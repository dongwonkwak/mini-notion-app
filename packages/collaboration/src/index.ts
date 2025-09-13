// Y.js Collaboration will be implemented in future tasks

// Placeholder exports for build compatibility
export interface AwarenessState {
  user: {
    id: string;
    name: string;
    color: string;
  };
}

export interface YjsProviderConfig {
  documentId: string;
  serverUrl: string;
}

export interface OfflineManagerConfig {
  storageKey: string;
}

// TODO: Implement in Task 5 - Y.js 실시간 협업 구현
export class AwarenessManager {
  constructor(/* config: any */) {}
}

export class YjsProvider {
  constructor(/* config: YjsProviderConfig */) {}
}

export class OfflineManager {
  constructor(/* config: OfflineManagerConfig */) {}
}
