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

- [x] 3.2.3 JSDoc 표준 적용 및 ESLint 통합
  - [x] 루트 package.json에 eslint-plugin-jsdoc 의존성 추가
  - [x] packages/config ESLint 설정에 JSDoc 규칙 통합
  - [x] VS Code 스니펫 및 JSDoc 템플릿 생성
  - [x] 기존 코드에 JSDoc 주석 적용 (공통 유틸리티 함수 우선)
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3.3 Frontend 핵심 패키지 설치
- [x] 3.3.1 React 19, TypeScript, Vite 관련 패키지 설치
  - React 19, React DOM 최신 버전 설치
  - TypeScript 및 관련 타입 정의 설치 (@types/react, @types/react-dom)
  - Vite 및 React 플러그인 설치 (@vitejs/plugin-react)
  - _Requirements: 2.1, 2.2_

- [x] 3.3.2 Tiptap 에디터 패키지 설치
  - @tiptap/react, @tiptap/pm, @tiptap/starter-kit 설치
  - 에디터 확장 패키지 설치 (@tiptap/extension-*)
  - _Requirements: 3.1_

- [x] 3.3.3 실시간 협업 패키지 설치
  - yjs, y-prosemirror, @hocuspocus/provider 설치
  - Y.js 관련 유틸리티 패키지 설치
  - _Requirements: 3.2_

- [x] 3.3.4 TailwindCSS 설치 및 설정
  - TailwindCSS 및 관련 패키지 설치
  - tailwind.config.js 파일 생성 및 설정
  - 기본 CSS 파일에 Tailwind 지시문 추가
  - PostCSS 설정 파일 생성
  - _Requirements: 2.1, 2.2_

- [x] 3.3.5 상태 관리 및 기타 패키지 설치
  - Zustand 상태 관리 라이브러리 설치
  - react-dropzone 파일 업로드 라이브러리 설치
  - 기타 유틸리티 패키지 설치
  - _Requirements: 2.1_

- [x] 3.4 Shadcn/ui 설정

- [x] 3.4.1 Shadcn/ui 초기화 및 components.json 설정
  - Shadcn/ui CLI 초기화 실행
  - components.json 설정 파일 구성
  - 기본 디렉토리 구조 설정
  - _Requirements: 2.1, 2.2_

- [x] 3.4.2 기본 UI 컴포넌트 설치
  - Button, Input, Card 컴포넌트 설치
  - 컴포넌트 스타일 및 variants 설정
  - 컴포넌트 export 설정
  - _Requirements: 2.1, 2.2_

- [x] 3.4.3 디자인 토큰 및 CSS 변수 설정
  - CSS 변수 기반 디자인 토큰 정의
  - 다크/라이트 테마 설정
  - 색상 팔레트 및 타이포그래피 설정
  - _Requirements: 2.1, 2.2_

- [ ] 3.5 기본 프로젝트 구조 생성
- [ ] 3.5.1 디렉토리 구조 생성
  - src/components, src/pages, src/hooks, src/stores 디렉토리 생성
  - 각 디렉토리별 index.ts 파일 생성
  - 기본 디렉토리 구조 문서화
  - _Requirements: 2.1, 2.2_

- [ ] 3.5.2 기본 라우팅 설정
  - React Router 패키지 설치
  - 기본 라우터 설정 및 페이지 구조 정의
  - 라우트 보호 및 네비게이션 설정
  - _Requirements: 2.1, 2.2_

- [ ] 3.5.3 환경변수 타입 정의 및 Zod 스키마 생성
  - 환경변수 타입 인터페이스 정의
  - Zod 스키마 기반 환경변수 검증 로직
  - 환경변수 로딩 및 검증 유틸리티
  - _Requirements: 6.1_

- [ ] 3.5.4 기본 에디터 컴포넌트 스켈레톤 생성
  - 에디터 컴포넌트 기본 구조 생성
  - 에디터 관련 타입 및 인터페이스 정의
  - 기본 에디터 스타일 및 레이아웃 설정
  - _Requirements: 2.1, 2.2_

