# Implementation Plan

- [ ] 1. 모노레포 기본 구조 생성
  - [ ] 루트 디렉토리에 pnpm 워크스페이스 설정
  - [ ] apps/, packages/, tools/, docs/ 디렉토리 구조 생성
  - [ ] 기본 .gitignore, README.md 파일 작성
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. 패키지 매니저 및 빌드 시스템 설정
- [ ] 2.1 pnpm 워크스페이스 구성
  - [ ] 루트 package.json에 workspaces 설정
  - [ ] packageManager 필드로 pnpm 버전 고정
  - [ ] engines 필드로 Node.js 버전 제약 설정
  - _Requirements: 1.1, 1.3_

- [ ] 2.2 Turbo 빌드 시스템 설정
  - [ ] turbo.json 파이프라인 설정 파일 생성
  - [ ] 빌드, 개발, 테스트, 린트 태스크 정의
  - [ ] 캐싱 및 의존성 설정 구성
  - _Requirements: 1.1, 1.3_

- [ ] 3. Frontend 앱 (apps/web) 초기 설정
- [ ] 3.1 Vite + React 19 프로젝트 생성
  - [ ] Vite 기반 React 19 프로젝트 초기화
  - [ ] TypeScript strict 모드 설정
  - [ ] 기본 컴포넌트 및 라우팅 구조 생성
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Tiptap 에디터 기본 패키지 설치
  - [ ] @tiptap/react, @tiptap/pm 핵심 패키지 설치
  - [ ] 기본 확장들 설치 및 에디터 초기화 테스트
  - [ ] 에디터 컴포넌트 기본 구조 생성
  - _Requirements: 3.1, 3.2_

- [ ] 3.3 Y.js 실시간 협업 패키지 설치
  - [ ] yjs, y-prosemirror, @hocuspocus/provider 설치
  - [ ] Y.js 문서 생성 및 기본 동기화 테스트
  - [ ] Hocuspocus provider 연결 설정
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.4 Shadcn/ui 및 스타일링 설정
  - [ ] TailwindCSS, PostCSS, Autoprefixer 설치
  - [ ] Shadcn/ui 초기화 및 기본 컴포넌트 설치
  - [ ] 디자인 토큰 및 CSS 변수 설정
  - _Requirements: 2.1, 2.2_

- [ ] 3.5 상태 관리 및 유틸리티 라이브러리 설치
  - [ ] Zustand 상태 관리 라이브러리 설치
  - [ ] react-dropzone 파일 업로드 라이브러리 설치
  - [ ] 기본 스토어 구조 및 파일 업로드 컴포넌트 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4. Backend 앱 (apps/api) 초기 설정
- [ ] 4.1 NestJS 프로젝트 생성
  - [ ] NestJS CLI로 기본 프로젝트 구조 생성
  - [ ] TypeScript strict 모드 설정
  - [ ] 기본 모듈, 컨트롤러, 서비스 구조 생성
  - _Requirements: 2.1, 2.2_

- [ ] 4.2 데이터베이스 및 ORM 설정
  - [ ] Prisma ORM 설치 및 초기화
  - [ ] PostgreSQL 연결 설정
  - [ ] 기본 스키마 파일 생성 및 마이그레이션 설정
  - _Requirements: 5.1, 5.2_

- [ ] 4.3 Redis 캐싱 시스템 설정
  - [ ] ioredis 라이브러리 설치
  - [ ] Redis 연결 설정 및 기본 캐시 서비스 생성
  - [ ] 연결 테스트 및 기본 캐시 작업 구현
  - _Requirements: 5.1, 5.2_

- [ ] 4.4 Hocuspocus 실시간 서버 설정
  - [ ] @hocuspocus/server 설치 및 기본 설정
  - [ ] WebSocket 서버 초기화 및 포트 설정
  - [ ] Y.js 문서 동기화 테스트 환경 구성
  - _Requirements: 3.3, 5.3_

- [ ] 4.5 인증 및 보안 패키지 설치
  - [ ] JWT, Passport 인증 라이브러리 설치
  - [ ] Helmet, express-rate-limit 보안 미들웨어 설치
  - [ ] 기본 인증 가드 및 보안 설정 구성
  - _Requirements: 2.1, 2.2_

