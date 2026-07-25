/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the SQLite database file is included in the Vercel output bundle
  outputFileTracingIncludes: {
    '/api/**': ['./prisma/dev.db'],
    '/problems/**': ['./prisma/dev.db'],
    '/dashboard': ['./prisma/dev.db'],
    '/leaderboard': ['./prisma/dev.db'],
    '/contests/**': ['./prisma/dev.db'],
    '/company/**': ['./prisma/dev.db'],
  },
}

module.exports = nextConfig
