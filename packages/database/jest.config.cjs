const baseConfig = require('@editor/config/jest/base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'database',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 워커별 병렬 실행 최적화
  maxWorkers: '50%', // CPU 코어의 50% 사용 (안정성과 성능의 균형)

  // 테스트 격리 강화
  testTimeout: 30000, // 30초 타임아웃

  // 워커별 독립성 보장
  workerIdleMemoryLimit: '512MB', // 메모리 제한으로 워커 재시작 방지

  // Prisma 클라이언트 모킹 비활성화 (실제 클라이언트 사용)
  clearMocks: true,
  restoreMocks: true,

  // 테스트 실행 순서는 기본값 사용
};
