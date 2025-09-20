# 개발자 온보딩 가이드

미니 노션 프로젝트에 새로 참여하는 개발자를 위한 완전한 온보딩 가이드입니다. 프로젝트 이해부터 첫 기여까지 단계별로 안내합니다.

## 📋 온보딩 체크리스트

### Phase 1: 프로젝트 이해 (1-2시간)
- [ ] 프로젝트 개요 및 비전 이해
- [ ] 기술 스택 및 아키텍처 파악
- [ ] 개발 환경 요구사항 확인
- [ ] 팀 커뮤니케이션 채널 참여

### Phase 2: 개발 환경 구축 (2-3시간)
- [ ] 필수 도구 설치
- [ ] 프로젝트 클론 및 의존성 설치
- [ ] 환경변수 설정
- [ ] 로컬 개발 서버 실행 확인

### Phase 3: 개발 워크플로우 학습 (1-2시간)
- [ ] Git 워크플로우 이해
- [ ] 코드 품질 도구 설정
- [ ] 테스트 실행 방법 학습
- [ ] 디버깅 환경 설정

### Phase 4: 첫 기여 (2-4시간)
- [ ] 간단한 이슈 선택
- [ ] 브랜치 생성 및 개발
- [ ] 테스트 작성 및 실행
- [ ] Pull Request 생성

## 🎯 Phase 1: 프로젝트 이해

### 1.1 프로젝트 개요 읽기

**필수 문서 순서대로 읽기**:
1. `README.md` - 프로젝트 기본 정보
2. `docs/project-overview.md` - 상세 프로젝트 개요
3. `.kiro/steering/product.md` - 제품 비전 및 목표
4. `.kiro/steering/tech.md` - 기술 스택 및 제약사항

**이해해야 할 핵심 개념**:
- 블록 기반 에디터 시스템
- 실시간 협업 (Y.js + CRDT)
- 워크스페이스 계층 구조
- 권한 기반 접근 제어

### 1.2 아키텍처 파악

**모노레포 구조 이해**:
```
mini-notion/
├── apps/web/          # React 19 + Vite 프론트엔드
├── apps/api/          # NestJS 백엔드
├── packages/shared/   # 공통 타입 및 유틸리티
├── packages/ui/       # 컴포넌트 라이브러리
└── packages/contracts/ # OpenAPI 스펙
```

**핵심 기술 스택**:
- Frontend: React 19, TypeScript, Vite, Tiptap, Y.js
- Backend: NestJS, Prisma, PostgreSQL, Redis, Hocuspocus
- Testing: Vitest, TestContainers, Playwright
- DevOps: Docker, Turbo, pnpm

### 1.3 개발 철학 이해

**Contract-First 개발**:
- API 구현 전 OpenAPI 스펙 작성 필수
- 프론트엔드/백엔드 병렬 개발 지원
- 타입 안전성 최우선

**실시간 협업 중심**:
- 모든 기능이 다중 사용자 동시 편집 고려
- 충돌 해결 및 데이터 일관성 보장
- 오프라인 편집 및 동기화 지원

## 🛠 Phase 2: 개발 환경 구축

### 2.1 필수 도구 설치

**시스템 요구사항**:
- macOS (권장) 또는 Linux
- Node.js 20+ (최신 LTS)
- Docker Desktop
- Git

**필수 도구 설치**:
```bash
# Node.js 20+ 설치 (nvm 사용 권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# pnpm 설치
npm install -g pnpm

# Docker Desktop 설치
# https://www.docker.com/products/docker-desktop 에서 다운로드

# 선택적: 유용한 도구들
brew install git-lfs      # 대용량 파일 관리
brew install jq           # JSON 처리
```

**VS Code 확장 설치** (권장 에디터):
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers"
  ]
}
```

### 2.2 프로젝트 클론 및 설정

**저장소 클론**:
```bash
git clone https://github.com/your-org/mini-notion.git
cd mini-notion
```

**의존성 설치**:
```bash
# 모든 패키지 의존성 설치
pnpm install

# 개발 환경 초기 설정
pnpm setup:env
```

**Git 설정**:
```bash
# 커밋 템플릿 설정
git config commit.template .gitmessage

