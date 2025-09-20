# Design Document

## Overview

미니 노션 프로젝트의 개발 환경 구성을 위한 모노레포 아키텍처와 개발 도구 설정을 설계합니다. Turbo + pnpm 워크스페이스 기반의 모노레포 구조를 구축하고, React 19, NestJS, Tiptap, Y.js 등 핵심 기술 스택을 통합하여 일관된 개발 환경을 제공합니다.

## Architecture

### Monorepo Structure

```
mini-notion/
├── apps/
│   ├── web/                    # React 19 + Vite 프론트엔드
│   └── api/                    # NestJS 백엔드 API
├── packages/
│   ├── shared/                 # 공통 타입 및 유틸리티
│   ├── ui/                     # Shadcn/ui 컴포넌트 라이브러리
│   └── contracts/              # OpenAPI 스펙 및 생성된 타입
├── tools/
│   ├── docker/                 # Docker 설정 파일들
│   └── scripts/                # 빌드/배포 스크립트
├── docs/                       # 프로젝트 문서
├── .kiro/                      # Kiro 설정 및 스펙
└── tests/                      # E2E 테스트 (Playwright)
```

### Package Manager Strategy

- **pnpm**: 디스크 효율성과 빠른 설치 속도
- **Workspaces**: 패키지 간 의존성 관리 및 호이스팅
- **최신 버전 우선**: 모든 패키지는 `@latest` 태그로 설치

### Build System

- **Turbo**: 모노레포 빌드 파이프라인 최적화
- **캐싱**: 빌드 결과물 캐싱으로 개발 속도 향상
- **병렬 실행**: 독립적인 패키지들의 병렬 빌드

**Turbo Configuration (turbo.json):**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

## Components and Interfaces

### Frontend App (apps/web)

**Core Dependencies:**
```json
{
  "react": "latest",
  "typescript": "latest",
  "vite": "latest",
  "@tiptap/react": "latest",
  "@tiptap/pm": "latest",
  "y-prosemirror": "latest",
  "yjs": "latest",
  "@hocuspocus/provider": "latest",
  "zustand": "latest",
  "tailwindcss": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest",
  "react-dropzone": "latest"
}
```

**Development Tools:**
```json
{
  "@vitejs/plugin-react": "latest",
  "vitest": "latest",
  "@testing-library/react": "latest",
  "@testing-library/jest-dom": "latest",
  "eslint": "latest",
  "@typescript-eslint/eslint-plugin": "latest",
  "@typescript-eslint/parser": "latest",
  "eslint-plugin-react": "latest",
  "eslint-plugin-react-hooks": "latest",
  "prettier": "latest",
  "autoprefixer": "latest",
  "postcss": "latest"
}
```

### Backend App (apps/api)

**Core Dependencies:**
```json
{
  "@nestjs/core": "latest",
  "@nestjs/common": "latest",
  "@nestjs/platform-express": "latest",
  "@nestjs/jwt": "latest",
  "@nestjs/passport": "latest",
  "passport": "latest",
  "passport-jwt": "latest",
  "@hocuspocus/server": "latest",
  "@prisma/client": "latest",
  "prisma": "latest",
  "ioredis": "latest",
  "zod": "latest",
  "helmet": "latest",
  "express-rate-limit": "latest",
  "multer": "latest",
  "@nestjs/platform-express": "latest",
  "minio": "latest"
}
```

**Development Tools:**
```json
{
  "@nestjs/testing": "latest",
  "@nestjs/cli": "latest",
  "supertest": "latest",
  "testcontainers": "latest",
  "@testcontainers/postgresql": "latest",
  "@testcontainers/redis": "latest",
  "@types/passport-jwt": "latest",
  "@types/multer": "latest"
}
```

### Shared Packages

**packages/shared:**
- 공통 TypeScript 타입 정의
- Zod 스키마 및 검증 로직
- 유틸리티 함수

**packages/ui:**
- Shadcn/ui 기반 컴포넌트 라이브러리
- TailwindCSS 설정 및 디자인 토큰

**packages/contracts:**
- OpenAPI 3.0 스펙 파일
- 자동 생성된 TypeScript 타입
- Prism Mock Server 설정

**Contract Generation Tools:**
```json
{
  "openapi-typescript": "latest",
  "@stoplight/prism-cli": "latest"
}
```

## Data Models

### Environment Configuration

