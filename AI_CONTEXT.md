# CodeForge AI - Master Project Context

This is the single exhaustive context document for the CodeForge AI project. Another AI agent reading this file should know the entire project as if they built it themselves.

---

## 1. TEAM & HACKATHON CONTEXT
- **Team Name**: WinterIsComing
- **Members**: Sparsh Singh, Shashwat Rastogi, Sumit Singh, Sudiksha Singh
- **Event**: Tech4Hack Buildathon 2
- **Status**: Selected in Top 25 hackathon teams
- **Live URL**: `https://hackathon2-olive-eight.vercel.app`
- **GitHub Repo**: `https://github.com/sparsh101sparsh/hackathon2`
- **Local Directory**: `/Users/iamsparsh00321/Documents/antigravity/happy-carson`

---

## 2. FULL HISTORY OF WHAT WAS REQUESTED & BUILT (chronological)

### Request 1: Build the initial platform
- **What user asked**: Build an AI-powered LeetCode competitor with 600 DSA problems from open-source repos, Monaco Editor, Piston API code execution, AI features, company pages, contests, dashboard, admin panel, auth system
- **What was built**: Full CodeForge AI platform — Next.js 14 App Router + TypeScript + Tailwind CSS + Prisma SQLite + Framer Motion. Seeded 600+ real DSA problems scraped from `doocs/leetcode` GitHub. Real online judge via Judge0 CE Cloud API. FreeModel AI integration (gpt-5.4-mini + gpt-5.6-sol). Company pages for 8 companies. Contest system. Dashboard with Recharts. Admin portal.
- **Why these choices**: Next.js 14 chosen for Vercel compatibility (server + client in one project). SQLite + Prisma for simplicity (swappable to Postgres). Judge0 CE Cloud chosen over Piston because Piston had rate limits. FreeModel API chosen because it's free with OpenAI-compatible interface.

### Request 2: Add Email+Password Signup & Login
- **What user asked**: "i wanna built a working signup and login page in it through email login"
- **What was built**: Complete auth system using native Node.js crypto (pbkdf2Sync, sha512, 1000 iterations), HMAC-SHA256 JWT sessions in HTTP-only cookies, `/login` and `/register` pages with dark glassmorphism UI, navbar dynamic auth state (Sign In/Sign Up buttons when logged out, user avatar + dropdown when logged in), role-based access (USER / ADMIN), `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` endpoints
- **Why**: No external auth libraries (NextAuth removed) to keep the stack minimal and fully controllable. Native crypto for zero dependencies.

### Request 3: Update FreeModel API key
- **What user asked**: Replace old FreeModel API key with `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`
- **What was done**: Updated `.env` file and all references. New key: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`. Base URL: `https://api.freemodel.dev/v1`. Models: `gpt-5.4-mini` (fast, Socratic tutor, hints) and `gpt-5.6-sol` (complex reasoning, code review).

### Request 4: Add multiplayer Speed Battle Arena
- **What user asked**: "u can add your friends and compete in solving question whoever solves first and submits it gets a point and they all are ranked max limit 10 users ki hogi"
- **What was built**: Private Friend Speed Battle Arena system. Prisma models: `CustomRoom` (code, name, hostName, maxPlayers=10, difficulty, problemCount, status, problemIds JSON) and `RoomParticipant` (roomId, userId, userName, score, solved). API routes: `POST /api/rooms/create` (generates unique 6-char room code like `BATTLE-7892`), `POST /api/rooms/join`, `GET /api/rooms/[code]`. Frontend: Create Room modal with difficulty + question count picker, Join Room modal with code input, `/contests/room/[code]` live battle workspace with real-time leaderboard, speed bonus scoring (first to solve gets 100 base points + 50 speed bonus), 🥇 🥈 🥉 badges.
- **Why**: 6-digit codes chosen for easy human sharing. 10 player limit is hard-enforced in DB and API.

### Request 5: Create AI agent master prompt (.md)
- **What user asked**: Create a prompt in a .md file that can be fed to any other AI agent to rebuild the entire platform
- **What was built**: `CODEFORGE_AI_MASTER_PROMPT.md` — 313 lines, documented full tech stack, all 7 requirements (R1-R7), full Prisma schema, step-by-step implementation roadmap, code snippets for Prisma Vercel SQLite workaround, Judge0 execution engine, deployment commands.
- **Why**: To make the project reproducible by any AI coding agent (Cursor, Claude, GPT-4o, etc.) without starting from scratch.

### Request 6: Mobile app idea from presentation slides
- **What user asked**: "i want a mobile app for this too but m soch nai pa rha us mobile app m kya rkhu can u think abt it? like go through pppt101 (1).pdf this file as images for each page create an idea for an mobile app for this"
- **What was built**: `MOBILE_APP_MASTER_PROMPT.md` — 162 lines. Mobile companion app concept named **CodeForge Go**. Documents 6 mobile modules: (1) 5-Min DSA Micro-Drills (Duolingo-style swipeable flashcards), (2) Voice AI Mock Interviewer (speech-to-text, hands-free), (3) 1v1-10 Player Speed Battles (QR code join), (4) Pocket Socratic Tutor, (5) Mobile Symbol Keyboard (`{ } [ ] () => :`), (6) Home Screen Widgets. Tech stack: React Native (Expo SDK 51) OR Flutter 3.x. Full API endpoint mappings to `https://hackathon2-olive-eight.vercel.app/api`.
- **Why**: Presentation slides showed the hackathon vision for a mobile-first developer tool.

