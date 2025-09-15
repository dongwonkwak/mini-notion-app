/**
 * SQLite에서 PostgreSQL로 마이그레이션 스크립트
 * 프로덕션 배포 시 사용합니다.
 */
import { PrismaClient } from '@prisma/client';

import { config } from '@editor/config/environment';

interface MigrationResult {
  success: boolean;
  message: string;
  recordsMigrated?: number;
  errors?: string[];
}

/**
 * 데이터베이스 마이그레이션 실행
 */
export async function migrateToPostgreSQL(): Promise<MigrationResult> {
  const errors: string[] = [];
  let recordsMigrated = 0;

  try {
    // 소스 데이터베이스 (SQLite)
    const sourceDb = new PrismaClient({
      datasources: {
        db: {
          url: 'sqlite:./dev.db',
        },
      },
    });

    // 대상 데이터베이스 (PostgreSQL)
    const targetDb = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
    });

    console.log('Starting database migration...');

    // 1. 사용자 데이터 마이그레이션
    const users = await sourceDb.user.findMany();
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        await targetDb.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            password: user.password,
            provider: user.provider,
            providerId: user.providerId,
            emailVerified: user.emailVerified,
            mfaEnabled: user.mfaEnabled,
            mfaSecret: user.mfaSecret,
            mfaBackupCodes: user.mfaBackupCodes,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastActiveAt: user.lastActiveAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate user ${user.id}: ${error}`);
      }
    }

    // 2. 세션 데이터 마이그레이션
    const sessions = await sourceDb.session.findMany();
    console.log(`Found ${sessions.length} sessions to migrate`);

    for (const session of sessions) {
      try {
        await targetDb.session.create({
          data: {
            id: session.id,
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
            createdAt: session.createdAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate session ${session.id}: ${error}`);
      }
    }

    // 3. 워크스페이스 데이터 마이그레이션
    const workspaces = await sourceDb.workspace.findMany();
    console.log(`Found ${workspaces.length} workspaces to migrate`);

    for (const workspace of workspaces) {
      try {
        await targetDb.workspace.create({
          data: {
            id: workspace.id,
            name: workspace.name,
            ownerId: workspace.ownerId,
            settings: workspace.settings,
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate workspace ${workspace.id}: ${error}`);
      }
    }

    // 4. 워크스페이스 멤버 데이터 마이그레이션
    const workspaceMembers = await sourceDb.workspaceMember.findMany();
    console.log(
      `Found ${workspaceMembers.length} workspace members to migrate`
    );

    for (const member of workspaceMembers) {
      try {
        await targetDb.workspaceMember.create({
          data: {
            id: member.id,
            workspaceId: member.workspaceId,
            userId: member.userId,
            role: member.role,
            joinedAt: member.joinedAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(
          `Failed to migrate workspace member ${member.id}: ${error}`
        );
      }
    }

    // 5. 페이지 데이터 마이그레이션
    const pages = await sourceDb.page.findMany();
    console.log(`Found ${pages.length} pages to migrate`);

    for (const page of pages) {
      try {
        await targetDb.page.create({
          data: {
            id: page.id,
            workspaceId: page.workspaceId,
            title: page.title,
            parentId: page.parentId,
            documentId: page.documentId,
            position: page.position,
            permissions: page.permissions,
            isPublic: page.isPublic,
            createdBy: page.createdBy,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate page ${page.id}: ${error}`);
      }
    }

    // 6. 문서 데이터 마이그레이션
    const documents = await sourceDb.document.findMany();
    console.log(`Found ${documents.length} documents to migrate`);

    for (const document of documents) {
      try {
        await targetDb.document.create({
          data: {
            id: document.id,
            state: document.state,
            version: document.version,
            lastModified: document.lastModified,
            sizeBytes: document.sizeBytes,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate document ${document.id}: ${error}`);
      }
    }

    // 7. 문서 히스토리 데이터 마이그레이션
    const documentHistory = await sourceDb.documentHistory.findMany();
    console.log(
      `Found ${documentHistory.length} document history records to migrate`
    );

    for (const history of documentHistory) {
      try {
        await targetDb.documentHistory.create({
          data: {
            id: history.id,
            documentId: history.documentId,
            state: history.state,
            version: history.version,
            createdAt: history.createdAt,
            createdBy: history.createdBy,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(
          `Failed to migrate document history ${history.id}: ${error}`
        );
      }
    }

    // 8. 댓글 데이터 마이그레이션
    const comments = await sourceDb.comment.findMany();
    console.log(`Found ${comments.length} comments to migrate`);

    for (const comment of comments) {
      try {
        await targetDb.comment.create({
          data: {
            id: comment.id,
            documentId: comment.documentId,
            parentId: comment.parentId,
            authorId: comment.authorId,
            content: comment.content,
            positionStart: comment.positionStart,
            positionEnd: comment.positionEnd,
            resolved: comment.resolved,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate comment ${comment.id}: ${error}`);
      }
    }

    // 9. 파일 업로드 데이터 마이그레이션
    const fileUploads = await sourceDb.fileUpload.findMany();
    console.log(`Found ${fileUploads.length} file uploads to migrate`);

    for (const fileUpload of fileUploads) {
      try {
        await targetDb.fileUpload.create({
          data: {
            id: fileUpload.id,
            name: fileUpload.name,
            size: fileUpload.size,
            type: fileUpload.type,
            url: fileUpload.url,
            uploadedBy: fileUpload.uploadedBy,
            createdAt: fileUpload.createdAt,
          },
        });
        recordsMigrated++;
      } catch (error) {
        errors.push(`Failed to migrate file upload ${fileUpload.id}: ${error}`);
      }
    }

    await sourceDb.$disconnect();
    await targetDb.$disconnect();

    console.log(`Migration completed. ${recordsMigrated} records migrated.`);

    return {
      success: errors.length === 0,
      message: `Migration completed. ${recordsMigrated} records migrated.`,
      recordsMigrated,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error}`,
      errors: [error.toString()],
    };
  }
}

/**
 * 마이그레이션 검증
 */
export async function validateMigration(): Promise<boolean> {
  try {
    const sourceDb = new PrismaClient({
      datasources: {
        db: {
          url: 'sqlite:./dev.db',
        },
      },
    });

    const targetDb = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
    });

    // 각 테이블의 레코드 수 비교
    // Compare counts for each model explicitly (avoid dynamic any indexing)
    const comparisons: Array<[string, number, number]> = [];

    const userSource = await sourceDb.user.count();
    const userTarget = await targetDb.user.count();
    comparisons.push(['user', userSource, userTarget]);

    const sessionSource = await sourceDb.session.count();
    const sessionTarget = await targetDb.session.count();
    comparisons.push(['session', sessionSource, sessionTarget]);

    const workspaceSource = await sourceDb.workspace.count();
    const workspaceTarget = await targetDb.workspace.count();
    comparisons.push(['workspace', workspaceSource, workspaceTarget]);

    const workspaceMemberSource = await sourceDb.workspaceMember.count();
    const workspaceMemberTarget = await targetDb.workspaceMember.count();
    comparisons.push([
      'workspaceMember',
      workspaceMemberSource,
      workspaceMemberTarget,
    ]);

    const pageSource = await sourceDb.page.count();
    const pageTarget = await targetDb.page.count();
    comparisons.push(['page', pageSource, pageTarget]);

    const documentSource = await sourceDb.document.count();
    const documentTarget = await targetDb.document.count();
    comparisons.push(['document', documentSource, documentTarget]);

    const documentHistorySource = await sourceDb.documentHistory.count();
    const documentHistoryTarget = await targetDb.documentHistory.count();
    comparisons.push([
      'documentHistory',
      documentHistorySource,
      documentHistoryTarget,
    ]);

    const commentSource = await sourceDb.comment.count();
    const commentTarget = await targetDb.comment.count();
    comparisons.push(['comment', commentSource, commentTarget]);

    const fileUploadSource = await sourceDb.fileUpload.count();
    const fileUploadTarget = await targetDb.fileUpload.count();
    comparisons.push(['fileUpload', fileUploadSource, fileUploadTarget]);

    for (const [tableName, sourceCount, targetCount] of comparisons) {
      if (sourceCount !== targetCount) {
        console.error(
          `Table ${tableName}: source has ${sourceCount} records, target has ${targetCount} records`
        );
        return false;
      }
    }

    await sourceDb.$disconnect();
    await targetDb.$disconnect();

    console.log('Migration validation passed');
    return true;
  } catch (error) {
    console.error('Migration validation failed:', error);
    return false;
  }
}

// CLI 실행을 위한 메인 함수
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'migrate') {
    migrateToPostgreSQL()
      .then(result => {
        console.log(result);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
      });
  } else if (command === 'validate') {
    validateMigration()
      .then(success => {
        console.log(success ? 'Validation passed' : 'Validation failed');
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node migrate-to-postgresql.js [migrate|validate]');
    process.exit(1);
  }
}
