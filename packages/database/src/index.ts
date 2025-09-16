/**
 * Database package main exports
 * Provides Prisma client, Redis utilities, and database operations
 */

// Prisma client and types
export { PrismaClient } from '@prisma/client';
export type {
  AuthEvent, Comment, Document, FileUpload, Page, Prisma, Session, User, Workspace,
  WorkspaceMember
} from '@prisma/client';

export {
  checkDatabaseHealth,
  cleanDatabase,
  closePrisma,
  initPrisma,
  getPrisma as prisma
} from './utils';

// Redis utilities
export {
  closeRedis,
  DocumentCache,
  documentCache,
  getRedis,
  initRedis,
  RateLimiter,
  rateLimiter,
  SessionCache,
  sessionCache
} from './redis';

// Database utilities
export * from './utils';

