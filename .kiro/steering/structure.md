---
inclusion: always
---

# 프로젝트 구조 가이드

모노레포 구조, 디렉토리 컨벤션, 파일 명명 규칙, import 패턴을 정의합니다. 모든 새로운 파일과 폴더는 이 구조를 따라야 합니다.

## 모노레포 구조

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

**중요**: 새 파일 생성 시 반드시 이 구조를 따르세요. 잘못된 위치에 파일을 생성하지 마세요.

## 관련 설정 파일

이 구조와 관련된 설정 파일들:

- #[[file:package.json]] - 모노레포 워크스페이스 설정
- #[[file:apps/web/tsconfig.json]] - 프론트엔드 경로 설정 (@/ 별칭)
- #[[file:apps/api/tsconfig.json]] - 백엔드 경로 설정
- #[[file:.eslintrc.js]] - Import 순서 및 절대 경로 ESLint 규칙
- #[[file:turbo.json]] - 모노레포 빌드 파이프라인 설정

이 파일들은 프로젝트 구조 가이드를 자동으로 강제하고 검증하는 역할을 합니다.

## 환경별 설정 파일 관리

### 환경변수 파일 구조

**파일 종류 및 위치**
```
1. .env (공통 기본값)
   - 위치: 프로젝트 루트 (선택적)
   - 용도: 워크스페이스 공통 툴/메타 설정만
   - 런타임 비밀 포함 금지

2. .env.development
   - 위치: apps/web/, apps/api/
   - 용도: 개발 모드 전용 설정
   - 기본값 fallback 제공

3. .env.test
   - 위치: apps/web/, apps/api/
   - 용도: 테스트 실행 시 전용 설정
   - TestContainers, Vitest, Playwright 설정

4. .env.staging
   - 위치: apps/web/, apps/api/
   - 용도: 스테이징 환경 전용 설정
   - 포트번호 명시적 기입 필수

5. .env.production
   - 위치: apps/web/, apps/api/
   - 용도: 프로덕션 환경 전용 설정
   - 포트번호 명시적 기입 필수

6. .env.local (개발자 개인 오버라이드)
   - 위치: apps/web/, apps/api/
   - .gitignore 처리 필수
   - 최고 우선순위 적용
```

**로딩 우선순위**
1. `.env` (기본값)
2. `.env.{environment}` (환경별 설정)
3. `.env.local` (개인 오버라이드, 최고 우선순위)

### 환경변수 명명 규칙

**프리픽스 표준**
- `VITE_*` - 브라우저 노출 가능 (Vite 앱 전용)
- `DATABASE_*` - Prisma 데이터베이스 관련
- `REDIS_*` - Redis 연결 및 설정
- `JWT_*` - 인증 토큰 관련
- `HOCUSPOCUS_*` - Y.js 실시간 협업
- `SMTP_*` - 이메일 발송 서비스
- `STORAGE_*` - 파일 업로드 및 저장

**값 형식 표준**
- Boolean: `"true"` / `"false"` (문자열)
- URL: 프로토콜 포함, 마지막 슬래시 제외 (`https://api.example.com`)
- 포트: 개발/로컬은 기본값 제공, 운영/스테이징은 명시적 기입 필수

### 앱별 환경변수 관리

**웹 앱 (apps/web)**
```
브라우저 노출 변수 (VITE_ 프리픽스 필수):
- VITE_API_BASE_URL
- VITE_WS_URL
- VITE_APP_NAME
- VITE_ENVIRONMENT

내부 빌드 변수:
- PORT (기본값: 3000)
- HOST (기본값: localhost)
```

**API 앱 (apps/api)**
```
서버 전용 변수:
- PORT (기본값: 3001)
- DATABASE_URL (필수)
- REDIS_URL (기본값: redis://localhost:6379)
- JWT_SECRET (필수, 최소 32자)
- HOCUSPOCUS_PORT (기본값: 1234)

실시간 협업 설정:
- COLLABORATION_MAX_USERS (기본값: 100)
- DOCUMENT_SYNC_INTERVAL (기본값: 5000)
- HOCUSPOCUS_TIMEOUT (기본값: 30000)
```

### 환경변수 검증

