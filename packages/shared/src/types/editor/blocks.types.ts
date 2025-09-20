/**
 * 에디터 블록 관련 타입 정의
 * 
 * Tiptap 에디터의 블록 시스템과 관련된 타입들을 정의합니다.
 * 블록 생성, 변환, 렌더링에 필요한 모든 타입을 포함합니다.
 * 
 * @since 1.0.0
 * @editor Tiptap 에디터 블록 시스템
 */

// import type { ID } from '../common/base.types'

/**
 * 에디터 블록 타입
 * 
 * Tiptap 에디터에서 지원하는 모든 블록 노드 타입을 정의합니다.
 * ProseMirror 스키마와 일치하는 타입 구조를 유지합니다.
 * 
 * @editor Tiptap 노드 타입과 매핑
 */
export type EditorBlockType =
  | 'doc'              // 문서 루트 노드
  | 'paragraph'        // 일반 텍스트 단락
  | 'heading'          // 제목 (h1-h6)
  | 'bulletList'       // 불릿 리스트
  | 'orderedList'      // 번호 리스트
  | 'listItem'         // 리스트 항목
  | 'codeBlock'        // 코드 블록
  | 'blockquote'       // 인용문
  | 'horizontalRule'   // 수평선
  | 'table'            // 테이블
  | 'tableRow'         // 테이블 행
  | 'tableHeader'      // 테이블 헤더 셀
  | 'tableCell'        // 테이블 일반 셀
  | 'image'            // 이미지
  | 'hardBreak'        // 강제 줄바꿈
  | 'text'             // 텍스트 노드

/**
 * 에디터 마크 타입
 * 
 * 텍스트에 적용할 수 있는 인라인 스타일 마크들을 정의합니다.
 * 
 * @editor Tiptap 마크 타입
 */
export type EditorMarkType =
  | 'bold'        // 굵게
  | 'italic'      // 기울임
  | 'underline'   // 밑줄
  | 'strike'      // 취소선
  | 'code'        // 인라인 코드
  | 'link'        // 링크
  | 'highlight'   // 하이라이트

/**
 * 블록 속성 인터페이스
 * 
 * 각 블록 타입별로 가질 수 있는 속성들을 정의합니다.
 * ProseMirror 노드 속성과 호환됩니다.
 * 
 * @example
 * ```typescript
 * // 제목 블록 속성
 * const headingAttrs: EditorBlockAttrs = {
 *   level: 2,
 *   id: 'heading-intro'
 * }
 * 
 * // 코드 블록 속성
 * const codeAttrs: EditorBlockAttrs = {
 *   language: 'typescript',
 *   showLineNumbers: true
 * }
 * ```
 */
export interface EditorBlockAttrs {
  /** 제목 레벨 (heading 전용) */
  level?: number
  
  /** 코드 언어 (codeBlock 전용) */
  language?: string
  
  /** 줄 번호 표시 여부 (codeBlock 전용) */
  showLineNumbers?: boolean
  
  /** 이미지 소스 URL (image 전용) */
  src?: string
  
  /** 이미지 대체 텍스트 (image 전용) */
  alt?: string
  
  /** 이미지 제목 (image 전용) */
  title?: string
  
  /** 링크 URL (link 마크 전용) */
  href?: string
  
  /** 링크 타겟 (link 마크 전용) */
  target?: string
  
  /** 하이라이트 색상 (highlight 마크 전용) */
  color?: string
  
  /** 텍스트 정렬 */
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  
  /** 블록 ID (고유 식별자) */
  id?: string
  
  /** CSS 클래스명 */
  class?: string
  
  /** 기타 속성 */
  [key: string]: unknown
}

/**
 * 에디터 블록 노드
 * 
 * Tiptap/ProseMirror 블록 노드의 JSON 표현입니다.
 * 문서 구조를 트리 형태로 나타냅니다.
 * 
 * @example
 * ```typescript
 * const paragraphBlock: EditorBlock = {
 *   type: 'paragraph',
 *   attrs: {
 *     textAlign: 'left'
 *   },
 *   content: [
 *     {
 *       type: 'text',
 *       text: 'Hello, ',
 *       marks: []
 *     },
 *     {
 *       type: 'text',
 *       text: 'World!',
 *       marks: [{ type: 'bold' }]
 *     }
 *   ]
 * }
 * ```
 * 
 * @editor ProseMirror 노드 구조
 */
export interface EditorBlock {
  /** 블록 타입 */
  type: EditorBlockType
  
  /** 블록 속성 */
  attrs?: EditorBlockAttrs
  
  /** 자식 노드들 (선택적) */
  content?: EditorBlock[]
  
  /** 텍스트 내용 (텍스트 노드 전용) */
  text?: string
  
  /** 적용된 마크들 (텍스트 노드 전용) */
  marks?: EditorMark[]
}

