# Implementation Plan

- [x] 1. 모노레포 기본 구조 생성
  - [x] 루트 디렉토리에 pnpm 워크스페이스 설정
  - [x] apps/, packages/, tools/, docs/ 디렉토리 구조 생성
  - [x] 기본 .gitignore, README.md 파일 작성
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 패키지 매니저 및 빌드 시스템 설정
- [x] 2.1 pnpm 워크스페이스 구성
  - [x] 루트 package.json에 workspaces 설정
  - [x] packageManager 필드로 pnpm 버전 고정
  - [x] engines 필드로 Node.js 버전 제약 설정
  - _Requirements: 1.1, 1.3_

- [x] 2.2 Turbo 빌드 시스템 설정
  - [x] turbo.json 파이프라인 설정 파일 생성
  - [x] 빌드, 개발, 테스트, 린트 태스크 정의
  - [x] 캐싱 및 의존성 설정 구성
  - _Requirements: 1.1, 1.3_

- [ ] 3. Frontend 앱 (apps/web) 초기 설정
- [x] 3.1 Vite + React 19 프로젝트 생성
  - [x] apps/web 디렉토리에 Vite 기반 React 19 프로젝트 초기화
  - [x] package.json 설정 (name: @mini-notion/web, 최신 패키지 버전)
  - [x] TypeScript strict 모드 설정 및 tsconfig.json 구성
  - [x] Vite 설정 파일 생성 (포트 3000, 절대 경로 @/ 별칭)
  - [x] 기본 App.tsx 및 main.tsx 파일 생성
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 모노레포 설정 표준화 구현
- [x] 3.2.1 packages/config 패키지 생성
  - [x] packages/config 디렉토리 및 package.json 생성
  - [x] TypeScript 설정 파일들 생성 (base.json, react.json, node.json)
  - [x] ESLint 설정 파일들 생성 (base.js, react.js, jsdoc.js)
  - [x] Prettier 설정 파일 생성 (index.js)
  - [x] peerDependencies 설정 및 exports 경로 정의
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 3.2.2 공통 타입 패키지 구조 정립
  - [x] packages/shared/src/types 디렉토리 구조 생성
  - [x] 도메인별 타입 파일 생성 (user.types.ts, document.types.ts, collaboration.types.ts)
  - [x] 공통 기본 타입 파일 생성 (base.types.ts, api.types.ts)
  - [x] 에디터 특화 타입 파일 생성 (blocks.types.ts, commands.types.ts)
  - [x] JSDoc 문서화 적용 및 타입 테스트 파일 생성
  - _Requirements: 1.2, 2.1, 6.1_

- [ ] 3.2.3 JSDoc 표준 적용 및 ESLint 통합
  - [ ] 루트 package.json에 eslint-plugin-jsdoc 의존성 추가
  - [ ] packages/config ESLint 설정에 JSDoc 규칙 통합
  - [ ] VS Code 스니펫 및 JSDoc 템플릿 생성
  - [ ] 기존 코드에 JSDoc 주석 적용 (공통 유틸리티 함수 우선)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3.3 Frontend 핵심 패키지 설치
  - [ ] React 19, TypeScript, Vite 관련 패키지 설치
  - [ ] @tiptap/react, @tiptap/pm, @tiptap/starter-kit 설치
  - [ ] yjs, y-prosemirror, @hocuspocus/provider 설치
  - [ ] TailwindCSS, PostCSS, Autoprefixer 설치
  - [ ] Zustand, react-dropzone 설치
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 3.4 TailwindCSS 및 Shadcn/ui 설정
  - [ ] TailwindCSS 설정 파일 생성 및 기본 스타일 적용
  - [ ] Shadcn/ui 초기화 및 components.json 설정
  - [ ] 기본 UI 컴포넌트 (Button, Input, Card) 설치
  - [ ] 디자인 토큰 및 CSS 변수 설정
  - _Requirements: 2.1, 2.2_

