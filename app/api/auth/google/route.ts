import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Always use the fixed production redirect URI from env if set,
// otherwise compute from request headers
function getCallbackUrl(req: NextRequest): string {
  // In production, always use the explicitly configured GOOGLE_REDIRECT_URI
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.startsWith('https://')) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}/api/auth/google/callback`;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url));
  }

  // Generate a secure state value
  const state = crypto.randomBytes(24).toString('hex');
  const callbackUrl = getCallbackUrl(req);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  // Set state cookie - use SameSite=None; Secure to ensure it's sent
  // even in cross-site redirect scenarios on Vercel's edge network
  response.cookies.set('codeforge_google_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // Changed from 'lax' to 'none' to ensure cross-site sends
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  return response;
}