### Request 7: Add Spaced Repetition Revision Flashcards
- **What user asked**: "add something like flashcards for question that had been done for revision or any other revision for add tracker for revision"
- **What was built**:
  - New Prisma model `RevisionCard` with SM-2 spaced repetition fields: `interval` (days), `easeFactor` (2.5 default), `repetitions`, `dueDate`, `lastReviewedAt`, compound unique `[userId, problemId]`
  - Auto-creation: Every `Accepted` submission triggers upsert of RevisionCard in `/api/submissions/route.ts`
  - `/api/revision` GET (fetch due cards + stats) and POST (SM-2 interval calculation: Hard=1d, Good=3d, Easy=7d)
  - `/revision` page: 3D flip-card UI (front shows problem title, pattern pill, difficulty; back shows key takeaway, time/space complexity), self-rating buttons (🔴 Hard 1d, 🔵 Good 3d, 🟢 Easy 7d), progress stats (Due Today, Mastered, Total)
  - Navbar link with Brain icon
- **Why SM-2**: Industry-standard spaced repetition algorithm (used by Anki) proven to maximize long-term retention.

### Request 8: Reddit market research for hackathon features
- **What user asked**: "i want to win this hackathon topic given is basic we need to anything unique things in it surf the internet to find cool things to add that while doing dsa prep are necessary but platform like leetcode dont provide"
- **What was created**: `HACKATHON_WINNING_FEATURES.md` — 93 lines. Documented Reddit pain points from r/leetcode + r/cscareerquestions. Identified 7 killer features LeetCode lacks:
  1. 🙈 Blind Mode (redact difficulty to reduce anxiety)
  2. 🎨 Interactive Pointer/Recursion Visualizer
  3. 🎙️ Verbal Thought-Process Evaluator
  4. 📈 Empirical Big-O Profiler (plot actual runtime curves)
  5. 🎴 Spaced Repetition Deck (SM-2)
  6. 📝 Human Debugging Scratchpad
  7. ⚔️ 1v1-10 Player Speed Battle Arena
  Feature comparison matrix vs LeetCode/NeetCode/HackerRank.

### Request 9: Scrape ChaiCode visualizer pages
- **What user asked**: "go through https://dsa.chaicode.com go through each problem we gonna copy this website idea go through each problem extract that visualization page"
- **What was done**:
  - Crawled 830 pages from `https://dsa.chaicode.com` using Python `requests` + `BeautifulSoup`
  - Extracted 18 DSA pattern tracks: Two Pointers (9), Sliding Window (10), DP (19), DFS (25), BFS (11), Graphs (12), Backtracking (10), Stack (9), Linked List (10), Arrays/Hashing (9), Heap (7), Greedy (6), Bit Manipulation (6), Intervals (6), plus LLD (45), OS (39), CN (33)
  - Saved catalog to `CHAICODE_VISUALIZATION_CATALOG.json` (301KB)
  - Matched 75 of CodeForge AI's 600 problems directly to ChaiCode visualizer pages
  - Saved matches to `CHAICODE_MATCHED_VISUALIZERS.json` (14KB)
  - Created `CHAICODE_VISUALIZER_EXTRACTION_PLAN.md` — architecture blueprint

### Request 10: Build interactive Algorithm Step Visualizer
- **What user asked**: "add it to those question on our platform using the data of https://dsa.chaicode.com visualization data"
- **What was built**:
  - `components/problems/ProblemVisualizer.tsx` (376 lines): Interactive algorithm step visualizer with Play, Pause, Reset, Step-Forward, Step-Back controls. Animation speed selector (0.5x, 1.0x, 2.0x). Canvas rendering array cells with index markers `[0],[1],...` and dual pointer animations (`▲ L`, `▲ R`, `▲ i`, `▲ j`). Approach Leap selector (Brute Force $O(N^2)$ vs Optimized $O(N)$). Color-coded pointer types (cyan = Left, amber = Right, purple = i, emerald = j).
  - `public/data/visualizers.json`: JSON data dictionary mapping 75 problem IDs to visualizer configs (algorithm steps, pointer types, approach complexity)
  - Added `🎨 Visualizer` tab to problem workspace (`app/problems/[id]/page.tsx`) alongside Description, Editorial, AI Coach tabs
- **Why**: Direct canvas animation chosen over embedding ChaiCode iframes to avoid CORS and iframe-busting issues.

### Request 11: Create Visualizer Collection section on Problems page
- **What user asked**: "make a new section for these problems that have visualizer for it"
- **What was built**:
  - Featured 75 Visualizers hero banner on `/problems` page
  - `🎨 Visualized (75)` filter tab added to difficulty filter bar
  - `✨ Animated Visualizer` glowing pill badge on problem cards for all 75 visualizer problems
  - Client-side filtering using `public/data/visualizers.json` fetched on mount

