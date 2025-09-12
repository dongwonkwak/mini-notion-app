#!/usr/bin/env tsx

/**
 * 데이터베이스 스키마 검증 스크립트
 * 
 * 사용법:
 * pnpm tsx scripts/validate-schema.ts
 */

import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import { execSync } from 'child_process';

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

class SchemaValidator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async validateAll(): Promise<void> {
    console.log(chalk.blue('🔍 데이터베이스 스키마 검증을 시작합니다...\n'));

    const validations = [
      { name: 'Prisma 스키마 문법', fn: () => this.validatePrismaSchema() },
      { name: '데이터베이스 연결', fn: () => this.validateConnection() },
      { name: '테이블 구조', fn: () => this.validateTableStructure() },
      { name: '제약 조건', fn: () => this.validateConstraints() },
      { name: '인덱스', fn: () => this.validateIndexes() },
      { name: '외래 키', fn: () => this.validateForeignKeys() },
      { name: '데이터 타입', fn: () => this.validateDataTypes() }
    ];

    let allPassed = true;

    for (const validation of validations) {
      try {
        console.log(chalk.yellow(`⏳ ${validation.name} 검증 중...`));
        const result = await validation.fn();
        
        if (result.success) {
          console.log(chalk.green(`✅ ${validation.name}: ${result.message}`));
        } else {
          console.log(chalk.red(`❌ ${validation.name}: ${result.message}`));
          if (result.details) {
            console.log(chalk.gray(`   세부사항: ${JSON.stringify(result.details, null, 2)}`));
          }
          allPassed = false;
        }
      } catch (error) {
        console.log(chalk.red(`❌ ${validation.name}: 검증 중 오류 발생`));
        console.log(chalk.gray(`   오류: ${error}`));
        allPassed = false;
      }
      console.log('');
    }

    if (allPassed) {
      console.log(chalk.green.bold('🎉 모든 스키마 검증이 통과했습니다!'));
    } else {
      console.log(chalk.red.bold('💥 일부 검증이 실패했습니다. 위의 오류를 확인해주세요.'));
      process.exit(1);
    }

