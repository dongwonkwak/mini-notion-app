// AI features will be implemented in future tasks

// Placeholder exports for build compatibility
export interface AIConfig {
  apiKey: string;
  model: string;
}

export interface ContentSuggestion {
  text: string;
  confidence: number;
}

// TODO: Implement in Task 18 - AI 문서 생성 통합
export class DocumentGenerator {
  constructor(config: AIConfig) {}
  
  async generateContent(prompt: string): Promise<string> {
    return 'AI-generated content placeholder';
  }
}

export class ContentSuggestions {
  async getSuggestions(context: string): Promise<ContentSuggestion[]> {
    return [];
  }
}

export class OpenAIClient {
  constructor(config: AIConfig) {}
}
