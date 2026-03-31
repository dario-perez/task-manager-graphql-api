import 'dotenv/config';
import fastify from 'fastify';
import { createSchema, createYoga } from 'graphql-yoga';
import { PrismaClient } from './generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import cors from '@fastify/cors';
import { YogaContext, getUserData } from './context/index.js';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const schema = createSchema<YogaContext>({
  typeDefs,
  resolvers,
});

const yoga = createYoga<YogaContext>({ 
  schema,
  context: async (initialContext) => ({
    ...initialContext,
    prisma,
    user: getUserData(initialContext.req),
  }),
  maskedErrors: {
    maskError(error: unknown) {
      console.error("🚨 INTERNAL_ERROR:", error);
      if (error instanceof Error) {
        return error;
      }
      return new Error("Ocurrió un error inesperado en el servidor. 🛠️");
    }
  }
});

const server = fastify();

await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

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

const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server organized and running on http://localhost:4000/graphql');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();