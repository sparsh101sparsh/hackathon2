/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure the SQLite database file is included in the Vercel serverless function bundle
    // so lib/prisma.ts can copy it to /tmp at cold start
    outputFileTracingIncludes: {
      '/api': ['./prisma/dev.db'],
    },
  },
}

module.exports = nextConfig
