/**
 * 보안 관리 API 엔드포인트
 * 관리자용 보안 통계 및 이벤트 조회
 */

import { AuthEventLogger } from '@editor/auth';
import { getPrisma } from '@editor/database';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

const prisma = getPrisma();
const eventLogger = new AuthEventLogger(prisma);

/**
 * 보안 통계 조회
 * 
 * @swagger
 * /api/admin/security:
 *   get:
 *     summary: Get security statistics
 *     description: Retrieve security statistics for admin dashboard
 *     tags:
 *       - Admin
 *       - Security
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in statistics
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID
 *     responses:
 *       200:
 *         description: Security statistics retrieved successfully
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
 *                     totalLogins:
 *                       type: integer
 *                       description: Total number of logins
 *                     uniqueIPs:
 *                       type: integer
 *                       description: Number of unique IP addresses
 *                     mfaSetupCount:
 *                       type: integer
 *                       description: Number of MFA setups
 *                     passwordResetCount:
 *                       type: integer
 *                       description: Number of password resets
 *                     suspiciousActivityCount:
 *                       type: integer
 *                       description: Number of suspicious activities
 *                     accountLockedCount:
 *                       type: integer
 *                       description: Number of account lockouts
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const userId = searchParams.get('userId') || undefined;

    const stats = await eventLogger.getSecurityStats(userId, days);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: unknown) {
    console.error('Security stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'SECURITY_STATS_FAILED',
        message: '보안 통계 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

/**
 * 보안 이벤트 조회
 * 
 * @swagger
 * /api/admin/security:
 *   post:
 *     summary: Get security events
 *     description: Retrieve security events with filtering options
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
 *               userId:
 *                 type: string
 *                 description: Filter by user ID
 *               type:
 *                 type: string
 *                 enum: [LOGIN, LOGOUT, MFA_SETUP, PASSWORD_RESET, ACCOUNT_LOCKED, SUSPICIOUS_ACTIVITY]
 *                 description: Filter by event type
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for filtering
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for filtering
 *               limit:
 *                 type: integer
 *                 default: 100
 *                 description: Maximum number of events to return
 *               offset:
 *                 type: integer
 *                 default: 0
 *                 description: Number of events to skip
 *     responses:
 *       200:
 *         description: Security events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [LOGIN, LOGOUT, MFA_SETUP, PASSWORD_RESET, ACCOUNT_LOCKED, SUSPICIOUS_ACTIVITY]
 *                       userId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       ip:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       metadata:
 *                         type: object
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
    const { userId, type, startDate, endDate, limit, offset } = body;

    const filter = {
      userId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit || 100,
      offset: offset || 0
    };

    const events = await eventLogger.getEvents(filter);

    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error: unknown) {
    console.error('Security events error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'SECURITY_EVENTS_FAILED',
        message: '보안 이벤트 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
