# 라이브러리 버전 관리 가이드라인

## 개요

실시간 협업 에디터 프로젝트의 모든 라이브러리를 최신 버전으로 유지하여 보안, 성능, 기능 개선의 이점을 얻고, 기술 부채를 최소화하는 가이드라인입니다.

## 🎯 목적

1. **보안 강화**: 최신 보안 패치 및 취약점 수정 적용
2. **성능 최적화**: 최신 성능 개선사항 활용
3. **기능 향상**: 새로운 기능과 API 활용
4. **기술 부채 최소화**: 레거시 버전으로 인한 호환성 문제 방지
5. **개발자 경험**: 최신 개발 도구와 IDE 지원 활용

## 📋 버전 관리 원칙

### 1. **항상 최신 안정 버전 사용**
```json
// ❌ 나쁜 예시 - 오래된 버전
{
  "dependencies": {
    "react": "^17.0.0",
    "next": "^12.0.0",
    "typescript": "^4.5.0"
  }
}

// ✅ 좋은 예시 - 최신 안정 버전
{
  "dependencies": {
    "react": "^18.3.1",
    "next": "^15.1.3", 
    "typescript": "^5.7.2"
  }
}
```

### 2. **메이저 버전 업데이트 신중 검토**
- **패치 버전** (1.0.1 → 1.0.2): 즉시 업데이트
- **마이너 버전** (1.0.0 → 1.1.0): 빠른 업데이트 (호환성 확인)
- **메이저 버전** (1.0.0 → 2.0.0): 신중한 검토 후 업데이트

### 3. **핵심 라이브러리 우선순위**
1. **보안 관련**: 인증, 암호화, 검증 라이브러리
2. **프레임워크**: React, Next.js, Node.js
3. **빌드 도구**: TypeScript, Turbo, ESLint, Prettier
4. **테스트 도구**: Jest, Playwright, Testing Library
5. **기타 의존성**: 유틸리티, UI 라이브러리

## 🔧 자동화 도구 및 스크립트

### 1. 의존성 업데이트 스크립트

```bash
#!/bin/bash
# scripts/update-dependencies.sh

echo "🔍 의존성 업데이트 확인 중..."

# 1. 현재 outdated 패키지 확인
echo "📊 현재 outdated 패키지:"
pnpm outdated

# 2. 보안 취약점 확인
echo "🔒 보안 취약점 확인:"
pnpm audit

# 3. 인터랙티브 업데이트
echo "⬆️ 의존성 업데이트 시작:"
pnpm update --interactive --latest

# 4. 업데이트 후 테스트
echo "🧪 업데이트 후 테스트 실행:"
pnpm test:ci

# 5. 빌드 확인
echo "🏗️ 빌드 확인:"
pnpm build

echo "✅ 의존성 업데이트 완료!"
```

### 2. package.json 스크립트 추가

```json
{
  "scripts": {
    "deps:check": "pnpm outdated",
    "deps:update": "pnpm update --interactive --latest",
    "deps:audit": "pnpm audit",
    "deps:audit-fix": "pnpm audit --fix",
    "deps:clean": "rm -rf node_modules pnpm-lock.yaml && pnpm install",
    "deps:update-all": "./scripts/update-dependencies.sh"
  }
}
```

### 3. 자동 의존성 체크 GitHub Action

```yaml
# .github/workflows/dependency-check.yml
name: Dependency Check
on:
  schedule:
    - cron: '0 9 * * MON'  # 매주 월요일 오전 9시
  workflow_dispatch:

jobs:
  check-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Check outdated packages
        run: |
          echo "## 📊 Outdated Packages" >> $GITHUB_STEP_SUMMARY
          pnpm outdated >> $GITHUB_STEP_SUMMARY || true
          
      - name: Security audit
        run: |
          echo "## 🔒 Security Audit" >> $GITHUB_STEP_SUMMARY
          pnpm audit >> $GITHUB_STEP_SUMMARY || true
          
      - name: Create issue if updates needed
        uses: actions/github-script@v7
        with:
          script: |
            const { execSync } = require('child_process');
            try {
              execSync('pnpm outdated', { stdio: 'pipe' });
            } catch (error) {
              // outdated 패키지가 있으면 이슈 생성
              github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: '📦 의존성 업데이트 필요',
                body: '자동 검사에서 업데이트 가능한 패키지가 발견되었습니다.\n\n`pnpm deps:update` 명령어로 업데이트를 진행해주세요.',
                labels: ['dependencies', 'maintenance']
              });
            }
```

## 📊 핵심 라이브러리별 최신 버전 가이드

### Frontend 스택
```json
{
  "dependencies": {
    // React 생태계
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "^15.1.3",
    
    // 에디터 관련
    "@tiptap/core": "^2.10.3",
    "@tiptap/react": "^2.10.3",
    "@tiptap/starter-kit": "^2.10.3",
    
    // 실시간 협업
    "yjs": "^13.6.20",
    "@hocuspocus/provider": "^2.15.0",
    
    // 인증
    "next-auth": "^4.24.10",
    "jsonwebtoken": "^9.0.2",
    
    // AI
    "openai": "^4.76.1"
  }
}
```

### Backend 스택
```json
{
  "dependencies": {
    // 서버 프레임워크
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    
    // 데이터베이스
    "@prisma/client": "^6.1.0",
    "prisma": "^6.1.0",
    
    // 실시간 서버
    "@hocuspocus/server": "^2.15.0",
    "@hocuspocus/extension-redis": "^2.15.0"
  }
}
```