### Request 12: This AI context document
- **What user asked**: "create a new .md file for an ai that when read knows that ai what this project is all about what have built every single thing in that should be documented"
- **What was built**: This file — `AI_CONTEXT.md`

---

## 3. FULL TECH STACK

| Component | Technology | Version/Details |
|---|---|---|
| Framework | Next.js | 14.2.35 (App Router) |
| Language | TypeScript | 5.6.3 (100% typed) |
| Styling | Tailwind CSS | 3.4.15 |
| UI Animations | Framer Motion | 11.11.17 |
| Icons | Lucide React | 0.460.0 |
| Code Editor | Monaco Editor | @monaco-editor/react 4.6.0 |
| Charts/Analytics | Recharts | 2.13.3 |
| Database | SQLite | via better-sqlite3 11.5.0 |
| ORM | Prisma | 5.22.0 |
| State Management | Zustand | 5.0.1 |
| Code Execution | Judge0 CE Cloud | `https://ce.judge0.com/submissions?wait=true` (no auth required) |
| AI Engine | FreeModel API | Base: `https://api.freemodel.dev/v1`, Key: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`, Models: `gpt-5.4-mini` (fast) + `gpt-5.6-sol` (reasoning) |
| Deployment | Vercel | Free tier, `npx vercel --prod --yes` |
| Node Runtime | Node.js | 24.x (as of Vercel build) |

---

## 4. COMPLETE PROJECT FILE STRUCTURE

List every single file in the project under these sections:

```
/Users/iamsparsh00321/Documents/antigravity/happy-carson/
├── AI_CONTEXT.md                          ← This file (AI context document)
├── CODEFORGE_AI_MASTER_PROMPT.md          ← AI agent prompt to rebuild the platform
├── MOBILE_APP_MASTER_PROMPT.md            ← Mobile companion app (CodeForge Go) spec
├── HACKATHON_WINNING_FEATURES.md          ← Reddit research: 7 killer features vs LeetCode
├── CHAICODE_VISUALIZATION_CATALOG.json    ← 830 scraped ChaiCode pages (301KB)
├── CHAICODE_MATCHED_VISUALIZERS.json      ← 75 matched visualizer configs (14KB)
├── CHAICODE_VISUALIZER_EXTRACTION_PLAN.md ← Architecture blueprint for visualizer integration
├── UNMATCHED_PROBLEMS.json                ← 525 problems without static visualizers
├── README.md                              ← GitHub README with setup instructions
├── PROJECT.md                             ← Project overview
├── ORIGINAL_REQUEST.md                    ← Original hackathon requirements
├── package.json                           ← npm scripts & dependencies
├── next.config.js                         ← Next.js config (outputFileTracingIncludes for SQLite)
├── tailwind.config.js                     ← Tailwind config
├── tsconfig.json                          ← TypeScript config
├── .env                                   ← Environment variables (not committed)
├── .env.example                           ← Example env file template
│
├── prisma/
│   ├── schema.prisma                      ← Full DB schema (14 models)
│   ├── dev.db                             ← SQLite database (5MB, 600+ problems seeded)
│   ├── seed.ts                            ← Prisma seed entry point
│   └── seedData/                          ← Seed data files
│
├── app/                                   ← Next.js App Router pages
│   ├── layout.tsx                         ← Root layout with Navbar + Footer + Toast
│   ├── page.tsx                           ← Landing page (home)
│   ├── globals.css                        ← Global styles
│   ├── login/page.tsx                     ← Email/password login page
│   ├── register/page.tsx                  ← Email/password signup page
│   ├── problems/
│   │   ├── page.tsx                       ← Problem list with filters + 75 Visualizer section
│   │   └── [id]/page.tsx                  ← Problem workspace (Monaco + 4 tabs + Visualizer)
│   ├── contests/
│   │   ├── page.tsx                       ← Contests list + Friend Battle Arena
│   │   ├── [id]/page.tsx                  ← Individual contest workspace
│   │   └── room/[code]/page.tsx           ← Live Speed Battle Room
│   ├── dashboard/page.tsx                 ← Analytics dashboard with Recharts
│   ├── leaderboard/page.tsx               ← Global leaderboard
│   ├── company/
│   │   ├── page.tsx                       ← Company archive (8 companies)
│   │   ├── [slug]/page.tsx                ← Company problem list
│   │   └── system-design/page.tsx         ← AI System Design evaluator
│   ├── mock-interview/page.tsx            ← AI Mock Interview simulator
│   ├── revision/page.tsx                  ← Spaced Repetition Flashcard Deck
│   ├── admin/
│   │   ├── page.tsx                       ← Admin dashboard
│   │   ├── problems/new/page.tsx          ← Create new problem
│   │   └── problems/[id]/edit/page.tsx    ← Edit existing problem
│   └── api/                               ← All API routes
│       ├── auth/
│       │   ├── signup/route.ts            ← POST: Register new user
│       │   ├── login/route.ts             ← POST: Authenticate + issue JWT
│       │   ├── me/route.ts                ← GET: Current user profile
│       │   └── logout/route.ts            ← POST: Clear session cookie
│       ├── problems/
│       │   ├── route.ts                   ← GET: Paginated problem list with filters
│       │   └── [id]/route.ts              ← GET: Single problem by slug or ID
│       ├── execute/route.ts               ← POST: Judge0 code execution
│       ├── submissions/route.ts           ← POST: Full submission + verdict + RevisionCard upsert
│       ├── revision/route.ts              ← GET: Due flashcards; POST: SM-2 rating update
│       ├── rooms/
│       │   ├── create/route.ts            ← POST: Create battle room with 6-char code
│       │   ├── join/route.ts              ← POST: Join room (10 player max)
│       │   └── [code]/route.ts            ← GET: Room state + participants
│       ├── contests/
│       │   ├── route.ts                   ← GET: Contest list
│       │   ├── [id]/route.ts              ← GET: Contest details
│       │   ├── [id]/register/route.ts     ← POST: Register for contest
│       │   └── [id]/leaderboard/route.ts  ← GET: Contest rankings
│       ├── company/
│       │   ├── route.ts                   ← GET: Company list
│       │   └── [slug]/route.ts            ← GET: Company problem archive
│       ├── dashboard/
│       │   ├── stats/route.ts             ← GET: User analytics stats
│       │   └── weekly-report/route.ts     ← GET: AI weekly progress report
│       ├── leaderboard/route.ts           ← GET: Global rankings
│       ├── ai/
│       │   ├── review/route.ts            ← POST: AI code review (gpt-5.6-sol)
│       │   ├── hints/route.ts             ← POST: 3-level progressive hints (gpt-5.4-mini)
│       │   ├── tutor/route.ts             ← POST: Interactive AI Chat Tutor
│       │   ├── mock-interview/route.ts    ← POST: Mock interview session
│       │   ├── system-design/route.ts     ← POST: System design evaluation
│       │   └── recommendations/route.ts   ← GET: AI daily problem recommendations
│       └── admin/
│           ├── stats/route.ts             ← GET: Admin platform stats
│           ├── problems/route.ts          ← GET/POST: Problem management
│           ├── problems/[id]/route.ts     ← PUT/DELETE: Problem CRUD
│           ├── users/route.ts             ← GET: User list
│           └── users/[id]/route.ts        ← GET/PATCH: User management
│
├── components/
│   ├── navbar/Navbar.tsx                  ← Global navbar with auth state + all nav links
│   ├── footer/Footer.tsx                  ← Footer component
│   ├── landing/
│   │   ├── HeroSection.tsx                ← Landing page hero
│   │   ├── CoreFeaturesGrid.tsx           ← Feature showcase grid
│   │   ├── FaqAndTestimonials.tsx         ← FAQ section
│   │   └── MonacoPreviewDemo.tsx          ← Monaco editor preview
│   ├── editor/
│   │   ├── CodeEditor.tsx                 ← Monaco Editor wrapper
│   │   └── EditorWorkspace.tsx            ← Full code workspace with run/submit
│   ├── problems/
│   │   └── ProblemVisualizer.tsx          ← Interactive Algorithm Step Visualizer
│   ├── ai/
│   │   ├── AIChatTutorDrawer.tsx          ← Sliding AI chat drawer
│   │   ├── AICodeReviewModal.tsx          ← AI code review modal
│   │   ├── ProgressiveHints.tsx           ← 3-level hint system UI
│   │   └── DailyRecommendationsWidget.tsx ← AI problem recommendations
│   ├── contests/
│   │   ├── CreateRoomModal.tsx            ← Create battle room modal
│   │   └── JoinRoomModal.tsx              ← Join battle room modal
│   ├── dashboard/
│   │   ├── ActivityCalendar.tsx           ← Submission streak calendar
│   │   ├── BadgesGrid.tsx                 ← Achievement badges
│   │   ├── RatingHistoryChart.tsx         ← Rating progression chart
│   │   ├── SolvedSummaryCards.tsx         ← Easy/Medium/Hard solved stats
│   │   ├── TopicRadarChart.tsx            ← Topic mastery radar chart
│   │   └── WeeklyAiInsights.tsx           ← AI weekly progress report
│   ├── providers/                         ← React context providers
│   └── ui/
│       ├── Skeletons.tsx                  ← Loading skeleton components
│       └── Toast.tsx                      ← Toast notification system
│
├── lib/
│   ├── prisma.ts                          ← Prisma client with Vercel /tmp SQLite workaround
│   ├── auth.ts                            ← JWT auth: signToken, verifyToken, getUserFromRequest
│   ├── piston.ts                          ← Judge0 CE execution engine + Python/JS harness wrappers
│   ├── freemodel.ts                       ← FreeModel AI API client (chat completions)
│   ├── rating.ts                          ← Codeforces-style Elo rating calculation
│   └── types.ts                           ← Shared TypeScript interfaces
│
├── public/
│   └── data/
│       └── visualizers.json               ← 75 problem visualizer configs
│
├── context/                               ← React Context providers
│
└── scripts/
    ├── seed-problems.ts                   ← Basic seed script
    ├── seed-real-problems.ts              ← 600+ real DSA problem seeder
    ├── generate-leetcode-dataset.ts       ← Fetches problems from doocs/leetcode GitHub
    ├── dataset-helpers.ts                 ← Problem data helpers
    ├── verify-db.ts                       ← DB integrity verification
    ├── verify-company-tags.ts             ← Company tag verification
    ├── verify-m1-empirical.cjs            ← Empirical Big-O test
    ├── empirical-challenger-test.ts       ← Challenge test suite
    ├── test-ai-features.ts                ← AI API test suite
    ├── test-auth-and-admin.ts             ← Auth/admin test suite
    ├── test-piston-execution.ts           ← Code execution test suite
    ├── test-dashboard-contests-company.ts ← Dashboard test suite
    ├── run-all-tests.ts                   ← Master E2E test runner
    ├── crawl_chaicode.py                  ← ChaiCode page crawler
    ├── fast_crawl_chaicode.py             ← Fast async ChaiCode crawler
    └── build_visualizer_data.py           ← Builds visualizers.json