- [ ] 4.6 파일 저장소 설정
  - [ ] multer 파일 업로드 미들웨어 설치
  - [ ] MinIO 클라이언트 라이브러리 설치
  - [ ] 파일 업로드 서비스 및 MinIO 연결 설정
  - _Requirements: 2.1, 2.2_

- [ ] 5. 공통 패키지 (packages/) 설정
- [ ] 5.1 Shared 패키지 생성
  - [ ] packages/shared 디렉토리 구조 생성
  - [ ] 공통 TypeScript 타입 정의 파일 생성
  - [ ] Zod 스키마 및 검증 로직 구현
  - _Requirements: 1.2, 6.1, 6.2_

- [ ] 5.2 UI 컴포넌트 라이브러리 생성
  - [ ] packages/ui 디렉토리 구조 생성
  - [ ] Shadcn/ui 기반 공통 컴포넌트 설정
  - [ ] TailwindCSS 설정 및 디자인 토큰 정의
  - _Requirements: 2.1, 2.2_

- [ ] 5.3 Contracts 패키지 생성
  - [ ] packages/contracts 디렉토리 구조 생성
  - [ ] OpenAPI 3.0 스펙 파일 템플릿 생성
  - [ ] openapi-typescript, Prism CLI 도구 설치
  - _Requirements: 1.2, 2.1_

- [ ] 6. 개발 도구 및 코드 품질 설정
- [ ] 6.1 ESLint 및 Prettier 설정
  - [ ] 모노레포 전체 ESLint 설정 파일 생성
  - [ ] TypeScript, React 19 규칙 적용
  - [ ] Prettier 포맷팅 규칙 설정 및 통합
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.2 Git Hooks 및 커밋 검증 설정
  - [ ] Husky 설치 및 pre-commit hook 설정
  - [ ] lint-staged로 스테이징된 파일만 검증
  - [ ] 커밋 메시지 규칙 및 검증 설정
  - _Requirements: 4.3_

- [ ] 7. Docker 개발 환경 구성
- [ ] 7.1 Docker Compose 서비스 설정
  - [ ] PostgreSQL 15, Redis 7, MinIO 서비스 정의
  - [ ] 볼륨 마운트 및 네트워크 설정
  - [ ] 환경변수 및 포트 매핑 구성
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.2 개발 환경 스크립트 작성
  - [ ] Docker 서비스 시작/중지 스크립트 생성
  - [ ] 데이터베이스 초기화 및 시드 스크립트 작성
  - [ ] 개발 환경 설정 자동화 스크립트 구현
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. 환경변수 관리 시스템 구성
- [ ] 8.1 Zod 기반 환경변수 검증 구현
  - [ ] Frontend 환경변수 스키마 정의 및 검증
  - [ ] Backend 환경변수 스키마 정의 및 검증
  - [ ] 환경별 설정 파일 템플릿 생성
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2 환경변수 파일 설정
  - [ ] .env.example 템플릿 파일 생성
  - [ ] 개발/테스트/프로덕션 환경별 설정 구분
  - [ ] 민감 정보 보안 처리 가이드 작성
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. 테스트 환경 기반 구성
- [ ] 9.1 단위 테스트 환경 설정
  - [ ] Vitest 설정 및 기본 테스트 구조 생성
  - [ ] React Testing Library 설정 및 컴포넌트 테스트 예시
  - [ ] Supertest API 테스트 환경 구성
  - _Requirements: 7.1, 7.2_

- [ ] 9.2 TestContainers 통합 테스트 설정
  - [ ] PostgreSQL, Redis TestContainers 설정
  - [ ] 테스트 데이터베이스 자동 생성/정리 로직
  - [ ] 통합 테스트 실행 환경 구성
  - _Requirements: 7.3_

- [ ] 10. CI/CD 파이프라인 기본 구성
- [ ] 10.1 GitHub Actions 워크플로우 생성
  - [ ] 의존성 설치 및 캐싱 설정
  - [ ] 타입 검사, 린팅, 테스트 단계 정의
  - [ ] 빌드 검증 및 아티팩트 생성 설정
  - _Requirements: 7.2_

- [ ] 10.2 개발 워크플로우 스크립트 통합
  - [ ] 루트 package.json 스크립트 정의
  - [ ] Turbo 명령어와 Docker 환경 통합
  - [ ] 개발자 온보딩 가이드 및 README 작성
  - _Requirements: 1.1, 1.2, 1.3_