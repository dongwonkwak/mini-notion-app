import reactConfig from '@mini-notion/config/eslint/react'
import globals from 'globals'

export default [
  ...reactConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        document: 'readonly',
        window: 'readonly',
        console: 'readonly'
      }
    }
  }
]