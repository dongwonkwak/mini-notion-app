/**
 * 보안 로그 정리 API 엔드포인트
 * 오래된 보안 로그를 정리합니다.
 */

import { AuthEventLogger } from '@editor/auth';
import { getPrisma } from '@editor/database';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

const prisma = getPrisma();
const eventLogger = new AuthEventLogger(prisma);

/**
 * 오래된 보안 로그 정리
 * 
 * @swagger
 * /api/admin/security/cleanup:
 *   post:
 *     summary: Clean up old security logs
 *     description: Remove security logs older than specified days
 *     tags:
 *       - Admin
 *       - Security
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysToKeep:
 *                 type: integer
 *                 default: 90
 *                 description: Number of days to keep logs
 *     responses:
 *       200:
 *         description: Log cleanup completed successfully
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
 *                     deletedCount:
 *                       type: integer
 *                       description: Number of logs deleted
 *                     daysToKeep:
 *                       type: integer
 *                       description: Number of days logs were kept
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
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

    // TODO: 관리자 권한 확인 로직 추가
    // const isAdmin = await checkAdminPermission(session.user.id);
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'ADMIN_ACCESS_REQUIRED',
    //       message: '관리자 권한이 필요합니다.'
    //     },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { daysToKeep = 90 } = body;

    // 최소 30일, 최대 365일로 제한
    const validDaysToKeep = Math.max(30, Math.min(365, daysToKeep));

    const deletedCount = await eventLogger.cleanupOldLogs(validDaysToKeep);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        daysToKeep: validDaysToKeep
      }
    });

  } catch (error: unknown) {
    console.error('Log cleanup error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'LOG_CLEANUP_FAILED',
        message: '로그 정리 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
