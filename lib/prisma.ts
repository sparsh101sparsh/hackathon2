import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * On Vercel (production), the project filesystem is read-only.
 * We copy the bundled SQLite database to /tmp (the only writable dir)
 * so that Prisma can open it with WAL mode (requires write access).
 *
 * IMPORTANT: /tmp is ephemeral per-container. Data written in one Lambda
 * instance is NOT visible in another. For persistent auth, migrate to
 * PostgreSQL (e.g. Neon) and set DATABASE_URL to a postgresql:// URL.
 *
 * The code below handles the file:// case for local/SQLite usage.
 * If DATABASE_URL starts with "postgresql://" or "postgres://", it uses
 * that directly — no file copying needed.
 */
function initDbUrl(): string {
  const envUrl = process.env.DATABASE_URL || '';

  // Use non-SQLite datasource (Postgres, etc.) directly — no copying needed
  if (envUrl && !envUrl.startsWith('file:') && !envUrl.startsWith('sqlite:')) {
    return envUrl;
  }

  // Vercel production: copy to /tmp for read-write access
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  if (isVercel) {
    const tmpDbPath = '/tmp/codeforge.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
      ];
      let copied = false;
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            console.log(`[DB] Copied bundled SQLite DB from ${src} to ${tmpDbPath}`);
            copied = true;
            break;
          } catch (err) {
            console.error(`[DB] Failed to copy from ${src}:`, err);
          }
        }
      }
      if (!copied) {
        console.warn('[DB] No bundled SQLite DB found — database queries will fail.');
      }
    }
    return `file:${tmpDbPath}`;
  }

  // Local development: use DATABASE_URL or default
  return envUrl || 'file:./prisma/dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDbUrl(): string {
  const base = initDbUrl();
  // For PostgreSQL on serverless (Vercel), limit connections per function instance
  // to prevent "Too many clients" errors on Neon / PgBouncer connection pools.
  if (base.startsWith('postgresql://') || base.startsWith('postgres://')) {
    try {
      const url = new URL(base);
      // Only add if not already set
      if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', '1');
      }
      if (!url.searchParams.has('connect_timeout')) {
        url.searchParams.set('connect_timeout', '10');
      }
      return url.toString();
    } catch {
      return base;
    }
  }
  return base;
}

const dbUrl = buildDbUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always persist singleton on globalThis to prevent multiple instances
// across hot-reload (dev) AND across serverless warm containers (production).
globalForPrisma.prisma = prisma;

export default prisma;
