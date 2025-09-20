# ADR-001: NestJS vs Next.js 백엔드 선택

## 상태
승인됨 (2025-09-21)

## 컨텍스트
미니 노션 프로젝트의 백엔드 아키텍처를 위한 프레임워크 선택이 필요했습니다. 실시간 협업 기능, 복잡한 권한 시스템, 확장 가능한 아키텍처를 지원할 수 있는 프레임워크가 요구되었습니다.

**주요 요구사항**:
- 실시간 WebSocket 통신 지원
- Y.js + Hocuspocus 서버 통합
- 복잡한 비즈니스 로직 구조화
- 세밀한 권한 관리 시스템
- TypeScript 퍼스트 개발
- 확장 가능한 모듈 아키텍처
- 엔터프라이즈급 안정성

**제약사항**:
- 팀의 Node.js/TypeScript 경험 활용
- 빠른 개발 속도 필요
- 장기적 유지보수성 고려
- 커뮤니티 지원 및 생태계

## 결정
**NestJS**를 백엔드 프레임워크로 선택

## 고려된 옵션들

### 옵션 1: Next.js API Routes
**장점**:
- 프론트엔드와 동일한 프레임워크로 일관성
- 파일 기반 라우팅으로 빠른 프로토타이핑
- Vercel 배포 최적화
- 풀스택 개발 경험

**단점**:
- 복잡한 비즈니스 로직 구조화 한계
- WebSocket 지원 제한적
- 의존성 주입 시스템 부재
- 엔터프라이즈 아키텍처 패턴 부족
- Hocuspocus 서버 통합 복잡성

### 옵션 2: Express.js + TypeScript
**장점**:
- 가벼운 프레임워크
- 높은 유연성과 커스터마이징
- 풍부한 미들웨어 생태계
- 팀의 기존 경험 활용

**단점**:
- 아키텍처 구조화 수동 작업 필요
- 의존성 주입 별도 구현 필요
- 타입 안전성 보장 추가 작업
- 대규모 프로젝트 구조 관리 복잡

### 옵션 3: NestJS (선택됨)
**장점**:
- 의존성 주입 기반 모듈 아키텍처
- 데코레이터 기반 직관적 API 설계
- WebSocket 및 실시간 통신 내장 지원
- TypeScript 퍼스트 설계
- Guards, Interceptors, Pipes 등 엔터프라이즈 패턴
- Prisma ORM 완벽 통합
- 테스트 친화적 구조

**단점**:
- 학습 곡선 존재
- 상대적으로 무거운 프레임워크
- Angular 스타일 아키텍처 (팀 경험 부족)

## 결정 근거

### 1. 실시간 협업 최적화
NestJS의 WebSocket Gateway는 Hocuspocus 서버와 자연스럽게 통합됩니다:
- `@WebSocketGateway()` 데코레이터로 간단한 WebSocket 서버 구성
- 클라이언트 연결 관리 및 인증 통합
- Y.js 문서 동기화 로직을 서비스 레이어에서 체계적 관리

### 2. 복잡한 비즈니스 로직 구조화
미니 노션의 복잡한 도메인 로직을 모듈 시스템으로 깔끔하게 분리:
```
modules/
├── auth/           # 인증/인가
├── documents/      # 문서 관리
├── collaboration/  # 실시간 협업
├── workspaces/     # 워크스페이스 관리
└── users/          # 사용자 관리
```

### 3. 권한 시스템 구현 용이성
Guards와 데코레이터를 활용한 세밀한 권한 제어:
- `@UseGuards(JwtAuthGuard, RolesGuard)` 
- `@Roles('owner', 'editor')`
- 리소스별, 액션별 권한 검증 자동화

### 4. 타입 안전성 및 개발 경험
- Zod 스키마와 DTO 자동 검증
- OpenAPI 문서 자동 생성
- 의존성 주입으로 테스트 용이성 극대화

### 5. 확장성 및 유지보수성
- 모듈 간 명확한 경계와 의존성 관리
- 인터셉터를 통한 로깅, 캐싱, 변환 로직 분리
- 파이프를 통한 입력 검증 및 변환 자동화

## 결과 및 영향

### 긍정적 결과
- **개발 생산성 향상**: 의존성 주입과 데코레이터로 보일러플레이트 코드 감소
- **코드 품질 향상**: 명확한 아키텍처 패턴으로 일관된 코드 구조
- **테스트 용이성**: 모킹과 의존성 주입으로 단위 테스트 작성 용이
- **실시간 기능 안정성**: WebSocket 연결 관리 및 에러 처리 내장
- **확장성 확보**: 새로운 모듈 추가 시 기존 코드 영향 최소화

### 부정적 결과 및 위험
- **학습 비용**: 팀의 NestJS 학습 시간 필요 (약 1-2주)
- **번들 크기**: Express 대비 상대적으로 큰 런타임 크기
- **과도한 추상화**: 간단한 기능도 복잡한 구조로 구현될 위험

### 완화 방안
- **학습 지원**: NestJS 공식 문서 스터디 및 페어 프로그래밍
- **점진적 적용**: 핵심 모듈부터 시작하여 점진적으로 확장
- **성능 모니터링**: 런타임 성능 지속적 모니터링 및 최적화
- **아키텍처 가이드**: 팀 내 NestJS 베스트 프랙티스 문서화

## 관련 결정
- [ADR-003: Y.js + Hocuspocus 실시간 협업](./003-yjs-hocuspocus.md) - WebSocket 통합
- [ADR-005: Prisma ORM 데이터베이스 레이어](./005-prisma-orm.md) - ORM 통합
- [ADR-006: 다층 테스트 전략 수립](./006-testing-strategy.md) - 테스트 아키텍처

## 참고 자료
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Hocuspocus NestJS 통합 가이드](https://tiptap.dev/hocuspocus/provider/nestjs)
- [NestJS vs Express 성능 비교](https://github.com/nestjs/nest/tree/master/benchmarks)
- [엔터프라이즈 Node.js 아키텍처 패턴](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)