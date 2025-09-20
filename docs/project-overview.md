# 미니 노션 - 고급 협업 에디터 포트폴리오

## 프로젝트 개요
Y.js, Tiptap, Hocuspocus를 활용한 실시간 협업 에디터를 기반으로, 핵심적인 엔터프라이즈급 기능들을 구현하는 포트폴리오 프로젝트. Contract-First 개발 방법론과 TestContainers를 활용한 Production-First 개발 전략으로 높은 기술적 완성도와 실무 적용성을 보여주는 것이 목표.

## 핵심 기술 스택

### Frontend
- **React 19** + TypeScript
- **Vite** (빌드 도구, HMR 지원)
- **Tiptap** (ProseMirror 기반 에디터)
- **Y.js** (CRDT 기반 협업)
- **Zustand** (상태 관리)
- **TailwindCSS** + **Shadcn/ui** (디자인 시스템)

### Backend
- **NestJS** + TypeScript
- **Hocuspocus** (Y.js 서버)
- **Prisma** ORM
- **PostgreSQL 15+** (모든 환경 통일)
- **Redis 7+** (캐싱 및 Pub/Sub)

### Development & Testing
- **TestContainers** (PostgreSQL + Redis 컨테이너 관리)
- **Docker** + **Docker Compose** (로컬 개발 환경)
- **Vitest** + **Supertest** (단위/통합 테스트)
- **Playwright** + **Cucumber BDD** (E2E 테스트)

### Contract & Validation
- **OpenAPI 3.0** (API Contract 정의)
- **Prism** (Mock Server + Contract 검증)
- **Zod** (환경변수 + 스키마 검증)

### Infrastructure
- **Docker** + **Docker Compose**
- **AWS** 또는 **GCP** 배포
- **GitHub Actions** CI/CD

## 개발 방법론

### Contract-First Development
- **API Contract 우선**: OpenAPI 스펙 기반 개발
- **Mock Server**: Prism을 활용한 Frontend/Backend 병렬 개발
- **자동 검증**: Contract 준수 여부 자동 테스트
- **타입 안전성**: Contract에서 TypeScript 타입 자동 생성

### Production-First Development
- **환경 일치성**: TestContainers로 모든 환경에서 동일한 PostgreSQL 15 + Redis 7 사용
- **테스트 완전성**: 실제 DB 연결로 통합 테스트 수행
- **환경 관리**: Zod 기반 환경변수 검증과 타입 안전성
- **자동화**: 다층 테스트 전략으로 품질 보증

## 핵심 기능 구현 계획

### 1. 문서/페이지/워크스페이스 모델
- **계층적 구조**: 워크스페이스 → 페이지(트리/폴더 구조) → 문서 단위 관리
- **권한 시스템**: Owner/Editor/Viewer 역할별 접근 제어
- **중첩 폴더 지원**: 무제한 깊이의 페이지 트리 구조
- **페이지 이동/복사**: 드래그 앤 드롭으로 페이지 재구성
- **워크스페이스 분리**: 팀별, 프로젝트별 독립적인 작업 공간

### 2. 실시간 협업 편집
- **Y.js 기반 동기화**: y-prosemirror를 활용한 충돌 없는 협업
- **WebSocket 통신**: Hocuspocus 서버를 통한 실시간 양방향 데이터 전송
- **Presence 시스템**: 현재 접속자 실시간 표시 및 상태 공유
- **Awareness 채널**: 커서 위치, 선택 범위를 색상별로 구분 표시
- **동시 편집 지원**: 여러 사용자가 같은 문서를 동시에 편집

### 3. 영속화 & 복구
- **PostgreSQL 저장소**: Y.Doc 스냅샷 + 업데이트 로그를 bytea 컬럼에 저장
- **Redis Pub/Sub**: 다중 서버 환경에서의 실시간 동기화
- **클라이언트 캐시**: IndexedDB를 활용한 오프라인 문서 캐싱
- **증분 동기화**: 재접속 시 변경된 부분만 효율적으로 동기화
- **자동 저장**: 실시간 변경사항 자동 백업

