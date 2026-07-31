# CodeForge

CodeForge is a full-stack coding practice workspace for learning data
structures and algorithms, running code, preparing for technical interviews,
and competing with friends. It combines a curated problem catalog, visual
algorithm walkthroughs, guided feedback, spaced revision, contests, and
private battle rooms in one focused developer workspace.

## Features

- Curated DSA problem catalog with search, difficulty, topic, and company filters.
- Monaco-based editor with five supported execution languages.
- Sample execution, custom input runs, persisted submissions, and verdict history.
- Guided code review, progressive hints, problem tutoring, recommendations, and weekly progress reports.
- Animated visualizers with synchronized commentary for 75 algorithm scenarios.
- Company preparation banks and system-design interview practice.
- Rated contests, private battle rooms, on-demand formats, and leaderboards.
- Spaced-repetition revision cards created from solved problems and failed attempts.
- Email verification registration, password sign-in, password reset, and optional Google sign-in.
- Admin tools for managing problems, users, and platform statistics.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Monaco Editor.
- **Backend:** Next.js route handlers, Prisma, PostgreSQL, signed HTTP-only sessions.
- **Execution:** Piston-compatible code execution service.
- **Guidance provider:** FreeModel-compatible chat completion service with ordered key failover and deterministic fallbacks.
- **Deployment:** Vercel-compatible Next.js deployment.

## Folder Structure

```text
app/                 Pages and route handlers
components/          Reusable interface and feature components
context/             Authentication context
hooks/               Client-side feature hooks
lib/                 Authentication, database, execution, provider, and domain utilities
prisma/              Schema, seed scripts, and canonical problem data
public/               Static visualizer metadata and public assets
scripts/              Verification, data maintenance, and operational scripts
```

## Installation

```bash
git clone <repository-url>
cd happy-carson
npm install
cp .env.example .env.local
```

Fill in the environment values below, then create or update the database:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

The local application runs at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `PRISMA_CONNECTION_LIMIT` | Recommended | Connection limit for serverless database clients. |
| `JWT_SECRET` | Yes | Secret used to sign session cookies and verification-code digests. |
| `APP_URL` | Production | Canonical application origin used by OAuth redirects. |
| `FREEMODEL_API_KEY` | Optional | Primary provider key. |
| `FREEMODEL_API_KEY_2` | Optional | First provider backup key. |
| `FREEMODEL_API_KEY_3` | Optional | Second provider backup key. |
| `FREEMODEL_BASE_URL` | Optional | Provider API base URL. |
| `RESEND_API_KEY` | Production | Transactional email delivery key. |
| `RESEND_FROM_EMAIL` | Production | Verified sender address for verification emails. |
| `GOOGLE_CLIENT_ID` | Optional | Google sign-in client identifier. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google sign-in client secret. |
| `GOOGLE_REDIRECT_URI` | Optional | Google callback URL. |

Never commit `.env`, `.env.local`, provider keys, database credentials, or OAuth
secrets. Use platform-managed secrets in deployed environments.

## Usage

1. Browse a problem or select a company preparation track.
2. Read the statement, write code in the editor, and run samples or custom input.
3. Submit a solution to record the verdict and update progress.
4. Use walkthroughs, hints, reviews, and the tutor to investigate difficult steps.
5. Revisit generated revision cards and join contests or private rooms for timed practice.

## Development

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run verify:quality
npm run test:health
npx tsx scripts/test-public-boundaries.ts
```

`npm run verify:quality` runs linting, type checking, the production build,
dependency auditing, catalog coverage checks, visualizer stress checks,
provider boundary checks, resilience checks, and rate-limit checks.

## Deployment

See [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md) for Vercel environment
configuration, database rollout, health verification, smoke tests, and rollback
guidance. Configure all production secrets in the deployment platform before
running a migration or exposing the application publicly.

## Performance

The application uses database-side counts for dashboard and leaderboard paths,
bounded catalog queries, abortable client requests, provider deadlines, ordered
provider failover, deterministic fallbacks, and route-level rate limits. A
shared rate-limit store and production-sized load test are still recommended
before multi-instance public traffic.

## Architecture Overview

The browser renders App Router pages and feature components. Client actions call
typed route handlers, which validate input, enforce session and rate-limit
boundaries, query Prisma, and call execution or guidance providers when needed.
Submission outcomes update progress and revision records. Visualizer metadata
and problem data are served from bounded catalog queries, while PostgreSQL is
the source of truth for users, submissions, contests, rooms, ratings, and
revision state.

## Contributing

Keep changes focused, preserve existing route contracts, add a regression test
for behavior changes, and run `npm run verify:quality` before opening a pull
request. Do not add credentials or generated artifacts to the repository.

## License

No license has been selected yet. Add a `LICENSE` file before publishing this
repository as an open-source project.