**Zod 스키마 위치**
- `apps/web/src/config/env.schema.ts`
- `apps/api/src/config/env.schema.ts`

**검증 레벨**
- 개발환경: 경고만 출력, 기본값 사용
- 테스트환경: 검증 실패 시 테스트 중단
- 스테이징/프로덕션: 검증 실패 시 앱 시작 중단

**검증 규칙**
- URL 형식 검증: `z.string().url()`
- 포트 범위 검증: `z.string().regex(/^\d{4,5}$/)`
- Boolean 변환: `z.enum(['true', 'false']).transform(val => val === 'true')`
- 필수값 환경별 구분: 개발은 선택적, 운영은 필수

### Docker 환경 고려사항

**네트워크 주소 처리**
- 로컬 개발: `localhost` 기본값
- Docker Compose: 서비스명 사용 (`postgres`, `redis`)
- 프로덕션: 실제 호스트명/IP 명시

**컨테이너 환경변수**
- Docker Compose에서 `env_file` 명시적 지정
- 개발: `docker-compose.yml` + `.env.development`
- 프로덕션: `docker-compose.prod.yml` + 환경변수 주입

### 보안 및 관리

**민감 정보 분류**
- PUBLIC: 브라우저 노출 가능 (API URL, 앱 이름)
- INTERNAL: 서버 내부용 (DB 호스트, 포트)
- SECRET: 암호화 필요 (JWT 시크릿, API 키)

**파일 관리 규칙**
- `.env.local` 파일은 `.gitignore`에 포함 필수
- `.env.example` 파일로 템플릿 제공
- 실제 값 대신 설명이나 예시값 사용
- CI/CD는 GitHub 환경변수 사용 (파일 기반 금지)

**패키지별 제약사항**
- `packages/shared`, `packages/ui`: 환경변수 파일 금지
- 라이브러리는 런타임 값을 직접 읽지 말고 호출자에서 주입
- Prisma 스키마: `apps/api/.env.*` 파일만 사용, 별도 `.env` 금지

### 개발자 온보딩

**초기 설정 자동화**
- `pnpm setup:env` 명령어로 `.env.local` 자동 생성
- `.env.example` 복사 및 개발자별 포트 할당
- 필수 환경변수 누락 체크 및 안내

**문서화 자동화**
- 각 앱 README에 환경변수 표 자동 생성
- 변수명, 필수 여부, 기본값, 설명 포함
- 환경변수 변경 시 문서 자동 업데이트

## 앱별 디렉토리 구조

### Frontend (apps/web)
```
apps/web/
├── src/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── editor/            # Tiptap 에디터 관련
│   │   │   ├── blocks/        # 블록 타입별 컴포넌트
│   │   │   ├── extensions/    # Tiptap 커스텀 확장
│   │   │   └── toolbar/       # 에디터 툴바 컴포넌트
│   │   ├── workspace/         # 워크스페이스 관련
│   │   │   ├── sidebar/       # 사이드바 컴포넌트
│   │   │   └── navigation/    # 네비게이션 컴포넌트
│   │   ├── collaboration/     # 실시간 협업 UI
│   │   └── ui/                # 기본 UI 컴포넌트 (Shadcn/ui 기반)
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── auth/              # 인증 관련 페이지
│   │   ├── workspace/         # 워크스페이스 페이지
│   │   └── document/          # 문서 편집 페이지
│   ├── hooks/                 # 커스텀 React hooks
│   │   ├── editor/            # 에디터 관련 hooks
│   │   ├── collaboration/     # 협업 관련 hooks
│   │   └── api/               # API 호출 hooks
│   ├── stores/                # Zustand 스토어
│   │   ├── auth.store.ts      # 인증 상태
│   │   ├── document.store.ts  # 문서 상태
│   │   └── collaboration.store.ts # 협업 상태
│   ├── services/              # API 호출 로직
│   │   ├── api/               # REST API 클라이언트
│   │   └── websocket/         # WebSocket 연결 관리
│   ├── types/                 # 프론트엔드 전용 타입
│   ├── utils/                 # 유틸리티 함수
│   │   ├── editor/            # 에디터 관련 유틸
│   │   └── validation/        # 클라이언트 검증 로직
│   └── lib/                   # 외부 라이브러리 설정
│       ├── tiptap.ts          # Tiptap 설정
│       ├── yjs.ts             # Y.js 설정
│       └── api-client.ts      # API 클라이언트 설정
├── public/                    # 정적 파일
└── tests/                     # 컴포넌트 테스트 (Vitest)
    ├── components/            # 컴포넌트 테스트
    ├── hooks/                 # Hook 테스트
    └── utils/                 # 유틸리티 테스트
```

