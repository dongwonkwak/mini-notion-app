/**
 * Database utility functions and helpers
 */

import { PrismaClient } from '@prisma/client';

// 워커별 Prisma client instance (Jest 워커 격리를 위해)
const prismaInstances = new Map<string, PrismaClient>();

/**
 * 워커별 고유 키 생성
 */
function getWorkerKey(): string {
  // Jest 워커 ID와 프로세스 ID를 조합하여 고유 키 생성
  const workerId = process.env.JEST_WORKER_ID || 'main';
  const processId = process.pid;
  return `${workerId}-${processId}`;
}

/**
 * Initialize Prisma client with proper configuration
 * 워커별로 독립적인 인스턴스 관리
 */
export function initPrisma(): PrismaClient {
  const workerKey = getWorkerKey();
  
  if (prismaInstances.has(workerKey)) {
    return prismaInstances.get(workerKey)!;
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'], // 테스트 중에는 에러만 로깅
    errorFormat: 'pretty',
  });

  // 워커별 인스턴스 저장
  prismaInstances.set(workerKey, prisma);

  // Handle graceful shutdown (워커별로)
  const shutdownHandler = async () => {
    const instance = prismaInstances.get(workerKey);
    if (instance) {
      await instance.$disconnect();
      prismaInstances.delete(workerKey);
    }
  };

  process.on('beforeExit', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);

  return prisma;
}

/**
 * Get Prisma client instance (워커별)
 * 안전한 인스턴스 반환을 위한 검증 로직 포함
 */
export function getPrisma(): PrismaClient {
  const workerKey = getWorkerKey();
  
  if (!prismaInstances.has(workerKey)) {
    return initPrisma();
  }
  
  const instance = prismaInstances.get(workerKey);
  if (!instance) {
    throw new Error(`Prisma client instance not found for worker: ${workerKey}. This should not happen.`);
  }
  
  return instance;
}

/**
 * Close Prisma connection (워커별)
 */
export async function closePrisma(): Promise<void> {
  const workerKey = getWorkerKey();
  const instance = prismaInstances.get(workerKey);
  
  if (instance) {
    await instance.$disconnect();
    prismaInstances.delete(workerKey);
    console.log(`🔌 Prisma connection closed for worker: ${workerKey}`);
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrisma();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Clean database (for testing)
 * 테이블이 존재하는 경우에만 정리 수행
 */
export async function cleanDatabase(): Promise<void> {
  const client = getPrisma();
  
  try {
    // 테이블 존재 여부 확인
    const tables = await client.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
    `;
    
    if (tables.length === 0) {
      // 테이블이 없으면 정리할 필요 없음
      return;
    }
    
    // 외래키 제약 조건을 임시로 비활성화
    await client.$executeRaw`PRAGMA foreign_keys = OFF;`;
    
    // 테이블이 존재하는 경우에만 데이터 정리
    const tableNames = tables.map(t => t.name);
    
    if (tableNames.includes('comments')) {
      await client.comment.deleteMany();
    }
    if (tableNames.includes('document_history')) {
      await client.documentHistory.deleteMany();
    }
    if (tableNames.includes('documents')) {
      await client.document.deleteMany();
    }
    if (tableNames.includes('pages')) {
      await client.page.deleteMany();
    }
    if (tableNames.includes('workspace_members')) {
      await client.workspaceMember.deleteMany();
    }
    if (tableNames.includes('workspaces')) {
      await client.workspace.deleteMany();
    }
    if (tableNames.includes('sessions')) {
      await client.session.deleteMany();
    }
    if (tableNames.includes('file_uploads')) {
      await client.fileUpload.deleteMany();
    }
    if (tableNames.includes('users')) {
      await client.user.deleteMany();
    }
    
    // 외래키 제약 조건 다시 활성화
    await client.$executeRaw`PRAGMA foreign_keys = ON;`;
  } catch {
    // 테이블이 없거나 다른 문제가 있어도 조용히 처리
    try {
      await client.$executeRaw`PRAGMA foreign_keys = ON;`;
    } catch {
      // 무시
    }
  }
}

/**
 * Workspace utilities
 */
export class WorkspaceService {
  private get prisma(): PrismaClient {
    return getPrisma();
  }

  /**
   * Check if user has access to workspace
   */
  async hasAccess(userId: string, workspaceId: string): Promise<boolean> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Get user role in workspace
   */
  async getUserRole(userId: string, workspaceId: string): Promise<string | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return member?.role || null;
  }

  /**
   * Check if user can perform action in workspace
   */
  async canPerformAction(userId: string, workspaceId: string, action: 'read' | 'write' | 'admin'): Promise<boolean> {
    const role = await this.getUserRole(userId, workspaceId);
    
    if (!role) return false;

    const permissions = {
      viewer: ['read'],
      editor: ['read', 'write'],
      admin: ['read', 'write', 'admin'],
      owner: ['read', 'write', 'admin'],
    };

    return permissions[role as keyof typeof permissions]?.includes(action) || false;
  }
}

/**
 * Document utilities
 */
export class DocumentService {
  private get prisma(): PrismaClient {
    return getPrisma();
  }

  /**
   * Get document with page information
   */
  async getDocumentWithPage(documentId: string) {
    return await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        page: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update document state and version
   */
  async updateDocumentState(documentId: string, state: Buffer, version: number): Promise<void> {
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        state,
        version,
        lastModified: new Date(),
        sizeBytes: state.length,
      },
    });
  }

  /**
   * Create document history entry
   */
  async createHistoryEntry(documentId: string, state: Buffer, version: number, createdBy: string): Promise<void> {
    await this.prisma.documentHistory.create({
      data: {
        documentId,
        state,
        version,
        createdBy,
      },
    });
  }
}

/**
 * User utilities
 */
export class UserService {
  private get prisma(): PrismaClient {
    return getPrisma();
  }

  /**
   * Find or create user by email
   */
  async findOrCreateUser(userData: {
    email: string;
    name: string;
    provider: string;
    providerId?: string;
    avatarUrl?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return existingUser;
    }

    return await this.prisma.user.create({
      data: userData,
    });
  }

  /**
   * Update user last activity
   */
  async updateLastActivity(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }

  /**
   * Get user workspaces
   */
  async getUserWorkspaces(userId: string) {
    return await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            pages: true,
          },
        },
      },
    });
  }
}

// Export service instances
export const workspaceService = new WorkspaceService();
export const documentService = new DocumentService();
export const userService = new UserService();