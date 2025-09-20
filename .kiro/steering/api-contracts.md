---
inclusion: fileMatch
fileMatchPattern: "contracts/**/*"
---

# Contract-First API 개발 가이드

OpenAPI 3.0 기반 Contract-First 개발 방법론과 표준을 정의합니다. 모든 API 개발은 Contract를 먼저 정의하고 구현해야 합니다.

## Contract-First 개발 워크플로우

### 1. 개발 순서
```
1. OpenAPI 스펙 작성 (contracts/*.yaml)
2. TypeScript 타입 자동 생성
3. Prism Mock Server 실행
4. Frontend 개발 (Mock API 사용)
5. Backend 구현 (실제 API)
6. Contract 검증 테스트
7. 통합 테스트
```

### 2. 디렉토리 구조
```
packages/contracts/
├── openapi/                    # OpenAPI 스펙 파일
│   ├── auth.yaml              # 인증 API
│   ├── documents.yaml         # 문서 API
│   ├── users.yaml             # 사용자 API
│   ├── workspaces.yaml        # 워크스페이스 API
│   └── common/                # 공통 스키마
│       ├── errors.yaml        # 에러 응답 스키마
│       ├── pagination.yaml    # 페이지네이션 스키마
│       └── base.yaml          # 기본 스키마
├── generated/                 # 자동 생성 파일 (Git 무시)
│   ├── api-types.ts          # TypeScript 타입
│   └── client/               # API 클라이언트 (선택사항)
├── scripts/                   # 생성 스크립트
│   ├── generate-types.js     # 타입 생성
│   ├── validate-specs.js     # 스펙 검증
│   └── start-mock.js         # Mock 서버 실행
└── tests/                     # Contract 테스트
    ├── contract.test.ts      # Contract 검증
    └── mock.test.ts          # Mock 서버 테스트
```

## OpenAPI 3.0 스펙 작성 표준

### 필수 구조 요소
- **OpenAPI 3.0.3** 버전 사용 필수
- **JWT Bearer 인증** 스키마 표준 적용
- **공통 스키마 참조** 패턴 사용 (`$ref: './common/*.yaml'`)
- **일관된 에러 응답** 스키마 적용

### 스펙 파일 구성 원칙
```yaml
# 기본 구조 (예시)
openapi: 3.0.3
info:
  title: [API Name]
  version: 1.0.0
  contact:
    name: API Support

servers:
  - url: http://localhost:3000/api/v1    # Development
  - url: https://api.mini-notion.com/v1  # Production

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  # 공통 스키마 참조 패턴
  schemas:
    Document: { $ref: './common/base.yaml#/components/schemas/Document' }
    Error: { $ref: './common/errors.yaml#/components/schemas/Error' }
  
  # 공통 응답 참조 패턴  
  responses:
    NotFound: { $ref: './common/errors.yaml#/components/responses/NotFound' }
    Unauthorized: { $ref: './common/errors.yaml#/components/responses/Unauthorized' }
```

### 엔드포인트 작성 규칙
- **RESTful URL 패턴** 준수 (`/resources`, `/resources/{id}`)
- **HTTP 메서드별 표준 응답 코드** 사용
  - GET: 200, 404, 401
  - POST: 201, 400, 401
  - PUT: 200, 404, 400, 401
  - DELETE: 204, 404, 401
- **페이지네이션 파라미터** 표준화 (page, limit)
- **검색 파라미터** 일관성 유지 (search, filter)

### 공통 스키마 설계 원칙
- **ID 패턴 표준화**: 리소스별 prefix 사용 (`doc_`, `user_`, `ws_`)
- **필수 필드 정의**: 모든 리소스에 `id`, `createdAt`, `updatedAt` 포함
- **문자열 길이 제한**: 사용자 입력 필드에 적절한 `minLength`, `maxLength` 설정
- **날짜 형식 통일**: ISO 8601 형식 (`date-time`) 사용
- **Nullable 필드 명시**: 선택적 필드는 `nullable: true` 설정

