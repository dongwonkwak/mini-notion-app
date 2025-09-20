---
inclusion: always
---

# 기술 스택 및 개발 가이드라인

미니 노션 프로젝트의 필수 기술 스택과 개발 제약사항을 정의합니다. 모든 구현은 이 명세를 엄격히 준수해야 합니다.

## 필수 기술 스택

### 프론트엔드
- **React 19** 함수형 컴포넌트만 사용 (use() hook, Concurrent Features)
- **TypeScript** strict 모드로 완전한 타입 안전성 보장
- **Vite** 빌드 도구 (HMR, ESM 지원)
- **Tiptap** ProseMirror 기반 리치 텍스트 에디터
- **Y.js + y-prosemirror** CRDT 기반 실시간 협업
- **@hocuspocus/provider** Y.js 서버 연결
- **IndexedDB** 오프라인 문서 캐싱
- **Zustand** 경량 상태 관리
- **TailwindCSS + Shadcn/ui** 스타일링 및 컴포넌트

### 백엔드
- **NestJS** TypeScript 기반 모듈형 아키텍처
- **@hocuspocus/server** 인증/로깅 확장 포함
- **Prisma** TypeScript ORM with PostgreSQL 15+
- **Redis 7+** ioredis로 캐싱 및 pub/sub
- **Helmet + express-rate-limit** 보안

### 테스팅 및 검증
- **Vitest** 단위 테스트 (Jest API 호환)
- **TestContainers** 실제 데이터베이스 통합 테스트
- **Playwright** E2E 테스트
- **Zod** 런타임 스키마 검증
- **OpenAPI 3.0** Contract-First API 개발

### 개발 도구
- **Turbo** 모노레포 with pnpm workspaces
- **packages/config** 중앙화된 설정 관리
- **Docker + Docker Compose** 컨테이너화된 개발

## 개발 원칙

### Contract-First API 개발
1. 구현 전 `packages/contracts/openapi/*.yaml`에 OpenAPI 스펙 작성 필수
2. `openapi-typescript`로 TypeScript 타입 자동 생성
3. Prism 목 서버로 프론트엔드/백엔드 병렬 개발
4. 실제 API 응답을 계약과 대조하여 검증

### 타입 안전성 요구사항
- 모든 패키지에서 TypeScript strict 모드 활성화
- 모든 API 경계에서 Zod 스키마로 런타임 검증
- OpenAPI 스펙에서 타입 자동 생성 (수동 API 타입 작성 금지)
- 환경변수는 Zod 스키마로 검증

### 테스팅 전략
- Vitest로 단위 테스트 (Jest API 호환)
- 통합 테스트는 반드시 TestContainers로 실제 PostgreSQL/Redis 사용
- 핵심 사용자 플로우는 Playwright로 E2E 테스트
- 모든 데이터베이스 관련 테스트는 실제 컨테이너 인스턴스 필요

## 구현 제약사항

### React 19 규칙
- 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- React 19 기능 활용: `use()` hook, Suspense, Transitions
- 필요시 `memo`, `useMemo`, `useCallback`로 최적화
- JSX props에서 인라인 객체/함수 사용 금지

### Tiptap 에디터 요구사항
- `y-prosemirror` 확장으로 Y.js 통합 필수
- 독립적인 노드로 블록 기반 구조 구현
- 슬래시 커맨드(`/`)는 suggestion 확장 사용
- Y.Doc 바이너리 데이터를 PostgreSQL bytea 컬럼에 저장

### 실시간 협업 (Y.js)
- `@hocuspocus/server` 사용 (커스텀 Y.js WebSocket 서버 구현 금지)
- Y.Doc을 PostgreSQL에 적절한 인덱싱과 함께 영속화
- 사용자 커서와 선택 영역을 위한 awareness 구현
- IndexedDB 캐싱으로 오프라인 편집 지원

### NestJS 백엔드 아키텍처
- 기능별 모듈로 구성 (`auth/`, `documents/`, `collaboration/`)
- 모든 DTO를 Zod 스키마로 검증
- JWT 인증 및 권한 부여에 Guards 사용
- 로깅 및 응답 변환에 Interceptors 구현

