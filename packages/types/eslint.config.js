import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        node: true
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-undef': 'off', // Turn off no-undef as TypeScript handles this
      'no-unused-vars': 'off', // Turn off no-unused-vars as @typescript-eslint handles this
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }]
    }
  }
];