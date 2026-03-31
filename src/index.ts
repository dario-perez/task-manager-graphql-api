import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { createSchema, createYoga } from 'graphql-yoga';
import { PrismaClient } from './generated/prisma/index.js';
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
    // Extracts user identity and roles from the Authorization header
    user: getUserData(initialContext.req),
  }),
  maskedErrors: {
    maskError(error: unknown) {
      console.error('🚨 INTERNAL_ERROR:', error);
      // Prevents leaking sensitive stack traces to the client
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
    
    // Synchronize Yoga headers with Fastify response
    response.headers.forEach((value, key) => reply.header(key, value));
    
    reply.status(response.status);
    reply.send(await response.text());
  },
});

/**
 * Server Lifecycle Management
 * Running on host 0.0.0.0 for Docker compatibility and accessibility.
 */
try {
  await server.listen({ port: 4000, host: '0.0.0.0' });
  console.log('🚀 Server running on http://localhost:4000/graphql');
} catch (err) {
  server.log.error(err);
  process.exit(1);
}