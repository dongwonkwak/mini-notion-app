/**
 * JWT 토큰 관리 서비스
 * 토큰 생성, 검증, 갱신 등을 담당합니다.
 */
import jwt from 'jsonwebtoken';

import type { JWTPayload, StrictJWTPayload, UserRole } from '@editor/types';
import { AuthError, AuthErrorCode } from '@editor/types';

export class TokenService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN = '30d';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '90d';
  private readonly PASSWORD_RESET_EXPIRES_IN = '1h';

  constructor(jwtSecret?: string) {
    this.JWT_SECRET =
      jwtSecret || process.env.NEXTAUTH_SECRET || 'fallback-secret';
  }

  /**
   * JWT 토큰 생성
   */
  async generateJWT(payload: {
    userId: string;
    email: string;
    role: UserRole;
    workspaceId?: string;
  }): Promise<string> {
    try {
      return jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          workspaceId: payload.workspaceId,
        },
        this.JWT_SECRET,
        {
          expiresIn: this.JWT_EXPIRES_IN,
          issuer: 'collaborative-editor',
          audience: 'collaborative-editor-users',
        }
      );
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        'JWT 토큰 생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * JWT 토큰 검증 및 디코딩
   */
  async verifyJWT(token: string): Promise<StrictJWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'collaborative-editor',
        audience: 'collaborative-editor-users',
      }) as StrictJWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError(
          AuthErrorCode.EXPIRED_JWT,
          'JWT 토큰이 만료되었습니다.',
          { expiredAt: error.expiredAt }
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError(
          AuthErrorCode.INVALID_JWT,
          '유효하지 않은 JWT 토큰입니다.',
          error
        );
      }

      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        'JWT 토큰 검증에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 리프레시 토큰 생성
   */
  async generateRefreshToken(userId: string): Promise<string> {
    try {
      const payload = {
        userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      });
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        '리프레시 토큰 생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 리프레시 토큰 검증
   */
  async verifyRefreshToken(
    token: string
  ): Promise<{ userId: string; type: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: string;
        type: string;
        iat: number;
        exp: number;
      };

      if (decoded.type !== 'refresh') {
        throw new AuthError(
          AuthErrorCode.INVALID_REFRESH_TOKEN,
          '유효하지 않은 리프레시 토큰입니다.'
        );
      }

      return {
        userId: decoded.userId,
        type: decoded.type,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError(
          AuthErrorCode.EXPIRED_JWT,
          '리프레시 토큰이 만료되었습니다.',
          { expiredAt: error.expiredAt }
        );
      } else if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        '리프레시 토큰 검증에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 비밀번호 재설정 토큰 생성
   */
  async generatePasswordResetToken(
    userId: string,
    email: string
  ): Promise<string> {
    try {
      return jwt.sign(
        {
          userId,
          email,
          type: 'password-reset',
        },
        this.JWT_SECRET,
        {
          expiresIn: this.PASSWORD_RESET_EXPIRES_IN,
        }
      );
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.AUTHENTICATION_ERROR,
        '비밀번호 재설정 토큰 생성에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 비밀번호 재설정 토큰 검증
   */
  async verifyPasswordResetToken(
    token: string
  ): Promise<{ userId: string; email: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: string;
        type: string;
        iat: number;
        exp: number;
      };

      if (decoded.type !== 'password-reset') {
        throw new AuthError(
          AuthErrorCode.INVALID_RESET_TOKEN,
          '유효하지 않은 재설정 토큰입니다.'
        );
      }

      return {
        userId: decoded.userId,
        email: (decoded as any).email,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError(
          AuthErrorCode.EXPIRED_JWT,
          '재설정 토큰이 만료되었습니다.',
          { expiredAt: error.expiredAt }
        );
      } else if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.INVALID_RESET_TOKEN,
        '재설정 토큰 검증에 실패했습니다.',
        error
      );
    }
  }

  /**
   * 토큰에서 사용자 정보 추출 (검증 없이)
   */
  decodeJWT(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * 토큰 만료 시간 확인
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return true;

      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * 토큰 남은 시간 계산 (초 단위)
   */
  getTokenTimeRemaining(token: string): number {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return 0;

      const remaining = decoded.exp * 1000 - Date.now();
      return Math.max(0, Math.floor(remaining / 1000));
    } catch {
      return 0;
    }
  }
}
