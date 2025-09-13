/**
 * Database package main exports
 * Provides Prisma client, Redis utilities, and database operations
 */

// Prisma client
export { PrismaClient } from '@prisma/client';
export {
  getPrisma as prisma,
  initPrisma,
  closePrisma,
  checkDatabaseHealth,
  cleanDatabase,
} from './utils';

// Redis utilities
export {
  initRedis,
  getRedis,
  closeRedis,
  DocumentCache,
  SessionCache,
  RateLimiter,
  documentCache,
  sessionCache,
  rateLimiter,
} from './redis';

// Database utilities
export * from './utils';

// Types
export type {
  User,
  Workspace,
  WorkspaceMember,
  Page,
  Document,
  DocumentHistory,
  Comment,
  Session,
  FileUpload,
  AuthEvent,
} from '@prisma/client';
