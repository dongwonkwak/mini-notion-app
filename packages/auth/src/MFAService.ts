/**
 * 다중 인증(MFA) 서비스
 * TOTP 기반 MFA 설정, 검증, 백업 코드 관리를 담당합니다.
 */
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

import { getPrisma, Prisma } from '@editor/database';
import type { MFASetup } from '@editor/types';
import { AuthError, AuthErrorCode } from '@editor/types';

export class MFAService {
  private readonly MFA_WINDOW = 2; // TOTP 시간 윈도우
  private readonly BACKUP_CODES_COUNT = 8;

  /**
   * MFA 설정 생성
   */
  async setupMFA(userId: string): Promise<MFASetup> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          '사용자를 찾을 수 없습니다.'
        );
      }

      // TOTP 시크릿 생성
      const secret = speakeasy.generateSecret({
        name: `Collaborative Editor (${user.email})`,
        issuer: 'Collaborative Editor',
        length: 32,
      });

      // QR 코드 생성
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // 백업 코드 생성
      const backupCodes = this.generateBackupCodes();

      // 데이터베이스에 MFA 시크릿 저장 (아직 활성화하지 않음)
      await getPrisma().user.update({
        where: { id: userId },
        data: {
          mfaSecret: secret.base32,
          mfaBackupCodes: backupCodes,
        },
      });

      return {
        secret: secret.base32!,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('MFA setup error:', error);
      throw new AuthError(
        AuthErrorCode.MFA_SETUP_FAILED,
        'MFA 설정에 실패했습니다.',
        error
      );
    }
  }

  /**
   * MFA 활성화
   */
  async enableMFA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.mfaSecret) {
        throw new AuthError(
          AuthErrorCode.MFA_SETUP_FAILED,
          'MFA 설정이 완료되지 않았습니다.'
        );
      }

      // TOTP 토큰 검증
      const isValid = this.verifyMFA(user.mfaSecret, token);
      if (!isValid) {
        throw new AuthError(
          AuthErrorCode.INVALID_MFA_TOKEN,
          'MFA 토큰이 올바르지 않습니다.'
        );
      }

      // MFA 활성화
      await getPrisma().user.update({
        where: { id: userId },
        data: { mfaEnabled: true },
      });

      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('MFA enable error:', error);
      throw new AuthError(
        AuthErrorCode.MFA_ENABLE_FAILED,
        'MFA 활성화에 실패했습니다.',
        error
      );
    }
  }

  /**
   * MFA 비활성화
   */
  async disableMFA(userId: string): Promise<boolean> {
    try {
      await getPrisma().user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaBackupCodes: Prisma.JsonNull,
        },
      });

      return true;
    } catch (error) {
      console.error('MFA disable error:', error);
      throw new AuthError(
        AuthErrorCode.MFA_DISABLE_FAILED,
        'MFA 비활성화에 실패했습니다.',
        error
      );
    }
  }

  /**
   * MFA 토큰 검증
   */
  verifyMFA(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: this.MFA_WINDOW,
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  /**
   * 백업 코드 검증
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: { mfaBackupCodes: true },
      });

      if (
        !user ||
        !user.mfaBackupCodes ||
        !Array.isArray(user.mfaBackupCodes)
      ) {
        return false;
      }

      // 백업 코드 목록에서 검색 (대소문자 무시)
      const normalizedCode = backupCode.toUpperCase();
      const codeIndex = user.mfaBackupCodes.findIndex(
        (code: any) =>
          typeof code === 'string' && code.toUpperCase() === normalizedCode
      );

      if (codeIndex === -1) {
        return false;
      }

      // 사용된 백업 코드 제거
      const updatedCodes = user.mfaBackupCodes.filter(
        (_: any, index: number) => index !== codeIndex
      );
      await getPrisma().user.update({
        where: { id: userId },
        data: { mfaBackupCodes: updatedCodes },
      });

      return true;
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  /**
   * 백업 코드 재생성
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.mfaEnabled) {
        throw new AuthError(
          AuthErrorCode.MFA_REQUIRED,
          'MFA가 활성화되지 않았습니다.'
        );
      }

      const newBackupCodes = this.generateBackupCodes();

      await getPrisma().user.update({
        where: { id: userId },
        data: { mfaBackupCodes: newBackupCodes },
      });

      return newBackupCodes;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('Backup codes regeneration error:', error);
      throw new AuthError(
        AuthErrorCode.MFA_SETUP_FAILED,
        '백업 코드 재생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * MFA 상태 확인
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    hasBackupCodes: boolean;
    backupCodesCount: number;
  }> {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: {
          mfaEnabled: true,
          mfaBackupCodes: true,
        },
      });

      if (!user) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          '사용자를 찾을 수 없습니다.'
        );
      }

      return {
        enabled: user.mfaEnabled,
        hasBackupCodes:
          !!user.mfaBackupCodes &&
          Array.isArray(user.mfaBackupCodes) &&
          user.mfaBackupCodes.length > 0,
        backupCodesCount: Array.isArray(user.mfaBackupCodes)
          ? user.mfaBackupCodes.length
          : 0,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('MFA status check error:', error);
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        'MFA 상태 확인에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 백업 코드 생성
   */
  private generateBackupCodes(): string[] {
    return Array.from({ length: this.BACKUP_CODES_COUNT }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }

  /**
   * 사용자 정보 조회
   */
  private async getUserById(id: string) {
    return getPrisma().user.findUnique({
      where: { id },
    });
  }

  /**
   * TOTP 시크릿 검증 (테스트용)
   */
  generateTestToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }
}
