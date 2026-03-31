import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

export interface YogaContext {
  prisma: PrismaClient;
  req: FastifyRequest;
  reply: FastifyReply;
  user: { userId: string; role: string } | null;
}

export const getUserData = (req: FastifyRequest) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'top-secret') as { userId: string; role: string };
    } catch (e) {
      return null;
    }
  }
  return null;
};