import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { YogaContext } from '../context/index.js';

export const resolvers = {
  Query: {
    // Returns the profile of the currently authenticated user
    me: async (_: unknown, __: unknown, { prisma, user }: YogaContext) => {
      if (!user) return null;
      return await prisma.user.findUnique({ where: { id: user.userId } });
    },

    /**
     * Requirement: USER can only see their own tasks
     * Filters the Task collection by the authenticated user's unique ID.
     */
    myTasks: async (_: unknown, __: unknown, { prisma, user }: YogaContext) => {
      if (!user) throw new Error('Authentication required 🚫');
      return await prisma.task.findMany({
        where: { authorId: user.userId },
      });
    },

    /**
     * Requirement: ADMIN can view all tasks in the system
     * RBAC Enforcement: Validates if the requester holds the 'ADMIN' role.
     */
    allTasks: async (_: unknown, __: unknown, { prisma, user }: YogaContext) => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Forbidden: Administrator access only 👑');
      }
      return await prisma.task.findMany();
    },
  },

  Mutation: {
    // User registration: Encrypts plain-text passwords using salted hashing.
    register: async (
      _: unknown,
      { email, password }: { email: string; password: string },
      { prisma }: YogaContext
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await prisma.user.create({
        data: { email, password: hashedPassword, role: 'USER' },
      });
    },

    /**
     * Identity validation and session issuance
     * Generates a signed JWT containing identity and role for stateless authorization.
     */
    login: async (
      _: unknown,
      { email, password }: { email: string; password: string },
      { prisma }: YogaContext
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid credentials');

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');

      return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );
    },

    /**
     * Resource creation: Task initialization
     * Automatically binds the new task to the authenticated user's ID (authorId).
     */
    createTask: async (
      _: unknown,
      { title }: { title: string },
      { prisma, user }: YogaContext
    ) => {
      if (!user) throw new Error('Unauthorized 🚫');
      return await prisma.task.create({
        data: { title, authorId: user.userId },
      });
    },

    /**
     * Requirement: USER can update their own tasks (state toggle)
     * Ownership Validation: Prevents users from modifying tasks they do not own.
     */
    updateTask: async (
      _: unknown,
      { id, completed }: { id: string; completed: boolean },
      { prisma, user }: YogaContext
    ) => {
      if (!user) throw new Error('Unauthorized 🚫');

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task || task.authorId !== user.userId) {
        throw new Error('Forbidden: You can only update your own tasks 🛡️');
      }

      return await prisma.task.update({
        where: { id },
        data: { completed },
      });
    },

    /**
     * Requirement: ADMIN can delete any task, USER only their own
     * Multi-level authorization logic based on identity and role privileges.
     */
    deleteTask: async (
      _: unknown,
      { id }: { id: string },
      { prisma, user }: YogaContext
    ) => {
      if (!user) throw new Error('Unauthorized 🚫');

      const task = await prisma.task.findUnique({ where: { id } });

      const isOwner = task?.authorId === user.userId;
      const isAdmin = user.role === 'ADMIN';

      if (!task || (!isOwner && !isAdmin)) {
        throw new Error('Forbidden: Insufficient permissions to delete this resource 🛡️');
      }

      return await prisma.task.delete({ where: { id } });
    },
  },

  /**
   * Relation Resolvers: Graph data mapping
   * Enables the API to resolve nested queries (e.g., Task -> Author).
   */
  Task: {
    author: async (parent: { authorId: string }, __: unknown, { prisma }: YogaContext) => {
      return await prisma.user.findUnique({ where: { id: parent.authorId } });
    },
  },
  User: {
    tasks: async (parent: { id: string }, __: unknown, { prisma }: YogaContext) => {
      return await prisma.task.findMany({ where: { authorId: parent.id } });
    },
  },
};