```

---

## 5. COMPLETE PRISMA DATABASE SCHEMA

Document every model with every field, type, default, and relationship:

**Models:**
1. `User` — id (uuid), email (unique), name, passwordHash, role (USER/ADMIN), createdAt, updatedAt
2. `Problem` — id, slug (unique), title, statement, inputFormat, outputFormat, constraints, difficulty (EASY/MEDIUM/HARD), topicTags (JSON string), companyTags (JSON string), editorial, timeLimit (Float, default 1.0), memoryLimit (Int, default 256), createdAt. Relations: codeTemplates[], testCases[], submissions[], contestProblems[], companyProblems[], revisionCards[]
3. `CodeTemplate` — id, problemId (FK→Problem), language (python/cpp/javascript/java/go), code
4. `TestCase` — id, problemId (FK→Problem), input, expectedOutput, isSample (Boolean), explanation (optional)
5. `Submission` — id, userId (default "guest"), problemId (FK→Problem), code, language, status (Accepted/Wrong Answer/TLE/MLE/Runtime Error/Compilation Error), executionTime (Float), memory (Float), failedTestCase, createdAt
6. `Contest` — id, title, description, startTime, endTime, isRated (Boolean), status (UPCOMING/ACTIVE/ENDED), createdAt. Relations: contestProblems[], contestParticipants[], userRatings[]
7. `ContestProblem` — id, contestId (FK→Contest), problemId (FK→Problem), points (default 100), order
8. `ContestParticipant` — id, contestId, userId (default "guest"), name (default "Guest Coder"), score, finishTime, oldRating (1500), newRating (1500)
9. `UserRating` — id, userId, contestId (FK→Contest), rating, delta, timestamp
10. `UserProgress` — id, userId (unique, default "guest"), solvedEasy, solvedMedium, solvedHard, streak, lastActiveDate
11. `Company` — id, name (unique), logo, description, problemCount. Relations: companyProblems[]
12. `CompanyProblem` — id, companyId (FK→Company), problemId (FK→Problem), frequency (default 1)
13. `CustomRoom` — id, code (unique), name, hostName, maxPlayers (default 10), difficulty (EASY/MEDIUM/HARD/MIXED), problemCount (default 3), status (WAITING/IN_PROGRESS/FINISHED), problemIds (JSON string), createdAt. Relations: participants[]
14. `RoomParticipant` — id, roomId (FK→CustomRoom), userId, userName, score, solved, joinedAt. Compound unique: [roomId, userId]
15. `RevisionCard` — id, userId (default "guest"), problemId (FK→Problem), pattern (default "General DSA"), keyTakeaway, timeComplexity (default "O(N)"), spaceComplexity (default "O(1)"), interval (Int, default 1), easeFactor (Float, default 2.5), repetitions (default 0), dueDate (DateTime, default now()), lastReviewedAt (optional), createdAt. Compound unique: [userId, problemId]

---

## 6. ENVIRONMENT VARIABLES

```env
# .env file at /Users/iamsparsh00321/Documents/antigravity/happy-carson/.env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="codeforge-ai-super-secret-jwt-key-2026"
FREEMODEL_API_KEY="fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f"
FREEMODEL_BASE_URL="https://api.freemodel.dev/v1"
```

Key values:
- **FREEMODEL_API_KEY**: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f` (updated from original)
- **FREEMODEL_BASE_URL**: `https://api.freemodel.dev/v1`
- **AI Models available**: `gpt-5.4-mini` (fast, default for hints/tutor), `gpt-5.6-sol` (reasoning, for code review), `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.4`, `gpt-5.6-terra`
- **DATABASE_URL**: SQLite file path locally. On Vercel: auto-copied to `/tmp/codeforge.db`
- **JWT_SECRET**: Used for HMAC-SHA256 JWT signing