### 개발 도구
```json
{
  "devDependencies": {
    // TypeScript
    "typescript": "^5.7.2",
    "@types/node": "^22.10.5",
    "@types/react": "^18.3.17",
    
    // 빌드 도구
    "turbo": "^2.3.3",
    "@turbo/gen": "^2.3.3",
    
    // 테스트
    "jest": "^29.7.0",
    "@testing-library/react": "^16.1.0",
    "playwright": "^1.49.1",
    
    // 코드 품질
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    
    // 유틸리티
    "tsx": "^4.19.2",
    "chalk": "^5.3.0"
  }
}
```

## 🚨 업데이트 시 주의사항

### 1. **Breaking Changes 확인**
```bash
# 메이저 버전 업데이트 전 체크리스트
echo "📋 Breaking Changes 체크리스트:"
echo "1. CHANGELOG.md 또는 릴리즈 노트 확인"
echo "2. 마이그레이션 가이드 검토"
echo "3. 테스트 스위트 실행"
echo "4. 타입 에러 확인"
echo "5. 빌드 에러 확인"
```

### 2. **호환성 매트릭스**
| 라이브러리 | 최소 Node.js | React 버전 | TypeScript |
|-----------|-------------|-----------|------------|
| Next.js 15 | 18.17.0+ | 18.2.0+ | 5.0+ |
| Tiptap 2.10 | 16.0.0+ | 17.0.0+ | 4.0+ |
| Prisma 6 | 16.13.0+ | - | 4.7+ |

### 3. **단계별 업데이트 전략**

#### Phase 1: 안전한 업데이트 (패치/마이너)
```bash
# 1. 패치 버전 업데이트
pnpm update

# 2. 테스트 실행
pnpm test:ci

# 3. 빌드 확인
pnpm build
```

#### Phase 2: 메이저 버전 업데이트
```bash
# 1. 백업 브랜치 생성
git checkout -b deps/major-update-$(date +%Y%m%d)

# 2. 하나씩 업데이트
pnpm add react@latest react-dom@latest

# 3. 각 업데이트마다 테스트
pnpm test:ci && pnpm build

# 4. 문제 발생 시 롤백
git checkout -- package.json pnpm-lock.yaml
```

## 🔍 모니터링 및 알림

### 1. **Dependabot 설정**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "team-leads"
    assignees:
      - "maintainers"
    commit-message:
      prefix: "deps"
      include: "scope"
```

### 2. **보안 취약점 모니터링**
```bash
# 주간 보안 체크 스크립트
#!/bin/bash
# scripts/security-check.sh

echo "🔒 보안 취약점 검사 시작..."

# 1. npm audit
pnpm audit --audit-level moderate

# 2. Snyk 검사 (선택사항)
if command -v snyk &> /dev/null; then
    snyk test
fi

# 3. 결과 리포트
echo "📊 보안 검사 완료"
```

## 📈 성능 최적화

### 1. **번들 크기 모니터링**
```json
{
  "scripts": {
    "analyze": "ANALYZE=true pnpm build",
    "bundle-analyzer": "npx @next/bundle-analyzer"
  }
}
```

### 2. **의존성 크기 체크**
```bash
# 패키지 크기 분석
npx cost-of-modules

# 중복 의존성 확인
pnpm ls --depth=0
```

## 🎯 베스트 프랙티스

### 1. **정기적인 업데이트 스케줄**
- **매주 월요일**: 패치 버전 업데이트
- **매월 첫째 주**: 마이너 버전 업데이트 검토
- **분기별**: 메이저 버전 업데이트 계획

### 2. **업데이트 우선순위**
1. 🔴 **Critical**: 보안 취약점 수정
2. 🟡 **High**: 성능 개선, 버그 수정
3. 🟢 **Medium**: 새 기능, API 개선
4. 🔵 **Low**: 문서 업데이트, 타입 개선

### 3. **롤백 계획**
```bash
# 문제 발생 시 빠른 롤백
git checkout HEAD~1 -- package.json pnpm-lock.yaml
pnpm install
pnpm build
```

## 🚀 자동화 워크플로우

### 1. **Agent Hook 연동**
```json
{
  "name": "dependency-update-check",
  "description": "의존성 업데이트 확인 및 제안",
  "trigger": "manual",
  "actions": [
    "pnpm outdated",
    "pnpm audit", 
    "업데이트 가능한 패키지 리스트 생성",
    "보안 취약점 리포트 생성"
  ]
}
```

### 2. **CI/CD 통합**
```yaml
# 모든 PR에서 의존성 체크
- name: Check dependencies
  run: |
    pnpm audit --audit-level high
    pnpm outdated --format json > outdated.json
```

## 📚 참고 자료

- [pnpm 공식 문서](https://pnpm.io/)
- [Dependabot 설정 가이드](https://docs.github.com/en/code-security/dependabot)
- [npm 보안 가이드](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [Semantic Versioning](https://semver.org/)

## 🔄 지속적 개선

### 업데이트 메트릭 추적
- [ ] 업데이트 빈도 및 성공률
- [ ] 보안 취약점 해결 시간
- [ ] 빌드 실패율 변화
- [ ] 번들 크기 변화 추이

---

**중요**: 모든 의존성 업데이트는 테스트를 통과한 후에만 메인 브랜치에 머지하며, 메이저 버전 업데이트는 별도 브랜치에서 충분한 검증 후 진행합니다.