import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Role assignment: ADMIN if email contains admin domain or keyword (e.g., admin.com, admin@, etc.)
    const isAdminDomain =
      trimmedEmail.includes('admin') ||
      trimmedEmail.endsWith('@admin.com') ||
      trimmedEmail.endsWith('@codeforge.ai');
    const role = isAdminDomain ? 'ADMIN' : 'REGISTERED';

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        password: hashedPassword,
        role: role,
        rating: 1500,
        userProgress: {
          create: {
            solvedEasy: 0,
            solvedMedium: 0,
            solvedHard: 0,
            streak: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        rating: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Sign JWT token
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    // Return response with HTTP-only cookie
    const response = NextResponse.json(
      {
        user: newUser,
        token,
        message: 'Registration successful',
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