# Pre-commit hook 설치
pnpm prepare
```

### 2.3 환경변수 설정

**환경변수 파일 생성**:
```bash
# 웹앱 환경변수
cp apps/web/.env.example apps/web/.env.local
# API 환경변수  
cp apps/api/.env.example apps/api/.env.local
```

**필수 환경변수 설정**:

`apps/web/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:1234
VITE_APP_NAME=Mini Notion Dev
VITE_ENVIRONMENT=development
```

`apps/api/.env.local`:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_notion_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
HOCUSPOCUS_PORT=1234
```

### 2.4 로컬 서비스 실행

**Docker 서비스 시작**:
```bash
# PostgreSQL + Redis 시작
docker-compose up -d postgres redis

# 서비스 상태 확인
docker-compose ps
```

**데이터베이스 초기화**:
```bash
# Prisma 마이그레이션 실행
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

**개발 서버 실행**:
```bash
# 루트 디렉토리에서 모든 서비스 실행
pnpm dev

# 또는 개별 실행
pnpm dev:web    # 프론트엔드 (http://localhost:3000)
pnpm dev:api    # 백엔드 (http://localhost:3001)
```

### 2.5 설치 검증

**서비스 접근 확인**:
- 웹앱: http://localhost:3000
- API 문서: http://localhost:3001/api/docs
- 실시간 협업: ws://localhost:1234

**헬스체크 실행**:
```bash
# 전체 시스템 헬스체크
pnpm health-check

# 개별 서비스 확인
curl http://localhost:3001/health
curl http://localhost:3000
```

## 🔄 Phase 3: 개발 워크플로우 학습

### 3.1 Git 워크플로우

**브랜치 전략**:
```bash
# 새 기능 개발
git checkout -b feature/user-authentication
git checkout -b fix/editor-cursor-bug
git checkout -b docs/api-documentation

# 브랜치 명명 규칙
feature/기능명
fix/버그명  
docs/문서명
refactor/리팩토링명
```

**커밋 메시지 규칙**:
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경

예시:
feat(editor): 슬래시 커맨드 블록 선택 기능 추가
fix(auth): JWT 토큰 만료 처리 버그 수정
docs(api): 사용자 인증 API 문서 업데이트
```

### 3.2 코드 품질 도구

**ESLint 및 Prettier 설정 확인**:
```bash
# 린팅 실행
pnpm lint

# 자동 수정
pnpm lint:fix

# 포맷팅 확인
pnpm format:check

# 자동 포맷팅
pnpm format
```

**타입 검사**:
```bash
# 전체 프로젝트 타입 검사
pnpm type-check

# 개별 앱 타입 검사
pnpm type-check:web
pnpm type-check:api
```

### 3.3 테스트 실행 방법

**단위 테스트**:
```bash
# 전체 단위 테스트
pnpm test

# Watch 모드
pnpm test:watch

# 커버리지 포함
pnpm test:coverage
```

**통합 테스트**:
```bash
# TestContainers 기반 통합 테스트
pnpm test:integration

# 특정 모듈만
pnpm test:integration --testNamePattern="auth"
```

**E2E 테스트**:
```bash
# Playwright E2E 테스트
pnpm test:e2e

# 헤드리스 모드
pnpm test:e2e:headless

# 특정 브라우저
pnpm test:e2e --project=chromium
```

### 3.4 디버깅 환경 설정

**VS Code 디버깅 설정**:
`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/main.ts",
      "envFile": "${workspaceFolder}/apps/api/.env.local",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Web",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/web/vite.config.ts",
      "envFile": "${workspaceFolder}/apps/web/.env.local"
    }
  ]
}
```

**브라우저 디버깅**:
- React DevTools 설치
- Redux DevTools (Zustand 디버깅용)
- 네트워크 탭에서 API 호출 모니터링
- WebSocket 연결 상태 확인

## 🚀 Phase 4: 첫 기여

### 4.1 이슈 선택

**Good First Issue 찾기**:
- GitHub Issues에서 `good-first-issue` 라벨 확인
- 문서 개선, 간단한 UI 수정, 테스트 추가 등
- 예상 작업 시간 2-4시간 내외

**이슈 분석**:
- 요구사항 명확히 이해
- 관련 코드 위치 파악
- 필요한 테스트 범위 확인
- 질문이 있으면 이슈에 댓글로 문의

### 4.2 개발 진행

**브랜치 생성 및 개발**:
```bash
# 이슈 번호 기반 브랜치 생성
git checkout -b fix/issue-123-button-accessibility

# 개발 진행
# 1. 관련 steering 파일 확인
# 2. 기존 코드 패턴 따라하기
# 3. 점진적 개발 및 테스트
```

