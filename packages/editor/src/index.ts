// Tiptap Editor will be implemented in future tasks

// Placeholder exports for build compatibility
export interface EditorConfig {
  documentId: string;
  userId: string;
}

export interface BlockType {
  type: string;
  content: any;
}

// TODO: Implement in Task 4 - Tiptap 기반 협업 에디터 기초 구축
export class CollaborativeEditor {
  constructor(config: EditorConfig) {}
}

export const EditorCommands = {
  // TODO: Implement editor commands
};

export const BlockExtensions = {
  // TODO: Implement block extensions
};
