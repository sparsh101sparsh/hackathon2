import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, purpose = 'SIGNUP', name, password } = body;

    if (typeof email !== 'string' || typeof code !== 'string') {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Must be exactly 6 digits
    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit verification code' }, { status: 400 });
    }

    const validPurposes = ['SIGNUP', 'LOGIN', 'RESET_PASSWORD'];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose specified' }, { status: 400 });
    }

    // Find valid active verification entry
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
        purpose,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    if (purpose === 'SIGNUP') {
      // Check if account already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        // Cleanup only SIGNUP verification codes for this email
        await prisma.emailVerification.deleteMany({ where: { email: cleanEmail, purpose: 'SIGNUP' } });
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in.' },
          { status: 409 }
        );
      }

      const finalName = (verification.name || name || cleanEmail.split('@')[0] || 'Coder').trim();

      // Require password — either from the verification record or from the request body
      const rawPassword = password || null;
      const passwordHash = verification.passwordHash || (rawPassword ? hashPassword(rawPassword) : null);

      if (!passwordHash) {
        return NextResponse.json(
          { error: 'Password is required to create your account. Please go back and set a password.' },
          { status: 400 }
        );
      }

      // Create new user and UserProgress transactionally — also delete verification code within the transaction
      const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name: finalName,
            email: cleanEmail,
            passwordHash,
            role: 'USER',
          },
        });

        await tx.userProgress.create({
          data: { userId: createdUser.id },
        });

        // Delete only SIGNUP codes for this email within the transaction
        await tx.emailVerification.deleteMany({ where: { email: cleanEmail, purpose: 'SIGNUP' } });

        return createdUser;
      });

      // Sign JWT session token
      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      return setSessionCookie(response, token);
    } else {
      // LOGIN flow via Verification Code
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email. Please sign up first.' },
          { status: 404 }
        );
      }

      // Delete only LOGIN codes for this email — don't touch SIGNUP or RESET_PASSWORD codes
      await prisma.emailVerification.deleteMany({ where: { email: cleanEmail, purpose: 'LOGIN' } });

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      return setSessionCookie(response, token);
    }
  } catch (error: any) {
    console.error('Error in /api/auth/verify-code:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