/**
 * 에디터 마크
 * 
 * 텍스트에 적용되는 인라인 스타일 마크를 나타냅니다.
 * 
 * @example
 * ```typescript
 * const boldMark: EditorMark = {
 *   type: 'bold'
 * }
 * 
 * const linkMark: EditorMark = {
 *   type: 'link',
 *   attrs: {
 *     href: 'https://example.com',
 *     target: '_blank'
 *   }
 * }
 * ```
 */
export interface EditorMark {
  /** 마크 타입 */
  type: EditorMarkType
  
  /** 마크 속성 (선택적) */
  attrs?: EditorBlockAttrs
}

/**
 * 블록 변환 규칙
 * 
 * 한 블록 타입을 다른 타입으로 변환하는 규칙을 정의합니다.
 * 슬래시 커맨드나 키보드 단축키에서 사용됩니다.
 * 
 * @example
 * ```typescript
 * const transformRule: BlockTransformRule = {
 *   from: 'paragraph',
 *   to: 'heading',
 *   trigger: '#',
 *   attrs: { level: 1 },
 *   condition: (block) => block.content?.[0]?.text?.startsWith('#')
 * }
 * ```
 */
export interface BlockTransformRule {
  /** 변환 전 블록 타입 */
  from: EditorBlockType
  
  /** 변환 후 블록 타입 */
  to: EditorBlockType
  
  /** 변환 트리거 (키보드 입력) */
  trigger: string
  
  /** 변환 후 적용할 속성 */
  attrs?: EditorBlockAttrs
  
  /** 변환 조건 함수 (선택적) */
  condition?: (block: EditorBlock) => boolean
  
  /** 변환 후 처리 함수 (선택적) */
  transform?: (block: EditorBlock) => EditorBlock
}

/**
 * 블록 스타일 정의
 * 
 * 각 블록 타입의 시각적 스타일을 정의합니다.
 * CSS 클래스나 인라인 스타일로 적용됩니다.
 * 
 * @example
 * ```typescript
 * const headingStyle: BlockStyle = {
 *   blockType: 'heading',
 *   className: 'prose-heading',
 *   styles: {
 *     fontSize: '1.5rem',
 *     fontWeight: 'bold',
 *     marginBottom: '1rem'
 *   },
 *   variants: {
 *     level1: { fontSize: '2rem' },
 *     level2: { fontSize: '1.5rem' },
 *     level3: { fontSize: '1.25rem' }
 *   }
 * }
 * ```
 */
export interface BlockStyle {
  /** 적용할 블록 타입 */
  blockType: EditorBlockType
  
  /** CSS 클래스명 */
  className?: string
  
  /** 인라인 스타일 */
  styles?: Record<string, string | number>
  
  /** 스타일 변형 (속성별) */
  variants?: Record<string, Record<string, string | number>>
  
  /** 반응형 스타일 */
  responsive?: {
    mobile?: Record<string, string | number>
    tablet?: Record<string, string | number>
    desktop?: Record<string, string | number>
  }
}

/**
 * 블록 검증 규칙
 * 
 * 블록의 유효성을 검사하는 규칙을 정의합니다.
 * 에디터에서 잘못된 구조나 내용을 방지합니다.
 * 
 * @example
 * ```typescript
 * const headingValidation: BlockValidation = {
 *   blockType: 'heading',
 *   rules: [
 *     {
 *       field: 'level',
 *       required: true,
 *       min: 1,
 *       max: 6
 *     }
 *   ],
 *   customValidator: (block) => {
 *     return block.content?.some(node => node.type === 'text')
 *   }
 * }
 * ```
 */
export interface BlockValidation {
  /** 검증할 블록 타입 */
  blockType: EditorBlockType
  
  /** 속성 검증 규칙 */
  rules?: Array<{
    field: string
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    enum?: string[]
  }>
  
  /** 커스텀 검증 함수 */
  customValidator?: (block: EditorBlock) => boolean
  
  /** 오류 메시지 */
  errorMessage?: string
}

/**
 * 블록 렌더링 옵션
 * 
 * 블록을 HTML로 렌더링할 때 사용하는 옵션들을 정의합니다.
 * 
 * @example
 * ```typescript
 * const renderOptions: BlockRenderOptions = {
 *   sanitize: true,
 *   allowedTags: ['p', 'h1', 'h2', 'strong', 'em'],
 *   classPrefix: 'editor-',
 *   customRenderers: {
 *     heading: (block) => `<h${block.attrs?.level}>${block.content}</h${block.attrs?.level}>`
 *   }
 * }
 * ```
 */
export interface BlockRenderOptions {
  /** HTML 새니타이징 여부 */
  sanitize?: boolean
  
  /** 허용된 HTML 태그 목록 */
  allowedTags?: string[]
  
  /** CSS 클래스 접두사 */
  classPrefix?: string
  
  /** 커스텀 렌더러 함수들 */
  customRenderers?: Record<EditorBlockType, (block: EditorBlock) => string>
  
  /** 마크다운 호환 모드 */
  markdownCompatible?: boolean
}