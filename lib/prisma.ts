import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

/**
 * On Vercel (production), the project filesystem is read-only.
 * We copy the bundled SQLite database to /tmp (the only writable dir)
 * so that Prisma can open it with WAL mode (requires write access).
 * On each cold start, we get a fresh /tmp — re-copy if missing.
 */
function initDbUrl(): string {
  // Use DATABASE_URL from env if it points to a non-file datasource (Postgres, etc.)
  const envUrl = process.env.DATABASE_URL || ''
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl
  }

  // Vercel production: copy to /tmp for read-write access
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
  if (isVercel) {
    const tmpDbPath = '/tmp/codeforge.db'
    if (!fs.existsSync(tmpDbPath)) {
      // Try multiple possible locations for the bundled DB
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
      ]
      let copied = false
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath)
            console.log(`[DB] Copied bundled SQLite DB from ${src} to ${tmpDbPath}`)
            copied = true
            break
          } catch (err) {
            console.error(`[DB] Failed to copy from ${src}:`, err)
          }
        }
      }
      if (!copied) {
        console.warn('[DB] No bundled SQLite DB found — database queries will fail.')
      }
    }
    return `file:${tmpDbPath}`
  }

  // Local development: use DATABASE_URL or default
  return envUrl || 'file:./prisma/dev.db'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = initDbUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