### Backend (apps/api)
```
apps/api/
├── src/
│   ├── modules/               # 기능별 NestJS 모듈
│   │   ├── auth/             # 인증/인가
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── guards/       # 인증 가드
│   │   │   └── strategies/   # Passport 전략
│   │   ├── documents/        # 문서 관리
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── documents.module.ts
│   │   │   └── dto/          # 데이터 전송 객체
│   │   ├── collaboration/    # 실시간 협업 (Hocuspocus)
│   │   │   ├── collaboration.gateway.ts
│   │   │   ├── collaboration.service.ts
│   │   │   ├── collaboration.module.ts
│   │   │   └── extensions/   # Hocuspocus 확장
│   │   ├── users/            # 사용자 관리
│   │   └── workspaces/       # 워크스페이스 관리
│   ├── common/               # 공통 기능
│   │   ├── guards/           # 공통 가드
│   │   ├── interceptors/     # 인터셉터
│   │   ├── decorators/       # 커스텀 데코레이터
│   │   ├── filters/          # 예외 필터
│   │   └── pipes/            # 검증 파이프
│   ├── config/               # 설정 파일
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   ├── database/             # 데이터베이스 관련
│   │   ├── prisma/           # Prisma 스키마 및 마이그레이션
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── seeds/            # 시드 데이터
│   └── utils/                # 백엔드 유틸리티
└── tests/                    # 단위/통합 테스트
    ├── unit/                 # 단위 테스트
    ├── integration/          # 통합 테스트 (TestContainers)
    └── fixtures/             # 테스트 데이터
```

### Packages 구조

#### packages/shared
```
packages/shared/
├── src/
│   ├── types/                # 공통 타입 정의
│   │   ├── auth.types.ts     # 인증 관련 타입
│   │   ├── document.types.ts # 문서 관련 타입
│   │   └── user.types.ts     # 사용자 관련 타입
│   ├── utils/                # 공통 유틸리티
│   │   ├── validation.ts     # 공통 검증 로직
│   │   └── constants.ts      # 상수 정의
│   └── schemas/              # Zod 스키마
│       ├── auth.schema.ts
│       └── document.schema.ts
└── tests/                    # 공통 로직 테스트
```

#### packages/contracts
```
packages/contracts/
├── openapi/                  # OpenAPI 스펙 파일
│   ├── auth.yaml            # 인증 API 스펙
│   ├── documents.yaml       # 문서 API 스펙
│   └── users.yaml           # 사용자 API 스펙
├── generated/               # 자동 생성된 타입 (Git 무시)
│   └── api-types.ts
└── scripts/                 # 타입 생성 스크립트
    └── generate-types.js
```

## 파일 명명 규칙

**절대 규칙**: 파일명과 디렉토리명은 다음 규칙을 엄격히 따르세요.

### React 컴포넌트
- 컴포넌트 파일: **PascalCase** (`DocumentEditor.tsx`)
- 컴포넌트 디렉토리: **kebab-case** (`document-editor/`)
- 인덱스 파일: `index.ts` (re-export용)

### Hook 파일
- Hook 파일: **camelCase** with `use` prefix (`useDocumentSync.ts`)
- Hook 디렉토리: **kebab-case**

### Store 파일
- Store 파일: **camelCase** with `.store.ts` suffix (`auth.store.ts`)

### 백엔드 파일
- 모든 NestJS 파일: **kebab-case** (`documents.controller.ts`, `create-document.dto.ts`)

### 테스트 파일
- 단위 테스트: `*.test.ts` 또는 `*.spec.ts`
- E2E 테스트: `*.e2e.ts`