```typescript
// Zod 스키마 기반 환경변수 검증
const WebEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('Mini Notion'),
  PORT: z.string().regex(/^\d{4,5}$/).default('3000')
});

const ApiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().regex(/^\d{4,5}$/).default('3001'),
  HOCUSPOCUS_PORT: z.string().regex(/^\d{4,5}$/).default('1234'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().regex(/^\d{4,5}$/).default('9000'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_NAME: z.string().default('mini-notion-files')
});
```

### Docker Services Configuration

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mini_notion
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Package.json Workspace Configuration

```json
{
  "name": "mini-notion",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "packageManager": "pnpm",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

## Error Handling

### Environment Validation Errors

- **Missing Required Variables**: 애플리케이션 시작 시 Zod 검증 실패 시 명확한 오류 메시지
- **Invalid URL Format**: 잘못된 URL 형식 감지 및 예시 제공
- **Port Conflicts**: 포트 충돌 감지 및 대안 포트 제안

### Package Installation Errors

- **Node Version Mismatch**: engines 필드로 Node.js 버전 검증
- **pnpm Version Check**: packageManager 필드로 pnpm 버전 강제
- **Workspace Resolution**: 워크스페이스 의존성 해결 실패 시 가이드 제공

### Docker Environment Errors

- **Container Startup Failures**: 서비스별 헬스체크 및 재시작 정책
- **Port Binding Issues**: 포트 충돌 시 자동 대체 포트 할당
- **Volume Mount Problems**: 데이터 영속성 보장을 위한 볼륨 설정

## Testing Strategy

### Unit Testing Setup

- **Vitest**: Jest API 호환 테스트 러너
- **React Testing Library**: 컴포넌트 테스트
- **Supertest**: API 엔드포인트 테스트

### Integration Testing

- **TestContainers**: 실제 PostgreSQL/Redis 컨테이너 사용
  - `@testcontainers/postgresql`: PostgreSQL 15 컨테이너 관리
  - `@testcontainers/redis`: Redis 7 컨테이너 관리
- **Database Migrations**: 테스트 환경에서 Prisma 마이그레이션 자동 실행
- **Environment Isolation**: 테스트별 독립적인 데이터베이스 인스턴스
- **Container Lifecycle**: 테스트 시작/종료 시 컨테이너 자동 생성/정리

### E2E Testing Foundation

- **Playwright**: 브라우저 자동화 테스트
- **Test Environment**: Docker Compose로 전체 스택 실행
- **CI/CD Integration**: GitHub Actions에서 자동 실행

### Code Quality Tools

**ESLint Configuration:**
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/jsx-no-leaked-render": "error"
  }
}
```

**Prettier Configuration:**
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### CI/CD Pipeline Design

**GitHub Actions Workflow:**
1. **Dependency Installation**: pnpm install with cache
2. **Type Checking**: TypeScript 컴파일 검증
3. **Linting**: ESLint 규칙 검증
4. **Unit Tests**: Vitest 실행
5. **Build Verification**: 모든 앱 빌드 성공 확인

### Development Scripts

**Root Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "format": "prettier --write .",
    "type-check": "turbo type-check",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "setup": "pnpm install && pnpm docker:up",
    "contracts:generate": "pnpm --filter contracts generate",
    "contracts:mock": "pnpm --filter contracts mock",
    "prepare": "husky install"
  }
}
```

**Git Hooks Setup:**
```json
{
  "husky": "^9.1.0",
  "lint-staged": "^15.2.0"
}
```

**Lint-staged Configuration (.lintstagedrc.json):**
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yaml,yml}": ["prettier --write"]
}
```

## Implementation Considerations

### Performance Optimizations

- **pnpm**: 심볼릭 링크 기반 효율적인 패키지 관리
- **Turbo Cache**: 빌드 결과물 캐싱으로 반복 빌드 시간 단축
- **Vite HMR**: 개발 시 빠른 핫 리로드

### Security Measures

- **Environment Variables**: 민감 정보는 .env.local에서 관리
- **TypeScript Strict Mode**: 타입 안전성 보장
- **Dependency Auditing**: pnpm audit으로 보안 취약점 검사

### Scalability Considerations

- **Modular Architecture**: 기능별 패키지 분리로 확장성 확보
- **Contract-First**: OpenAPI 기반 API 설계로 프론트엔드/백엔드 독립 개발
- **Container Ready**: Docker 기반 배포 환경 준비