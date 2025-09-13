# ESLint 설정 가이드

## 📋 개요

실시간 협업 에디터 프로젝트는 `next lint` 대신 **직접 ESLint**를 사용하여 더 세밀한 코드 품질 관리를 수행합니다.

## 🔧 ESLint 설정 구조

### 루트 레벨 설정

```javascript
// eslint.config.js (루트)
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React 관련 규칙
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js 관련 규칙
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',

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
        },
      ],

      // 접근성 관련 규칙
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
    },
  },
];
```

### 패키지별 설정

각 패키지는 자체 ESLint 설정을 가집니다:

```javascript
// packages/auth/eslint.config.js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
```

## 🚀 사용법

### 기본 명령어

```bash
# 전체 프로젝트 린트 검사
pnpm eslint .

# 특정 파일/폴더 검사
pnpm eslint src/

# 자동 수정 가능한 문제 해결
pnpm eslint . --fix

# 경고 포함 모든 문제 표시
pnpm eslint . --max-warnings 0

# 특정 확장자만 검사
pnpm eslint . --ext .ts,.tsx
```

### 패키지별 실행

```bash
# 특정 패키지에서 실행
pnpm --filter @editor/auth eslint src

# 모든 패키지에서 실행
pnpm -r eslint src
```

## 📊 품질 게이트 통합

### 자동화 스크립트

```bash
# 코드 품질 전체 검사
pnpm quality:check  # eslint + type-check + test

# 자동 수정 적용
pnpm quality:fix    # eslint --fix + format
```

### Git Hooks 통합

```bash
# pre-commit hook에서 자동 실행
pnpm eslint . --fix
```

### CI/CD 파이프라인

```yaml
# GitHub Actions
- name: ESLint Check
  run: pnpm eslint . --max-warnings 0
```

## 🔍 규칙 설명

### TypeScript 규칙

- `@typescript-eslint/no-unused-vars`: 사용하지 않는 변수 감지
- `@typescript-eslint/no-explicit-any`: any 타입 사용 경고
- `no-undef`: TypeScript가 처리하므로 비활성화

### React/Next.js 규칙

- `react/react-in-jsx-scope`: Next.js에서 불필요하므로 비활성화
- `@next/next/no-html-link-for-pages`: Next.js Link 컴포넌트 사용 강제
- `@next/next/no-img-element`: Next.js Image 컴포넌트 사용 권장

### Import 규칙

- `import/order`: Import 순서 정리
  1. Node.js 내장 모듈
  2. 외부 라이브러리
  3. 내부 모듈
  4. 상대 경로 import

### 접근성 규칙

- `jsx-a11y/alt-text`: 이미지 alt 속성 필수
- `jsx-a11y/anchor-is-valid`: 유효한 링크 구조 강제

## 🛠️ 커스터마이징

### 규칙 비활성화

```javascript
// 특정 파일에서 규칙 비활성화
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = {};

// 특정 라인에서만 비활성화
const data: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
```

### 프로젝트별 규칙 추가

```javascript
// eslint.config.js에 규칙 추가
rules: {
  // 커스텀 규칙
  'prefer-const': 'error',
  'no-var': 'error',
  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
}
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 파싱 오류

```bash
# TypeScript 파서 설정 확인
languageOptions: {
  parser: tsparser,
  parserOptions: {
    project: './tsconfig.json'
  }
}
```

#### 2. 플러그인 충돌

```bash
# 플러그인 버전 확인
pnpm list eslint @typescript-eslint/eslint-plugin
```

#### 3. 성능 문제

```bash
# 캐시 사용
pnpm eslint . --cache

# 병렬 처리
pnpm eslint . --max-warnings 0 --cache --cache-location .eslintcache
```

## 📈 모니터링

### 메트릭 추적

- ESLint 에러 수: 0개 유지
- 경고 수: 최소화
- 규칙 위반 패턴 분석

### 자동화된 리포트

```bash
# ESLint 결과를 JSON으로 출력
pnpm eslint . --format json > eslint-report.json

# HTML 리포트 생성
pnpm eslint . --format html > eslint-report.html
```

## 🎯 베스트 프랙티스

### 1. 점진적 적용

- 새 코드부터 엄격한 규칙 적용
- 기존 코드는 단계적으로 개선

### 2. 팀 컨벤션

- 규칙 변경 시 팀 논의
- 문서화된 예외 사항 관리

### 3. 성능 최적화

- `.eslintignore` 파일 활용
- 캐시 기능 사용
- 필요한 파일만 검사

### 4. IDE 통합

- VS Code ESLint 확장 설치
- 저장 시 자동 수정 설정
- 실시간 오류 표시

---

**참고**: ESLint 설정은 프로젝트 요구사항에 따라 지속적으로 조정됩니다. 새로운 규칙 추가나 변경 시에는 팀과 논의 후 적용해주세요.
