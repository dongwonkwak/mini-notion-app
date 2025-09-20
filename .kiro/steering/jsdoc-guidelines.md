# JSDoc 문서화 가이드라인

미니 노션 프로젝트의 코드 문서화 표준을 정의합니다. 일관되고 유용한 JSDoc 주석을 통해 코드의 가독성과 유지보수성을 향상시킵니다.

## 문서화 대상

### 필수 문서화 항목
- **외부 공개 API 함수**: 다른 모듈에서 사용하는 모든 export 함수
- **복잡한 비즈니스 로직**: 3개 이상의 조건문이나 복잡한 알고리즘
- **공통 유틸리티 함수**: packages/shared의 모든 함수
- **타입 추론 불명확**: TypeScript가 정확한 타입을 추론하지 못하는 경우
- **React Hook**: 커스텀 훅의 매개변수, 반환값, 사용법
- **Y.js/협업 관련**: CRDT 동기화, WebSocket 통신 로직
- **에디터 확장**: Tiptap 확장 및 커스텀 노드/마크
- **성능 최적화 함수**: 메모이제이션, 디바운싱, 가상화 관련

### 문서화 제외 항목
- **Shadcn/ui 컴포넌트**: CLI로 생성된 기본 UI 컴포넌트 (Button, Input, Card 등)
- **외부 라이브러리 래퍼**: 단순히 외부 라이브러리를 감싸는 컴포넌트
- **자동 생성 코드**: OpenAPI, Prisma 등에서 자동 생성된 코드

### 선택적 문서화 항목
- **간단한 getter/setter**: 명확한 경우 생략 가능
- **타입이 명확한 함수**: 매개변수와 반환값이 자명한 경우
- **테스트 헬퍼 함수**: 테스트 코드 내부의 보조 함수

### Shadcn/ui 컴포넌트 처리 원칙
Shadcn/ui CLI로 생성된 컴포넌트는 이미 표준화된 패턴을 따르므로 JSDoc 주석을 추가하지 않습니다:

- **이유**: 공식 문서가 존재하고 표준 패턴을 따름
- **예외**: 커스텀 로직이나 비즈니스 로직이 추가된 경우에만 문서화
- **대안**: Storybook이나 컴포넌트 쇼케이스를 통한 사용법 시연
- **ESLint 설정**: `**/components/ui/**/*.{ts,tsx}` 패턴으로 JSDoc 규칙 자동 제외

## JSDoc 태그 표준

### 기본 태그
```typescript
/**
 * 함수의 목적과 동작을 한 줄로 요약
 * 
 * 더 자세한 설명이 필요한 경우 여기에 작성합니다.
 * 여러 줄로 작성할 수 있으며, 사용 예시나 주의사항을 포함합니다.
 * 
 * @param paramName - 매개변수 설명
 * @param options - 옵션 객체 설명
 * @param options.property - 옵션 속성 설명
 * @returns 반환값 설명
 * @throws {ErrorType} 에러 발생 조건
 * @example
 * ```typescript
 * const result = functionName(param, { property: 'value' })
 * ```
 * @since 1.0.0
 * @see {@link RelatedFunction} 관련 함수
 */
```

### 미니 노션 특화 태그
```typescript
/**
 * @yjs Y.js 관련 함수임을 표시
 * @collaboration 실시간 협업 기능
 * @editor Tiptap 에디터 관련
 * @performance 성능 최적화 함수
 * @security 보안 관련 함수
 * @offline 오프라인 지원 기능
 */
```

## 함수별 문서화 패턴

### 1. API 함수 (NestJS Controller)
```typescript
/**
 * 문서 생성 API 엔드포인트
 * 
 * 새로운 문서를 생성하고 초기 Y.js 상태를 설정합니다.
 * 생성된 문서는 요청한 사용자가 소유자 권한을 가집니다.
 * 
 * @param createDocumentDto - 문서 생성 정보
 * @param user - 인증된 사용자 정보 (JWT에서 추출)
 * @returns 생성된 문서 정보와 초기 협업 토큰
 * @throws {BadRequestException} 제목이 비어있거나 워크스페이스가 존재하지 않는 경우
 * @throws {ForbiddenException} 워크스페이스에 대한 생성 권한이 없는 경우
 * 
 * @example
 * ```typescript
 * POST /api/documents
 * {
 *   "title": "새 문서",
 *   "workspaceId": "workspace-123"
 * }
 * ```
 * 
 * @collaboration 생성 즉시 실시간 협업 세션 시작
 * @security 워크스페이스 권한 검증 필수
 */
@Post()
async createDocument(
  @Body() createDocumentDto: CreateDocumentDto,
  @CurrentUser() user: User
): Promise<DocumentResponse> {
  // 구현...
}
```

