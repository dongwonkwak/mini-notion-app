# Config 패키지 설계 패턴

packages/config 패키지의 설계 원칙과 확장 패턴을 정의합니다.

## 설계 원칙

### 1. 계층적 설정 구조
```
base (공통) → environment (환경별) → app (앱별 오버라이드)
```

### 2. 명시적 Export 경로
```json
{
  "exports": {
    "./typescript/base": "./typescript/base.json",
    "./typescript/react": "./typescript/react.json",
    "./eslint/react": "./eslint/react.js"
  }
}
```

### 3. peerDependencies 활용
- 실제 도구는 루트에 설치
- config 패키지는 설정만 제공
- 버전 호환성은 peerDependencies로 명시

## 설정 파일 구조

### TypeScript 설정 패턴

**base.json (공통 기본 설정)**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**react.json (React 특화)**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

**node.json (Node.js 특화)**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2020"],
    "module": "CommonJS",
    "types": ["node"]
  }
}
```

### ESLint 설정 패턴

**base.js (공통 기본 설정)**
```javascript
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**']
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules
    }
  }
]
```

**react.js (React 특화)**
```javascript
import reactHooks from 'eslint-plugin-react-hooks'
import jsdoc from 'eslint-plugin-jsdoc'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      ...baseConfig[1].plugins,
      'react-hooks': reactHooks,
      'jsdoc': jsdoc
    },
    rules: {
      ...baseConfig[1].rules,
      ...reactHooks.configs.recommended.rules,
      // JSDoc 규칙 - React 컴포넌트 특화
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration'
          ]
        }
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-example': [
        'warn',
        {
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration'
          ]
        }
      ]
    }
  }
]
```

## 새 설정 타입 추가 패턴

### 1. 새 환경 추가 (예: Electron)

**typescript/electron.json**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "target": "ES2020",
    "moduleResolution": "node"
  }
}
```

**eslint/electron.js**
```javascript
import electronConfig from 'eslint-plugin-electron'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    plugins: {
      ...baseConfig[1].plugins,
      'electron': electronConfig
    }
  }
]
```

### 2. 새 도구 설정 추가 (예: JSDoc ESLint)

**eslint/jsdoc.js**
```javascript
import jsdoc from 'eslint-plugin-jsdoc'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    plugins: {
      ...baseConfig[1].plugins,
      'jsdoc': jsdoc
    },
    rules: {
      ...baseConfig[1].rules,
      // 미니 노션 특화 JSDoc 규칙
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration'
          ]
        }
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/require-example': [
        'warn',
        {
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration'
          ]
        }
      ]
    }
  }
]
```

### 3. 새 도구 설정 추가 (예: Jest)

**jest/base.js**
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
}
```

**jest/react.js**
```javascript
import baseConfig from './base.js'

export default {
  ...baseConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

## 설정 확장 패턴

### 1. 앱별 오버라이드
```json
// apps/web/tsconfig.json
{
  "extends": "@mini-notion/config/typescript/react",
  "compilerOptions": {
    // 앱별 특화 설정
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. 조건부 설정 적용
```javascript
// apps/web/eslint.config.js
import reactConfig from '@mini-notion/config/eslint/react'

export default [
  ...reactConfig,
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      // 테스트 파일에서만 적용할 규칙
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]
```

### 3. 환경별 설정 분기
```javascript
// packages/config/eslint/react.js
const isDevelopment = process.env.NODE_ENV === 'development'

export default [
  // ... 기본 설정
  {
    rules: {
      // 개발 환경에서만 경고, 프로덕션에서는 에러
      'console.log': isDevelopment ? 'warn' : 'error'
    }
  }
]
```

## 설정 테스트 패턴

### 1. 설정 유효성 검증
```javascript
// packages/config/tests/typescript.test.js
import { readFileSync } from 'fs'
import { resolve } from 'path'

test('TypeScript base config is valid JSON', () => {
  const configPath = resolve(__dirname, '../typescript/base.json')
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  
  expect(config.compilerOptions).toBeDefined()
  expect(config.compilerOptions.strict).toBe(true)
})
```

### 2. 설정 상속 테스트
```javascript
test('React config extends base config', () => {
  const reactConfig = require('../typescript/react.json')
  expect(reactConfig.extends).toBe('./base.json')
  expect(reactConfig.compilerOptions.jsx).toBe('react-jsx')
})
```

## 버전 관리 전략

### 1. 설정 변경 시 영향도 분석
```bash
# 설정 변경 전 영향받는 앱 확인
pnpm --filter "*" type-check
pnpm --filter "*" lint
```

### 2. 점진적 설정 적용
```javascript
// 새 규칙을 warn으로 먼저 적용
export default [
  {
    rules: {
      'new-rule': 'warn'  // 나중에 'error'로 변경
    }
  }
]
```

### 3. 설정 변경 로그 관리
```markdown
# packages/config/CHANGELOG.md

## v1.2.0
- Added: Electron 환경 설정 추가
- Changed: TypeScript strict 모드 기본 활성화
- Fixed: ESLint React hooks 규칙 수정
```

## 모범 사례

### 1. 설정 문서화
```javascript
/**
 * 모든 프로젝트에서 사용하는 기본 TypeScript 설정
 * 
 * strict 모드를 활성화하여 타입 안전성을 보장하고,
 * JSDoc 주석과 TypeScript 타입 시스템을 연동합니다.
 * 
 * @see {@link https://www.typescriptlang.org/tsconfig} TypeScript 설정 문서
 */
// packages/config/typescript/base.json
{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### 2. 설정 그룹화
```
packages/config/
├── typescript/     # TypeScript 관련 설정
├── eslint/        # ESLint 관련 설정
├── testing/       # 테스트 도구 설정
└── bundling/      # 번들링 도구 설정
```

### 3. 설정 검증 스크립트
```json
// packages/config/package.json
{
  "scripts": {
    "validate": "node scripts/validate-configs.js",
    "test": "jest tests/"
  }
}
```

이 패턴을 따르면 확장 가능하고 유지보수하기 쉬운 설정 시스템을 구축할 수 있습니다.