- [ ] 4. Backend 앱 (apps/api) 초기 설정
- [ ] 4.1 NestJS 프로젝트 생성
- [ ] 4.1.1 NestJS 프로젝트 초기화
  - apps/api 디렉토리에 NestJS 프로젝트 생성
  - 기본 프로젝트 구조 및 파일 생성
  - NestJS CLI 설정 및 구성
  - _Requirements: 2.1, 2.2_

- [ ] 4.1.2 package.json 설정
  - 패키지명 설정 (name: @mini-notion/api)
  - 최신 패키지 버전으로 의존성 설정
  - 스크립트 및 메타데이터 구성
  - _Requirements: 2.1, 2.2_

- [ ] 4.1.3 TypeScript 설정
  - TypeScript strict 모드 활성화
  - tsconfig.json 파일 구성
  - 경로 별칭 및 컴파일 옵션 설정
  - _Requirements: 2.1, 2.2_

- [ ] 4.1.4 기본 모듈 구조 생성
  - nest-cli.json 설정 파일 구성
  - 기본 AppModule, AppController, AppService 생성
  - 모듈 구조 및 의존성 주입 설정
  - _Requirements: 2.1, 2.2_

- [ ] 4.2 Backend 핵심 패키지 설치
- [ ] 4.2.1 NestJS 핵심 패키지 설치
  - @nestjs/core, @nestjs/common, @nestjs/platform-express 설치
  - NestJS 관련 타입 정의 및 개발 도구 설치
  - 기본 NestJS 설정 및 구성
  - _Requirements: 2.1, 2.2_

- [ ] 4.2.2 Prisma ORM 설치
  - @prisma/client, prisma 패키지 설치
  - Prisma CLI 및 개발 도구 설정
  - 기본 Prisma 설정 파일 생성
  - _Requirements: 5.1_

- [ ] 4.2.3 Redis 패키지 설치
  - ioredis, @nestjs/redis 패키지 설치
  - Redis 연결 및 설정 모듈 구성
  - Redis 타입 정의 및 유틸리티 설치
  - _Requirements: 5.2_

- [ ] 4.2.4 인증 패키지 설치
  - @nestjs/jwt, @nestjs/passport, passport-jwt 설치
  - 인증 관련 타입 정의 및 전략 설정
  - JWT 및 Passport 설정 구성
  - _Requirements: 2.1, 2.2_

- [ ] 4.2.5 보안 패키지 설치
  - helmet, express-rate-limit 패키지 설치
  - 보안 미들웨어 및 설정 구성
  - CORS 및 기타 보안 도구 설치
  - _Requirements: 2.1, 2.2_

- [ ] 4.2.6 Hocuspocus 서버 설치
  - @hocuspocus/server 패키지 설치
  - 실시간 협업 서버 설정 및 구성
  - Y.js 관련 서버 패키지 설치
  - _Requirements: 5.1, 5.2_

- [ ] 4.3 데이터베이스 및 환경 설정
- [ ] 4.3.1 Prisma 스키마 파일 초기화
  - prisma/schema.prisma 파일 생성
  - 기본 데이터베이스 스키마 정의
  - Prisma 생성기 및 데이터소스 설정
  - _Requirements: 5.1_

- [ ] 4.3.2 환경변수 스키마 정의 및 Zod 검증 설정
  - 환경변수 타입 인터페이스 정의
  - Zod 스키마 기반 환경변수 검증 로직
  - 환경변수 로딩 및 검증 모듈 생성
  - _Requirements: 6.1, 6.2_

- [ ] 4.3.3 기본 데이터베이스 연결 설정
  - Prisma 클라이언트 연결 설정
  - 데이터베이스 연결 풀 및 설정 구성
  - 연결 상태 모니터링 및 헬스체크
  - _Requirements: 5.1_

