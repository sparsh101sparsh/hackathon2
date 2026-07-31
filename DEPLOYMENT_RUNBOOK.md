# Production Deployment Runbook

This project runs as a Next.js App Router application on Vercel with a
managed PostgreSQL database. The repository does not contain a production
deployment token, database credentials, or provider secrets, so this runbook
documents the operator-controlled steps without claiming that a deployment
has occurred.

## 1. Prepare Production Services

Create these services before deploying:

- A pooled PostgreSQL database with automated backups and a separate staging
  database.
- A transactional email sender/domain for OTP delivery.
- FreeModel credentials, preferably with backup keys configured.
- A Judge0 execution endpoint or an approved execution provider.
- Shared rate-limit storage such as Redis or Upstash before public traffic.

Use a separate database for preview/staging deployments. Never point preview
builds at the production database.

## 2. Configure Vercel Environment Variables

Set these variables for **Production**, and set staging equivalents for
Preview/Development:

```text
DATABASE_URL=postgresql://...pooled...
JWT_SECRET=<long-random-secret>
APP_URL=https://<production-domain>
NEXT_PUBLIC_APP_URL=https://<production-domain>
FREEMODEL_API_KEY=<primary-key>
FREEMODEL_API_KEY_2=<backup-key>
FREEMODEL_API_KEY_3=<optional-third-key>
FREEMODEL_BASE_URL=https://api.freemodel.dev/v1
RESEND_API_KEY=<sender-key>
RESEND_FROM_EMAIL=CodeForge <auth@yourdomain.com>
GOOGLE_CLIENT_ID=<optional-client-id>
GOOGLE_CLIENT_SECRET=<optional-client-secret>
GOOGLE_REDIRECT_URI=https://<production-domain>/api/auth/google/callback
```

Email OTP requires a Resend API key and a sender address on a Resend-verified
domain. Do not use `onboarding@resend.dev` or `auth@yourdomain.com` in
production. Before promoting, validate the secret shape and send a real
operator-owned smoke email:

```bash
npm run verify:email
VERIFY_EMAIL_TO=operator@example.com npm run verify:email
```

For the linked Vercel project, add the two production secrets with:

```bash
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env ls production
```

The `vercel env ls production` output must include both `RESEND_API_KEY` and
`RESEND_FROM_EMAIL` before deploying or redeploying production.

Generate a session secret outside the repository, for example:

```bash
openssl rand -base64 48
```

Rotate any credential that has appeared in local files, screenshots, logs, or
chat history. Do not commit `.env`, `.env.local`, or generated provider keys.

## 3. Apply the Database Schema Safely

The current repository has no Prisma migration history. Do not use
`prisma db push` against an existing production database as a release step.

1. Back up production and restore a copy into staging.
2. Review the current schema against `prisma/schema.prisma` and create a
   reviewed baseline migration for the existing database.
3. Apply the baseline/index changes to staging first with `npx prisma migrate
   deploy`.
4. Run the catalog, company-tag, and forensic checks against staging.
5. Resolve the baseline as applied only after the existing production schema
   is confirmed to match; then use reviewed migrations for every later change.
6. Run `npx prisma generate` during the build and keep the runtime connection
   URL pooled with a low `PRISMA_CONNECTION_LIMIT`.

The new `ContestParticipant` uniqueness invariant and the targeted indexes are
not proven in production until this migration rollout is completed.

## 4. Deploy

From an authenticated operator machine:

```bash
npm ci
npm run verify:quality
npx prisma migrate deploy
npx prisma generate
vercel link
vercel deploy --prod
```

The GitHub Actions quality gate at `.github/workflows/quality.yml` runs on
pushes and pull requests. A green local build is necessary but does not prove
that Vercel secrets, database connectivity, email delivery, or provider
quotas are configured.

## 5. Verify the Deployment

Replace the host with the production domain:

```bash
curl -i https://<production-domain>/api/health
curl -i https://<production-domain>/api/problems?page=1\&limit=3
curl -i https://<production-domain>/api/company
```

`/api/health` must return HTTP `200`, `status: "ok"`, database status `"ok"`,
and email verification status `"configured"` in production. It deliberately
disables caching and never returns connection strings, provider keys, sender
addresses, or provider error details.

Then manually verify register OTP, login OTP, password reset OTP, Google OAuth
(if enabled), code execution, a deterministic fallback, contest
registration/submission, and room join/leave in staging before production.

## 6. Rollback

If the health probe or smoke tests fail:

1. Stop promotion and inspect Vercel function logs without exposing secrets.
2. Roll back to the previous Vercel deployment.
3. Do not roll back application code across an already-applied destructive
   database migration; use a forward-compatible database fix.
4. Re-run `/api/health` and the smoke checklist before reopening traffic.

## Current Readiness Boundary

The application build and deterministic quality gate pass locally. Production
readiness is still conditional on secret rotation, migration/baseline rollout,
shared rate limits, backups, provider quotas, email sender verification, and
browser-level accessibility verification.