**금지사항**:
- camelCase 디렉토리명 (`documentEditor/`)
- snake_case (`document_editor/`)
- PascalCase 디렉토리명 (`DocumentEditor/`)

## Import 패턴 및 규칙

**필수 Import 순서**:
1. Node.js 내장 모듈
2. 외부 라이브러리 (React, @tiptap/react 등)
3. 내부 패키지 (@mini-notion/shared, @mini-notion/ui)
4. 상대 경로 import
5. 타입 import (별도 그룹)

**타입 Import 규칙**:
- 타입만 import: `import type { User } from '@mini-notion/shared'`
- 값과 타입 함께: `import { validateUser, type User } from '@mini-notion/shared'`

**절대 경로 사용**:
- `@/components/editor/DocumentEditor` (상대 경로보다 우선)
- `@mini-notion/shared` (패키지 import)

**Re-export 패턴**:
```typescript
// index.ts에서 re-export
export { DocumentEditor } from './DocumentEditor';
export { BlockSelector } from './BlockSelector';

// 사용처
import { DocumentEditor, BlockSelector } from '@/components/editor';
```

## 패키지 의존성 규칙

**허용되는 의존성**:
- `apps/web` → `packages/*`
- `apps/api` → `packages/shared`, `packages/contracts`
- `packages/ui` → `packages/shared`

**절대 금지**:
- `packages/*` → `apps/*` (패키지가 앱 참조 금지)
- `apps/web` → `apps/api` (프론트엔드가 백엔드 직접 참조 금지)
- 순환 의존성 (A → B → A)

## 디렉토리별 역할

### `/packages/contracts`
- OpenAPI 스펙 파일 (`*.yaml`)
- 생성된 TypeScript 타입
- API 클라이언트 코드

### `/packages/shared`
- 프론트엔드/백엔드 공통 타입
- 공통 유틸리티 함수
- Zod 스키마 정의

### `/packages/ui`
- Shadcn/ui 기반 컴포넌트
- 디자인 시스템 토큰

## 피해야 할 패턴들 (안티패턴)

### 잘못된 파일 위치
❌ `apps/web/src/shared/` (공통 코드는 `packages/shared`에)
❌ `apps/api/src/types/common.ts` (공통 타입은 `packages/shared`에)
❌ `apps/web/src/api-client.ts` (API 클라이언트는 `lib/`에)
❌ `apps/web/src/components/Button.tsx` (기본 UI는 `packages/ui`에)
❌ `apps/api/src/shared/` (공통 로직은 `packages/shared`에)

✅ **올바른 위치**:
- 공통 타입: `packages/shared/src/types/`
- API 클라이언트: `apps/web/src/lib/api-client.ts`
- 기본 UI 컴포넌트: `packages/ui/src/components/`
- 공통 유틸리티: `packages/shared/src/utils/`

### 잘못된 Import 패턴
❌ `import '../../../components/ui/Button'` (절대 경로 사용)
❌ `import { User } from 'apps/api/src/types'` (`packages/shared` 사용)
❌ `import type React from 'react'` (값과 타입 구분 필요)
❌ `import { Button } from './Button'` (index.ts 통해 import)
❌ `import React, { useState } from 'react'` (React 19에서 불필요)

✅ **올바른 Import**:
- `import { Button } from '@/components/ui'`
- `import type { User } from '@mini-notion/shared'`
- `import { useState } from 'react'`
- `import { Button } from '@mini-notion/ui'`

### 잘못된 명명 규칙
❌ `documentEditor/` (디렉토리는 kebab-case)
❌ `document_editor.tsx` (snake_case 금지)
❌ `DocumentEditor/` (디렉토리는 PascalCase 금지)
❌ `useDocumentEditor.tsx` (Hook은 .ts 확장자)

✅ **올바른 명명**:
- `document-editor/` (디렉토리)
- `DocumentEditor.tsx` (컴포넌트)
- `useDocumentEditor.ts` (Hook)
- `document.store.ts` (Store)

## 새 파일 생성 가이드