- [ ] 4.3.4 Redis 연결 설정 및 모듈 구성
  - Redis 연결 설정 및 구성
  - Redis 모듈 및 서비스 생성
  - 캐싱 및 세션 관리 설정
  - _Requirements: 5.2_

- [ ] 4.4 기본 모듈 구조 생성
- [ ] 4.4.1 모듈 디렉토리 구조 생성
  - src/modules 디렉토리 생성
  - auth, users, documents, collaboration 모듈 디렉토리 생성
  - 각 모듈별 기본 파일 구조 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4.4.2 공통 디렉토리 구조 생성
  - src/common 디렉토리 생성
  - guards, interceptors, pipes 디렉토리 생성
  - 공통 유틸리티 및 데코레이터 디렉토리 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4.4.3 설정 디렉토리 및 파일 생성
  - src/config 디렉토리 생성
  - 데이터베이스, Redis, JWT 설정 파일 생성
  - 환경별 설정 파일 구조 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4.4.4 기본 헬스체크 엔드포인트 구현
  - 헬스체크 컨트롤러 및 서비스 생성
  - 데이터베이스 및 Redis 연결 상태 확인
  - 기본 API 응답 형식 정의
  - _Requirements: 2.1, 2.2_

- [ ] 5. 공통 패키지 (packages/) 설정
- [ ] 5.1 Shared 패키지 생성
- [ ] 5.1.1 Shared 패키지 프로젝트 초기화
  - packages/shared 디렉토리 생성
  - package.json 및 tsconfig.json 파일 생성
  - 기본 프로젝트 구조 및 설정 구성
  - _Requirements: 1.2_

- [ ] 5.1.2 공통 타입 정의 파일 생성
  - src/types 디렉토리 생성
  - 도메인별 타입 정의 파일 생성
  - 공통 기본 타입 및 유틸리티 타입 정의
  - _Requirements: 6.1_

- [ ] 5.1.3 Zod 스키마 파일 생성
  - src/schemas 디렉토리 생성
  - 데이터 검증용 Zod 스키마 정의
  - 스키마 기반 타입 추론 설정
  - _Requirements: 6.2_

- [ ] 5.1.4 공통 유틸리티 함수 생성
  - src/utils 디렉토리 생성
  - 공통 유틸리티 함수 및 헬퍼 구현
  - 상수 정의 및 공통 로직 구현
  - _Requirements: 1.2_

- [ ] 5.1.5 빌드 설정 및 타입 선언 파일 생성
  - TypeScript 빌드 설정 구성
  - 타입 선언 파일 생성 및 export 설정
  - 패키지 배포 및 사용 설정
  - _Requirements: 1.2_

- [ ] 5.2 UI 컴포넌트 라이브러리 생성
- [ ] 5.2.1 UI 패키지 프로젝트 초기화
  - packages/ui 디렉토리 생성
  - package.json 및 tsconfig.json 파일 생성
  - React 컴포넌트 라이브러리 기본 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5.2.2 TailwindCSS 설정 및 디자인 토큰 정의
  - TailwindCSS 설정 파일 생성
  - 디자인 토큰 및 테마 정의
  - CSS 변수 및 커스텀 스타일 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5.2.3 Shadcn/ui 기반 공통 컴포넌트 구조 생성
  - Shadcn/ui 컴포넌트 기본 구조 생성
  - 공통 UI 컴포넌트 템플릿 구성
  - 컴포넌트 스토리북 및 문서화 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5.2.4 컴포넌트 빌드 및 export 설정
  - 컴포넌트 빌드 시스템 구성
  - export 경로 및 모듈 설정
  - 타입 정의 및 배포 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5.3 Contracts 패키지 생성
- [ ] 5.3.1 Contracts 패키지 프로젝트 초기화
  - packages/contracts 디렉토리 생성
  - package.json 및 tsconfig.json 파일 생성
  - API 계약 관리 기본 설정 구성
  - _Requirements: 1.2_