- [ ] 3.5 기본 프로젝트 구조 생성
  - [ ] src/components, src/pages, src/hooks, src/stores 디렉토리 생성
  - [ ] 기본 라우팅 설정 (React Router 설치 및 설정)
  - [ ] 환경변수 타입 정의 및 Zod 스키마 생성
  - [ ] 기본 에디터 컴포넌트 스켈레톤 생성
  - _Requirements: 2.1, 2.2, 6.1_

- [ ] 4. Backend 앱 (apps/api) 초기 설정
- [ ] 4.1 NestJS 프로젝트 생성
  - [ ] apps/api 디렉토리에 NestJS 프로젝트 초기화
  - [ ] package.json 설정 (name: @mini-notion/api, 최신 패키지 버전)
  - [ ] TypeScript strict 모드 설정 및 tsconfig.json 구성
  - [ ] nest-cli.json 설정 및 기본 모듈 구조 생성
  - [ ] 기본 AppModule, AppController, AppService 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4.2 Backend 핵심 패키지 설치
  - [ ] NestJS 핵심 패키지 (@nestjs/core, @nestjs/common, @nestjs/platform-express)
  - [ ] Prisma ORM (@prisma/client, prisma) 설치
  - [ ] Redis (ioredis, @nestjs/redis) 설치
  - [ ] 인증 패키지 (@nestjs/jwt, @nestjs/passport, passport-jwt) 설치
  - [ ] 보안 패키지 (helmet, express-rate-limit) 설치
  - [ ] Hocuspocus (@hocuspocus/server) 설치
  - _Requirements: 2.1, 2.2, 5.1, 5.2_

- [ ] 4.3 데이터베이스 및 환경 설정
  - [ ] Prisma 스키마 파일 초기화 (prisma/schema.prisma)
  - [ ] 환경변수 스키마 정의 및 Zod 검증 설정
  - [ ] 기본 데이터베이스 연결 설정
  - [ ] Redis 연결 설정 및 모듈 구성
  - _Requirements: 5.1, 5.2, 6.1, 6.2_

- [ ] 4.4 기본 모듈 구조 생성
  - [ ] src/modules 디렉토리 구조 생성 (auth, users, documents, collaboration)
  - [ ] src/common 디렉토리 구조 생성 (guards, interceptors, pipes)
  - [ ] src/config 디렉토리 및 설정 파일들 생성
  - [ ] 기본 헬스체크 엔드포인트 구현
  - _Requirements: 2.1, 2.2_

- [ ] 5. 공통 패키지 (packages/) 설정
- [ ] 5.1 Shared 패키지 생성
  - [ ] packages/shared 프로젝트 초기화 (package.json, tsconfig.json)
  - [ ] src/types 디렉토리 및 공통 타입 정의 파일 생성
  - [ ] src/schemas 디렉토리 및 Zod 스키마 파일 생성
  - [ ] src/utils 디렉토리 및 공통 유틸리티 함수 생성
  - [ ] 빌드 설정 및 타입 선언 파일 생성
  - _Requirements: 1.2, 6.1, 6.2_

- [ ] 5.2 UI 컴포넌트 라이브러리 생성
  - [ ] packages/ui 프로젝트 초기화 (package.json, tsconfig.json)
  - [ ] TailwindCSS 설정 및 디자인 토큰 정의
  - [ ] Shadcn/ui 기반 공통 컴포넌트 구조 생성
  - [ ] 컴포넌트 빌드 및 export 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5.3 Contracts 패키지 생성
  - [ ] packages/contracts 프로젝트 초기화 (package.json, tsconfig.json)
  - [ ] openapi 디렉토리 및 기본 API 스펙 파일 생성
  - [ ] openapi-typescript, @stoplight/prism-cli 설치
  - [ ] 타입 생성 스크립트 및 목 서버 설정
  - _Requirements: 1.2, 2.1_