### 컴포넌트 생성 절차
1. **디렉토리 생성**: `components/[category]/[component-name]/` 구조 준수
2. **컴포넌트 파일**: `ComponentName.tsx` (PascalCase) 생성
3. **Props 인터페이스**: TypeScript 인터페이스 정의 필수
4. **Index 파일**: `index.ts`에서 컴포넌트와 타입 re-export
5. **상위 index 업데이트**: 상위 디렉토리 index에 추가
6. **테스트 파일**: `ComponentName.test.tsx` 생성 (필요시)

### API 모듈 생성 절차
1. **모듈 디렉토리**: `modules/[module-name]/` 구조 생성
2. **컨트롤러 파일**: `[module-name].controller.ts` 생성
3. **서비스 파일**: `[module-name].service.ts` 생성  
4. **모듈 파일**: `[module-name].module.ts` 생성
5. **DTO 디렉토리**: `dto/` 폴더에 Zod 스키마 기반 DTO 생성
6. **의존성 주입**: 컨트롤러-서비스 간 DI 패턴 적용

### Hook 생성 절차
1. **Hook 파일**: `hooks/[category]/useHookName.ts` 구조 준수
2. **명명 규칙**: `use` prefix 필수, camelCase 사용
3. **타입 정의**: 반환값 타입 명시적 정의
4. **의존성 배열**: useEffect 의존성 배열 정확히 설정
5. **Index 파일**: `hooks/index.ts`에 re-export 추가

### Store 생성 절차
1. **Store 파일**: `stores/[name].store.ts` 명명 규칙 준수
2. **Zustand 사용**: create 함수로 스토어 생성
3. **인터페이스 정의**: 상태와 액션 타입 명시적 정의
4. **불변성 유지**: 상태 업데이트 시 불변성 원칙 준수

## 구현 패턴 요약

### 컴포넌트 구현 원칙
- **함수형 컴포넌트**: React 19 함수형 컴포넌트만 사용
- **TypeScript 인터페이스**: Props 타입 명시적 정의
- **Import 순서**: 외부 라이브러리 → 내부 패키지 → 상대 경로 → 타입
- **Re-export 패턴**: index.ts를 통한 깔끔한 모듈 구조

### API 모듈 구현 원칙  
- **NestJS 데코레이터**: @Controller, @Get, @Post 등 적절한 데코레이터 사용
- **의존성 주입**: 생성자 기반 DI 패턴 적용
- **DTO 검증**: Zod 스키마 기반 입출력 검증
- **타입 안전성**: 공통 타입 패키지 활용

## 코드 구성 원칙

- **단일 책임**: 하나의 파일은 하나의 주요 기능만 담당
- **관심사 분리**: UI 로직과 비즈니스 로직 분리
- **재사용성**: 공통 로직은 packages/shared로 추출

## 파일 생성 체크리스트

새 파일을 생성하기 전에 다음 사항들을 확인하세요:

### 기본 체크리스트
- [ ] 올바른 디렉토리에 위치하는가?
- [ ] 명명 규칙을 따르는가?
- [ ] Import 순서가 올바른가?
- [ ] 의존성 방향이 올바른가?

### 컴포넌트 체크리스트
- [ ] `components/[category]/[component-name]/` 구조인가?
- [ ] 컴포넌트명이 PascalCase인가?
- [ ] `index.ts`에서 re-export 했는가?
- [ ] Props 타입을 정의했는가?
- [ ] JSDoc 주석이 필요한 경우 작성했는가?
- [ ] 필요시 테스트 파일을 추가했는가?

### API 모듈 체크리스트
- [ ] Controller, Service, Module 파일이 모두 있는가?
- [ ] DTO 스키마를 Zod로 정의했는가?
- [ ] 적절한 HTTP 메서드를 사용했는가?
- [ ] 에러 처리를 구현했는가?
- [ ] 공개 API 함수에 JSDoc 주석을 작성했는가?

### Hook 체크리스트
- [ ] `use` prefix를 사용했는가?
- [ ] 적절한 카테고리 디렉토리에 위치하는가?
- [ ] 반환값의 타입을 명시했는가?
- [ ] 의존성 배열을 올바르게 설정했는가?
- [ ] 커스텀 훅에 JSDoc 주석을 작성했는가?

이 가이드를 따르면 일관성 있고 유지보수하기 쉬운 코드베이스를 구축할 수 있습니다.