- [ ] 5.3.2 OpenAPI 디렉토리 및 기본 API 스펙 파일 생성
  - openapi 디렉토리 생성
  - 기본 API 스펙 파일 (YAML) 생성
  - API 문서 구조 및 스키마 정의
  - _Requirements: 2.1_

- [ ] 5.3.3 OpenAPI 도구 설치
  - openapi-typescript 패키지 설치
  - @stoplight/prism-cli 목 서버 도구 설치
  - API 스펙 검증 및 린팅 도구 설치
  - _Requirements: 2.1_

- [ ] 5.3.4 타입 생성 스크립트 및 목 서버 설정
  - TypeScript 타입 자동 생성 스크립트 구성
  - Prism 목 서버 설정 및 구성
  - API 계약 테스트 및 검증 설정
  - _Requirements: 1.2, 2.1_

- [ ] 6. 개발 도구 및 코드 품질 설정
- [ ] 6.1 ESLint 및 Prettier 설정
- [ ] 6.1.1 루트 ESLint 설정 파일 생성
  - 루트 .eslintrc.js 파일 생성
  - TypeScript 및 React 19 규칙 설정
  - 기본 린팅 규칙 및 플러그인 구성
  - _Requirements: 4.1, 4.2_

- [ ] 6.1.2 Prettier 설정 파일 생성
  - .prettierrc 파일 생성
  - 프로젝트 표준 포맷팅 규칙 정의
  - 코드 스타일 및 포맷팅 옵션 설정
  - _Requirements: 4.2_

- [ ] 6.1.3 앱별 ESLint 설정 파일 생성
  - 각 앱별 ESLint 설정 파일 생성
  - 상속 구조 및 앱별 특화 규칙 설정
  - 환경별 린팅 규칙 구성
  - _Requirements: 4.1, 4.3_

- [ ] 6.1.4 ESLint와 Prettier 통합 설정
  - ESLint-Prettier 통합 설정 구성
  - 규칙 충돌 방지 및 자동 수정 설정
  - 에디터 통합 및 자동화 설정
  - _Requirements: 4.2, 4.3_

- [ ] 6.2 Git Hooks 및 커밋 검증 설정
- [ ] 6.2.1 Husky pre-commit hook 설정
  - .husky/pre-commit hook 파일 생성
  - 커밋 전 자동 검증 스크립트 구성
  - 린팅 및 포맷팅 자동 실행 설정
  - _Requirements: 4.3_

- [ ] 6.2.2 lint-staged 설정
  - lint-staged 설정 파일 생성 (.lintstagedrc.json)
  - 변경된 파일만 선택적 린팅 설정
  - 파일 타입별 처리 규칙 구성
  - _Requirements: 4.3_

- [ ] 6.2.3 commitlint 설정
  - commitlint.config.js 파일 생성
  - 커밋 메시지 규칙 및 형식 정의
  - 커밋 메시지 검증 규칙 구성
  - _Requirements: 4.3_

- [ ] 6.2.4 commit-msg hook 설정
  - .husky/commit-msg hook 파일 생성
  - 커밋 메시지 자동 검증 설정
  - 커밋 메시지 형식 강제 적용
  - _Requirements: 4.3_

- [ ] 7. Docker 개발 환경 구성
- [ ] 7.1 Docker Compose 서비스 설정
- [ ] 7.1.1 Docker Compose 파일 생성
  - docker-compose.yml 파일 생성
  - 기본 서비스 구조 및 설정 정의
  - 개발 환경용 Docker Compose 구성
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.1.2 PostgreSQL 서비스 정의
  - PostgreSQL 15 서비스 설정
  - 포트 5432 및 볼륨 설정 구성
  - 데이터베이스 초기화 및 설정
  - _Requirements: 5.1_

- [ ] 7.1.3 Redis 서비스 정의
  - Redis 7 서비스 설정
  - 포트 6379 및 볼륨 설정 구성
  - Redis 설정 파일 및 지속성 설정
  - _Requirements: 5.2_