### 2. 복잡한 비즈니스 로직
```typescript
/**
 * Y.js 문서 상태를 PostgreSQL과 동기화
 * 
 * Y.js의 바이너리 상태를 데이터베이스에 저장하고,
 * 충돌 해결 및 버전 관리를 수행합니다.
 * 
 * @param documentId - 동기화할 문서 ID
 * @param yjsUpdate - Y.js 업데이트 바이너리 데이터
 * @param userId - 변경을 수행한 사용자 ID
 * @returns 동기화 결과 및 충돌 해결 정보
 * 
 * @throws {ConflictException} 동시 수정으로 인한 충돌 발생 시
 * @throws {NotFoundException} 문서가 존재하지 않는 경우
 * 
 * @yjs Y.js CRDT 알고리즘 사용
 * @performance 대용량 문서의 경우 청크 단위로 처리
 * 
 * @example
 * ```typescript
 * const result = await syncYjsDocument(
 *   'doc-123',
 *   new Uint8Array([1, 2, 3, ...]),
 *   'user-456'
 * )
 * ```
 */
async syncYjsDocument(
  documentId: string,
  yjsUpdate: Uint8Array,
  userId: string
): Promise<SyncResult> {
  // 복잡한 동기화 로직...
}
```

### 3. React Hook
```typescript
/**
 * 문서 실시간 협업을 위한 Y.js 통합 훅
 * 
 * Y.js 문서 상태를 React 컴포넌트와 동기화하고,
 * WebSocket을 통한 실시간 협업 기능을 제공합니다.
 * 
 * @param documentId - 협업할 문서 ID
 * @param options - 협업 설정 옵션
 * @param options.autoConnect - 자동 연결 여부 (기본값: true)
 * @param options.retryAttempts - 연결 실패 시 재시도 횟수 (기본값: 3)
 * @param options.offlineSupport - 오프라인 편집 지원 여부 (기본값: true)
 * 
 * @returns 협업 상태와 제어 함수들
 * @returns returns.ydoc - Y.js 문서 인스턴스
 * @returns returns.provider - Hocuspocus 프로바이더
 * @returns returns.isConnected - WebSocket 연결 상태
 * @returns returns.users - 현재 접속 중인 사용자 목록
 * @returns returns.connect - 수동 연결 함수
 * @returns returns.disconnect - 연결 해제 함수
 * 
 * @example
 * ```typescript
 * function DocumentEditor({ documentId }: { documentId: string }) {
 *   const { ydoc, isConnected, users } = useYjsCollaboration(documentId, {
 *     autoConnect: true,
 *     offlineSupport: true
 *   })
 * 
 *   return (
 *     <div>
 *       <div>연결 상태: {isConnected ? '연결됨' : '연결 안됨'}</div>
 *       <div>협업자: {users.length}명</div>
 *       <TiptapEditor ydoc={ydoc} />
 *     </div>
 *   )
 * }
 * ```
 * 
 * @collaboration 실시간 다중 사용자 편집 지원
 * @offline IndexedDB를 통한 오프라인 상태 저장
 * @performance 연결 상태 변경 시에만 리렌더링
 */
export function useYjsCollaboration(
  documentId: string,
  options: CollaborationOptions = {}
): CollaborationState {
  // 훅 구현...
}
```

### 4. 유틸리티 함수
```typescript
/**
 * 디바운스된 함수를 생성합니다
 * 
 * 지정된 지연 시간 동안 함수 호출을 지연시키고,
 * 연속된 호출이 있을 경우 이전 호출을 취소합니다.
 * 
 * @template T - 디바운스할 함수의 타입
 * @param func - 디바운스할 함수
 * @param delay - 지연 시간 (밀리초)
 * @param options - 디바운스 옵션
 * @param options.leading - 첫 번째 호출을 즉시 실행할지 여부
 * @param options.trailing - 마지막 호출을 지연 후 실행할지 여부
 * 
 * @returns 디바운스된 함수와 제어 메서드
 * @returns returns.debouncedFn - 디바운스된 함수
 * @returns returns.cancel - 대기 중인 호출 취소
 * @returns returns.flush - 대기 중인 호출 즉시 실행
 * 
 * @example
 * ```typescript
 * const { debouncedFn, cancel } = debounce(
 *   (query: string) => searchDocuments(query),
 *   300,
 *   { leading: false, trailing: true }
 * )
 * 
 * // 사용자 입력 시
 * debouncedFn('검색어')
 * 
 * // 컴포넌트 언마운트 시
 * cancel()
 * ```
 * 
 * @performance 검색, 자동저장 등 성능 최적화에 사용
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  // 구현...
}
```

