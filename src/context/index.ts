import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

/**
 * Core GraphQL Context Interface
 * Binds the database client and authenticated user identity to every resolver.
 */
export interface YogaContext {
  prisma: PrismaClient;
  req: FastifyRequest;
  reply: FastifyReply;
  // User identity injected after successful JWT verification
  user: { userId: string; role: string } | null;
}

/**
 * Authentication Middleware: getUserData
 * Strictly validates the cryptographic signature of the Bearer Token.
 * Required by business logic to prevent unauthorized access to protected resolvers.
 */
export const getUserData = (req: FastifyRequest) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      // Cryptographic signature validation against the environment secret
      return jwt.verify(token, process.env.JWT_SECRET || 'top-secret') as { userId: string; role: string };
    } catch (e) {
      // Returns null on invalid or expired tokens to deny access in resolvers
      return null;
    }
  }
  return null;
};