### 데이터베이스 설계
- 모든 스키마 변경은 Prisma 마이그레이션으로 관리
- Y.js 문서를 PostgreSQL bytea로 저장
- 적절한 TTL로 메타데이터 캐싱에 Redis 사용
- 쿼리 성능을 위한 적절한 인덱싱 구현



## 금지사항

### 사용 금지 기술
- 클래스 컴포넌트 (React 19에서 함수형 컴포넌트만)
- 직접 DOM 조작 (React 생태계 내에서 해결)
- 커스텀 Y.js WebSocket 서버 (Hocuspocus 사용 필수)
- 수동 API 타입 정의 (OpenAPI에서 자동 생성)

### 금지된 안티패턴
- Props drilling (3단계 이상 props 전달)
- useEffect 남용 (불필요한 side effect)
- 인라인 객체/함수 (렌더링 최적화 저해)
- any 타입 사용 (타입 안전성 훼손)
- npm/yarn 사용 (pnpm만 허용)
- 고정 버전 패키지 설치 (최신 버전 우선 원칙 위반)

## 코드 품질 및 포맷팅

### ESLint 설정 요구사항

**필수 ESLint 플러그인**
- `@typescript-eslint/eslint-plugin` - TypeScript 규칙
- `eslint-plugin-react` - React 19 규칙
- `eslint-plugin-react-hooks` - React Hooks 규칙
- `eslint-plugin-jsx-a11y` - 접근성 규칙
- `eslint-plugin-import` - Import 순서 및 구조 규칙
- `eslint-plugin-jsdoc` - JSDoc 문서화 규칙

**TypeScript 엄격 규칙**
- `@typescript-eslint/no-explicit-any` - any 타입 사용 금지
- `@typescript-eslint/no-unused-vars` - 사용하지 않는 변수 금지
- `@typescript-eslint/explicit-function-return-type` - 함수 반환 타입 명시
- `@typescript-eslint/no-non-null-assertion` - non-null assertion 제한적 사용
- `@typescript-eslint/prefer-nullish-coalescing` - nullish coalescing 사용 권장

**React 19 특화 규칙**
- `react/jsx-no-leaked-render` - 조건부 렌더링 안전성
- `react/no-unstable-nested-components` - 중첩 컴포넌트 방지
- `react/jsx-key` - 리스트 렌더링 시 key prop 필수
- `react-hooks/exhaustive-deps` - useEffect 의존성 배열 완전성
- `react/jsx-no-useless-fragment` - 불필요한 Fragment 제거

**Import 순서 규칙**
1. Node.js 내장 모듈
2. 외부 라이브러리 (react, @tiptap/react 등)
3. 내부 패키지 (@mini-notion/shared, @mini-notion/ui)
4. 상대 경로 import
5. 타입 import (별도 그룹, import type 사용)

**접근성 규칙**
- `jsx-a11y/alt-text` - 이미지 alt 속성 필수
- `jsx-a11y/aria-props` - ARIA 속성 유효성 검증
- `jsx-a11y/click-events-have-key-events` - 클릭 이벤트 키보드 접근성
- `jsx-a11y/no-autofocus` - 자동 포커스 제한
- `jsx-a11y/heading-has-content` - 헤딩 요소 콘텐츠 필수

**JSDoc 문서화 규칙**
- `jsdoc/require-jsdoc` - 외부 공개 함수 JSDoc 필수
- `jsdoc/require-param` - 매개변수 문서화 필수
- `jsdoc/require-returns` - 반환값 문서화 필수
- `jsdoc/require-example` - 복잡한 함수 사용 예시 권장
- `jsdoc/check-param-names` - 매개변수 이름 일치성 검증
- `jsdoc/check-tag-names` - JSDoc 태그 유효성 검증

### Prettier 설정 표준

**기본 포맷팅 규칙**
- `printWidth: 100` - 한 줄 최대 길이
- `tabWidth: 2` - 들여쓰기 2칸
- `useTabs: false` - 스페이스 사용
- `semi: true` - 세미콜론 필수
- `singleQuote: true` - 단일 따옴표 사용
- `quoteProps: 'as-needed'` - 필요시에만 객체 키 따옴표
- `trailingComma: 'es5'` - ES5 호환 trailing comma
- `bracketSpacing: true` - 객체 브래킷 내부 공백
- `arrowParens: 'avoid'` - 화살표 함수 매개변수 괄호 최소화

