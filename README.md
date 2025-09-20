# 미니 노션 (Mini Notion)

> 블록 기반 실시간 협업 에디터 - Tiptap과 Y.js를 활용한 현대적인 문서 편집 플랫폼

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9%2B-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)

## 🚀 프로젝트 개요

미니 노션은 블록 기반 편집 구조를 가진 실시간 협업 에디터입니다. 여러 사용자가 동시에 문서를 편집할 수 있으며, 대규모 팀에서 안정적으로 사용할 수 있는 문서 협업 플랫폼입니다.

### 핵심 기능

- **🔄 실시간 협업**: CRDT 기반 충돌 없는 동시 편집
- **📝 블록 기반 에디터**: 슬래시 커맨드와 드래그 앤 드롭 지원
- **🏢 워크스페이스 관리**: 계층적 페이지 구조와 권한 관리
- **🔒 보안**: JWT 인증 및 역할 기반 접근 제어
- **📱 반응형**: 모바일과 데스크톱 모두 지원

## 🏗️ 기술 스택

### Frontend
- **React 19** - 최신 Concurrent Features 활용
- **TypeScript** - 완전한 타입 안전성
- **Vite** - 빠른 개발 서버와 HMR
- **Tiptap** - ProseMirror 기반 리치 텍스트 에디터
- **Y.js** - CRDT 기반 실시간 협업
- **Zustand** - 경량 상태 관리
- **TailwindCSS + Shadcn/ui** - 모던 UI 컴포넌트

### Backend
- **NestJS** - 모듈형 Node.js 프레임워크
- **Prisma** - 타입 안전 ORM
- **PostgreSQL 15** - 메인 데이터베이스
- **Redis 7** - 캐싱 및 세션 관리
- **Hocuspocus** - Y.js WebSocket 서버
- **JWT** - 인증 및 권한 관리

### DevOps & Tools
- **pnpm** - 효율적인 패키지 관리
- **Turbo** - 모노레포 빌드 시스템
- **Docker** - 컨테이너화된 개발 환경
- **Vitest** - 빠른 단위 테스트
- **Playwright** - E2E 테스트
- **ESLint + Prettier** - 코드 품질 관리

## 📁 프로젝트 구조

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

## 🛠️ 개발 환경 설정

### 필수 요구사항

- **Node.js** 20.0.0 이상
- **pnpm** 9.0.0 이상
- **Docker Desktop** (로컬 개발용)
- **Git** 2.0 이상

### 빠른 시작

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-org/mini-notion.git
   cd mini-notion
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **개발 환경 설정**
   ```bash
   # Docker 서비스 시작 (PostgreSQL, Redis, MinIO)
   pnpm docker:up
   
   # 환경변수 설정 (선택사항)
   cp .env.example .env.local
   ```

4. **개발 서버 시작**
   ```bash
   # 모든 앱 동시 실행
   pnpm dev
   
   # 또는 개별 실행
   pnpm --filter web dev      # 프론트엔드 (http://localhost:3000)
   pnpm --filter api dev      # 백엔드 API (http://localhost:3001)
   ```

### 환경변수 설정

개발에 필요한 환경변수들을 설정하세요:

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

주요 환경변수:
- `DATABASE_URL`: PostgreSQL 연결 URL
- `REDIS_URL`: Redis 연결 URL  
- `JWT_SECRET`: JWT 토큰 시크릿 키
- `VITE_API_BASE_URL`: 프론트엔드에서 사용할 API URL

## 📋 사용 가능한 스크립트

```bash
# 개발
pnpm dev                    # 모든 앱 개발 서버 시작
pnpm build                  # 모든 앱 빌드
pnpm test                   # 모든 테스트 실행
pnpm test:watch             # 테스트 감시 모드

# 코드 품질
pnpm lint                   # ESLint 검사
pnpm lint:fix               # ESLint 자동 수정
pnpm format                 # Prettier 포맷팅
pnpm type-check             # TypeScript 타입 검사

# Docker 환경
pnpm docker:up              # Docker 서비스 시작
pnpm docker:down            # Docker 서비스 중지
pnpm setup                  # 전체 환경 설정 (install + docker:up)

# API 계약
pnpm contracts:generate     # OpenAPI에서 TypeScript 타입 생성
pnpm contracts:mock         # Prism Mock 서버 시작
```

## 🧪 테스트

### 단위 테스트
```bash
# 모든 단위 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm --filter web test
pnpm --filter api test

# 테스트 감시 모드
pnpm test:watch
```

### 통합 테스트
```bash
# TestContainers를 사용한 통합 테스트
pnpm test:integration

# 실제 데이터베이스 컨테이너로 테스트
pnpm --filter api test:integration
```

### E2E 테스트
```bash
# Playwright E2E 테스트
pnpm test:e2e

# 헤드리스 모드
pnpm test:e2e:headless
```

## 🔧 개발 가이드

### 코드 스타일

이 프로젝트는 엄격한 코드 품질 기준을 따릅니다:

- **TypeScript Strict Mode**: 모든 패키지에서 활성화
- **ESLint**: React 19, TypeScript 규칙 적용
- **Prettier**: 일관된 코드 포맷팅
- **Commitlint**: 커밋 메시지 규칙 검증

### 브랜치 전략

```bash
# 새 기능 개발
git checkout -b feature/01-user-authentication
git commit -m "feat(auth): JWT 인증 시스템 구현"

# PR 생성 (GitHub CLI 사용)
gh pr create --title "feat(auth): 사용자 인증 시스템" --label "feature"
```

### 커밋 메시지 규칙

```bash
# 형식: <타입>(<범위>): <제목>
feat(editor): 슬래시 커맨드 블록 선택 기능 추가
fix(auth): JWT 토큰 만료 시 자동 갱신 버그 수정
docs(readme): 개발 환경 설정 가이드 업데이트
```

## 🚀 배포

### 개발 환경
```bash
# Docker Compose로 전체 스택 실행
docker-compose -f docker-compose.dev.yml up -d
```

### 프로덕션 환경
```bash
# 프로덕션 빌드
pnpm build

# Docker 이미지 빌드
docker build -t mini-notion-web ./apps/web
docker build -t mini-notion-api ./apps/api
```

## 📚 문서

- [프로젝트 개요](./docs/project-overview.md)
- [개발자 온보딩](./docs/developer-onboarding.md)
- [아키텍처 결정 기록 (ADR)](./docs/adr/)
- [API 문서](./packages/contracts/openapi/)

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새 기능 브랜치를 만드세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: 놀라운 기능 추가'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 열어주세요

### 개발 환경 요구사항

- Node.js 20+ 및 pnpm 9+ 설치
- Docker Desktop 실행
- VS Code + ESLint/Prettier 확장 (권장)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙋‍♂️ 지원

문제가 발생하거나 질문이 있으시면:

- [GitHub Issues](https://github.com/your-org/mini-notion/issues)에 이슈를 등록해주세요
- [GitHub Discussions](https://github.com/your-org/mini-notion/discussions)에서 토론에 참여하세요

---

**Mini Notion Team**과 함께 더 나은 협업 도구를 만들어가요! 🚀