- [ ] 7.1.4 MinIO 서비스 정의
  - MinIO 서비스 설정
  - 포트 9000/9001 및 볼륨 설정 구성
  - 객체 스토리지 설정 및 버킷 구성
  - _Requirements: 5.3_

- [ ] 7.1.5 네트워크 및 환경변수 설정
  - Docker 네트워크 설정 및 구성
  - 서비스 간 통신 및 환경변수 설정
  - 개발 환경 전용 설정 구성
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.2 Docker 관련 설정 파일 생성
- [ ] 7.2.1 Docker 초기화 스크립트 생성
  - tools/docker 디렉토리 생성
  - 데이터베이스 초기화 스크립트 생성
  - 개발 환경 설정 자동화 스크립트
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.2.2 .dockerignore 파일 생성
  - .dockerignore 파일 생성
  - 불필요한 파일 및 디렉토리 제외 설정
  - 빌드 최적화를 위한 무시 규칙 정의
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.2.3 개발용 Dockerfile 템플릿 생성
  - 개발용 Dockerfile 템플릿 생성
  - 멀티스테이지 빌드 구조 정의
  - 향후 프로덕션 배포용 기본 구조
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. 환경변수 관리 시스템 구성
- [ ] 8.1 환경변수 파일 및 템플릿 생성
- [ ] 8.1.1 루트 환경변수 템플릿 업데이트
  - 루트 .env.example 파일 업데이트
  - 전체 프로젝트 환경변수 템플릿 정의
  - 환경변수 설명 및 기본값 설정
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.1.2 Frontend 환경변수 파일 생성
  - apps/web/.env.development 파일 생성
  - 프론트엔드 개발 환경 변수 설정
  - Vite 환경변수 형식 및 규칙 적용
  - _Requirements: 6.1, 6.2_

- [ ] 8.1.3 Backend 환경변수 파일 생성
  - apps/api/.env.development 파일 생성
  - 백엔드 개발 환경 변수 설정
  - 데이터베이스 및 서비스 연결 설정
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.1.4 .gitignore 환경변수 패턴 추가
  - .gitignore에 환경변수 파일 패턴 추가
  - 민감한 정보 보호 설정
  - 환경별 파일 관리 규칙 정의
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2 환경변수 검증 스키마 구현
- [ ] 8.2.1 Frontend 환경변수 스키마 생성
  - apps/web/src/config/env.schema.ts 파일 생성
  - Vite 환경변수 Zod 스키마 정의
  - 프론트엔드 환경변수 타입 및 검증 로직
  - _Requirements: 6.1, 6.2_

- [ ] 8.2.2 Backend 환경변수 스키마 생성
  - apps/api/src/config/env.schema.ts 파일 생성
  - NestJS 환경변수 Zod 스키마 정의
  - 백엔드 환경변수 타입 및 검증 로직
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2.3 환경변수 검증 로직 구현
  - Zod 기반 환경변수 검증 로직 구현
  - 환경변수 파싱 및 타입 변환 로직
  - 검증 실패 시 에러 처리 및 로깅
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2.4 앱 시작 시 환경변수 검증 적용
  - 앱 시작 시 환경변수 자동 검증 설정
  - 검증 실패 시 앱 시작 중단 로직
  - 개발/프로덕션 환경별 검증 레벨 설정
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. 테스트 환경 기반 구성
- [ ] 9.1 Frontend 테스트 환경 설정
- [ ] 9.1.1 Vitest 설정 파일 생성
  - apps/web에 vitest.config.ts 파일 생성
  - Vitest 기본 설정 및 옵션 구성
  - 테스트 환경 및 모킹 설정
  - _Requirements: 7.1, 7.2_

- [ ] 9.1.2 React Testing Library 패키지 설치
  - React Testing Library 및 관련 패키지 설치
  - 테스트 유틸리티 및 매처 설치
  - React 19 호환 테스트 도구 설정
  - _Requirements: 7.1, 7.2_

