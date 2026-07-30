import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: 'New password must be between 8 and 128 characters long' },
        { status: 400 }
      );
    }

    // Verify active RESET_PASSWORD OTP entry
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
        purpose: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset code. Please request a new code.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Hash new password and update user record
    const passwordHash = hashPassword(newPassword);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Cleanup used RESET_PASSWORD verification codes only
    await prisma.emailVerification.deleteMany({ where: { email: cleanEmail, purpose: 'RESET_PASSWORD' } });

    // Issue JWT session cookie
    const token = signToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

    return setSessionCookie(response, token);
  } catch (error: any) {
    console.error('Error in /api/auth/reset-password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
