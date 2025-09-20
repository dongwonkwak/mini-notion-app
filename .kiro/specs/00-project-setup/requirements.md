# Requirements Document

## Introduction

미니 노션 프로젝트의 개발 환경 구성 및 기본 인프라 설정을 위한 요구사항을 정의합니다. 이 단계에서는 모노레포 구조, 필수 패키지 설치, 개발 도구 설정, 그리고 기본적인 CI/CD 파이프라인을 구축하여 후속 기능 개발의 기반을 마련합니다.

## Requirements

### Requirement 1

**User Story:** 개발자로서, 일관된 개발 환경에서 작업할 수 있도록 표준화된 모노레포 구조를 원합니다.

#### Acceptance Criteria

1. WHEN 프로젝트를 클론하고 설치 명령을 실행하면 THEN 시스템은 모든 워크스페이스 패키지를 올바르게 설치해야 합니다
2. WHEN 개발자가 apps/web 또는 apps/api 디렉토리에서 작업하면 THEN 시스템은 공통 패키지들을 자동으로 참조할 수 있어야 합니다
3. WHEN pnpm 명령을 실행하면 THEN 시스템은 워크스페이스 간 의존성을 올바르게 해결해야 합니다

### Requirement 2

**User Story:** 개발자로서, React 19와 NestJS 기반의 최신 기술 스택으로 개발할 수 있는 환경을 원합니다.

#### Acceptance Criteria

1. WHEN apps/web에서 개발 서버를 시작하면 THEN React 19 기능들(use hook, Concurrent Features)이 정상 작동해야 합니다
2. WHEN apps/api에서 서버를 시작하면 THEN NestJS 애플리케이션이 TypeScript strict 모드로 실행되어야 합니다
3. WHEN 패키지를 설치하면 THEN 모든 패키지는 최신 버전으로 설치되어야 합니다

### Requirement 3

**User Story:** 개발자로서, Tiptap과 Y.js를 활용한 실시간 협업 에디터 개발을 위한 기본 패키지가 설치되기를 원합니다.

#### Acceptance Criteria

1. WHEN Tiptap 에디터를 초기화하면 THEN 기본 확장들이 정상적으로 로드되어야 합니다
2. WHEN Y.js 문서를 생성하면 THEN CRDT 기반 동기화가 가능한 상태여야 합니다
3. WHEN Hocuspocus 서버를 시작하면 THEN WebSocket 연결을 받을 수 있어야 합니다

### Requirement 4

**User Story:** 개발자로서, 코드 품질과 일관성을 보장하기 위한 린팅 및 포맷팅 도구가 설정되기를 원합니다.

#### Acceptance Criteria

1. WHEN 코드를 저장하면 THEN Prettier가 자동으로 포맷팅을 적용해야 합니다
2. WHEN ESLint를 실행하면 THEN TypeScript 엄격 규칙과 React 19 규칙이 적용되어야 합니다
3. WHEN 커밋을 시도하면 THEN pre-commit hook이 린팅과 포맷팅을 검증해야 합니다

### Requirement 5

**User Story:** 개발자로서, 로컬 개발 환경에서 PostgreSQL과 Redis를 쉽게 실행할 수 있는 Docker 환경을 원합니다.

#### Acceptance Criteria

1. WHEN docker-compose up을 실행하면 THEN PostgreSQL 15와 Redis 7이 시작되어야 합니다
2. WHEN 데이터베이스에 연결하면 THEN Prisma가 정상적으로 스키마를 적용할 수 있어야 합니다
3. WHEN 개발 서버들을 시작하면 THEN 모든 서비스가 올바른 포트에서 실행되어야 합니다

### Requirement 6

**User Story:** 개발자로서, 환경변수 관리와 타입 안전성을 보장하는 설정 시스템을 원합니다.

#### Acceptance Criteria

1. WHEN 환경변수를 설정하면 THEN Zod 스키마로 검증되어야 합니다
2. WHEN 잘못된 환경변수가 있으면 THEN 애플리케이션 시작 시 명확한 오류 메시지를 표시해야 합니다
3. WHEN 개발/테스트/프로덕션 환경을 전환하면 THEN 각 환경에 맞는 설정이 적용되어야 합니다

### Requirement 7

**User Story:** 개발자로서, 기본적인 테스트 환경과 CI/CD 파이프라인이 구성되기를 원합니다.

#### Acceptance Criteria

1. WHEN Vitest를 실행하면 THEN 단위 테스트가 정상적으로 실행되어야 합니다
2. WHEN GitHub에 푸시하면 THEN CI 파이프라인이 자동으로 테스트를 실행해야 합니다
3. WHEN TestContainers를 사용하면 THEN 실제 PostgreSQL과 Redis 컨테이너로 통합 테스트가 가능해야 합니다