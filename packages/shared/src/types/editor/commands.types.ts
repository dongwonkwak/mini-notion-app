/**
 * 에디터 커맨드 관련 타입 정의
 * 
 * Tiptap 에디터의 커맨드 시스템과 슬래시 커맨드 기능에 관련된 타입들을 정의합니다.
 * 사용자 입력에 따른 블록 생성, 변환, 포맷팅 등의 기능을 지원합니다.
 * 
 * @since 1.0.0
 * @editor Tiptap 커맨드 시스템
 */

import type { EditorBlockType, EditorMarkType, EditorBlockAttrs } from './blocks.types'

/**
 * 커맨드 카테고리
 * 
 * 슬래시 커맨드를 기능별로 분류하는 카테고리입니다.
 * UI에서 커맨드를 그룹화하여 표시할 때 사용됩니다.
 */
export type CommandCategory = 
  | 'basic'      // 기본 텍스트 블록
  | 'heading'    // 제목 블록
  | 'list'       // 리스트 블록
  | 'media'      // 미디어 블록 (이미지, 비디오 등)
  | 'advanced'   // 고급 블록 (테이블, 코드 등)
  | 'formatting' // 텍스트 포맷팅
  | 'structure'  // 문서 구조 (구분선, 페이지 브레이크 등)

/**
 * 커맨드 실행 컨텍스트
 * 
 * 커맨드가 실행되는 환경과 상태 정보를 담습니다.
 * 현재 선택 영역, 커서 위치 등의 정보를 포함합니다.
 */
export interface CommandContext {
  /** 현재 선택 영역 시작 위치 */
  from: number
  
  /** 현재 선택 영역 끝 위치 */
  to: number
  
  /** 현재 블록 타입 */
  currentBlockType?: EditorBlockType
  
  /** 현재 블록 속성 */
  currentBlockAttrs?: EditorBlockAttrs
  
  /** 활성화된 마크들 */
  activeMarks?: EditorMarkType[]
  
  /** 선택된 텍스트 */
  selectedText?: string
  
  /** 커서가 위치한 블록 ID */
  blockId?: string
}

/**
 * 슬래시 커맨드 정의
 * 
 * '/' 입력 시 표시되는 커맨드의 정보와 실행 로직을 정의합니다.
 * 
 * @example
 * ```typescript
 * const headingCommand: SlashCommand = {
 *   id: 'heading-1',
 *   title: '제목 1',
 *   description: '큰 제목을 추가합니다',
 *   icon: 'H1',
 *   category: 'heading',
 *   keywords: ['제목', '헤딩', 'h1', 'heading'],
 *   shortcut: 'Ctrl+Alt+1',
 *   action: (context) => ({
 *     type: 'setBlockType',
 *     blockType: 'heading',
 *     attrs: { level: 1 }
 *   })
 * }
 * ```
 * 
 * @editor 슬래시 커맨드 시스템
 */
export interface SlashCommand {
  /** 커맨드 고유 ID */
  id: string
  
  /** 커맨드 제목 */
  title: string
  
  /** 커맨드 설명 */
  description: string
  
  /** 커맨드 아이콘 (아이콘 이름 또는 이모지) */
  icon: string
  
  /** 커맨드 카테고리 */
  category: CommandCategory
  
  /** 검색 키워드 */
  keywords: string[]
  
  /** 키보드 단축키 (선택적) */
  shortcut?: string
  
  /** 커맨드 실행 함수 */
  action: (context: CommandContext) => CommandAction
  
  /** 커맨드 활성화 조건 (선택적) */
  isEnabled?: (context: CommandContext) => boolean
  
  /** 커맨드 표시 조건 (선택적) */
  isVisible?: (context: CommandContext) => boolean
}

/**
 * 커맨드 액션 타입
 * 
 * 커맨드 실행 시 수행할 작업의 종류를 정의합니다.
 */
export type CommandActionType = 
  | 'setBlockType'     // 블록 타입 변경
  | 'toggleMark'       // 마크 토글
  | 'insertBlock'      // 새 블록 삽입
  | 'deleteBlock'      // 블록 삭제
  | 'splitBlock'       // 블록 분할
  | 'joinBlocks'       // 블록 병합
  | 'insertText'       // 텍스트 삽입
  | 'replaceText'      // 텍스트 교체
  | 'insertImage'      // 이미지 삽입
  | 'insertTable'      // 테이블 삽입
  | 'custom'           // 커스텀 액션

/**
 * 커맨드 액션
 * 
 * 커맨드 실행 시 수행할 구체적인 작업을 정의합니다.
 * 
 * @example
 * ```typescript
 * // 블록 타입 변경 액션
 * const setHeadingAction: CommandAction = {
 *   type: 'setBlockType',
 *   blockType: 'heading',
 *   attrs: { level: 2 }
 * }
 * 
 * // 텍스트 삽입 액션
 * const insertTextAction: CommandAction = {
 *   type: 'insertText',
 *   text: 'Hello, World!',
 *   position: 'cursor'
 * }
 * ```
 */
