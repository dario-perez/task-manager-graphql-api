import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { createSchema, createYoga } from 'graphql-yoga';
import { PrismaClient, Prisma } from './generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Internal schema and logic imports
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { YogaContext, getUserData } from './context/index.js';

/**
 * Infrastructure: Database Connection Setup
 * Using pg.Pool with PrismaPg adapter for optimized connection pooling.
 */
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Define the executable GraphQL schema with injected context types
const schema = createSchema<YogaContext>({ typeDefs, resolvers });

/**
 * GraphQL Yoga Server Configuration
 * Handles context injection and global error masking for production security.
 */
const yoga = createYoga<YogaContext>({
  schema,
  context: async (initialContext) => ({
    ...initialContext,
    prisma,
    user: getUserData(initialContext.req),
  }),
  maskedErrors: {
    maskError(error: unknown) {
      console.error('🚨 INTERNAL_ERROR:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return new Error('An account with this email already exists.');
        }
      }

      if (error instanceof Error) return error;
      return new Error('An unexpected error occurred. 🛠️');
    },
  },
});

const server = fastify();

/**
 * Security: CORS Policy
 * Essential for allowing cross-origin requests from international clients.
 */
await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * API Gateway: Main GraphQL Route
 * Bridges Fastify's lifecycle with Yoga's fetch-standard request handling.
 */
server.route({
  url: '/graphql',
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async (req, reply) => {
    const response = await yoga.handleNodeRequest(req, { req, reply, prisma });
    response.headers.forEach((value, key) => reply.header(key, value));
    reply.status(response.status);
    reply.send(await response.text());
  },
});

/**
 * Server Lifecycle Management
 * Running on host 0.0.0.0 for Docker compatibility and accessibility.
 */
const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;

try {
  await server.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Server running on http://localhost:${port}/graphql`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}