### 4. 기본 에디팅 UX
- **리치 텍스트 요소**: 헤딩, 리스트, 코드블록, 할 일 목록, 이미지 삽입
- **슬래시 커맨드**: `/` 입력으로 빠른 블록 삽입 및 포맷 변경
- **빠른 검색**: Ctrl/Cmd+K로 문서 내 검색 및 네비게이션
- **마크다운 지원**: 실시간 마크다운 문법 변환
- **블록 기반 편집**: 드래그 앤 드롭으로 블록 재배열

### 5. 접근 제어 및 공유
- **링크 공유**: 읽기 전용/편집 가능한 공유 링크 생성
- **사용자 초대**: 이메일 기반 워크스페이스/문서 초대 시스템
- **권한별 기능 제한**: 역할에 따른 세밀한 기능 접근 제어

### 6. 히스토리 및 버전 관리
- **버전 스냅샷**: 주요 변경 시점의 문서 상태 저장
- **히스토리 복구**: 특정 시점으로 문서 되돌리기

### 7. 커스텀 Hocuspocus 확장 기능
- **문서 변경 이력 기록 확장**
  - Y.js 문서의 변경사항을 PostgreSQL에 주기적으로 스냅샷 저장
  - 특정 시점으로의 문서 복원 기능 지원
- **권한 관리 확장**
  - 접속 시 JWT 토큰 검증을 통한 인증 및 기본 권한 확인
  - 문서별 세밀한 권한 제어 (읽기/쓰기)

### 8. 대용량 문서/트래픽 처리 최적화
- **성능 최적화 전략**
  - **Debounce/Throttle**: 에디터 입력에 300ms debounce 적용으로 불필요한 동기화 방지
  - **가상 스크롤링**: 수천 개 블록이 있는 문서의 렌더링 최적화
  - **Redis 캐싱**: 자주 접근하는 문서 메타데이터 캐싱
- **트래픽 분산 처리**
  - **Connection pooling**: WebSocket 연결 풀을 통한 리소스 관리
  - **Rate limiting**: 사용자당 초당 요청 제한으로 서버 보호

### 9. 인증 및 권한 관리
- **다층 인증 시스템**
  - **JWT 기반 인증**: Access Token + Refresh Token 구조
  - **OAuth 2.0 연동**: Google 또는 GitHub 소셜 로그인 1개 연동
  - **세션 관리**: 다중 디바이스 로그인 및 원격 로그아웃
- **역할 기반 접근 제어**
  - **Owner**: 문서 삭제, 권한 관리, 모든 편집 권한
  - **Editor**: 실시간 편집, 댓글, 제안 기능
  - **Viewer**: 읽기 전용, 내보내기 권한

## 테스트 전략

### 다층 테스트 아키텍처
- **단위 테스트**: Vitest + 기본 비즈니스 로직 (빠른 피드백)
- **Contract 테스트**: Prism + OpenAPI 스펙 검증 (API 계약 준수)
- **통합 테스트**: TestContainers PostgreSQL + Redis (실제 환경 시뮬레이션)
- **E2E 테스트**: Playwright + Cucumber BDD (사용자 시나리오 검증)

### 테스트 실행 전략
```bash
pnpm test              # 빠른 단위 테스트만 (기본 개발 중)
pnpm test:contracts    # Contract 검증
pnpm test:integration  # DB 연동 테스트 (조건부 실행)
pnpm test:e2e         # 전체 시스템 E2E 테스트
```

### 환경별 테스트 구성
- **개발 환경**: 단위 테스트 중심, Mock Server 활용
- **CI/CD 환경**: 모든 레벨 테스트 실행
- **로컬 통합 테스트**: TestContainers 조건부 활성화

## 기술적 챌린지 및 해결 방안

### 1. CRDT 충돌 해결
- Y.js의 내장 충돌 해결 알고리즘 활용
- 복잡한 문서 구조에서의 동시 편집 충돌 최소화
- TestContainers로 실제 PostgreSQL에서 Y.js 바이너리 데이터 저장/복원 검증

### 2. Contract-API 일치성 보장
- Prism Mock Server로 Frontend 개발 가속화
- Contract 준수 여부 자동 검증으로 문서-코드 불일치 방지
- OpenAPI 스펙에서 TypeScript 타입 자동 생성

### 3. 환경 일치성 보장
- Production-First 개발: 처음부터 프로덕션과 동일한 환경
- Zod 기반 환경변수 검증으로 설정 오류 조기 감지
- TestContainers로 테스트 환경 완전 자동화