- [ ] 6. 개발 도구 및 코드 품질 설정
- [ ] 6.1 ESLint 및 Prettier 설정
  - [ ] 루트 .eslintrc.js 파일 생성 (TypeScript, React 19 규칙)
  - [ ] .prettierrc 파일 생성 (프로젝트 표준 포맷팅 규칙)
  - [ ] 각 앱별 ESLint 설정 파일 생성 및 상속 구조 설정
  - [ ] ESLint와 Prettier 통합 설정 및 충돌 방지
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.2 Git Hooks 및 커밋 검증 설정
  - [ ] .husky/pre-commit hook 파일 생성
  - [ ] lint-staged 설정 파일 생성 (.lintstagedrc.json)
  - [ ] commitlint.config.js 파일 생성 및 커밋 메시지 규칙 설정
  - [ ] .husky/commit-msg hook 파일 생성
  - _Requirements: 4.3_

- [ ] 7. Docker 개발 환경 구성
- [ ] 7.1 Docker Compose 서비스 설정
  - [ ] docker-compose.yml 파일 생성
  - [ ] PostgreSQL 15 서비스 정의 (포트 5432, 볼륨 설정)
  - [ ] Redis 7 서비스 정의 (포트 6379, 볼륨 설정)
  - [ ] MinIO 서비스 정의 (포트 9000/9001, 볼륨 설정)
  - [ ] 네트워크 및 환경변수 설정
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.2 Docker 관련 설정 파일 생성
  - [ ] tools/docker 디렉토리에 초기화 스크립트 생성
  - [ ] .dockerignore 파일 생성
  - [ ] 개발용 Dockerfile 템플릿 생성 (향후 사용)
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. 환경변수 관리 시스템 구성
- [ ] 8.1 환경변수 파일 및 템플릿 생성
  - [ ] 루트 .env.example 파일 업데이트 (전체 프로젝트 환경변수)
  - [ ] apps/web/.env.development 파일 생성
  - [ ] apps/api/.env.development 파일 생성
  - [ ] .gitignore에 환경변수 파일 패턴 추가
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2 환경변수 검증 스키마 구현
  - [ ] apps/web/src/config/env.schema.ts 파일 생성
  - [ ] apps/api/src/config/env.schema.ts 파일 생성
  - [ ] Zod 기반 환경변수 검증 로직 구현
  - [ ] 앱 시작 시 환경변수 검증 적용
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. 테스트 환경 기반 구성
- [ ] 9.1 Frontend 테스트 환경 설정
  - [ ] apps/web에 Vitest 설정 파일 생성 (vitest.config.ts)
  - [ ] React Testing Library 및 관련 패키지 설치
  - [ ] 테스트 셋업 파일 생성 (setupTests.ts)
  - [ ] 기본 컴포넌트 테스트 예시 작성
  - _Requirements: 7.1, 7.2_

- [ ] 9.2 Backend 테스트 환경 설정
  - [ ] apps/api에 Jest 설정 파일 생성 (jest.config.js)
  - [ ] Supertest 및 TestContainers 패키지 설치
  - [ ] 테스트 데이터베이스 설정 및 초기화 로직
  - [ ] 기본 API 테스트 예시 작성
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. CI/CD 파이프라인 기본 구성
- [ ] 10.1 GitHub Actions 워크플로우 생성
  - [ ] .github/workflows 디렉토리 생성
  - [ ] ci.yml 파일 생성 (린팅, 타입 검사, 테스트, 빌드)
  - [ ] pnpm 캐싱 및 의존성 설치 최적화 설정
  - [ ] 병렬 작업 및 매트릭스 빌드 설정
  - _Requirements: 7.2_

- [ ] 10.2 개발 환경 검증 및 문서화
  - [ ] 전체 프로젝트 빌드 테스트 (pnpm build)
  - [ ] 개발 서버 시작 테스트 (pnpm dev)
  - [ ] README.md 업데이트 (설치, 개발, 빌드 가이드)
  - [ ] 개발자 온보딩 체크리스트 작성
  - _Requirements: 1.1, 1.2, 1.3_