**JSX 특화 설정**
- `jsxSingleQuote: true` - JSX에서 단일 따옴표
- `jsxBracketSameLine: false` - JSX 브래킷 다음 줄 배치
- `bracketSameLine: false` - HTML 브래킷 다음 줄 배치

**파일별 설정 오버라이드**
- Markdown 파일: `printWidth: 80`, `proseWrap: 'always'`
- JSON 파일: `tabWidth: 2`, `trailingComma: 'none'`
- YAML 파일: `tabWidth: 2`, `singleQuote: false`

### 통합 워크플로우

**에디터 통합**
- VS Code ESLint 확장 자동 수정 활성화
- 저장 시 Prettier 자동 포맷팅
- TypeScript 컴파일러와 ESLint 규칙 일치성 보장
- 실시간 타입 검사 및 린팅 피드백

**Pre-commit Hook**
- Husky + lint-staged로 커밋 전 자동 검사
- 변경된 파일만 선택적 린팅 및 포맷팅
- 타입 검사 통과 후 커밋 허용
- 테스트 실행 및 통과 확인

**CI/CD 통합**
- GitHub Actions에서 ESLint 검사 자동화
- Prettier 포맷팅 일관성 검증
- TypeScript 컴파일 오류 검사
- 코드 품질 게이트 통과 후 배포 진행

### 모노레포 설정

**중앙화된 설정 관리**
- `packages/config` 패키지에서 모든 공통 설정 관리
- 계층적 설정 구조: base → environment → app
- 명시적 export 경로로 설정 선택적 사용
- peerDependencies로 버전 호환성 관리

**패키지별 설정 상속**
- 루트 ESLint 설정을 기본으로 상속
- 패키지별 특화 규칙 오버라이드 허용
- 프론트엔드/백엔드 환경별 규칙 분리
- 공통 규칙 변경 시 전체 패키지 일괄 적용

**의존성 관리 원칙**
- 공통 도구는 루트 레벨에 설치
- workspace 프로토콜로 내부 패키지 참조
- 최신 버전 우선 정책 적용
- 호이스팅을 통한 중복 설치 방지

**Turbo 통합**
- `turbo lint` 명령어로 전체 패키지 린팅
- 병렬 실행으로 린팅 시간 단축
- 캐싱을 통한 중복 검사 방지
- 의존성 그래프 기반 효율적 실행

## 패키지 관리 원칙

### 최신 버전 우선 정책
- **새 패키지 설치**: 항상 최신 버전으로 설치 (`pnpm add package@latest`)
- **기존 패키지 업데이트**: 정기적인 최신 버전 업데이트 (`pnpm update --latest`)
- **보안 패치**: 보안 취약점 발견 시 즉시 최신 버전 적용
- **호환성 검증**: 최신 버전 적용 후 테스트 실행으로 호환성 확인

### 버전 관리 전략
- **메이저 버전**: 팀 논의 후 신중한 업데이트
- **마이너/패치 버전**: 적극적인 최신 버전 적용
- **개발 의존성**: 빌드 도구, 테스트 도구 등은 최신 버전 유지
- **런타임 의존성**: 안정성 검증 후 최신 버전 적용

### 패키지 설치 명령어 표준
```bash
# 새 패키지 설치 (최신 버전)
pnpm add package@latest
pnpm add -D dev-package@latest

# 전체 패키지 최신 버전 업데이트
pnpm update --latest

# 특정 패키지 최신 버전 업데이트
pnpm update package@latest

# 보안 취약점 확인 및 수정
pnpm audit
pnpm audit --fix
```

### 예외 상황 관리
- **레거시 호환성**: 특정 버전 고정이 필요한 경우 명시적 문서화
- **베타/알파 버전**: 안정 버전 출시 후 업데이트
- **의존성 충돌**: 최신 버전 간 충돌 시 호환 가능한 최신 버전 선택
- **성능 회귀**: 최신 버전에서 성능 저하 시 이전 안정 버전 유지

## 필수 개발 환경

- **Node.js 20+** (최신 LTS)
- **pnpm** (패키지 매니저)
- **Docker Desktop** (로컬 개발)
- **VS Code** + ESLint/Prettier 확장 (권장 에디터)

모든 구현은 이 기술 스택과 제약사항을 엄격히 준수해야 합니다.