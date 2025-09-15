/**
 * 회원가입 API 엔드포인트
 * 이메일/비밀번호 기반 사용자 등록을 처리합니다.
 */
import { NextRequest, NextResponse } from 'next/server';

import { AuthService } from '@editor/auth';
import type { CreateUserData } from '@editor/types';

const authService = new AuthService();

/**
 * 사용자 회원가입
 *
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Creates a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password (minimum 8 characters)
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "회원가입이 완료되었습니다."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // 클라이언트 정보 추출 (현재 사용되지 않지만 향후 로깅에 사용 예정)
    // const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    // const userAgent = request.headers.get('user-agent') || 'unknown';

    // 입력 데이터 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'EMAIL_NAME_PASSWORD_REQUIRED',
          message: '이메일, 이름, 비밀번호를 모두 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_EMAIL_FORMAT',
          message: '올바른 이메일 형식을 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'PASSWORD_TOO_SHORT',
          message: '비밀번호는 최소 8자 이상이어야 합니다.',
        },
        { status: 400 }
      );
    }

    // 사용자 생성
    const userData: CreateUserData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password,
      provider: 'email',
    };

    const user = await authService.createUser(userData);

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);

    // 이메일 중복 오류 처리
    if ((error as Error).message.includes('이미 존재하는 이메일')) {
      return NextResponse.json(
        {
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: '이미 사용 중인 이메일입니다.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'SIGNUP_FAILED',
        message: '회원가입 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
