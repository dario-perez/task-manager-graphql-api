import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { YogaContext } from '../context/index.js';

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL Yoga and Fastify!',
    feed: async (_: any, { skip, take, filter }: any, { prisma }: YogaContext) => {
      const where = filter
        ? {
            published: true,
            OR: [
              { title: { contains: filter, mode: 'insensitive' as const } },
              { content: { contains: filter, mode: 'insensitive' as const } },
            ],
          }
        : { published: true };

      return await prisma.post.findMany({
        where,
        skip: skip || 0,
        take: take || 10,
      });
    },
    users: async (_: any, __: any, { prisma, user }: YogaContext) => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Not authorized: Administrator permissions required 👑');
      }
      return await prisma.user.findMany();
    },
    myPosts: async (_: any, __: any, { prisma, user }: YogaContext) => {
      if (!user) throw new Error('Not authorized 🚫');
      return await prisma.post.findMany({
        where: { authorId: user.userId },
      });
    },
  },

  Mutation: {
    register: async (_: any, { email, password, role }: any, { prisma }: YogaContext) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await prisma.user.create({
        data: { email, password: hashedPassword, role: role || 'USER' },
      });
    },
    login: async (_: any, { email, password }: any, { prisma }: YogaContext) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User not found');
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Incorrect password');

      return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'top-secret',
        { expiresIn: '1d' }
      );
    },
    deletePost: async (_: any, { id }: any, { prisma, user }: YogaContext) => {
      if (!user) throw new Error('Not authorized 🚫');

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new Error('Post not found');

      // PDF Requirement: ADMIN puede borrar cualquier cosa, USER solo lo suyo [cite: 15, 16]
      const isOwner = post.authorId === user.userId;
      const isAdmin = user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new Error('FORBIDDEN_ACTION: You do not have permission to delete this 🛡️');
      }

      return await prisma.post.delete({ where: { id } });
    },
  },
  
  // Resolvers de campo para relaciones
  Post: {
    author: async (parent: any, __: any, { prisma }: YogaContext) => {
      return await prisma.user.findUnique({ where: { id: parent.authorId } });
    },
  },
  User: {
    posts: async (parent: any, __: any, { prisma }: YogaContext) => {
      return await prisma.post.findMany({ where: { authorId: parent.id } });
    },
  },
};