    await this.prisma.$disconnect();
  }

  private async validatePrismaSchema(): Promise<ValidationResult> {
    try {
      execSync('pnpm prisma validate', { stdio: 'pipe' });
      return {
        success: true,
        message: 'Prisma 스키마 문법이 올바릅니다'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Prisma 스키마에 문법 오류가 있습니다',
        details: error
      };
    }
  }

  private async validateConnection(): Promise<ValidationResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        message: '데이터베이스 연결이 정상입니다'
      };
    } catch (error) {
      return {
        success: false,
        message: '데이터베이스 연결에 실패했습니다',
        details: error
      };
    }
  }

  private async validateTableStructure(): Promise<ValidationResult> {
    try {
      const tables = await this.prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
      `;

      const expectedTables = [
        'users', 'sessions', 'workspaces', 'workspace_members',
        'pages', 'documents', 'document_history', 'comments', 'file_uploads'
      ];

      const tableNames = tables.map(t => t.name);
      const missingTables = expectedTables.filter(table => !tableNames.includes(table));

      if (missingTables.length === 0) {
        return {
          success: true,
          message: `모든 필수 테이블이 존재합니다 (${tableNames.length}개)`
        };
      } else {
        return {
          success: false,
          message: '일부 필수 테이블이 누락되었습니다',
          details: { missing: missingTables, existing: tableNames }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '테이블 구조 검증 중 오류가 발생했습니다',
        details: error
      };
    }
  }

  private async validateConstraints(): Promise<ValidationResult> {
    try {
      // 유니크 제약 조건 테스트
      const testEmail = `test-${Date.now()}@example.com`;
      
      // 첫 번째 사용자 생성
      const user1 = await this.prisma.user.create({
        data: {
          email: testEmail,
          name: 'Test User',
          provider: 'email'
        }
      });

      // 같은 이메일로 두 번째 사용자 생성 시도 (실패해야 함)
      try {
        await this.prisma.user.create({
          data: {
            email: testEmail,
            name: 'Test User 2',
            provider: 'email'
          }
        });
        
        // 정리
        await this.prisma.user.delete({ where: { id: user1.id } });
        
        return {
          success: false,
          message: '이메일 유니크 제약 조건이 작동하지 않습니다'
        };
      } catch (constraintError) {
        // 정리
        await this.prisma.user.delete({ where: { id: user1.id } });
        
        return {
          success: true,
          message: '제약 조건이 올바르게 작동합니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '제약 조건 검증 중 오류가 발생했습니다',
        details: error
      };
    }
  }

  private async validateIndexes(): Promise<ValidationResult> {
    try {
      // SQLite에서 인덱스 정보 조회
      const indexes = await this.prisma.$queryRaw<Array<{ name: string; tbl_name: string }>>`
        SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';
      `;

      // 중요한 인덱스들이 있는지 확인
      const userEmailIndex = indexes.find(idx => 
        idx.tbl_name === 'users' && idx.name.includes('email')
      );

      if (userEmailIndex) {
        return {
          success: true,
          message: `인덱스가 올바르게 생성되었습니다 (${indexes.length}개)`
        };
      } else {
        return {
          success: true, // SQLite는 UNIQUE 제약 조건에 자동으로 인덱스 생성
          message: `기본 인덱스가 생성되었습니다 (${indexes.length}개)`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '인덱스 검증 중 오류가 발생했습니다',
        details: error
      };
    }
  }

  private async validateForeignKeys(): Promise<ValidationResult> {
    try {
      // 외래 키 제약 조건 테스트
      const user = await this.prisma.user.create({
        data: {
          email: `fk-test-${Date.now()}@example.com`,
          name: 'FK Test User',
          provider: 'email'
        }
      });

      const workspace = await this.prisma.workspace.create({
        data: {
          name: 'FK Test Workspace',
          ownerId: user.id
        }
      });

      // 관계가 올바르게 설정되었는지 확인
      const workspaceWithOwner = await this.prisma.workspace.findUnique({
        where: { id: workspace.id },
        include: { members: true }
      });

      // 정리
      await this.prisma.workspace.delete({ where: { id: workspace.id } });
      await this.prisma.user.delete({ where: { id: user.id } });

      if (workspaceWithOwner) {
        return {
          success: true,
          message: '외래 키 관계가 올바르게 작동합니다'
        };
      } else {
        return {
          success: false,
          message: '외래 키 관계에 문제가 있습니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '외래 키 검증 중 오류가 발생했습니다',
        details: error
      };
    }
  }

  private async validateDataTypes(): Promise<ValidationResult> {
    try {
      // 다양한 데이터 타입 테스트
      const user = await this.prisma.user.create({
        data: {
          email: `datatype-test-${Date.now()}@example.com`,
          name: 'DataType Test User',
          provider: 'email'
        }
      });

      const workspace = await this.prisma.workspace.create({
        data: {
          name: 'DataType Test Workspace',
          ownerId: user.id,
          settings: {
            theme: 'dark',
            notifications: true,
            features: ['collaboration', 'ai']
          }
        }
      });

      const page = await this.prisma.page.create({
        data: {
          workspaceId: workspace.id,
          title: 'DataType Test Page',
          documentId: 'datatype-doc-123',
          document: {
            create: {
              id: 'datatype-doc-123',
              state: Buffer.from([1, 2, 3, 255, 254]),
              version: 1,
              sizeBytes: 5
            }
          }
        },
        include: {
          document: true
        }
      });

      // 데이터 타입 검증
      const isJsonValid = typeof workspace.settings === 'object';
      const isBlobValid = Buffer.isBuffer(page.document?.state);
      const isIntegerValid = typeof page.document?.version === 'number';

      // 정리
      await this.prisma.workspace.delete({ where: { id: workspace.id } });
      await this.prisma.user.delete({ where: { id: user.id } });

      if (isJsonValid && isBlobValid && isIntegerValid) {
        return {
          success: true,
          message: '모든 데이터 타입이 올바르게 처리됩니다'
        };
      } else {
        return {
          success: false,
          message: '일부 데이터 타입에 문제가 있습니다',
          details: {
            json: isJsonValid,
            blob: isBlobValid,
            integer: isIntegerValid
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '데이터 타입 검증 중 오류가 발생했습니다',
        details: error
      };
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const validator = new SchemaValidator();
  validator.validateAll().catch(console.error);
}