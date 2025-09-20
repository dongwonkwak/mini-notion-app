import globals from 'globals'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      ...baseConfig[1].languageOptions,
      globals: globals.node
    },
    rules: {
      ...baseConfig[1].rules,
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }
]