---

## 7. CRITICAL ARCHITECTURAL DECISIONS & WHY

Document every important technical decision:

1. **SQLite on Vercel**: Vercel's serverless filesystem is read-only. Solution: `lib/prisma.ts` detects `VERCEL=1` env var, copies `prisma/dev.db` → `/tmp/codeforge.db` on cold starts. The `/tmp` dir is writable on Vercel Lambda functions.

2. **Judge0 CE Cloud over Piston API**: Original spec used Piston but it had rate limiting issues and the Docker setup was complex. Judge0 CE Cloud at `https://ce.judge0.com/submissions?wait=true` is a free, no-auth-required REST API that executes Python (71), C++ (54), JavaScript Node.js (63), Java (62), Go (60). Supports sync mode with `?wait=true` for instant results.

3. **Python/JS Harness Wrappers**: LeetCode-style problems use `class Solution` with method signatures, not stdin/stdout. Judge0 only supports stdin. Solution: `lib/piston.ts` appends `PYTHON_SOLUTION_HARNESS` and `JS_SOLUTION_HARNESS` that use `sys.stdin`/`fs.readFileSync` to read test case input, parse it, call the `Solution` method via reflection, and print output as JSON.

4. **No NextAuth, native crypto**: Removed NextAuth for simplicity. Auth uses Node.js built-in `crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')` for password hashing. JWT uses HMAC-SHA256: `crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')`. Stored in HTTP-only cookies.

