# 환경 변수 관리 가이드

IMP-001: 환경 변수 관리 체계화에 따른 환경 변수 설정 및 관리 가이드입니다.

## 개요

이 프로젝트는 개발, 스테이징, 프로덕션 환경에 따른 체계적인 환경 변수 관리를 제공합니다.

## 환경별 설정

### Development (개발 환경)

- **파일**: `.env.development`
- **특징**: 개발에 최적화된 설정, 디버깅 활성화
- **데이터베이스**: SQLite (로컬 개발용)
- **보안**: 개발용 기본값 사용 가능

### Staging (스테이징 환경)

- **파일**: `.env.staging`
- **특징**: 프로덕션과 유사한 설정, 테스트용
- **데이터베이스**: PostgreSQL
- **보안**: 실제 보안 키 사용 필요

### Production (프로덕션 환경)

- **파일**: `.env.production`
- **특징**: 최고 수준의 보안과 성능
- **데이터베이스**: PostgreSQL (필수)
- **보안**: 강력한 보안 키 필수

## 필수 환경 변수

### 데이터베이스 설정

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 인증 설정

```bash
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-secret-key-32-chars-min"
JWT_SECRET="your-jwt-secret-key-32-chars-min"
ENCRYPTION_KEY="your-encryption-key-32-chars-min"
```

### OAuth 제공자 (선택사항)

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Redis 설정 (선택사항)

```bash
REDIS_URL="redis://localhost:6379"
```

### 보안 설정

```bash
RATE_LIMIT_WINDOW_MS="900000"  # 15분
RATE_LIMIT_MAX_REQUESTS="100"  # 최대 요청 수
```

### 파일 업로드 설정

```bash
UPLOAD_MAX_SIZE="10485760"  # 10MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
```

### 모니터링 설정

```bash
SENTRY_DSN="your-sentry-dsn"  # 선택사항
LOG_LEVEL="info"  # debug, info, warn, error
```

### 기능 플래그

```bash
ENABLE_MFA="true"           # 다중 인증 활성화
ENABLE_ANALYTICS="false"    # 분석 도구 활성화
ENABLE_DEBUG_MODE="false"   # 디버그 모드 활성화
```

## 사용법

### 1. 환경 파일 생성

```bash
# 환경별 .env 파일 생성
pnpm run env:setup
```

### 2. 환경 변수 상태 확인

```bash
# 현재 환경 변수 상태 확인
pnpm run env:check
```

### 3. 환경 변수 검증

```bash
# 환경 변수 유효성 검사
pnpm run env:validate

# 환경 파일 존재 여부도 함께 확인
pnpm run env:validate:files
```

## 보안 가이드라인

### 프로덕션 환경

- **절대 사용 금지**: `development-secret`, `change-in-production` 등의 기본값
- **최소 길이**: 보안 키는 최소 32자 이상
- **HTTPS 필수**: `NEXTAUTH_URL`은 반드시 `https://`로 시작
- **PostgreSQL 필수**: SQLite 사용 금지

### 개발 환경

- 기본값 사용 가능하지만 실제 서비스에서는 변경 권장
- 로컬 개발용 SQLite 사용 가능
- 디버그 모드 활성화 가능

## CI/CD 통합

GitHub Actions에서 자동으로 환경 변수를 검증합니다:

- **환경별 검증**: development, staging, production 환경별 테스트
- **보안 검사**: 하드코딩된 시크릿 탐지
- **설정 로딩 테스트**: 환경 설정 로딩 기능 테스트

## 문제 해결

### 일반적인 오류

#### 1. "NEXTAUTH_SECRET must be changed from default value"

```bash
# 해결: 강력한 시크릿 키 생성
openssl rand -base64 32
```

#### 2. "PostgreSQL must be used in production"

```bash
# 해결: 프로덕션에서는 PostgreSQL URL 사용
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

#### 3. "HTTPS must be used in production"

```bash
# 해결: 프로덕션에서는 HTTPS URL 사용
NEXTAUTH_URL="https://your-domain.com"
```

### 환경 변수 로딩 순서

1. `.env.production` (NODE_ENV=production일 때)
2. `.env.staging` (NODE_ENV=staging일 때)
3. `.env.development` (NODE_ENV=development일 때)
4. `.env.local` (모든 환경에서)
5. `.env` (기본값)

## 모범 사례

1. **환경별 분리**: 각 환경에 맞는 설정 파일 사용
2. **보안 키 관리**: 프로덕션 키는 안전한 곳에 보관
3. **정기적 검증**: 배포 전 환경 변수 검증 실행
4. **문서화**: 새로운 환경 변수 추가 시 문서 업데이트
5. **기본값 사용**: 개발 환경에서만 기본값 사용

## 관련 파일

- `scripts/validate-env.js`: 환경 변수 검증 스크립트
- `scripts/check-env.js`: 환경 변수 체크 및 설정 스크립트
- `packages/config/src/environment.ts`: 환경 설정 로딩 로직
- `.github/workflows/env-validation.yml`: CI/CD 환경 변수 검증
- `env.example`: 환경 변수 예시 파일
