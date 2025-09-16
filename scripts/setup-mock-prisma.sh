#!/bin/bash

echo "🧪 Setting up Mock Prisma Client for CI..."

# Navigate to database package
cd packages/database

# Create directories for both .prisma/client and @prisma/client
mkdir -p node_modules/.prisma/client
mkdir -p node_modules/@prisma/client

# Create TypeScript type definitions
cat > node_modules/@prisma/client/index.d.ts << 'EOF'
export declare class PrismaClient {
  user: any;
  session: any;
  workspace: any;
  workspaceMember: any;
  page: any;
  document: any;
  documentHistory: any;
  comment: any;
  fileUpload: any;
  authEvent: any;
  constructor(options?: any): PrismaClient;
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
  $queryRaw<T = unknown>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
  $executeRaw(query: TemplateStringsArray | string, ...values: any[]): Promise<number>;
}

export declare namespace Prisma {
  export type UserCreateInput = any;
  export type WorkspaceCreateInput = any;
  export type PageCreateInput = any;
  export type DocumentCreateInput = any;
  export type CommentCreateInput = any;
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };
}

export declare type User = any;
export declare type Session = any;
export declare type Workspace = any;
export declare type WorkspaceMember = any;
export declare type Page = any;
export declare type Document = any;
export declare type DocumentHistory = any;
export declare type Comment = any;
export declare type FileUpload = any;
export declare type AuthEvent = any;

export default PrismaClient;
EOF

# Create Mock implementation
cat > node_modules/@prisma/client/index.js << 'EOF'
class MockPrismaClient {
  constructor(options = {}) {
    console.log('🧪 Using Mock Prisma Client for CI');
    this.user = {};
    this.session = {};
    this.workspace = {};
    this.workspaceMember = {};
    this.page = {};
    this.document = {};
    this.documentHistory = {};
    this.comment = {};
    this.fileUpload = {};
    this.authEvent = {};
  }
  async $connect() { return Promise.resolve(); }
  async $disconnect() { return Promise.resolve(); }
  async $transaction(fn) { return fn(this); }
  async $queryRaw(query, ...values) {
    console.log('🧪 Mock $queryRaw called:', query);
    return Promise.resolve([]);
  }
  async $executeRaw(query, ...values) {
    console.log('🧪 Mock $executeRaw called:', query);
    return Promise.resolve(0);
  }
}

const Prisma = {
  UserCreateInput: {},
  WorkspaceCreateInput: {},
  PageCreateInput: {},
  DocumentCreateInput: {},
  CommentCreateInput: {}
};

module.exports = { 
  PrismaClient: MockPrismaClient,
  Prisma: Prisma,
  User: {},
  Session: {},
  Workspace: {},
  WorkspaceMember: {},
  Page: {},
  Document: {},
  DocumentHistory: {},
  Comment: {},
  FileUpload: {},
  AuthEvent: {}
};
module.exports.default = MockPrismaClient;
EOF

# Create package.json for @prisma/client module
cat > node_modules/@prisma/client/package.json << 'EOF'
{
  "name": "@prisma/client",
  "version": "6.16.1",
  "main": "index.js",
  "types": "index.d.ts"
}
EOF

# Copy files to .prisma/client as well (for compatibility)
cp node_modules/@prisma/client/index.d.ts node_modules/.prisma/client/index.d.ts
cp node_modules/@prisma/client/index.js node_modules/.prisma/client/index.js

echo "✅ Mock Prisma Client setup completed"
echo "📂 Mock client installed at:"
echo "   - node_modules/@prisma/client/"
echo "   - node_modules/.prisma/client/"