import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.d.ts',
      '**/turbo.json',
      '**/pnpm-lock.yaml',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // TypeScript 관련 규칙
      'no-undef': 'off',
      'no-unused-vars': 'off', // TypeScript에서 비활성화
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React 관련 규칙
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react/prop-types': 'off', // TypeScript 사용 시 불필요
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import 관련 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: '@editor/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // 접근성 관련 규칙
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',

      // Next.js 관련 규칙은 기본적으로 비활성화
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            './tsconfig.json',
            './apps/*/tsconfig.json',
            './packages/*/tsconfig.json',
          ],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
  // Next.js 앱에서만 Next.js 규칙 적용
  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@next/next/no-img-element': 'error',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
];
