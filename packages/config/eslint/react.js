import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...baseConfig[1].languageOptions,
      globals: globals.browser,
      parserOptions: {
        ...baseConfig[1].languageOptions.parserOptions,
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      ...baseConfig[1].plugins,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...baseConfig[1].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error'
    }
  }
]