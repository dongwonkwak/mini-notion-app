/**
 * Database utility functions and helpers
 */
import { PrismaClient } from '@prisma/client';

// 워커별 Prisma client instance (Jest 워커 격리를 위해)
const prismaInstances = new Map<string, PrismaClient>();

// 메모리 관리용: 인스턴스 생성 시간과 마지막 사용 시간 추적
interface PrismaInstanceInfo {
  instance: PrismaClient;
  createdAt: number;
  lastUsedAt: number;
  shutdownHandler: () => Promise<void>;
}

const instanceInfo = new Map<string, PrismaInstanceInfo>();

// 인스턴스 정리를 위한 설정
const INSTANCE_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5분
const INSTANCE_MAX_IDLE_TIME = 10 * 60 * 1000; // 10분
const MAX_INSTANCES = 50; // 최대 인스턴스 수 제한

/**
 * 워커별 고유 키 생성
 */
function getWorkerKey(): string {
  // Jest 워커 ID와 프로세스 ID를 조합하여 고유 키 생성
  const workerId = process.env.JEST_WORKER_ID || 'main';
  const processId = process.pid;
  return `${workerId}-${processId}`;
}

// Extend the global type for the cleanup interval to avoid using `any` casts
declare global {
  // global variable used to store the cleanup interval ID
  // eslint-disable-next-line no-unused-vars
  var __prismaCleanupInterval: NodeJS.Timeout | null | undefined;
}

/**
 * 유휴 인스턴스 정리
 */
async function cleanupIdleInstances(): Promise<void> {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (const [key, info] of instanceInfo.entries()) {
    const idleTime = now - info.lastUsedAt;

    // 유휴 시간이 초과하거나 최대 인스턴스 수를 초과한 경우
    if (
      idleTime > INSTANCE_MAX_IDLE_TIME ||
      instanceInfo.size > MAX_INSTANCES
    ) {
      keysToRemove.push(key);
    }
  }

  // 가장 오래된 인스턴스부터 정리 (LRU 방식)
  const sortedKeys = Array.from(instanceInfo.keys()).sort((a, b) => {
    const infoA = instanceInfo.get(a)!;
    const infoB = instanceInfo.get(b)!;
    return infoA.lastUsedAt - infoB.lastUsedAt;
  });

  // 최대 인스턴스 수 초과 시 오래된 것부터 제거
  while (instanceInfo.size > MAX_INSTANCES && sortedKeys.length > 0) {
    const oldestKey = sortedKeys.shift()!;
    if (!keysToRemove.includes(oldestKey)) {
      keysToRemove.push(oldestKey);
    }
  }

  // 인스턴스 정리 실행
  for (const key of keysToRemove) {
    const info = instanceInfo.get(key);
    if (info) {
      try {
        await info.shutdownHandler();
        instanceInfo.delete(key);
        prismaInstances.delete(key);
        console.log(`🧹 Cleaned up idle Prisma instance: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to cleanup instance ${key}:`, error);
      }
    }
  }
}

/**
 * 정기적인 인스턴스 정리 스케줄러 시작
 */
