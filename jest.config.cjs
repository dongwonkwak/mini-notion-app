/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Packages
    '<rootDir>/packages/types',
    '<rootDir>/packages/database',
    '<rootDir>/packages/ui',
    '<rootDir>/packages/editor',
    '<rootDir>/packages/collaboration',
    '<rootDir>/packages/auth',

    // Apps
    '<rootDir>/apps/web',
    '<rootDir>/apps/server',
    '<rootDir>/apps/api',
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    'apps/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  maxWorkers: '50%',
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
