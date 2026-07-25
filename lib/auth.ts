import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'codeforge-secret-key-super-secure';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string; // GUEST, REGISTERED, ADMIN
  rating?: number;
  avatar?: string | null;
}

/**
 * Hash a plain text password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password against a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token with the given user payload.
 */
export function signToken(payload: AuthUser): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode a JWT token. Returns null if invalid or expired.
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Extract and verify JWT token from Authorization header or HTTP-only cookie.
 */
export function getAuthUser(req: Request | NextRequest): AuthUser | null {
  try {
    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const user = verifyToken(token);
      if (user) return user;
    }

    // 2. Check NextRequest cookies helper if available
    if ('cookies' in req && typeof req.cookies?.get === 'function') {
      const tokenCookie = req.cookies.get('token');
      if (tokenCookie?.value) {
        const user = verifyToken(tokenCookie.value);
        if (user) return user;
      }
    }

    // 3. Fallback: Parse standard Cookie header string
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      if (cookies.token) {
        const user = verifyToken(cookies.token);
        if (user) return user;
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to parse a raw cookie header string.
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    const value = parts.join('=').trim();
    if (name) {
      list[name] = decodeURIComponent(value);
    }
  });
  return list;
}

/**
 * Route protection helper to enforce authenticated user.
 */
export function requireAuth(req: Request | NextRequest): AuthUser | null {
  const user = getAuthUser(req);
  return user;
}

/**
 * Route protection helper to enforce ADMIN role.
 */
export function requireAdmin(req: Request | NextRequest): AuthUser | null {
  const user = getAuthUser(req);
  if (user && user.role === 'ADMIN') {
    return user;
  }
  return null;
}