- [ ] 9.1.3 테스트 셋업 파일 생성
  - setupTests.ts 파일 생성
  - 전역 테스트 설정 및 모킹 구성
  - 테스트 환경 초기화 로직
  - _Requirements: 7.1, 7.2_

- [ ] 9.1.4 기본 컴포넌트 테스트 예시 작성
  - 기본 컴포넌트 테스트 예시 작성
  - 테스트 패턴 및 베스트 프랙티스 정의
  - 테스트 커버리지 설정 및 리포팅
  - _Requirements: 7.1, 7.2_

- [ ] 9.2 Backend 테스트 환경 설정
- [ ] 9.2.1 Jest 설정 파일 생성
  - apps/api에 jest.config.js 파일 생성
  - Jest 기본 설정 및 NestJS 통합 구성
  - 테스트 환경 및 모킹 설정
  - _Requirements: 7.1, 7.2_

- [ ] 9.2.2 테스트 패키지 설치
  - Supertest API 테스트 패키지 설치
  - TestContainers 통합 테스트 패키지 설치
  - NestJS 테스트 유틸리티 및 모킹 도구 설치
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9.2.3 테스트 데이터베이스 설정
  - 테스트 데이터베이스 설정 및 초기화 로직
  - TestContainers 기반 데이터베이스 설정
  - 테스트 데이터 시딩 및 정리 로직
  - _Requirements: 7.1, 7.3_

- [ ] 9.2.4 기본 API 테스트 예시 작성
  - 기본 API 엔드포인트 테스트 예시 작성
  - 통합 테스트 패턴 및 베스트 프랙티스 정의
  - 테스트 커버리지 설정 및 리포팅
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. CI/CD 파이프라인 기본 구성
- [ ] 10.1 GitHub Actions 워크플로우 생성
- [ ] 10.1.1 GitHub Actions 디렉토리 생성
  - .github/workflows 디렉토리 생성
  - 기본 워크플로우 구조 및 템플릿 설정
  - GitHub Actions 설정 파일 구조 정의
  - _Requirements: 7.2_

- [ ] 10.1.2 CI 워크플로우 파일 생성
  - ci.yml 파일 생성
  - 린팅, 타입 검사, 테스트, 빌드 작업 정의
  - 워크플로우 트리거 및 조건 설정
  - _Requirements: 7.2_

- [ ] 10.1.3 pnpm 캐싱 및 의존성 최적화 설정
  - pnpm 캐싱 설정 및 최적화
  - 의존성 설치 속도 개선 설정
  - 캐시 키 및 복원 전략 구성
  - _Requirements: 7.2_

- [ ] 10.1.4 병렬 작업 및 매트릭스 빌드 설정
  - 병렬 작업 및 매트릭스 빌드 설정
  - 다중 Node.js 버전 테스트 구성
  - 작업 의존성 및 실행 순서 정의
  - _Requirements: 7.2_

- [ ] 10.2 개발 환경 검증 및 문서화
- [ ] 10.2.1 전체 프로젝트 빌드 테스트
  - 전체 프로젝트 빌드 테스트 (pnpm build)
  - 빌드 오류 및 경고 해결
  - 빌드 성능 및 최적화 검증
  - _Requirements: 1.1, 1.2_

- [ ] 10.2.2 개발 서버 시작 테스트
  - 개발 서버 시작 테스트 (pnpm dev)
  - 핫 리로드 및 개발 환경 기능 검증
  - 서비스 간 연동 및 통신 테스트
  - _Requirements: 1.1, 1.2_

- [ ] 10.2.3 README.md 업데이트
  - README.md 파일 업데이트
  - 설치, 개발, 빌드 가이드 작성
  - 프로젝트 구조 및 사용법 문서화
  - _Requirements: 1.3_

- [ ] 10.2.4 개발자 온보딩 체크리스트 작성
  - 개발자 온보딩 체크리스트 작성
  - 개발 환경 설정 가이드 문서화
  - 트러블슈팅 및 FAQ 섹션 추가
  - _Requirements: 1.3_