5. **topicTags and companyTags as JSON strings**: SQLite doesn't support arrays. Tags are stored as JSON strings like `"[\"Arrays\", \"Hash Table\"]"` and parsed with `JSON.parse()` in API responses. TypeScript receives them as `string[]` after parsing.

6. **SM-2 Algorithm for Spaced Repetition**: The SuperMemo SM-2 algorithm (same as Anki) schedules flashcard review intervals based on recall difficulty rating: Hard → interval=1 day, Good → interval=3 days, Easy → interval=7 days. `easeFactor` is adjusted ±0.15 to increase/decrease future intervals over time.

7. **ChaiCode Visualizer Strategy**: Could not use iframe embeds (ChaiCode blocks cross-origin embedding). Instead: crawled 830 pages to extract step-by-step algorithm data, built custom canvas animation component in `ProblemVisualizer.tsx` using Framer Motion, stores pointer positions per step as JSON in `public/data/visualizers.json`.

8. **6-character Room Codes**: Battle rooms use codes like `AB1234` (2 letters + 4 digits) to make them easy to share verbally or via chat. Codes are stored in `CustomRoom.code` with `@unique` constraint. Generated via: `Math.random().toString(36).substring(2, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000)`.

9. **Visualizer Filter on Client**: The `🎨 Visualized (75)` filter on `/problems` page fetches `public/data/visualizers.json` on mount (via `fetch('/data/visualizers.json')`) and stores it in component state. Filtering is done purely client-side (no API changes needed) by checking `visualizerMap[prob.id]`.

10. **Problem slugs vs IDs**: Problems are accessed via slug (e.g., `two-sum`) in URLs (`/problems/two-sum`) for SEO friendliness. The `/api/problems/[id]/route.ts` accepts both slug and UUID for flexibility.

---

## 8. COMPLETE GIT COMMIT HISTORY (chronological)

All 23 commits from newest to oldest:
1. `46f148c` feat: add 75 Animated Visualizer collection section and filter tab to Problems page
2. `b8b4daf` fix: type check topicTags prop as string | string[] in ProblemVisualizer
3. `f62b862` feat: add interactive Algorithm Step Visualizer tab to Problem Workspace using ChaiCode visualization data
4. `02e0c10` docs: extract 830 ChaiCode visualizer pages, map 75 problems to CodeForge AI, and add CHAICODE_VISUALIZER_EXTRACTION_PLAN.md
5. `437c9f3` docs: add HACKATHON_WINNING_FEATURES.md with Reddit research & 7 killer LeetCode gaps
6. `1ffe95d` feat: add Spaced Repetition DSA Revision Flashcard System & Revision Tracker
7. `4cfa11d` docs: add MOBILE_APP_MASTER_PROMPT.md for CodeForge Go mobile app replication
8. `b106af0` docs: add master AI agent prompt document CODEFORGE_AI_MASTER_PROMPT.md for full-stack platform replication
9. `9c7aa1e` feat: add Private Friend Battle Arena for 1v1 - 10 Players speed coding competitions
10. `5fd2aff` chore: update FreeModel API key
11. `02b9c56` feat: add working Email + Password Signup & Login authentication system
12. `9dea47a` feat: expand DSA problem dataset to 600+ real problems fetched from open-source LeetCode repos
13. `86cdd1f` fix: upgrade code execution engine to Judge0 CE cloud API
14. `e2b1b93` fix: remove fake leaderboard data, remove word seeded, calculate real stats from submissions
15. `61fcf9c` fix: move outputFileTracingIncludes into experimental for Next.js 14 compatibility
16. `3cbf159` fix: bundle SQLite DB in Vercel deployment — /tmp copy strategy
17. `815dd3e` feat: complete no-auth overhaul — 400 problems seeded, auth removed, all pages clean build
18. `e6a96a0` fix: remove fake testimonials, upgrade UI — Inter font, mesh gradient bg, clean FAQ+stats section
19. `43812c7` chore: add presentation file
20. `827c767` docs: update production deployment URLs in README
21. `7cc225d` fix: add prisma generate to npm build script for Vercel deployment
22. `4fb6b31` feat: complete production-ready CodeForge AI platform
23. `17dffba` Initial commit

---

## 9. ALL API ENDPOINTS (COMPLETE REFERENCE)

Document every single API endpoint with method, path, request body, response:

