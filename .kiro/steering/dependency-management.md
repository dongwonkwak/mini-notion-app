# 모노레포 의존성 관리 가이드라인

모노레포에서 효율적이고 일관성 있는 의존성 관리를 위한 가이드라인입니다.

## 의존성 설치 위치 원칙

### 루트 레벨 (package.json)
**설치 대상:**
- 모든 앱에서 공통으로 사용하는 개발 도구
- 린팅, 포맷팅, 타입 체킹 도구
- 모노레포 관리 도구

**예시:**
```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "typescript": "^5.6.0",
    "prettier": "^3.6.0",
    "turbo": "^2.5.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-plugin-jsdoc": "^50.6.0"
  }
}
```

### 앱 레벨 (apps/*/package.json)
**설치 대상:**
- 앱별 특화 도구 (Vite, NestJS 등)
- 앱별 타입 정의 (@types/react 등)
- 런타임 의존성 (React, Express 등)

**예시:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

### 패키지 레벨 (packages/*/package.json)
**설치 대상:**
- 패키지별 특화 도구
- peerDependencies로 호환성 명시

**예시:**
```json
{
  "peerDependencies": {
    "eslint": "^9.0.0",
    "typescript": "^5.6.0",
    "prettier": "^3.0.0"
  }
}
```

## 의존성 중복 방지 전략

### 1. 호이스팅 활용
```bash
# pnpm의 자동 호이스팅으로 중복 설치 방지
pnpm install
```

### 2. workspace 프로토콜 사용
```json
{
  "dependencies": {
    "@mini-notion/shared": "workspace:*",
    "@mini-notion/config": "workspace:*"
  }
}
```

### 3. 버전 통일
```json
// 루트 package.json에서 버전 관리
{
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}

// 앱에서는 설치하지 않고 루트 버전 사용
```

## 새 의존성 추가 가이드

### 1. 공통 도구 추가
```bash
# 루트에 설치 (JSDoc ESLint 플러그인 예시)
pnpm add -D -w eslint-plugin-jsdoc@latest

# packages/config에서 peerDependencies 업데이트
# packages/config/package.json에 추가:
# "peerDependencies": {
#   "eslint-plugin-jsdoc": "^50.6.0"
# }
```

### 2. 앱별 도구 추가
```bash
# 특정 앱에만 설치
pnpm add -D --filter @mini-notion/web vite-plugin-specific
```

### 3. 공유 라이브러리 추가
```bash
# packages/shared에 설치
pnpm add --filter @mini-notion/shared lodash
pnpm add -D --filter @mini-notion/shared @types/lodash
```

## 버전 관리 전략

### 1. 최신 버전 우선 정책
```bash
# 새 패키지는 항상 최신 버전으로 설치
pnpm add package@latest

# 정기적인 업데이트
pnpm update --latest
```

### 2. 호환성 검증
```bash
# 업데이트 후 전체 빌드 테스트
pnpm build
pnpm test
pnpm type-check
```

### 3. 점진적 업데이트
```bash
# 메이저 버전 업데이트는 단계적으로
pnpm add typescript@5.6.0  # 특정 버전으로 먼저 테스트
pnpm add typescript@latest # 검증 후 최신 버전
```

## 의존성 정리 및 최적화

### 1. 사용하지 않는 의존성 제거
```bash
# 사용하지 않는 패키지 찾기
pnpm why package-name

# 안전한 제거
pnpm remove package-name
```

### 2. 중복 의존성 확인
```bash
# 중복 설치된 패키지 확인
pnpm list --depth=0

# 특정 패키지의 설치 위치 확인
pnpm why typescript
```

### 3. 의존성 트리 최적화
```bash
# 의존성 트리 정리
pnpm install --frozen-lockfile
pnpm dedupe
```

## 문제 해결 가이드

### 1. 버전 충돌 해결
```bash
# 충돌하는 패키지 확인
pnpm list typescript

# 특정 버전으로 통일
pnpm add -D -w typescript@5.6.0
```

### 2. 호이스팅 문제 해결
```bash
# 특정 패키지를 앱 레벨에 강제 설치
pnpm add --filter @mini-notion/web typescript
```

### 3. 캐시 문제 해결
```bash
# pnpm 캐시 정리
pnpm store prune

# node_modules 재설치
rm -rf node_modules
pnpm install
```

## 의존성 보안 관리

### 1. 취약점 스캔
```bash
# 보안 취약점 확인
pnpm audit

# 자동 수정
pnpm audit --fix
```

### 2. 정기적인 업데이트
```bash
# 주간 의존성 업데이트 체크
pnpm outdated

# 보안 패치 우선 적용
pnpm update --latest --prod
```

## 체크리스트

### 새 의존성 추가 시
- [ ] 올바른 위치에 설치 (루트/앱/패키지)
- [ ] 최신 버전으로 설치
- [ ] peerDependencies 업데이트 (필요시)
- [ ] ESLint/JSDoc 설정 업데이트 (해당하는 경우)
- [ ] 전체 빌드 테스트
- [ ] 타입 검사 통과 확인
- [ ] 린팅 규칙 검증

### 의존성 업데이트 시
- [ ] 변경 로그 확인
- [ ] 호환성 검증
- [ ] 테스트 실행
- [ ] 점진적 배포

### 정기 점검 시
- [ ] 사용하지 않는 의존성 제거
- [ ] 보안 취약점 확인
- [ ] 버전 통일성 검사
- [ ] 의존성 트리 최적화

이 가이드라인을 따르면 깔끔하고 효율적인 의존성 관리가 가능합니다.