### 데이터 타입 규칙
```yaml
# ID 패턴 예시
id:
  type: string
  pattern: '^(doc|user|ws)_[a-zA-Z0-9]+$'

# 날짜 필드 표준
createdAt:
  type: string
  format: date-time
  example: "2024-01-01T00:00:00Z"

# 문자열 길이 제한
title:
  type: string
  minLength: 1
  maxLength: 200

# 이메일 검증
email:
  type: string
  format: email
```

## 에러 응답 표준화

### 에러 스키마 구조 원칙
- **일관된 에러 형식**: 모든 API에서 동일한 에러 스키마 사용
- **에러 코드 표준화**: 대문자 스네이크 케이스 (`DOCUMENT_NOT_FOUND`)
- **사용자 친화적 메시지**: 기술적 세부사항 숨기고 명확한 안내 제공
- **디버깅 정보 포함**: `traceId`, `timestamp` 필드로 추적 가능

### 표준 에러 타입
```yaml
# 기본 에러 스키마
Error:
  required: [code, message, timestamp]
  properties:
    code: string           # 에러 코드
    message: string        # 사용자 메시지
    details: object        # 추가 정보 (선택)
    timestamp: date-time   # 발생 시각
    traceId: string        # 추적 ID (선택)

# 검증 에러 스키마
ValidationError:
  required: [code, message, timestamp, errors]
  properties:
    code: "VALIDATION_ERROR"
    errors: array          # 필드별 에러 목록
      - field: string      # 필드명
        message: string    # 에러 메시지
        value: any         # 입력값
```

### HTTP 상태 코드별 에러 매핑
- **400**: `VALIDATION_ERROR`, `BAD_REQUEST`
- **401**: `INVALID_TOKEN`, `AUTHENTICATION_REQUIRED`
- **403**: `ACCESS_DENIED`, `INSUFFICIENT_PERMISSIONS`
- **404**: `RESOURCE_NOT_FOUND`, `DOCUMENT_NOT_FOUND`
- **409**: `RESOURCE_CONFLICT`, `DUPLICATE_ENTRY`
- **500**: `INTERNAL_SERVER_ERROR`

## Prism Mock Server 활용 방법

### Mock 서버 구성 원칙
- **Prism CLI** 사용하여 OpenAPI 스펙에서 자동 Mock 생성
- **동적 응답 생성** 활성화 (`--dynamic` 옵션)
- **에러 응답 모킹** 포함 (`--errors` 옵션)
- **CORS 설정** 필수 (프론트엔드 개발용)

### Mock 데이터 품질 기준
- **현실적인 예시 데이터** 제공
- **다양한 시나리오** 커버 (성공/실패 케이스)
- **페이지네이션 데이터** 포함
- **관계형 데이터** 일관성 유지

### Mock 서버 설정 요구사항
```bash
# 기본 실행 명령어 패턴
prism mock [spec-file] --port [port] --dynamic --errors

# 다중 스펙 파일 처리
# - 각 스펙별 별도 포트 할당
# - 프록시 서버로 통합 엔드포인트 제공
# - 개발 환경과 동일한 URL 구조 유지
```

### Examples 작성 가이드
- **성공 케이스**: 정상적인 데이터 구조와 값
- **에러 케이스**: 각 HTTP 상태 코드별 에러 응답
- **엣지 케이스**: 빈 배열, null 값 등 경계 상황

## TypeScript 타입 자동 생성 규칙

### 타입 생성 도구 및 설정
- **openapi-typescript** 라이브러리 사용 필수
- **자동 생성 파일**은 Git에서 제외 (`generated/` 디렉토리)
- **빌드 프로세스**에 타입 생성 단계 포함
- **Watch 모드** 지원으로 개발 중 자동 재생성

### 생성된 타입 구조 원칙
```typescript
// 네임스페이스별 타입 분리
export namespace Documents {
  export type GetDocumentsResponse = /* ... */;
  export type CreateDocumentRequest = /* ... */;
}

// 공통 타입 재사용
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

// 에러 타입 표준화
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  traceId?: string;
}
```

