import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsdoc from 'eslint-plugin-jsdoc'
import baseConfig from './base.js'

/**
 * React-specific ESLint configuration with JSDoc integration
 * 
 * Extends base configuration with React-specific rules and JSDoc documentation
 * requirements for React components and hooks.
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...baseConfig[1].languageOptions,
      globals: {
        ...globals.browser
      },
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
      'react-refresh': reactRefresh,
      'jsdoc': jsdoc
    },
    rules: {
      ...baseConfig[1].rules,
      ...reactHooks.configs.recommended.rules,
      
      // React-specific rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      
      // JSDoc rules for React components and hooks
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
            'ExportDefaultDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportDefaultDeclaration > ArrowFunctionExpression'
          ]
        }
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-example': [
        'warn',
        {
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration'
          ]
        }
      ],
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
            'offline',
            'component',
            'hook',
            'since',
            'see',
            'example',
            'throws',
            'param',
            'returns',
            'template'
          ]
        }
      ]
    }
  },
  
  // Relaxed JSDoc rules for test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-example': 'off'
    }
  },
  
  // Relaxed JSDoc rules for entry point files
  {
    files: ['**/main.{ts,tsx}', '**/index.{ts,tsx}', '**/*.config.{ts,tsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-example': 'off'
    }
  }
]