**AUTH**
- `POST /api/auth/signup` — Body: `{name, email, password}`. Creates user, returns JWT in cookie + user object.
- `POST /api/auth/login` — Body: `{email, password}`. Validates credentials, returns JWT in cookie + user object.
- `GET /api/auth/me` — Cookie auth required. Returns current user profile.
- `POST /api/auth/logout` — Clears `auth_token` cookie.

**PROBLEMS**
- `GET /api/problems` — Query params: `page`, `limit` (default 20), `search`, `difficulty`, `topic`. Returns paginated `{problems, total, totalPages}`.
- `GET /api/problems/[id]` — `[id]` can be slug or UUID. Returns full problem with testCases, codeTemplates.

**EXECUTION**
- `POST /api/execute` — Body: `{language, code, input}`. Calls Judge0 with stdin. Returns `{output, error, executionTime, verdict}`.
- `POST /api/submissions` — Body: `{problemId, language, code}`. Runs all test cases via Judge0. On Accepted: auto-upserts RevisionCard. Returns `{status, verdict, results[], revisionCardCreated}`.

**REVISION (Spaced Repetition)**
- `GET /api/revision` — Returns `{cards: RevisionCard[], stats: {dueToday, mastered, total}}`.
- `POST /api/revision` — Body: `{cardId, rating}` where rating is 'hard'|'good'|'easy'. Updates SM-2 interval. Returns updated card.

**BATTLE ROOMS**
- `POST /api/rooms/create` — Body: `{name, hostName, difficulty, problemCount}`. Creates room with unique 6-char code, selects random problems. Returns `{room}`.
- `POST /api/rooms/join` — Body: `{code, userId, userName}`. Joins room if < maxPlayers. Returns `{room, participant}`.
- `GET /api/rooms/[code]` — Returns full room state with participants and leaderboard.

**CONTESTS**
- `GET /api/contests` — Returns active/upcoming/past contests.
- `GET /api/contests/[id]` — Contest details with problems.
- `POST /api/contests/[id]/register` — Register for a contest.
- `GET /api/contests/[id]/leaderboard` — Contest rankings.

**COMPANY**
- `GET /api/company` — Returns list of 8 companies (Google, Amazon, Microsoft, Meta, Apple, Netflix, Uber, Flipkart).
- `GET /api/company/[slug]` — Company profile + tagged problems.

**DASHBOARD**
- `GET /api/dashboard/stats` — Returns `{solvedEasy, solvedMedium, solvedHard, rating, streak, recentSubmissions[], topicBreakdown}`.
- `GET /api/dashboard/weekly-report` — AI-generated weekly progress summary via FreeModel.

**LEADERBOARD**
- `GET /api/leaderboard` — Global user rankings by total problems solved and rating.

**AI**
- `POST /api/ai/review` — Body: `{code, language, problemTitle, problemStatement}`. Returns AI code review with complexity analysis (gpt-5.6-sol).
- `POST /api/ai/hints` — Body: `{level, problemTitle, problemStatement}`. Returns level 1/2/3 hint (gpt-5.4-mini).
- `POST /api/ai/tutor` — Body: `{message, problemContext}`. Returns streaming AI tutor response (gpt-5.4-mini).
- `POST /api/ai/mock-interview` — Body: `{action, sessionId, userResponse}`. Multi-turn interview session.
- `POST /api/ai/system-design` — Body: `{topic, design, requirements}`. Returns system design evaluation.
- `GET /api/ai/recommendations` — Returns 3 personalized daily problem recommendations.

**ADMIN**
- `GET /api/admin/stats` — Platform telemetry: total users, problems, submissions, acceptance rate.
- `GET /api/admin/problems` — All problems (paginated, no limit).
- `POST /api/admin/problems` — Create new problem with testCases and codeTemplates.
- `PUT /api/admin/problems/[id]` — Update problem metadata.
- `DELETE /api/admin/problems/[id]` — Delete problem and cascade.
- `GET /api/admin/users` — User list with roles.
- `PATCH /api/admin/users/[id]` — Update user role.

---

## 10. UNIQUE DIFFERENTIATORS vs LEETCODE

Features that don't exist anywhere else (LeetCode, HackerRank, NeetCode):

1. **🎴 Spaced Repetition Revision Deck (SM-2)** — BUILT & LIVE at `/revision`. Auto-creates flashcards on Accepted submissions. 3D flip-card UI with self-rating recall. First platform to offer this.

2. **⚔️ 1v1-10 Player Speed Battle Arena** — BUILT & LIVE at `/contests`. Create private rooms with 6-digit codes, invite up to 10 friends, first-to-solve speed bonus scoring (100+50pts), live leaderboard with 🥇🥈🥉.

3. **🎨 75 Animated Step Visualizers** — BUILT & LIVE on 75 problem pages. Custom canvas animations for Two Pointers, Sliding Window, DP, DFS, BFS, Graphs. Play/Pause/Step controls. Speed selector 0.5x-2x. Dual pointer visualization.

4. **3-Level Socratic AI Hints** — Level 1 (concept/intuition), Level 2 (algorithm/data structure), Level 3 (code skeleton). Never reveals full solution. Uses gpt-5.4-mini.

