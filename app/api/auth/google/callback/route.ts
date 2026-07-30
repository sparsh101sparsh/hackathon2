import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function callbackUrl(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  if (host) {
    return `${proto}://${host}/api/auth/google/callback`;
  }
  return process.env.GOOGLE_REDIRECT_URI || `${new URL(req.url).origin}/api/auth/google/callback`;
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const savedState = req.cookies.get('codeforge_google_state')?.value;
  const failure = (reason: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, req.url));

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return failure('google_not_configured');
  if (!code || !state || !savedState || state.length !== savedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
    return failure('google_invalid_state');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl(req),
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) return failure('google_token_exchange_failed');
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) return failure('google_missing_access_token');

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) return failure('google_profile_failed');
    const profile = await profileResponse.json() as { sub?: string; email?: string; name?: string; email_verified?: boolean };
    if (!profile.sub || !profile.email || profile.email_verified === false) return failure('google_email_not_verified');

    const email = profile.email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (!user) {
      const existing = await prisma.user.findUnique({ where: { email } });
      user = existing
        ? await prisma.user.update({ where: { id: existing.id }, data: { googleId: profile.sub } })
        : await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
              data: {
                email,
                name: (profile.name || email.split('@')[0]).slice(0, 80),
                googleId: profile.sub,
                passwordHash: hashPassword(crypto.randomUUID()),
                role: 'USER',
              },
            });
            await tx.userProgress.create({ data: { userId: created.id } });
            return created;
          });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.delete('codeforge_google_state');
    return setSessionCookie(response, token);
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    return failure('google_login_failed');
  }
}
