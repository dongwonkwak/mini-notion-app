// Jest setup for database package
const { afterAll, beforeAll, beforeEach } = require('@jest/globals');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

let prisma;
let testDbPath;

/**
 * Jest 워커별로 고유한 데이터베이스 파일 생성
 * 각 워커(스레드/프로세스)가 완전히 독립적인 DB를 사용하여 락 문제 해결
 */
function createWorkerSpecificDbPath() {
  // Jest 워커 ID 가져오기 (환경변수에서)
  const workerId = process.env.JEST_WORKER_ID || '1';
  
  // 프로세스 ID와 타임스탬프를 조합하여 고유성 보장
  const processId = process.pid;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // 임시 디렉토리에 워커별 DB 파일 생성
  const tempDir = os.tmpdir();
  const dbFileName = `jest-worker-${workerId}-${processId}-${timestamp}-${randomId}.db`;
  
  return path.join(tempDir, dbFileName);
}

beforeAll(async () => {
  try {
    // 워커별 고유 DB 파일 경로 생성
    testDbPath = createWorkerSpecificDbPath();
    const dbUrl = `file:${testDbPath}`;
    
    // 환경변수 설정
    process.env.DATABASE_URL = dbUrl;
    
    console.log(`🗄️ Jest Worker ${process.env.JEST_WORKER_ID || '1'} using DB: ${path.basename(testDbPath)}`);
    
    // 기존 임시 DB 파일들 정리 (이 워커의 이전 실행 파일들만)
    const tempDir = os.tmpdir();
    const workerId = process.env.JEST_WORKER_ID || '1';
    const processId = process.pid;
    
    try {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        if (file.startsWith(`jest-worker-${workerId}-${processId}-`) && file.endsWith('.db')) {
          const filePath = path.join(tempDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            // 파일이 사용 중이거나 없으면 무시
          }
        }
      });
    } catch (e) {
      // 디렉토리 읽기 실패 시 무시
    }

    // 워커별 독립적인 Prisma 클라이언트 생성 (먼저 생성)
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      },
      log: [] // 테스트 중 로그 비활성화
    });
    
    // 연결 테스트
    await prisma.$connect();
    
    // 테스트 데이터베이스 초기화 (Prisma 클라이언트로)
    try {
      // 더 안정적인 DB 초기화를 위해 여러 번 시도
      let pushSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!pushSuccess && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`🔄 DB push attempt ${attempts} for worker ${process.env.JEST_WORKER_ID || '1'}`);
          
          execSync('npx prisma db push --force-reset --accept-data-loss --schema=./prisma/schema.prisma', { 
            stdio: 'pipe',
            env: { 
              ...process.env, 
              DATABASE_URL: dbUrl,
              PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes'
            },
            timeout: 30000, // 30초 타임아웃
            cwd: __dirname // 현재 디렉토리를 packages/database로 설정
          });
          pushSuccess = true;
          console.log(`✅ DB push successful for worker ${process.env.JEST_WORKER_ID || '1'}`);
        } catch (pushError) {
          console.warn(`⚠️ DB push attempt ${attempts} failed:`, pushError.message);
          if (attempts < maxAttempts) {
            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!pushSuccess) {
        throw new Error(`Failed to initialize database after ${maxAttempts} attempts`);
      }
      
    } catch (pushError) {
      // db push 실패 시 Prisma 클라이언트로 직접 스키마 적용 시도
      console.warn(`⚠️ DB push failed for worker ${process.env.JEST_WORKER_ID || '1'}, trying alternative method`);
      
      // Prisma 클라이언트 재생성으로 스키마 동기화 시도
      await prisma.$disconnect();
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl
          }
        },
        log: []
      });
      await prisma.$connect();
    }
    
  } catch (error) {
    console.warn(`⚠️ Database setup warning for worker ${process.env.JEST_WORKER_ID || '1'}:`, error.message);
    
    // Fallback: 기본 설정으로 시도
    prisma = new PrismaClient({
      log: []
    });
  }
});

beforeEach(async () => {
  if (!prisma) return;
  
  try {
    // 외래키 제약 조건을 비활성화하고 데이터 정리
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    
    // 올바른 순서로 데이터 정리 (외래키 의존성 고려)
    await prisma.comment.deleteMany();
    await prisma.documentHistory.deleteMany();
    await prisma.document.deleteMany();
    await prisma.page.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.session.deleteMany();
    await prisma.fileUpload.deleteMany();
    await prisma.user.deleteMany();
    
    // 외래키 제약 조건 다시 활성화
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  } catch (error) {
    console.warn('Database cleanup warning:', error.message);
  }
});

afterAll(async () => {
  // Prisma cleanup interval 정리
  if (global.__prismaCleanupInterval) {
    clearInterval(global.__prismaCleanupInterval);
    global.__prismaCleanupInterval = null;
  }

  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Prisma disconnect warning:', error.message);
    }
  }
  
  // 워커별 임시 DB 파일 정리
  if (testDbPath && fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
      console.log(`🗑️ Cleaned up DB file: ${path.basename(testDbPath)}`);
    } catch (error) {
      // 파일 삭제 실패 시 무시 (다른 프로세스가 사용 중일 수 있음)
    }
  }
});