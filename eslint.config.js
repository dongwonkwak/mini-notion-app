import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin
    },
    rules: {
      'no-undef': 'off' // Turn off no-undef as TypeScript handles this
    },
    ignores: [
      'node_modules/',
      'dist/',
      '.next/',
      'coverage/',
      '*.config.js',
      '*.config.ts'
    ]
  }
];