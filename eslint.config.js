import js from '@eslint/js'
import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', '**/build/**', '**/coverage/**']
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'jsdoc': jsdoc
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // JSDoc rules for exported functions and classes
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration'
          ]
        }
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: [
            'yjs',
            'collaboration', 
            'editor',
            'performance',
            'security',
            'offline'
          ]
        }
      ]
    }
  },
  
  // Relaxed JSDoc rules for test files
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/tests/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off'
    }
  }
]