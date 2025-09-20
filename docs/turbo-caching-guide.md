# Turbo 캐싱 및 의존성 설정 가이드

미니 노션 프로젝트의 Turbo 빌드 시스템 캐싱 및 의존성 최적화 설정에 대한 상세 가이드입니다.

## 개요

Turbo는 모노레포에서 빌드 성능을 최적화하기 위해 지능적인 캐싱과 의존성 관리를 제공합니다. 이 설정을 통해 개발 속도를 크게 향상시킬 수 있습니다.

## 캐싱 전략

### 1. 로컬 캐싱
- **위치**: `.turbo/` 디렉토리
- **동작**: 태스크 실행 결과를 로컬에 저장
- **장점**: 빠른 접근 속도, 네트워크 불필요

### 2. 원격 캐싱
- **설정**: `remoteCache.signature: true`
- **동작**: 팀 간 캐시 공유 가능
- **장점**: CI/CD 및 팀원 간 빌드 결과 공유

### 3. 캐시 무효화
캐시는 다음 요소들의 해시값으로 결정됩니다:
- 입력 파일들 (`inputs`)
- 환경변수 (`env`, `globalEnv`)
- 의존성 패키지 (`globalDependencies`)
- 태스크 설정 자체

## 태스크별 캐싱 설정

### Build 태스크
```json
{
  "build": {
    "dependsOn": ["^build", "contracts:generate", "db:generate"],
    "outputs": ["dist/**", ".next/**", "build/**", "lib/**"],
    "cache": true,
    "persistent": false
  }
}
```

**특징:**
- 의존성 패키지 빌드 완료 후 실행
- 생성된 타입과 DB 스키마 필요
- 빌드 결과물을 캐시에 저장

### Development 태스크
```json
{
  "dev": {
    "cache": false,
    "persistent": true,
    "dependsOn": ["^build", "contracts:generate", "db:generate"]
  }
}
```

**특징:**
- 캐시 비활성화 (실시간 변경 반영)
- 지속적 실행 (서버 프로세스)
- 필요한 생성 파일들 사전 준비

### Test 태스크
```json
{
  "test": {
    "dependsOn": ["^build", "db:generate"],
    "outputs": ["coverage/**", "test-results/**"],
    "cache": true
  }
}
```

**특징:**
- 테스트 결과와 커버리지 캐싱
- DB 스키마 생성 후 실행
- 빌드된 패키지 의존성

### Lint 태스크
```json
{
  "lint": {
    "outputs": ["eslint-report.json", "eslint-report.html"],
    "cache": true
  }
}
```

**특징:**
- 린팅 결과 리포트 캐싱
- 빠른 재실행 가능

## 의존성 관리

### 1. 태스크 간 의존성 (`dependsOn`)

#### 순차 의존성 (`^build`)
- `^` 접두사: 의존성 패키지의 해당 태스크 완료 후 실행
- 예: `apps/web`의 `build`는 `packages/*`의 `build` 완료 후 실행

#### 병렬 의존성 (`contracts:generate`)
- 같은 패키지 내 다른 태스크 완료 후 실행
- 예: `build`는 `contracts:generate` 완료 후 실행

### 2. 글로벌 의존성 (`globalDependencies`)

모든 태스크에 영향을 주는 파일들:
```json
{
  "globalDependencies": [
    "package.json",
    "pnpm-lock.yaml",
    "turbo.json",
    "tsconfig.json",
    ".eslintrc.js",
    "docker-compose.yml"
  ]
}
```

이 파일들이 변경되면 모든 캐시가 무효화됩니다.

### 3. 환경변수 의존성

#### 글로벌 환경변수 (`globalEnv`)
```json
{
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "REDIS_URL",
    "JWT_SECRET"
  ]
}
```

#### 태스크별 환경변수 (`env`)
```json
{
  "build": {
    "env": ["NODE_ENV", "VITE_*", "BUILD_*"]
  }
}
```

## 입력 파일 최적화

### 1. 정확한 입력 파일 지정
```json
{
  "build": {
    "inputs": [
      "src/**/*.tsx",
      "src/**/*.ts",
      "public/**",
      "package.json",
      "tsconfig.json",
      "vite.config.ts"
    ]
  }
}
```

**주의사항:**
- 너무 광범위한 패턴 사용 금지 (`**/*`)
- 실제 영향을 주는 파일만 포함
- 불필요한 파일 제외로 캐시 효율성 향상

### 2. 출력 파일 지정 (`outputs`)
```json
{
  "build": {
    "outputs": ["dist/**", ".next/**", "build/**"]
  }
}
```

출력 파일을 정확히 지정하여 캐시 복원 시 올바른 파일들이 복원되도록 합니다.

## 성능 최적화 팁

### 1. 캐시 적중률 향상
- 입력 파일을 최소한으로 지정
- 환경변수를 필요한 것만 포함
- 글로벌 의존성을 신중하게 선택

### 2. 병렬 실행 최적화
```bash
# 병렬 실행으로 속도 향상
pnpm turbo run build test lint --parallel

# 특정 패키지만 실행
pnpm turbo run build --filter=@mini-notion/web

# 변경된 패키지만 실행
pnpm turbo run test --affected
```

### 3. 캐시 관리
```bash
# 캐시 상태 확인
pnpm turbo run build --dry-run

# 캐시 강제 무효화
pnpm turbo run build --force

# 원격 캐시만 사용
pnpm turbo run build --remote-only
```

## 개발 워크플로우 최적화

### 1. 개발 시작 시
```bash
# 필요한 생성 파일들 준비
pnpm turbo run contracts:generate db:generate

# 개발 서버 시작 (의존성 자동 처리)
pnpm turbo run dev
```

### 2. 코드 변경 후
```bash
# 영향받는 패키지만 테스트
pnpm turbo run test --affected

# 전체 빌드 검증
pnpm turbo run build
```

### 3. 배포 전
```bash
# 전체 검증 파이프라인
pnpm turbo run type-check lint test build
```

## 트러블슈팅

### 1. 캐시 문제
```bash
# 캐시 디렉토리 정리
rm -rf .turbo

# 특정 태스크 캐시만 무효화
pnpm turbo run build --force
```

### 2. 의존성 문제
```bash
# 의존성 그래프 확인
pnpm turbo run build --graph

# 드라이런으로 실행 계획 확인
pnpm turbo run build --dry-run
```

### 3. 환경변수 문제
```bash
# 환경변수 상태 확인
pnpm turbo run build --dry-run=json | jq '.globalCacheInputs.environmentVariables'
```

## 모니터링 및 분석

### 1. 성능 프로파일링
```bash
# 성능 프로파일 생성
pnpm turbo run build --profile=profile.json

# 요약 정보 생성
pnpm turbo run build --summarize
```

### 2. 캐시 효율성 분석
- 캐시 적중률 모니터링
- 빌드 시간 변화 추적
- 병목 지점 식별

이 설정을 통해 미니 노션 프로젝트의 빌드 성능을 최대한 최적화할 수 있습니다.