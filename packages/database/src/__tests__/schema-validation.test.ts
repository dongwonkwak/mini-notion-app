import { beforeAll, describe, expect, it } from '@jest/globals';
import { execSync } from 'child_process';
import { prisma } from '../index';

describe('Database Schema Validation', () => {
  beforeAll(async () => {
    // 스키마가 데이터베이스와 동기화되어 있는지 확인
    execSync('pnpm prisma db push --force-reset', { stdio: 'inherit' });
  });

  describe('Table Structure Validation', () => {
    it('should have all required tables', async () => {
      const tables = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
      `;
      
      const tableNames = tables.map(t => t.name);
      const expectedTables = [
        'users',
        'sessions', 
        'workspaces',
        'workspace_members',
        'pages',
        'documents',
        'document_history',
        'comments',
        'file_uploads'
      ];

      expectedTables.forEach(tableName => {
        expect(tableNames).toContain(tableName);
      });
    });

    it('should have correct user table structure', async () => {
      const columns = await prisma.$queryRaw<Array<{ name: string; type: string; notnull: number; pk: number }>>`
        PRAGMA table_info(users);
      `;

      const columnMap = columns.reduce((acc, col) => {
        acc[col.name] = { type: col.type, required: col.notnull === 1, primaryKey: col.pk === 1 };
        return acc;
      }, {} as Record<string, any>);

      // 필수 컬럼 검증
      expect(columnMap.id).toBeDefined();
      expect(columnMap.id.primaryKey).toBe(true);
      expect(columnMap.email).toBeDefined();
      expect(columnMap.email.required).toBe(true);
      expect(columnMap.name).toBeDefined();
      expect(columnMap.name.required).toBe(true);
      expect(columnMap.provider).toBeDefined();
      expect(columnMap.created_at).toBeDefined();
      expect(columnMap.updated_at).toBeDefined();
    });

    it('should have correct workspace table structure', async () => {
      const columns = await prisma.$queryRaw<Array<{ name: string; type: string; notnull: number }>>`
        PRAGMA table_info(workspaces);
      `;

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('owner_id');
      expect(columnNames).toContain('settings');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have correct page-document relationship structure', async () => {
      const pageColumns = await prisma.$queryRaw<Array<{ name: string }>>`
        PRAGMA table_info(pages);
      `;
      const documentColumns = await prisma.$queryRaw<Array<{ name: string }>>`
        PRAGMA table_info(documents);
      `;

      const pageColumnNames = pageColumns.map(c => c.name);
      const documentColumnNames = documentColumns.map(c => c.name);

      // 페이지에 document_id가 있는지 확인
      expect(pageColumnNames).toContain('document_id');
      
      // 문서 테이블에 필요한 컬럼들이 있는지 확인
      expect(documentColumnNames).toContain('id');
      expect(documentColumnNames).toContain('state');
      expect(documentColumnNames).toContain('version');
      expect(documentColumnNames).toContain('last_modified');
    });
  });

  describe('Constraints and Indexes Validation', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'unique-test@example.com',
        name: 'Test User',
        provider: 'email'
      };

      // 첫 번째 사용자 생성 성공
      await prisma.user.create({ data: userData });

      // 같은 이메일로 두 번째 사용자 생성 실패
      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow();
    });

    it('should enforce unique document_id constraint', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'doc-test@example.com',
          name: 'Doc Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace',
          ownerId: user.id
        }
      });

      const documentId = 'unique-doc-123';

      // 첫 번째 페이지 생성 성공
      await prisma.page.create({
        data: {
          workspaceId: workspace.id,
          title: 'First Page',
          documentId: documentId,
          document: {
            create: {
              id: documentId,
              state: Buffer.from([]),
              version: 0
            }
          }
        }
      });

      // 같은 document_id로 두 번째 페이지 생성 실패
      await expect(
        prisma.page.create({
          data: {
            workspaceId: workspace.id,
            title: 'Second Page',
            documentId: documentId
          }
        })
      ).rejects.toThrow();
    });

    it('should enforce workspace member uniqueness', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'member-test@example.com',
          name: 'Member Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Member Test Workspace',
          ownerId: user.id
        }
      });

      // 첫 번째 멤버십 생성 성공
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner'
        }
      });

      // 같은 사용자의 중복 멤버십 생성 실패
      await expect(
        prisma.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: user.id,
            role: 'editor'
          }
        })
      ).rejects.toThrow();
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should cascade delete workspace members when workspace is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'cascade-test@example.com',
          name: 'Cascade Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Cascade Test Workspace',
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: 'owner'
            }
          }
        }
      });

      // 멤버가 생성되었는지 확인
      const membersBefore = await prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id }
      });
      expect(membersBefore).toHaveLength(1);

      // 워크스페이스 삭제
      await prisma.workspace.delete({
        where: { id: workspace.id }
      });

      // 멤버도 함께 삭제되었는지 확인
      const membersAfter = await prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id }
      });
      expect(membersAfter).toHaveLength(0);
    });

    it('should cascade delete pages and documents when workspace is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'page-cascade-test@example.com',
          name: 'Page Cascade Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Page Cascade Test Workspace',
          ownerId: user.id
        }
      });

      const page = await prisma.page.create({
        data: {
          workspaceId: workspace.id,
          title: 'Test Page',
          documentId: 'cascade-doc-123',
          document: {
            create: {
              id: 'cascade-doc-123',
              state: Buffer.from([]),
              version: 0
            }
          }
        }
      });

      // 페이지와 문서가 생성되었는지 확인
      expect(page).toBeDefined();
      const document = await prisma.document.findUnique({
        where: { id: 'cascade-doc-123' }
      });
      expect(document).toBeDefined();

      // 워크스페이스 삭제
      await prisma.workspace.delete({
        where: { id: workspace.id }
      });

      // 페이지와 문서도 함께 삭제되었는지 확인
      const pageAfter = await prisma.page.findUnique({
        where: { id: page.id }
      });
      expect(pageAfter).toBeNull();

      const documentAfter = await prisma.document.findUnique({
        where: { id: 'cascade-doc-123' }
      });
      expect(documentAfter).toBeNull();
    });
  });

  describe('Data Types and JSON Fields', () => {
    it('should handle JSON fields correctly', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'json-test@example.com',
          name: 'JSON Test User',
          provider: 'email'
        }
      });

      const complexSettings = {
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
          mentions: true
        },
        features: ['collaboration', 'ai-assist'],
        limits: {
          maxPages: 100,
          maxMembers: 10
        }
      };

      const workspace = await prisma.workspace.create({
        data: {
          name: 'JSON Test Workspace',
          ownerId: user.id,
          settings: complexSettings
        }
      });

      const retrieved = await prisma.workspace.findUnique({
        where: { id: workspace.id }
      });

      expect(retrieved?.settings).toEqual(complexSettings);
    });

    it('should handle BLOB data for document state', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'blob-test@example.com',
          name: 'Blob Test User',
          provider: 'email'
        }
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: 'Blob Test Workspace',
          ownerId: user.id
        }
      });

      // Y.js 상태를 시뮬레이션하는 바이너리 데이터
      const yjsState = Buffer.from([1, 2, 3, 4, 5, 255, 254, 253]);

      const page = await prisma.page.create({
        data: {
          workspaceId: workspace.id,
          title: 'Blob Test Page',
          documentId: 'blob-doc-123',
          document: {
            create: {
              id: 'blob-doc-123',
              state: yjsState,
              version: 1,
              sizeBytes: yjsState.length
            }
          }
        },
        include: {
          document: true
        }
      });

      expect(page.document?.state).toEqual(yjsState);
      expect(page.document?.sizeBytes).toBe(yjsState.length);
    });
  });
});