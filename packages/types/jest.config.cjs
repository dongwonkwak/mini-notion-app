const baseConfig = require('@editor/config/jest/base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'types',
  testEnvironment: 'node',
};
