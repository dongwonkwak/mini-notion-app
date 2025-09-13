# Mini Notion App

실시간 협업 에디터 - Y.js, Tiptap, Hocuspocus를 활용한 미니 노션 클론

## 🚀 기술 스택

- **Monorepo**: Turbo + pnpm workspace
- **Frontend**: React/Next.js, Tiptap, Y.js, TailwindCSS
- **Backend**: Node.js, Hocuspocus, Express.js
- **Database**: PostgreSQL (운영), SQLite (개발)
- **Cache**: Redis
- **Storage**: AWS S3 (또는 MinIO)
- **Authentication**: NextAuth.js (OAuth + JWT)

## 📦 패키지 구조

```
mini-notion-app/
├── apps/
│   ├── web/          # Next.js 클라이언트
│   ├── server/       # Hocuspocus 서버
│   └── api/          # REST API 서버
├── packages/
│   ├── ui/           # 공통 UI 컴포넌트
│   ├── editor/       # Tiptap 에디터 로직
│   ├── collaboration/# Y.js 협업 로직
│   ├── auth/         # 인증 관련 유틸리티
│   ├── database/     # DB 스키마 & 쿼리
│   ├── types/        # TypeScript 타입 정의
│   ├── ai/           # AI 문서 생성 기능
│   └── config/       # 공통 설정
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env

# 필요한 환경 변수 값 설정
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - OAuth 클라이언트 ID/Secret 등
```

### 3. 개발 서비스 시작

```bash
# Docker 서비스 시작 (Redis, MinIO, MailHog)
docker-compose up -d

# 데이터베이스 설정
pnpm db:generate
pnpm db:push
pnpm db:seed

# 개발 서버 시작
pnpm dev
```

## 📋 사용 가능한 스크립트

```bash
# 개발
pnpm dev              # 모든 앱 개발 모드 시작
pnpm build            # 모든 앱 빌드
pnpm test             # 테스트 실행
pnpm eslint .         # ESLint 검사 (직접 실행)
pnpm type-check       # 타입 검사
pnpm format           # 코드 포맷팅

# 데이터베이스
pnpm db:generate      # Prisma 클라이언트 생성
pnpm db:push          # 스키마를 데이터베이스에 푸시
pnpm db:seed          # 테스트 데이터 시딩

# 정리
pnpm clean            # 빌드 파일 정리
```

## 🗄️ 데이터베이스

### 개발 환경

- **SQLite**: 로컬 개발용 (`./packages/database/prisma/dev.db`)
- **Redis**: 캐싱 및 세션 관리
- **MinIO**: 파일 저장 (S3 호환)

### 테스트 데이터

시딩 스크립트로 다음 데이터가 생성됩니다:

- 사용자 5명 (관리자 1명, 에디터 2명, 뷰어 2명)
- 워크스페이스 1개
- 페이지 10개 (계층 구조 포함)
- 샘플 댓글

## 🔧 개발 도구

### Docker 서비스

```bash
# 서비스 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f [service-name]

# 서비스 중지
docker-compose down
```

### 접속 정보

- **Redis**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001` (minioadmin/minioadmin)
- **MailHog UI**: `http://localhost:8025`

## 📚 문서

- [요구사항 문서](./.kiro/specs/realtime-collaborative-editor/requirements.md)
- [설계 문서](./.kiro/specs/realtime-collaborative-editor/design.md)
- [구현 계획](./.kiro/specs/realtime-collaborative-editor/tasks.md)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/task-{번호}-{설명}`)
3. 변경사항 커밋
4. Pull Request 생성

## 📄 라이선스

MIT License
