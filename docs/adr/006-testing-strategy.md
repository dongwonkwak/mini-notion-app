# ADR-006: 다층 테스트 전략 수립

## 상태
승인됨 (2025-09-21)

## 컨텍스트
미니 노션의 복잡한 실시간 협업 시스템, 블록 기반 에디터, 권한 관리 시스템을 안정적으로 검증할 수 있는 포괄적인 테스트 전략이 필요했습니다. 개발 속도와 품질 보장의 균형을 맞추면서, CI/CD 파이프라인에서 효율적으로 실행될 수 있는 테스트 아키텍처가 요구되었습니다.

**주요 요구사항**:
- 실시간 협업 기능 안정성 검증
- 복잡한 에디터 상태 변화 테스트
- 데이터베이스 통합 테스트
- API 계약 준수 검증
- 사용자 시나리오 E2E 테스트
- 빠른 피드백 루프

**제약사항**:
- CI/CD 실행 시간 제한 (30분 이내)
- 테스트 환경 리소스 효율성
- 팀의 테스트 작성 경험 수준
- 실시간 기능 테스트 복잡성

## 결정
**4층 테스트 피라미드** 전략 채택: 단위 테스트 → Contract 테스트 → 통합 테스트 → E2E 테스트

## 고려된 옵션들

### 옵션 1: 전통적 3층 피라미드 (Unit → Integration → E2E)
**장점**:
- 단순하고 이해하기 쉬운 구조
- 기존 팀 경험 활용 가능
- 도구 선택의 자유도

**단점**:
- API 계약 검증 부족
- 프론트엔드/백엔드 통합 지점 취약
- Contract-First 개발 지원 부족
- 실시간 협업 테스트 커버리지 부족

### 옵션 2: 테스트 트로피 (Integration 중심)
**장점**:
- 실제 사용 시나리오 중심
- 높은 신뢰도
- 버그 발견 효율성

**단점**:
- 느린 실행 속도
- 디버깅 복잡성
- 테스트 환경 의존성 높음
- CI/CD 시간 초과 위험

### 옵션 3: 4층 피라미드 + Contract 테스트 (선택됨)
**장점**:
- API 계약 자동 검증
- 프론트엔드/백엔드 병렬 개발 지원
- 계층별 명확한 책임 분리
- 실시간 기능 전용 테스트 전략

**단점**:
- 초기 설정 복잡성
- 도구 학습 비용
- 테스트 유지보수 오버헤드

## 결정 근거

### 1. 단위 테스트 (70% 비중)
**Vitest 기반 빠른 실행**:
```typescript
// 에디터 블록 로직 테스트
describe('BlockManager', () => {
  it('should create new text block', () => {
    const manager = new BlockManager();
    const block = manager.createBlock('text', { content: 'Hello' });
    
    expect(block.type).toBe('text');
    expect(block.content).toBe('Hello');
    expect(block.id).toBeDefined();
  });
});

// Zustand 스토어 테스트
describe('DocumentStore', () => {
  it('should update document title', () => {
    const { result } = renderHook(() => useDocumentStore());
    
    act(() => {
      result.current.updateTitle('New Title');
    });
    
    expect(result.current.title).toBe('New Title');
  });
});
```

**커버리지 목표**:
- 비즈니스 로직: 90%+
- 유틸리티 함수: 95%+
- React 컴포넌트: 80%+

### 2. Contract 테스트 (15% 비중)
**Prism Mock Server 활용**:
```yaml
# OpenAPI 스펙 기반 자동 검증
paths:
  /api/documents:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDocumentRequest'
      responses:
        201:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
```

**자동 검증 프로세스**:
- API 스펙 변경 시 자동 테스트 생성
- 요청/응답 스키마 실시간 검증
- 프론트엔드 API 호출 계약 준수 확인

### 3. 통합 테스트 (10% 비중)
**TestContainers 실제 환경**:
```typescript
describe('DocumentService Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;

  beforeAll(async () => {
    // 실제 PostgreSQL + Redis 컨테이너 시작
    postgres = await new PostgreSqlContainer().start();
    redis = await new RedisContainer().start();
    
    // 테스트 앱 초기화
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should create and sync Y.js document', async () => {
    // 실제 데이터베이스와 Y.js 동기화 테스트
    const doc = await documentService.createDocument({
      title: 'Test Doc',
      workspaceId: 'workspace-1'
    });
    
    // Y.js 상태 변경
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');
    ytext.insert(0, 'Hello World');
    
    // 데이터베이스 동기화 확인
    await documentService.syncYjsState(doc.id, Y.encodeStateAsUpdate(ydoc));
    
    const savedDoc = await prisma.document.findUnique({
      where: { id: doc.id }
    });
    
    expect(savedDoc.yjsState).toBeDefined();
  });
});
```

