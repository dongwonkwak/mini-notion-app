import jsdoc from 'eslint-plugin-jsdoc'
import baseConfig from './base.js'

/**
 * JSDoc ESLint configuration for Mini Notion project
 * 
 * Enforces comprehensive JSDoc documentation standards including:
 * - Required documentation for exported functions and classes
 * - Parameter and return value documentation
 * - Example usage for complex functions
 * - Mini Notion specific tags (@yjs, @collaboration, @editor, etc.)
 * 
 * @see {@link https://github.com/gajus/eslint-plugin-jsdoc} ESLint JSDoc Plugin
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      ...baseConfig[1].plugins,
      'jsdoc': jsdoc
    },
    rules: {
      ...baseConfig[1].rules,
      
      // Core JSDoc requirements
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
      
      // Parameter and return documentation
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-name': 'error',
      'jsdoc/require-param-type': 'off', // TypeScript provides types
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off', // TypeScript provides types
      
      // Validation rules
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'off', // TypeScript handles types
      'jsdoc/valid-types': 'off', // TypeScript handles types
      'jsdoc/no-undefined-types': 'off', // TypeScript handles types
      
      // Format and style
      'jsdoc/require-description': 'warn',
      'jsdoc/require-description-complete-sentence': 'warn',
      'jsdoc/newline-after-description': 'error',
      'jsdoc/no-bad-blocks': 'error',
      'jsdoc/no-multi-asterisks': ['error', { allowWhitespace: true }],
      
      // Examples for complex functions
      'jsdoc/require-example': [
        'warn',
        {
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration'
          ],
          exemptedBy: ['@internal', '@private']
        }
      ],
      
      // Tag validation
      'jsdoc/check-access': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-line-alignment': 'error',
      'jsdoc/check-syntax': 'error',
      
      // Prevent redundant information
      'jsdoc/require-asterisk-prefix': 'error',
      'jsdoc/require-hyphen-before-param-description': 'error',
      
      // Custom tags for Mini Notion
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
            'since',
            'see',
            'example',
            'throws',
            'param',
            'returns',
            'template',
            'internal',
            'private',
            'public',
            'readonly',
            'static',
            'override',
            'deprecated',
            'todo',
            'fixme'
          ]
        }
      ]
    }
  },
  
  // Relaxed rules for test files
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/tests/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-example': 'off'
    }
  },
  
  // Relaxed rules for configuration files
  {
    files: ['**/*.config.{ts,js}', '**/*.setup.{ts,js}', '**/vite.config.*', '**/vitest.config.*'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-example': 'off'
    }
  }
]