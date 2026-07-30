import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const VALID_PURPOSES = ['SIGNUP', 'LOGIN', 'RESET_PASSWORD'] as const;
type Purpose = typeof VALID_PURPOSES[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose = 'SIGNUP', name, password } = body;

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Strictly validate purpose
    if (!VALID_PURPOSES.includes(purpose as Purpose)) {
      return NextResponse.json({ error: 'Invalid purpose specified' }, { status: 400 });
    }

    const cleanPurpose = purpose as Purpose;
    const cleanName = typeof name === 'string' ? name.trim() : '';

    if (cleanPurpose === 'SIGNUP') {
      if (cleanName && (cleanName.length < 2 || cleanName.length > 80)) {
        return NextResponse.json({ error: 'Name must be between 2 and 80 characters' }, { status: 400 });
      }

      if (password && (password.length < 8 || password.length > 128)) {
        return NextResponse.json({ error: 'Password must be between 8 and 128 characters long' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
    } else if (cleanPurpose === 'LOGIN' || cleanPurpose === 'RESET_PASSWORD') {
      // Check if user exists for login or password reset
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'No account found with this email address. Please sign up first.' },
          { status: 404 }
        );
      }
    }

    // Generate 6-digit verification OTP code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const passwordHash = password ? hashPassword(password) : undefined;

    // Delete any pending codes for this email and purpose to prevent clutter
    await prisma.emailVerification.deleteMany({
      where: {
        email: cleanEmail,
        purpose: cleanPurpose,
      },
    });

    // Create new verification entry
    await prisma.emailVerification.create({
      data: {
        email: cleanEmail,
        code,
        purpose: cleanPurpose,
        name: cleanName || undefined,
        passwordHash: passwordHash || undefined,
        expiresAt,
      },
    });

    // Send email (or log to dev console)
    const emailResult = await sendVerificationEmail({
      email: cleanEmail,
      code,
      purpose: cleanPurpose,
      name: cleanName || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      expiresInSeconds: 600,
      // In development or when email is unavailable, expose the code so users can still test
      ...(process.env.NODE_ENV !== 'production' || emailResult.devCode
        ? { devCode: emailResult.devCode }
        : {}),
    });
  } catch (error: any) {
    console.error('Error in /api/auth/send-code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