### 타입 사용 패턴
- **Request/Response 타입** 명시적 사용
- **Generic 타입** 활용으로 재사용성 증대
- **Union 타입** 활용한 에러 처리
- **Type Guard** 함수로 런타임 검증

### 타입 생성 자동화 요구사항
- **스펙 변경 시 자동 재생성**
- **타입 검증 실패 시 빌드 중단**
- **Breaking Change 감지** 및 경고
- **IDE 자동완성** 지원 최적화

## Contract 검증 및 테스트 패턴

### Contract 검증 필수 항목
- **OpenAPI 스펙 유효성** 검증 (SwaggerParser 사용)
- **스키마 일관성** 검증 (에러 응답, 공통 필드)
- **Breaking Change** 감지 및 방지
- **Mock 서버 응답** 스키마 준수 검증

### 검증 테스트 구조
```typescript
// 스펙 파일 유효성 검증
describe('OpenAPI Specification Validation', () => {
  it('should validate all spec files');
  it('should have consistent error schemas');
  it('should follow naming conventions');
});

// Mock 서버 통합 테스트
describe('Mock Server Integration', () => {
  it('should return correct response schemas');
  it('should handle error cases properly');
  it('should support all defined endpoints');
});

// 버전 호환성 테스트
describe('API Version Compatibility', () => {
  it('should maintain backward compatibility');
  it('should not remove required fields');
});
```

### 자동화된 검증 프로세스
- **PR 생성 시** Contract 검증 실행
- **스펙 변경 시** Breaking Change 분석
- **Mock 서버 헬스체크** 포함
- **타입 생성 성공** 여부 확인

## API 버전 관리 전략

### 버전 관리 원칙
- **Semantic Versioning** 적용 (Major.Minor.Patch)
- **하위 호환성** 보장 (Breaking Change 최소화)
- **버전별 디렉토리** 분리 (`v1/`, `v2/`)
- **Deprecation 정책** 명확히 정의

### 버전 업그레이드 가이드라인
```yaml
# 버전별 URL 구조
servers:
  - url: https://api.mini-notion.com/v1  # 현재 버전
  - url: https://api.mini-notion.com/v2  # 새 버전

# 하위 호환성 유지 규칙
# ✅ 허용: 새 필드 추가 (optional)
# ✅ 허용: 새 엔드포인트 추가
# ❌ 금지: 필수 필드 제거
# ❌ 금지: 필드 타입 변경
# ❌ 금지: 엔드포인트 제거
```

### 버전 전환 전략
- **점진적 마이그레이션**: 클라이언트별 개별 전환
- **병렬 운영**: 구버전과 신버전 동시 지원
- **Deprecation 공지**: 최소 6개월 전 사전 공지
- **자동화된 호환성 테스트**: CI/CD에서 Breaking Change 감지

## 개발 워크플로우 자동화

### 필수 npm 스크립트
```json
{
  "scripts": {
    "contracts:validate": "OpenAPI 스펙 유효성 검증",
    "contracts:generate": "TypeScript 타입 자동 생성", 
    "contracts:mock": "Prism Mock 서버 실행",
    "contracts:test": "Contract 검증 테스트 실행",
    "contracts:build": "검증 + 타입 생성 통합 실행",
    "contracts:dev": "개발 모드 (Mock 서버 + Watch 모드)"
  }
}
```

### CI/CD 파이프라인 요구사항
- **PR 생성 시**: Contract 검증 자동 실행
- **스펙 변경 감지**: `packages/contracts/**` 경로 모니터링
- **Breaking Change 검사**: 버전 호환성 자동 검증
- **타입 생성 검증**: 생성된 타입의 컴파일 성공 여부 확인

### 개발 환경 통합
- **Hot Reload**: 스펙 변경 시 자동 타입 재생성
- **IDE 지원**: 생성된 타입의 자동완성 활용
- **Mock 우선 개발**: Backend 구현 전 Frontend 개발 가능
- **Contract Testing**: 실제 API와 스펙 일치성 검증

이 가이드를 따르면 안정적이고 확장 가능한 Contract-First API 개발이 가능합니다.