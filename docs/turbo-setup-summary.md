# Turbo 빌드 시스템 설정 요약

미니 노션 프로젝트의 Turbo 빌드 시스템 설정에 대한 간단한 요약 가이드입니다.

## 🚀 주요 명령어

### 개발 시작
```bash
# 전체 개발 서버 시작
pnpm dev

# 특정 앱만 개발 서버 시작
pnpm dev --filter=@mini-notion/web
pnpm dev --filter=@mini-notion/api
```

### 빌드 및 검증
```bash
# 전체 프로젝트 빌드
pnpm build

# 타입 검사
pnpm type-check

# 린팅
pnpm lint

# 테스트 실행
pnpm test
```

### 캐시 관리
```bash
# 캐시 상태 확인 (실행 계획 보기)
pnpm turbo run build --dry-run

# 캐시 무시하고 강제 실행
pnpm turbo run build --force

# 캐시 디렉토리 정리
rm -rf .turbo
```

## 📋 태스크 실행 순서

### 1. 빌드 파이프라인
```
contracts:generate → db:generate → packages/shared → packages/ui → apps/*
```

### 2. 개발 서버 파이프라인
```
contracts:generate → db:generate → 모든 앱 병렬 시작
```

### 3. 테스트 파이프라인
```
packages/* 빌드 → db:generate → 테스트 실행
```

## 🎯 캐싱 전략

### ✅ 캐시 활성화 태스크
- **build**: 빌드 결과물 캐싱
- **test**: 테스트 결과 및 커버리지 캐싱
- **lint**: 린팅 결과 캐싱
- **type-check**: 타입 검사 결과 캐싱
- **contracts:generate**: API 타입 생성 결과 캐싱
- **db:generate**: Prisma 타입 생성 결과 캐싱

### ❌ 캐시 비활성화 태스크
- **dev**: 개발 서버 (실시간 변경 반영)
- **format**: 파일 수정 작업
- **db:push/migrate**: 데이터베이스 변경 작업
- **docker:up/down**: Docker 컨테이너 관리

## 🔄 의존성 관리

### 패키지 간 의존성
```
apps/web → packages/ui → packages/shared
apps/api → packages/shared
packages/contracts → (독립적)
```

### 태스크 간 의존성
- **`^build`**: 의존성 패키지의 빌드 완료 후 실행
- **`contracts:generate`**: API 타입 생성 후 실행
- **`db:generate`**: 데이터베이스 타입 생성 후 실행

## 📁 주요 출력 디렉토리

```
.turbo/                    # Turbo 캐시 디렉토리
apps/web/dist/            # 웹 앱 빌드 결과
apps/api/dist/            # API 앱 빌드 결과
packages/*/lib/           # 패키지 빌드 결과
coverage/                 # 테스트 커버리지 리포트
test-results/             # 테스트 결과 파일
```

## ⚡ 성능 최적화 팁

### 1. 병렬 실행
```bash
# 여러 태스크 병렬 실행
pnpm turbo run build test lint --parallel

# 변경된 패키지만 실행
pnpm turbo run test --affected
```

### 2. 필터링
```bash
# 특정 패키지만 대상
pnpm turbo run build --filter=@mini-notion/web

# 특정 패키지와 의존성 포함
pnpm turbo run build --filter=@mini-notion/web...
```

### 3. 캐시 최적화
- 불필요한 파일을 `inputs`에서 제외
- 정확한 `outputs` 지정으로 캐시 효율성 향상
- 환경변수를 필요한 것만 포함

## 🛠️ 트러블슈팅

### 캐시 문제
```bash
# 1. 캐시 디렉토리 정리
rm -rf .turbo

# 2. 특정 태스크만 강제 실행
pnpm turbo run build --force

# 3. 의존성 그래프 확인
pnpm turbo run build --graph
```

### 의존성 문제
```bash
# 1. 실행 계획 확인
pnpm turbo run build --dry-run

# 2. 의존성 설치 확인
pnpm install

# 3. 타입 생성 확인
pnpm turbo run contracts:generate db:generate
```

### 환경변수 문제
```bash
# 환경변수 상태 확인
pnpm turbo run build --dry-run=json | grep -A 10 "environmentVariables"
```

## 📊 성능 모니터링

### 빌드 시간 분석
```bash
# 성능 프로파일 생성
pnpm turbo run build --profile=profile.json

# 요약 정보 생성
pnpm turbo run build --summarize
```

### 캐시 효율성 확인
- **FULL TURBO**: 모든 태스크가 캐시에서 실행됨 (최적)
- **MISS**: 캐시 미스로 실제 실행됨
- **HIT**: 일부 캐시 적중

## 🎯 개발 워크플로우

### 새로운 기능 개발 시
```bash
# 1. 의존성 설치 및 타입 생성
pnpm install
pnpm turbo run contracts:generate db:generate

# 2. 개발 서버 시작
pnpm dev

# 3. 코드 변경 후 검증
pnpm turbo run lint type-check test

# 4. 빌드 확인
pnpm build
```

### 새 패키지 추가 시
```bash
# 1. 패키지 생성 후 pnpm-workspace.yaml 확인
# 2. package.json에 의존성 추가
# 3. turbo.json에 필요시 태스크 설정 추가
# 4. 빌드 테스트
pnpm turbo run build --filter=새패키지명
```

## 📚 추가 문서

- **상세 가이드**: `docs/turbo-caching-guide.md`
- **설정 검증**: `tools/scripts/validate-turbo-config.js`
- **Turbo 공식 문서**: https://turbo.build/repo/docs

이 요약을 통해 Turbo 빌드 시스템을 효율적으로 활용할 수 있습니다!