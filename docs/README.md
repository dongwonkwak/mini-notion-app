# 실시간 협업 에디터 문서

## 📚 문서 구조

### 🔐 인증 및 권한

- [권한 시스템 가이드](./auth/permissions.md) - 5단계 RBAC 권한 시스템
- [인증 시스템 가이드](./auth/authentication.md) - NextAuth.js 기반 인증
- [보안 정책](./auth/security-policies.md) - MFA, JWT, 비밀번호 정책
- [API 인증 가이드](./auth/api-authentication.md) - API 인증 방법

### 🏗️ 아키텍처

- [시스템 아키텍처](./architecture/system-overview.md) - 전체 시스템 구조
- [데이터베이스 스키마](./architecture/database-schema.md) - Prisma 스키마 설명
- [실시간 협업 아키텍처](./architecture/realtime-collaboration.md) - Y.js + Hocuspocus

### 📡 API 문서

- [REST API 문서](./api/rest-api.md) - 모든 REST 엔드포인트
- [WebSocket API 문서](./api/websocket-api.md) - 실시간 협업 API
- [인증 API](./api/auth-api.md) - 로그인, 회원가입, MFA API

### 🎨 UI/UX 가이드

- [디자인 시스템](./ui/design-system.md) - 색상, 타이포그래피, 컴포넌트
- [컴포넌트 라이브러리](./ui/component-library.md) - 재사용 가능한 컴포넌트
- [접근성 가이드](./ui/accessibility.md) - WCAG 2.1 준수 가이드

### 🚀 배포 및 운영

- [개발 환경 설정](./deployment/development-setup.md) - 로컬 개발 환경
- [프로덕션 배포](./deployment/production-deployment.md) - Docker, Kubernetes
- [모니터링 및 로깅](./deployment/monitoring.md) - 성능 모니터링

### 🛠️ 개발 도구

- [ESLint 설정 가이드](./development/eslint-guide.md) - 코드 품질 관리

### 🧪 테스트

- [테스트 전략](./testing/test-strategy.md) - 단위, 통합, E2E 테스트
- [테스트 실행 가이드](./testing/running-tests.md) - 테스트 실행 방법

### 📖 사용자 가이드

- [사용자 매뉴얼](./user/user-manual.md) - 최종 사용자 가이드
- [관리자 가이드](./user/admin-guide.md) - 워크스페이스 관리자 가이드

## 🔄 문서 업데이트 정책

- **자동 생성**: API 문서는 JSDoc에서 자동 생성
- **수동 관리**: 가이드 문서는 기능 구현 시 함께 업데이트
- **정기 검토**: 월 1회 문서 정확성 검토
- **버전 관리**: 주요 변경사항은 CHANGELOG.md에 기록

## 📝 문서 작성 가이드

### 마크다운 스타일

- 제목: `#`, `##`, `###` 계층 구조 사용
- 코드 블록: 언어 명시 (`typescript, `bash)
- 링크: 상대 경로 사용 (`./auth/permissions.md`)
- 이미지: `docs/images/` 폴더에 저장

### 다국어 지원

- **현재**: 한국어 우선 (개발팀용)
- **미래**: 영어 번역 (글로벌 확장 시)
- **자동화**: AI 번역 도구 활용 예정

## 🛠️ 문서 도구

- **마크다운 에디터**: Typora, Mark Text 권장
- **다이어그램**: Mermaid, Draw.io
- **API 문서**: Swagger UI (자동 생성)
- **스크린샷**: 일관된 브라우저/테마 사용

---

**참고**: 이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
