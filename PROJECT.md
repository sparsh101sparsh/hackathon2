# CodeForge AI — Project Architecture & Master Plan

## Project Overview
CodeForge AI is a production-ready, AI-powered competitive coding and DSA practice platform (LeetCode + CodeChef + AI Coaching).

## Architecture & Stack
- **Framework**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Database & ORM**: SQLite (via Prisma ORM) for development/build compatibility, PostgreSQL compatible schema
- **Code Execution**: Piston API (https://emkc.org/api/v2/piston/execute)
- **AI Engine**: FreeModel API (OpenAI compatible, base URL: `https://api.freemodel.dev/v1`, Key: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`)
  - Fast ops (hints, quick tutor chat): `gpt-5.4-mini`
  - Complex ops (code review, mock interview eval, system design eval): `gpt-5.6-sol`
- **Auth**: Custom JWT / NextAuth with Email & Password (Guest, Registered User, Admin roles)
- **UI & Visualization**: Monaco Editor (`@monaco-editor/react`), Recharts, Framer Motion, Tailwind CSS with Glassmorphism & Dark Mode default
- **State Management**: Zustand / React Context

## Code Layout
```
/
├── app/                      # Next.js App Router routes & API endpoints
│   ├── api/                  # Backend REST API routes
│   │   ├── auth/             # Signup, login, session API
│   │   ├── execute/          # Piston API code execution bridge
│   │   ├── problems/         # Problem set list & detail API
│   │   ├── submissions/      # Submission & history API
│   │   ├── ai/               # Code review, hints, chat tutor, recommendations, mock interview, system design
│   │   ├── dashboard/        # Stats, progress, streak, radar chart data
│   │   ├── contests/         # Contests & real-time leaderboard API
│   │   ├── admin/            # Problem CRUD management API
│   │   └── company/          # Company curated lists API
│   ├── (auth)/               # Login & Register pages
│   ├── dashboard/            # Personal stats dashboard page
│   ├── problems/             # Problem list page
│   ├── problem/[id]/         # Monaco editor & problem solving interface
│   ├── contests/             # Rated contest list & contest detail page
│   ├── company/              # Company interview prep & system design pages
│   ├── mock-interview/       # AI Mock Interview page
│   ├── admin/                # Admin Panel for problem management
│   ├── layout.tsx            # Global layout with ThemeProvider & Navigation
│   └── page.tsx              # Landing page (Hero, features, CTA)
├── components/               # React UI components
│   ├── ui/                   # Buttons, Modals, Cards, Glass Panels, Badges
│   ├── editor/               # Monaco Editor wrapper with language switcher, theme, custom test inputs
│   ├── ai/                   # AI Code Review panel, 3-Level Hints modal, AI Chat Tutor drawer
│   ├── dashboard/            # Recharts radar chart, rating graph, streak calendar, weekly report widget
│   └── navbar/               # Glassmorphism Navigation bar & footer
├── lib/                      # Utilities & Service Modules
│   ├── prisma.ts             # Prisma client instance
│   ├── piston.ts             # Piston API execution helper
│   ├── freemodel.ts          # FreeModel AI client helper
│   ├── auth.ts               # JWT signing & verification utilities
│   ├── rating.ts             # Codeforces-style rating calculation algorithm
│   └── types.ts              # Global TypeScript definitions
├── prisma/                   # Prisma schema & seed scripts
│   ├── schema.prisma         # Database models (User, Problem, TestCase, Submission, Contest, Rating, etc.)
│   └── seed.ts               # Seed script for 50 real DSA problems with full metadata & test cases
├── public/                   # Static assets & icons
├── README.md                 # Complete setup, architecture, and environment variable documentation
└── package.json
```

## Milestones

| # | Milestone Name | Scope & Deliverables | Status |
|---|----------------|----------------------|--------|
| M1 | Infrastructure & Seed Data | Next.js 14 setup, Tailwind, Prisma schema, seed script for 52 real DSA problems | DONE |
| M2 | Code Execution Engine & Editor Page | Piston API client, Monaco Editor component, custom input runner, submission verdicts | DONE |
| M3 | Auth, User Roles & Admin Panel | Email/Password JWT auth, Guest/User/Admin permissions, Admin CRUD panel for problems | DONE |
| M4 | AI Engine & Features | FreeModel API integration (Review, 3-level hints, Chat Tutor, Recs, Mock Interview, System Design) | DONE |
| M5 | Dashboards, Contests & Company Prep | Recharts dashboard (radar, rating graph, streak), 8 company prep pages, rated contest system | DONE |
| M6 | UI Hardening & Premium Styling | Glassmorphism design, Framer Motion animations, dark mode polish across all pages | DONE |
| M7 | Testing, GitHub & Vercel Deploy | Unit/E2E test pass, git init, GitHub repo `hackathon2` creation & push, Vercel deployment | IN_PROGRESS |

## Interface Contracts
### Piston API Integration
- `POST /api/execute`: Accepts `{ language: string, code: string, stdin?: string }`.
- Returns `{ verdict: 'Accepted' | 'Wrong Answer' | 'TLE' | 'MLE' | 'Runtime Error' | 'Compilation Error', output: string, executionTime: number, memory: number, testResults?: Array<{ passed: boolean, input: string, expected: string, actual: string }> }`.

### FreeModel AI API Integration
- Base URL: `https://api.freemodel.dev/v1`
- Authorization Header: `Bearer fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`
- Models: `gpt-5.4-mini` (fast/hints/chat), `gpt-5.6-sol` (complex reviews/mock interviews/system design eval).