export interface CommandAction {
  /** 액션 타입 */
  type: CommandActionType
  
  /** 블록 타입 (setBlockType, insertBlock 액션용) */
  blockType?: EditorBlockType
  
  /** 블록 속성 (setBlockType, insertBlock 액션용) */
  attrs?: EditorBlockAttrs
  
  /** 마크 타입 (toggleMark 액션용) */
  markType?: EditorMarkType
  
  /** 삽입할 텍스트 (insertText, replaceText 액션용) */
  text?: string
  
  /** 삽입 위치 (insertText, insertBlock 액션용) */
  position?: 'cursor' | 'start' | 'end' | number
  
  /** 이미지 URL (insertImage 액션용) */
  src?: string
  
  /** 테이블 크기 (insertTable 액션용) */
  tableSize?: { rows: number; cols: number }
  
  /** 커스텀 실행 함수 (custom 액션용) */
  execute?: (context: CommandContext) => void
}

/**
 * 키보드 단축키 정의
 * 
 * 에디터에서 사용할 키보드 단축키와 연결된 커맨드를 정의합니다.
 * 
 * @example
 * ```typescript
 * const shortcuts: KeyboardShortcut[] = [
 *   {
 *     key: 'Mod-b',
 *     description: '굵게',
 *     action: {
 *       type: 'toggleMark',
 *       markType: 'bold'
 *     }
 *   }
 * ]
 * ```
 */
export interface KeyboardShortcut {
  /** 키 조합 (ProseMirror 형식) */
  key: string
  
  /** 단축키 설명 */
  description: string
  
  /** 실행할 액션 */
  action: CommandAction
  
  /** 활성화 조건 (선택적) */
  isEnabled?: (context: CommandContext) => boolean
}

/**
 * 마크다운 단축키 정의
 * 
 * 마크다운 문법을 자동으로 변환하는 규칙을 정의합니다.
 * 
 * @example
 * ```typescript
 * const markdownShortcuts: MarkdownShortcut[] = [
 *   {
 *     pattern: /^# (.+)$/,
 *     action: {
 *       type: 'setBlockType',
 *       blockType: 'heading',
 *       attrs: { level: 1 }
 *     }
 *   }
 * ]
 * ```
 */
export interface MarkdownShortcut {
  /** 매칭할 정규식 패턴 */
  pattern: RegExp
  
  /** 실행할 액션 */
  action: CommandAction
  
  /** 변환 후 텍스트 처리 함수 (선택적) */
  transform?: (match: RegExpMatchArray) => string
}

/**
 * 커맨드 팔레트 설정
 * 
 * 슬래시 커맨드 UI의 표시 방식과 동작을 설정합니다.
 * 
 * @example
 * ```typescript
 * const paletteConfig: CommandPaletteConfig = {
 *   trigger: '/',
 *   maxItems: 10,
 *   searchThreshold: 0.3,
 *   groupByCategory: true
 * }
 * ```
 */
export interface CommandPaletteConfig {
  /** 팔레트 트리거 문자 */
  trigger: string
  
  /** 최대 표시 항목 수 */
  maxItems: number
  
  /** 검색 매칭 임계값 (0-1) */
  searchThreshold: number
  
  /** 카테고리별 그룹화 여부 */
  groupByCategory: boolean
  
  /** 단축키 표시 여부 */
  showShortcuts: boolean
  
  /** 팔레트 표시 위치 */
  position: 'cursor' | 'fixed' | 'floating'
  
  /** 애니메이션 효과 */
  animation: 'none' | 'fade' | 'slide' | 'scale'
  
  /** 커스텀 CSS 클래스 */
  className?: string
}

/**
 * 커맨드 실행 결과
 * 
 * 커맨드 실행 후 반환되는 결과 정보입니다.
 * 
 * @example
 * ```typescript
 * const result: CommandResult = {
 *   success: true,
 *   message: '제목 1로 변경되었습니다'
 * }
 * ```
 */
export interface CommandResult {
  /** 실행 성공 여부 */
  success: boolean
  
  /** 결과 메시지 (선택적) */
  message?: string
  
  /** 발생한 변경사항 (선택적) */
  changes?: {
    type: string
    from?: unknown
    to?: unknown
    data?: unknown
  }
  
  /** 오류 정보 (실패 시) */
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * 커맨드 히스토리 항목
 * 
 * 실행된 커맨드의 이력을 추적하기 위한 정보입니다.
 * 
 * @example
 * ```typescript
 * const historyItem: CommandHistoryItem = {
 *   commandId: 'heading-1',
 *   executedAt: Date.now(),
 *   context: { from: 0, to: 10 },
 *   result: { success: true }
 * }
 * ```
 */
export interface CommandHistoryItem {
  /** 실행된 커맨드 ID */
  commandId: string
  
  /** 실행 시간 */
  executedAt: number
  
  /** 실행 당시 컨텍스트 */
  context: CommandContext
  
  /** 실행 결과 */
  result: CommandResult
  
  /** 사용자 ID (협업 환경에서) */
  userId?: string
}