### 5. Tiptap 확장
```typescript
/**
 * 슬래시 커맨드 Tiptap 확장
 * 
 * '/' 입력 시 블록 타입 선택 메뉴를 표시하는 에디터 확장입니다.
 * 키보드 네비게이션과 검색 필터링을 지원합니다.
 * 
 * @example
 * ```typescript
 * const editor = new Editor({
 *   extensions: [
 *     SlashCommands.configure({
 *       commands: [
 *         { title: '제목 1', command: 'heading', level: 1 },
 *         { title: '불릿 리스트', command: 'bulletList' }
 *       ],
 *       filterThreshold: 0.3
 *     })
 *   ]
 * })
 * ```
 * 
 * @editor Tiptap 확장
 * @collaboration 다중 사용자 환경에서 안전한 커맨드 실행
 */
export const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: 'slashCommands',
  
  addOptions() {
    return {
      /**
       * 사용 가능한 슬래시 커맨드 목록
       * @default DEFAULT_COMMANDS
       */
      commands: DEFAULT_COMMANDS,
      
      /**
       * 검색 필터링 임계값 (0-1)
       * @default 0.3
       */
      filterThreshold: 0.3,
      
      /**
       * 메뉴 최대 표시 개수
       * @default 10
       */
      maxItems: 10
    }
  }
  
  // 확장 구현...
})
```

### 6. 타입 가드 함수
```typescript
/**
 * Y.js 업데이트가 유효한 문서 변경인지 검증
 * 
 * Y.js 바이너리 데이터를 파싱하여 유효성을 검사하고,
 * 악성 데이터나 손상된 업데이트를 필터링합니다.
 * 
 * @param update - 검증할 Y.js 업데이트 바이너리
 * @param documentId - 대상 문서 ID (로깅용)
 * @returns 업데이트가 유효한 경우 true
 * 
 * @example
 * ```typescript
 * if (isValidYjsUpdate(updateData, 'doc-123')) {
 *   await applyUpdate(updateData)
 * } else {
 *   logger.warn('Invalid Y.js update received')
 * }
 * ```
 * 
 * @yjs Y.js 바이너리 형식 검증
 * @security 악성 업데이트 방지
 */
export function isValidYjsUpdate(
  update: Uint8Array,
  documentId: string
): update is ValidYjsUpdate {
  // 타입 가드 구현...
}
```

## 에러 문서화 패턴

### 커스텀 에러 클래스
```typescript
/**
 * Y.js 동기화 실패 시 발생하는 에러
 * 
 * 문서 상태 충돌, 네트워크 오류, 또는 권한 부족으로
 * Y.js 동기화가 실패했을 때 발생합니다.
 * 
 * @example
 * ```typescript
 * try {
 *   await syncDocument(docId, update)
 * } catch (error) {
 *   if (error instanceof YjsSyncError) {
 *     if (error.code === 'CONFLICT') {
 *       // 충돌 해결 로직
 *     }
 *   }
 * }
 * ```
 */
export class YjsSyncError extends Error {
  /**
   * 에러 코드
   * - CONFLICT: 동시 수정 충돌
   * - NETWORK: 네트워크 연결 오류  
   * - PERMISSION: 권한 부족
   * - INVALID_UPDATE: 잘못된 업데이트 데이터
   */
  public readonly code: YjsSyncErrorCode
  
  /**
   * 관련 문서 ID
   */
  public readonly documentId: string
  
  constructor(code: YjsSyncErrorCode, documentId: string, message: string) {
    super(message)
    this.name = 'YjsSyncError'
    this.code = code
    this.documentId = documentId
  }
}
```

## 인터페이스 및 타입 문서화

### 복잡한 인터페이스
```typescript
/**
 * 문서 협업 설정 옵션
 * 
 * 실시간 협업 기능의 동작을 제어하는 설정들입니다.
 * 네트워크 상태, 성능, 사용자 경험을 고려하여 조정할 수 있습니다.
 */
export interface CollaborationOptions {
  /**
   * 자동 연결 여부
   * 
   * true인 경우 컴포넌트 마운트 시 자동으로 WebSocket 연결을 시작합니다.
   * false인 경우 수동으로 connect() 함수를 호출해야 합니다.
   * 
   * @default true
   */
  autoConnect?: boolean
  
  /**
   * 연결 실패 시 재시도 횟수
   * 
   * WebSocket 연결이 실패했을 때 자동으로 재시도할 횟수입니다.
   * 0으로 설정하면 재시도하지 않습니다.
   * 
   * @default 3
   * @min 0
   * @max 10
   */
  retryAttempts?: number
  
  /**
   * 재시도 간격 (밀리초)
   * 
   * 연결 재시도 사이의 대기 시간입니다.
   * 지수 백오프가 적용되어 재시도할 때마다 간격이 증가합니다.
   * 
   * @default 1000
   * @min 100
   */
  retryDelay?: number
  
  /**
   * 오프라인 편집 지원 여부
   * 
   * true인 경우 네트워크 연결이 끊어져도 로컬에서 편집을 계속할 수 있고,
   * 연결 복구 시 자동으로 동기화됩니다.
   * 
   * @default true
   * @offline IndexedDB를 사용한 로컬 저장
   */
  offlineSupport?: boolean
  
  /**
   * 사용자 인식 정보 표시 여부
   * 
   * 다른 사용자의 커서, 선택 영역, 타이핑 상태를 표시할지 결정합니다.
   * 
   * @default true
   * @collaboration 실시간 사용자 상태 공유
   */
  showPresence?: boolean
}
```

