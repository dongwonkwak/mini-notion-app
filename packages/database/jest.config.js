const baseConfig = require('@editor/config/jest/base.config');

module.exports = {
  ...baseConfig,
  displayName: 'database',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};