function startCleanupScheduler(): void {
  // Jest 환경에서는 cleanup scheduler를 시작하지 않음
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return;
  }

  // 이미 스케줄러가 실행 중인지 확인
  if (global.__prismaCleanupInterval) {
    return;
  }

  global.__prismaCleanupInterval = setInterval(async () => {
    try {
      await cleanupIdleInstances();
    } catch (error) {
      console.error('❌ Instance cleanup failed:', error);
    }
  }, INSTANCE_CLEANUP_INTERVAL);

  // 프로세스 종료 시 정리
  const cleanup = async () => {
    if (global.__prismaCleanupInterval) {
      clearInterval(global.__prismaCleanupInterval);
      global.__prismaCleanupInterval = null;
    }

    // 모든 인스턴스 정리
    for (const [key, info] of instanceInfo.entries()) {
      try {
        await info.shutdownHandler();
      } catch (error) {
        console.error(`❌ Failed to cleanup instance ${key} on exit:`, error);
      }
    }

    instanceInfo.clear();
    prismaInstances.clear();
  };

  process.on('beforeExit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

/**
 * Initialize Prisma client with proper configuration
 * 워커별로 독립적인 인스턴스 관리 + 메모리 효율성 개선
 */
export function initPrisma(): PrismaClient {
  const workerKey = getWorkerKey();

  // 기존 인스턴스가 있고 유효한지 확인
  const existingInfo = instanceInfo.get(workerKey);
  if (existingInfo) {
    // 마지막 사용 시간 업데이트
    existingInfo.lastUsedAt = Date.now();
    return existingInfo.instance;
  }

  // 정리 스케줄러 시작 (최초 한 번만)
  startCleanupScheduler();

  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID
        ? ['query', 'info', 'warn', 'error']
        : ['error'], // 테스트 중에는 에러만 로깅
    errorFormat: 'pretty',
  });

  const now = Date.now();

  // Handle graceful shutdown (워커별로)
  const shutdownHandler = async () => {
    try {
      await prisma.$disconnect();
      instanceInfo.delete(workerKey);
      prismaInstances.delete(workerKey);
      console.log(`🔌 Prisma connection closed for worker: ${workerKey}`);
    } catch (error) {
      console.error(
        `❌ Error closing Prisma connection for ${workerKey}:`,
        error
      );
    }
  };

  // 인스턴스 정보 저장 (메모리 관리용)
  const info: PrismaInstanceInfo = {
    instance: prisma,
    createdAt: now,
    lastUsedAt: now,
    shutdownHandler,
  };

  instanceInfo.set(workerKey, info);
  prismaInstances.set(workerKey, prisma);

  return prisma;
}

/**
 * Get Prisma client instance (워커별)
 * 안전한 인스턴스 반환을 위한 검증 로직 포함 + 사용 시간 추적
 */
export function getPrisma(): PrismaClient {
  const workerKey = getWorkerKey();

  // 인스턴스 정보에서 가져오기 (사용 시간 추적을 위해)
  const info = instanceInfo.get(workerKey);
  if (info) {
    // 마지막 사용 시간 업데이트
    info.lastUsedAt = Date.now();
    return info.instance;
  }

  // 인스턴스가 없으면 새로 생성
  return initPrisma();
}

/**
 * Close Prisma connection (워커별)
 */
export async function closePrisma(): Promise<void> {
  const workerKey = getWorkerKey();
  const info = instanceInfo.get(workerKey);

  if (info) {
    await info.shutdownHandler();
  }
}

/**
 * 메모리 사용량 모니터링 함수
 */
export function getMemoryStats() {
  const stats = {
    totalInstances: instanceInfo.size,
    maxInstances: MAX_INSTANCES,
    cleanupInterval: INSTANCE_CLEANUP_INTERVAL,
    maxIdleTime: INSTANCE_MAX_IDLE_TIME,
    instances: Array.from(instanceInfo.entries()).map(([key, info]) => ({
      key,
      createdAt: info.createdAt,
      lastUsedAt: info.lastUsedAt,
      age: Date.now() - info.createdAt,
      idleTime: Date.now() - info.lastUsedAt,
    })),
  };

  return stats;
}

/**
 * 강제로 유휴 인스턴스 정리
 */
export async function forceCleanup(): Promise<{
  cleaned: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let cleaned = 0;

  try {
    const beforeCount = instanceInfo.size;
    await cleanupIdleInstances();
    cleaned = beforeCount - instanceInfo.size;
  } catch (error) {
    errors.push(`Cleanup failed: ${error}`);
  }

  return { cleaned, errors };
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
    const tableNames = tables.map((t: { name: string }) => t.name);

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
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return !!member;
  }

  /**
   * Get user role in workspace
   */
  async getUserRole(
    userId: string,
    workspaceId: string
  ): Promise<string | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return member?.role || null;
  }

  /**
   * Check if user can perform action in workspace
   */
  async canPerformAction(
    userId: string,
    workspaceId: string,
    action: 'read' | 'write' | 'admin'
  ): Promise<boolean> {
    const role = await this.getUserRole(userId, workspaceId);

    if (!role) return false;

    const permissions = {
      viewer: ['read'],
      editor: ['read', 'write'],
      admin: ['read', 'write', 'admin'],
      owner: ['read', 'write', 'admin'],
    };

    return (
      permissions[role as keyof typeof permissions]?.includes(action) || false
    );
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
  async updateDocumentState(
    documentId: string,
    state: Buffer,
    version: number
  ): Promise<void> {
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
  async createHistoryEntry(
    documentId: string,
    state: Buffer,
    version: number,
    createdBy: string
  ): Promise<void> {
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
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
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