5. **AI Code Review on Submission** — Triggered automatically after every submission. Reports Time/Space complexity ($O(N)$, $O(N\log N)$), Code Quality Score 0-100, edge cases missed, refactored optimal code. Uses gpt-5.6-sol.

6. **AI Mock Interview Simulator** — Multi-turn FAANG-style technical interview at `/mock-interview`. AI asks probing follow-up questions, evaluates responses, generates hiring verdict (Hire/Strong Hire/No Hire) with rubric breakdown.

7. **AI System Design Evaluator** — `/company/system-design` page where users submit high-level architecture proposals (Rate Limiters, Distributed Cache, URL Shortener) and receive AI evaluation on scalability, bottlenecks, trade-offs.

---

## 11. DEPLOYMENT & INFRASTRUCTURE

**Production URL**: `https://hackathon2-olive-eight.vercel.app`
**GitHub**: `https://github.com/sparsh101sparsh/hackathon2` (public repo, branch: `main`)
**Vercel Project**: `sparsh5/hackathon2` (Vercel team: sparsh5)

**Deploy Command**:
```bash
git add -A
git commit -m "your message"
git push origin main
npx vercel --prod --yes
```

**Build Command** (in package.json):
```bash
prisma generate && next build
```

**Vercel SQLite Workaround** (critical — without this the DB won't work on Vercel):
```typescript
// lib/prisma.ts
// On Vercel, copy prisma/dev.db → /tmp/codeforge.db on cold start
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
if (isVercel) {
  fs.copyFileSync('prisma/dev.db', '/tmp/codeforge.db');
  process.env.DATABASE_URL = 'file:/tmp/codeforge.db';
}
```

**next.config.js** must include:
```js
// To bundle prisma/dev.db in the Vercel output
experimental: {
  outputFileTracingIncludes: {
    '/api/**': ['./prisma/*.db'],
  },
}
```

---

## 12. KNOWN LIMITATIONS & GOTCHAS

1. **Vercel SQLite is ephemeral**: Each Vercel cold start copies a fresh DB. Any writes (submissions, user signups) are LOST on next cold start. For production persistence, migrate to PostgreSQL (just change Prisma datasource provider).

2. **Judge0 CE Cloud rate limits**: The free `ce.judge0.com` endpoint has rate limits (~50-100 req/hr). For high traffic, use Judge0 CE self-hosted or Piston API fallback.

3. **topicTags JSON parsing**: In some components, `topicTags` arrives as a raw JSON string from the DB. Always parse: `const tags = typeof prob.topicTags === 'string' ? JSON.parse(prob.topicTags) : prob.topicTags;`.

4. **ProblemVisualizer topicTags prop**: Accepts `string | string[]` to handle both raw DB strings and parsed arrays from Next.js page state.

5. **Battle room state is in-memory-ish**: Room participant scores are persisted to SQLite, but real-time updates require polling (currently set at 3-second intervals). For true real-time, upgrade to WebSockets (Pusher/Ably).

6. **Admin routes are unprotected on Vercel**: The admin API routes check for `role === 'ADMIN'` via JWT, but since sessions are ephemeral on Vercel (no persistent DB), admin access in production requires manual DB seeding of an admin user.

---

## 13. HOW TO CONTINUE DEVELOPMENT

If you are an AI agent reading this and need to add features:

**Setup**:
```bash
git clone https://github.com/sparsh101sparsh/hackathon2.git
cd hackathon2
npm install
cp .env.example .env
# Edit .env: set FREEMODEL_API_KEY=fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f
npm run dev
```

**Database**:
```bash
npx prisma studio       # Visual DB browser
npx prisma db push      # Push schema changes
npx prisma generate     # Regenerate client after schema changes
```

**Add a new API route**: Create `app/api/your-route/route.ts`, export `GET` or `POST` async functions.

**Add a new page**: Create `app/your-page/page.tsx` with `'use client'` directive.

**Add a new Prisma model**: Edit `prisma/schema.prisma`, run `npx prisma db push && npx prisma generate`.

**Environment Variables**:
- `FREEMODEL_API_KEY`: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`
- `FREEMODEL_BASE_URL`: `https://api.freemodel.dev/v1`
- Use `gpt-5.4-mini` for fast/cheap ops, `gpt-5.6-sol` for reasoning

---

## 14. PLATFORM STATISTICS (as of last build)

| Metric | Value |
|---|---|
| Total DSA Problems | 600+ |
| Problems with Animated Visualizers | 75 |
| Problems without Visualizers | 525 |
| Supported Languages | 5 (Python, C++, JavaScript, Java, Go) |
| Company Archives | 8 (Google, Amazon, Microsoft, Meta, Apple, Netflix, Uber, Flipkart) |
| AI Features | 6 (Code Review, Hints, Tutor, Mock Interview, System Design, Recommendations) |
| Battle Room Max Players | 10 |
| Speed Bonus Points | 50 (on top of 100 base) |
| SM-2 Revision Intervals | 1d (Hard), 3d (Good), 7d (Easy) |
| ChaiCode Pages Scraped | 830 |
| DSA Pattern Tracks | 18 |
| Total API Routes | 35+ |
| Total Components | 25+ |
| Git Commits | 23 |
| Live Deployment | https://hackathon2-olive-eight.vercel.app |
