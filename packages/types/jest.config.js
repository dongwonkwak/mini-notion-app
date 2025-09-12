const baseConfig = require('@editor/config/jest/base.config');

module.exports = {
  ...baseConfig,
  displayName: 'types',
  testEnvironment: 'node'
};