### 4. E2E 테스트 (5% 비중)
**Playwright + Cucumber BDD**:
```gherkin
Feature: 실시간 문서 협업
  As a 팀 멤버
  I want to 다른 사용자와 동시에 문서를 편집하고 싶다
  So that 효율적인 협업이 가능하다

  Scenario: 두 사용자 동시 편집
    Given 사용자 A가 문서 "프로젝트 계획"에 접속해 있다
    And 사용자 B가 같은 문서에 접속한다
    When 사용자 A가 "목표: " 텍스트를 입력한다
    And 사용자 B가 다른 줄에 "일정: " 텍스트를 입력한다
    Then 두 사용자 모두에게 변경사항이 실시간으로 반영된다
    And 문서에 "목표: "와 "일정: " 텍스트가 모두 저장된다
```

**핵심 시나리오 커버리지**:
- 사용자 인증 및 워크스페이스 접근
- 문서 생성 및 편집 플로우
- 실시간 협업 및 충돌 해결
- 권한 기반 접근 제어

### 5. 실시간 협업 특화 테스트
**Y.js 동기화 테스트**:
```typescript
describe('Real-time Collaboration', () => {
  it('should sync changes between multiple clients', async () => {
    // 두 개의 Y.js 문서 인스턴스 생성
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    
    const text1 = doc1.getText('content');
    const text2 = doc2.getText('content');
    
    // 동시 편집 시뮬레이션
    text1.insert(0, 'Hello ');
    text2.insert(0, 'World');
    
    // 상태 동기화
    const update1 = Y.encodeStateAsUpdate(doc1);
    const update2 = Y.encodeStateAsUpdate(doc2);
    
    Y.applyUpdate(doc2, update1);
    Y.applyUpdate(doc1, update2);
    
    // 충돌 없는 병합 확인
    expect(text1.toString()).toBe('WorldHello ');
    expect(text2.toString()).toBe('WorldHello ');
  });
});
```

## 결과 및 영향

### 긍정적 결과
- **빠른 피드백**: 단위 테스트 5분 이내 실행
- **높은 신뢰도**: Contract 테스트로 API 호환성 보장
- **실제 환경 검증**: TestContainers로 프로덕션 유사 환경 테스트
- **사용자 시나리오**: BDD로 비즈니스 요구사항 직접 검증
- **CI/CD 효율성**: 계층별 병렬 실행으로 총 실행 시간 25분

### 부정적 결과 및 위험
- **초기 설정 복잡성**: 4층 테스트 환경 구축 시간 (2-3주)
- **유지보수 오버헤드**: 테스트 코드 유지보수 비용 증가
- **도구 학습 비용**: TestContainers, Playwright, Prism 학습 필요
- **리소스 사용량**: 통합 테스트 시 컨테이너 리소스 소모
- **테스트 복잡성**: 실시간 기능 테스트 디버깅 어려움

### 완화 방안
- **점진적 도입**: 단위 테스트부터 시작하여 단계적 확장
- **템플릿 제공**: 각 테스트 유형별 표준 템플릿 제공
- **자동화 도구**: 테스트 생성 및 유지보수 자동화 스크립트
- **성능 최적화**: 테스트 병렬 실행 및 캐싱 전략
- **교육 프로그램**: 팀 테스트 작성 역량 강화 교육

## 관련 결정
- [ADR-001: NestJS vs Next.js 백엔드 선택](./001-nestjs-vs-nextjs.md) - 백엔드 테스트 전략
- [ADR-002: React 19 + Vite 프론트엔드 조합](./002-react19-vite.md) - 프론트엔드 테스트 도구
- [ADR-003: Y.js + Hocuspocus 실시간 협업](./003-yjs-hocuspocus.md) - 실시간 기능 테스트
- [ADR-004: Turbo 모노레포 구조 채택](./004-monorepo-structure.md) - 모노레포 테스트 실행

## 참고 자료
- [Testing Trophy vs Testing Pyramid](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Contract Testing with Pact](https://docs.pact.io/)
- [TestContainers 공식 문서](https://www.testcontainers.org/)
- [Playwright BDD 가이드](https://playwright.dev/docs/test-runners)
- [Y.js 테스트 전략](https://docs.yjs.dev/getting-started/testing)