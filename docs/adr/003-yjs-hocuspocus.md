# ADR-003: Y.js + Hocuspocus 실시간 협업

## 상태
승인됨 (2025-09-21)

## 컨텍스트
미니 노션의 핵심 기능인 실시간 협업 에디터 구현을 위한 기술 선택이 필요했습니다. 여러 사용자가 동시에 문서를 편집할 때 충돌 없는 동기화, 오프라인 편집 지원, 확장 가능한 아키텍처가 요구되었습니다.

**주요 요구사항**:
- 충돌 없는 실시간 다중 사용자 편집
- 네트워크 단절 시 오프라인 편집 지원
- 문서 히스토리 및 버전 관리
- 사용자 커서 및 선택 영역 실시간 표시
- 대용량 문서 효율적 동기화
- 확장 가능한 서버 아키텍처

**제약사항**:
- Tiptap 에디터와 완벽 통합
- PostgreSQL 데이터 영속화
- 100명 이상 동시 편집 지원
- 낮은 지연시간 (< 100ms)

## 결정
**Y.js + Hocuspocus** 조합을 실시간 협업 솔루션으로 선택

## 고려된 옵션들

### 옵션 1: Socket.io + 커스텀 OT (Operational Transform)
**장점**:
- 완전한 제어권
- 기존 팀 Socket.io 경험 활용
- 커스텀 비즈니스 로직 구현 용이

**단점**:
- OT 알고리즘 직접 구현 복잡성
- 충돌 해결 로직 버그 위험성 높음
- 대용량 문서 성능 최적화 어려움
- 오프라인 동기화 구현 복잡
- 개발 및 유지보수 비용 높음

### 옵션 2: ShareJS/ShareDB
**장점**:
- 성숙한 OT 라이브러리
- 다양한 에디터 지원
- 커스터마이징 가능

**단점**:
- 활발하지 않은 커뮤니티
- Tiptap 통합 복잡성
- 성능 최적화 한계
- 모던 JavaScript 생태계 지원 부족

### 옵션 3: Y.js + Hocuspocus (선택됨)
**장점**:
- CRDT 기반 충돌 없는 동기화
- Tiptap 네이티브 통합 (y-prosemirror)
- 오프라인 편집 자동 지원
- 뛰어난 성능 및 메모리 효율성
- 활발한 커뮤니티 및 지속적 개발
- 바이너리 프로토콜 최적화

**단점**:
- CRDT 개념 학습 곡선
- 바이너리 데이터 디버깅 어려움
- 커스텀 비즈니스 로직 제약

## 결정 근거

### 1. CRDT 기반 충돌 해결
Y.js의 CRDT (Conflict-free Replicated Data Type) 알고리즘:
- **수학적 보장**: 동일한 연산 순서로 항상 같은 결과
- **네트워크 순서 무관**: 패킷 순서와 관계없이 일관성 보장
- **분산 환경 최적화**: 중앙 서버 없이도 동기화 가능

```typescript
// Y.js 문서 구조 예시
const ydoc = new Y.Doc();
const ytext = ydoc.getText('content');

// 동시 편집 시나리오
// 사용자 A: "Hello" 입력
ytext.insert(0, "Hello");
// 사용자 B: 같은 위치에 "Hi" 입력  
ytext.insert(0, "Hi");
// 결과: "HiHello" (충돌 없이 자동 해결)
```

### 2. Tiptap 완벽 통합
**y-prosemirror 확장**:
- ProseMirror 문서와 Y.js 문서 자동 동기화
- 에디터 상태 변경 시 실시간 Y.js 업데이트
- 원격 변경사항 에디터에 자동 반영
- 커서 위치 및 선택 영역 동기화

```typescript
// Tiptap + Y.js 통합
const editor = new Editor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: ydoc,
    }),
    CollaborationCursor.configure({
      provider: hocuspocusProvider,
    }),
  ],
});
```

### 3. Hocuspocus 서버 최적화
**NestJS 통합 장점**:
- 인증 및 권한 시스템 완벽 통합
- 데이터베이스 영속화 자동 처리
- 확장 가능한 서버 아키텍처
- 로깅 및 모니터링 내장

```typescript
// Hocuspocus NestJS 통합
@WebSocketGateway()
export class CollaborationGateway {
  constructor(private hocuspocus: HocuspocusService) {}
  
  @UseGuards(JwtAuthGuard)
  handleConnection(client: Socket) {
    // 인증된 사용자만 협업 세션 참여
  }
}
```

### 4. 성능 및 확장성
**바이너리 프로토콜 최적화**:
- 텍스트 기반 대비 90% 대역폭 절약
- 압축된 업데이트 델타 전송
- 메모리 효율적 문서 표현

**확장성 지표**:
- 단일 문서 동시 편집자: 100명+
- 문서 크기: 10MB+ 지원
- 동기화 지연시간: < 50ms
- 메모리 사용량: 문서 크기의 2-3배

### 5. 오프라인 지원
**자동 오프라인 처리**:
- IndexedDB 자동 캐싱
- 네트워크 복구 시 자동 동기화
- 충돌 없는 오프라인 편집 병합
- 사용자 투명한 오프라인/온라인 전환

## 결과 및 영향

### 긍정적 결과
- **개발 속도 향상**: 복잡한 동기화 로직 구현 불필요
- **안정성 확보**: 검증된 CRDT 알고리즘으로 버그 위험 최소화
- **성능 최적화**: 바이너리 프로토콜로 네트워크 효율성 극대화
- **사용자 경험**: 즉각적인 동기화와 자연스러운 협업 경험
- **확장성**: 대용량 문서 및 다중 사용자 안정적 지원

### 부정적 결과 및 위험
- **학습 곡선**: CRDT 개념 및 Y.js API 학습 필요
- **디버깅 복잡성**: 바이너리 데이터 구조 디버깅 어려움
- **커스터마이징 제약**: Y.js 내부 구조 변경 불가
- **의존성 위험**: Y.js 생태계 의존도 높음
- **데이터 크기**: CRDT 메타데이터로 인한 문서 크기 증가

### 완화 방안
- **교육 프로그램**: Y.js 및 CRDT 개념 팀 교육 실시
- **디버깅 도구**: Y.js 상태 시각화 도구 개발
- **모니터링 강화**: 협업 세션 성능 및 에러 모니터링
- **백업 전략**: 정기적 문서 스냅샷 및 히스토리 백업
- **성능 최적화**: 문서 크기 모니터링 및 압축 전략

## 관련 결정
- [ADR-001: NestJS vs Next.js 백엔드 선택](./001-nestjs-vs-nextjs.md) - Hocuspocus 서버 통합
- [ADR-002: React 19 + Vite 프론트엔드 조합](./002-react19-vite.md) - 클라이언트 성능 최적화
- [ADR-005: Prisma ORM 데이터베이스 레이어](./005-prisma-orm.md) - 문서 영속화

## 참고 자료
- [Y.js 공식 문서](https://docs.yjs.dev/)
- [Hocuspocus 서버 가이드](https://tiptap.dev/hocuspocus)
- [CRDT 알고리즘 설명](https://crdt.tech/)
- [y-prosemirror 통합 가이드](https://github.com/yjs/y-prosemirror)
- [실시간 협업 성능 벤치마크](https://blog.yjs.dev/2019/11/06/performance-benchmarks.html)