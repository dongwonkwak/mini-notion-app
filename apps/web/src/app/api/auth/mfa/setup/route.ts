/**
 * MFA 설정 API 엔드포인트
 * TOTP 기반 다중 인증 설정을 처리합니다.
 */

import { AuthService } from '@editor/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

const authService = new AuthService();

/**
 * MFA 설정 시작
 * 
 * @swagger
 * /api/auth/mfa/setup:
 *   post:
 *     summary: Setup MFA for user
 *     description: Generates TOTP secret and QR code for MFA setup
 *     tags:
 *       - Authentication
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Backup codes for account recovery
 *                       example: ["ABC12345", "DEF67890"]
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: MFA setup failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: '로그인이 필요합니다.'
        },
        { status: 401 }
      );
    }

    // 클라이언트 정보 추출
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const mfaSetup = await authService.setupMFA(session.user.id, ip, userAgent);

    return NextResponse.json({
      success: true,
      data: {
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes
      }
    });

  } catch (error: unknown) {
    console.error('MFA setup error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'MFA_SETUP_FAILED',
        message: (error as Error).message || 'MFA 설정 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

/**
 * MFA 활성화
 * 
 * @swagger
 * /api/auth/mfa/setup:
 *   put:
 *     summary: Enable MFA for user
 *     description: Verifies TOTP token and enables MFA for the user
 *     tags:
 *       - Authentication
 *       - MFA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP token from authenticator app
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: MFA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "MFA가 활성화되었습니다."
 *       400:
 *         description: Invalid MFA token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: '로그인이 필요합니다.'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'TOKEN_REQUIRED',
          message: 'MFA 토큰을 입력해주세요.'
        },
        { status: 400 }
      );
    }

    // 클라이언트 정보 추출
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await authService.enableMFA(session.user.id, token, ip, userAgent);

    return NextResponse.json({
      success: true,
      message: 'MFA가 활성화되었습니다.'
    });

  } catch (error: unknown) {
    console.error('MFA enable error:', error);

    if ((error as Error).message.includes('토큰이 올바르지 않습니다')) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_MFA_TOKEN',
          message: 'MFA 토큰이 올바르지 않습니다.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'MFA_ENABLE_FAILED',
        message: 'MFA 활성화 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}