**개발 중 체크포인트**:
- [ ] Steering 가이드라인 준수 확인
- [ ] 타입 안전성 보장
- [ ] 접근성 고려사항 반영
- [ ] 성능 영향도 검토

### 4.3 테스트 작성

**테스트 전략**:
```bash
# 단위 테스트 작성
# apps/web/tests/ 또는 apps/api/tests/

# 테스트 실행 및 확인
pnpm test --testNamePattern="새로운기능"

# 커버리지 확인
pnpm test:coverage
```

**테스트 작성 가이드**:
- AAA 패턴 (Arrange, Act, Assert) 준수
- 의미 있는 테스트 이름 작성
- Edge case 및 에러 상황 테스트
- 접근성 테스트 포함 (필요시)

### 4.4 Pull Request 생성

**PR 생성 전 체크리스트**:
```bash
# 코드 품질 검사
pnpm lint
pnpm type-check
pnpm test

# 빌드 확인
pnpm build

# 커밋 정리 (필요시)
git rebase -i HEAD~3
```

**PR 템플릿 작성**:
```markdown
## 변경사항
- 구체적인 변경 내용 설명

## 테스트
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 확인
- [ ] 수동 테스트 완료

## 체크리스트
- [ ] Steering 가이드라인 준수
- [ ] 타입 안전성 확인
- [ ] 접근성 고려
- [ ] 문서 업데이트 (필요시)

## 스크린샷 (UI 변경시)
변경 전후 스크린샷 첨부
```

### 4.5 코드 리뷰 대응

**리뷰 요청 시**:
- 명확한 PR 설명 작성
- 변경 이유 및 접근 방법 설명
- 테스트 결과 공유
- 스크린샷/동영상 첨부 (UI 변경시)

**피드백 대응**:
- 건설적인 피드백 수용
- 질문에 성의껏 답변
- 요청된 변경사항 신속 반영
- 학습 기회로 활용

## 🎓 추가 학습 리소스

### 기술 스택 심화 학습

**React 19 & TypeScript**:
- React 19 새로운 기능 (use hook, Concurrent Features)
- TypeScript strict 모드 활용법
- 성능 최적화 패턴

**실시간 협업**:
- Y.js CRDT 개념 이해
- ProseMirror 에디터 아키텍처
- WebSocket 통신 패턴

**백엔드 아키텍처**:
- NestJS 모듈 시스템
- Prisma ORM 고급 기능
- Redis 캐싱 전략

### 프로젝트 특화 지식

**미니 노션 도메인**:
- 블록 기반 에디터 UX 패턴
- 워크스페이스 권한 시스템
- 실시간 협업 사용자 경험

**성능 최적화**:
- 가상 스크롤링 구현
- 대용량 문서 처리
- 실시간 동기화 최적화

## 🆘 문제 해결 가이드

### 자주 발생하는 문제들

**환경 설정 문제**:
```bash
# 포트 충돌
lsof -ti:3000 | xargs kill -9

# Docker 서비스 재시작
docker-compose down && docker-compose up -d

# 의존성 재설치
rm -rf node_modules && pnpm install
```

**개발 서버 문제**:
```bash
# 캐시 클리어
pnpm clean
pnpm build

# 타입 생성 재실행
pnpm generate:types
```

**테스트 실행 문제**:
```bash
# TestContainers 재시작
docker system prune -f
pnpm test:integration --forceExit
```

### 도움 요청 방법

**내부 리소스**:
1. Steering 파일 재확인
2. 기존 코드 패턴 참고
3. 테스트 케이스 참고
4. Git 히스토리 확인

**팀 지원**:
1. Slack/Discord 채널 활용
2. GitHub 이슈/Discussion 활용
3. 페어 프로그래밍 요청
4. 코드 리뷰에서 학습

## 🎉 온보딩 완료

축하합니다! 미니 노션 프로젝트 온보딩을 완료했습니다.

**다음 단계**:
- 더 복잡한 이슈에 도전
- 코드 리뷰 참여
- 새로운 기능 제안
- 다른 개발자 온보딩 도움

**지속적 성장**:
- 정기적인 steering 파일 업데이트 확인
- 새로운 기술 스택 학습
- 프로젝트 아키텍처 개선 제안
- 팀 지식 공유 참여

미니 노션 팀의 일원이 되신 것을 환영합니다! 🚀