### 유니온 타입
```typescript
/**
 * 에디터 블록 타입
 * 
 * Tiptap 에디터에서 지원하는 모든 블록 타입을 정의합니다.
 * 각 타입은 고유한 렌더링과 편집 동작을 가집니다.
 */
export type BlockType = 
  | 'paragraph'     // 일반 텍스트 단락
  | 'heading'       // 제목 (h1-h6)
  | 'bulletList'    // 불릿 리스트
  | 'orderedList'   // 번호 리스트
  | 'codeBlock'     // 코드 블록 (문법 하이라이팅)
  | 'blockquote'    // 인용문
  | 'table'         // 테이블
  | 'image'         // 이미지
  | 'divider'       // 구분선
  | 'todoList'      // 할 일 목록 (체크박스)
  | 'callout'       // 강조 박스
  | 'embed'         // 외부 콘텐츠 임베드
```

## 성능 관련 함수 문서화

```typescript
/**
 * 대용량 문서를 위한 가상 스크롤링 훅
 * 
 * 수천 개의 블록을 포함한 문서에서 성능을 최적화하기 위해
 * 뷰포트에 보이는 블록만 렌더링합니다.
 * 
 * @param items - 전체 블록 목록
 * @param itemHeight - 각 블록의 예상 높이 (픽셀)
 * @param containerHeight - 컨테이너 높이 (픽셀)
 * @param overscan - 뷰포트 밖에서 미리 렌더링할 아이템 수
 * 
 * @returns 가상 스크롤링 상태와 제어 함수
 * @returns returns.visibleItems - 현재 렌더링해야 할 아이템들
 * @returns returns.totalHeight - 전체 스크롤 영역 높이
 * @returns returns.scrollToIndex - 특정 인덱스로 스크롤
 * 
 * @performance 10,000+ 블록 문서에서 60fps 유지
 * @example
 * ```typescript
 * const { visibleItems, totalHeight, scrollToIndex } = useVirtualScroll(
 *   blocks,
 *   80, // 블록당 80px
 *   600, // 컨테이너 600px
 *   5 // 앞뒤로 5개씩 미리 렌더링
 * )
 * ```
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
): VirtualScrollResult<T> {
  // 가상 스크롤링 구현...
}
```

## 문서화 품질 체크리스트

### 작성 시 확인사항
- [ ] 함수의 목적이 명확히 설명되었는가?
- [ ] 모든 매개변수가 문서화되었는가?
- [ ] 반환값의 의미가 설명되었는가?
- [ ] 발생 가능한 에러가 명시되었는가?
- [ ] 실제 사용 예시가 포함되었는가?
- [ ] 성능이나 보안 관련 주의사항이 있는가?

### 미니 노션 특화 확인사항
- [ ] Y.js 관련 함수는 @yjs 태그가 있는가?
- [ ] 협업 기능은 @collaboration 태그가 있는가?
- [ ] 에디터 확장은 @editor 태그가 있는가?
- [ ] 성능 최적화 함수는 @performance 태그가 있는가?
- [ ] 오프라인 지원 기능은 @offline 태그가 있는가?

## 자동화 도구 설정

### ESLint 규칙
```json
{
  "rules": {
    "jsdoc/require-jsdoc": [
      "error",
      {
        "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": true,
          "ClassDeclaration": true,
          "ArrowFunctionExpression": false,
          "FunctionExpression": false
        },
        "contexts": [
          "ExportNamedDeclaration > FunctionDeclaration",
          "ExportDefaultDeclaration > FunctionDeclaration"
        ]
      }
    ],
    "jsdoc/require-param": "error",
    "jsdoc/require-returns": "error",
    "jsdoc/require-example": [
      "warn",
      {
        "contexts": [
          "ExportNamedDeclaration > FunctionDeclaration"
        ]
      }
    ]
  }
}
```

### TypeScript 설정
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false
  }
}
```

이 가이드라인을 따르면 미니 노션 프로젝트의 코드베이스가 잘 문서화되어 팀 협업과 유지보수가 크게 개선될 것입니다.