### 4. 대용량 문서 성능 최적화
- Virtual DOM을 활용한 효율적인 렌더링 (가상 스크롤링)
- PostgreSQL 최적화: Y.js 바이너리 데이터 효율적 저장/조회
- Redis 캐싱: 자주 접근하는 문서 메타데이터 캐싱

### 5. 실시간성 보장
- WebSocket 연결 실패 시 자동 fallback
- 네트워크 단절 후 자동 재연결 및 동기화 로직
- 오프라인 편집 내용의 안전한 동기화

### 6. 확장성 대응
- 수평적 확장을 위한 stateless 서버 아키텍처
- Redis Pub/Sub을 활용한 다중 인스턴스 동기화

## 배포 및 운영

### 컨테이너화 및 배포
- **Docker 멀티 스테이지 빌드**로 이미지 크기 최적화
- **Docker Compose**를 통한 서비스 통합 실행

### CI/CD 파이프라인
- **GitHub Actions**를 통한 자동화된 테스트 및 배포
- **Contract 검증**: Prism을 활용한 API 스펙 준수 확인
- **다층 테스트**: 단위 → Contract → 통합 → E2E 순차 실행
- **환경변수 검증**: Zod로 배포 전 환경 설정 검증

### 모니터링 및 관찰성
- **Sentry**: 실시간 오류 추적 및 알림
- 기본적인 로깅 시스템 구축

## 포트폴리오 어필 포인트

### 기술적 깊이
1. **실시간 협업 기술**: Y.js, Hocuspocus 등 cutting-edge CRDT 기술 활용
2. **Contract-First 개발**: OpenAPI 기반 설계 우선 개발 방법론
3. **Production-First 개발**: TestContainers로 처음부터 프로덕션 환경 시뮬레이션
4. **컨테이너 네이티브**: Docker 생태계 기반 현대적 개발 방식
5. **다층 검증**: Unit → Contract → Integration → E2E 체계적 테스트

### 현업 적용성
1. **환경 일치성**: DevOps 베스트 프랙티스 적용
2. **팀 협업 최적화**: Contract 기반 Frontend/Backend 병렬 개발
3. **품질 보증**: 자동화된 다층 테스트로 버그 조기 발견
4. **CI/CD 친화적**: GitHub Actions에서 즉시 실행 가능한 테스트 환경
5. **설정 관리**: Zod 기반 환경변수 타입 안전성과 검증

### 아키텍처 설계
1. **MSA 지향**: Frontend, Backend, Realtime 서버의 역할 분리
2. **이벤트 기반**: 실시간 이벤트 처리 및 비동기 통신
3. **데이터 일관성**: CRDT + PostgreSQL을 통한 분산 환경에서의 일관성 보장
4. **컨테이너 오케스트레이션**: Docker Compose를 활용한 서비스 관리

### 개발 프로세스
1. **Contract-Driven Development**: API 설계 우선, 문서-코드 일치성 보장
2. **TestContainers 활용**: 개발 단계부터 프로덕션 환경 검증
3. **자동화된 품질 관리**: 코드 품질, Contract 준수, 테스트, 배포 자동화

## 개발 계획 (8-10주)

### Phase 1: Contract & 기반 구조 (Week 1-2)
- OpenAPI Contract 설계 및 Prism Mock Server 구축
- TestContainers 환경 구성 및 Zod 환경변수 검증
- 기본 에디터 (Tiptap) 구현
- PostgreSQL 스키마 설계

### Phase 2: 실시간 협업 (Week 3-4)
- Y.js + Hocuspocus 통합
- WebSocket Contract 정의 및 검증
- 실시간 동기화 구현
- Contract vs 실제 API 검증

### Phase 3: 인증 및 워크스페이스 (Week 5-6)
- JWT 인증 시스템 구현
- 워크스페이스 및 페이지 관리 API
- 권한 기반 접근 제어
- Contract 준수 검증

### Phase 4: 고도화 및 최적화 (Week 7-8)
- 성능 최적화 (가상 스크롤링, 캐싱)
- 파일 업로드 및 공유 기능
- 통합 테스트 및 E2E BDD 테스트 구축

### Phase 5: 배포 및 마무리 (Week 9-10)
- 프로덕션 배포 설정
- 모니터링 및 로깅 구축
- 문서화 및 포트폴리오 완성
- 성능 튜닝 및 최종 검증
