# 🚀 CODEFORGE AI — MASTER AGENT PROMPT

> **How to Use This Prompt**: Copy and paste this complete document into any AI Coding Agent (Cursor, Claude 3.5 Sonnet, GPT-4o, Gemini, DeepSeek, AGY) to build or replicate **CodeForge AI** — a production-ready, full-stack, AI-powered competitive coding and DSA platform inspired by LeetCode + CodeChef + AI Coaching + Private Friend Battles.

---

## 🎯 PROJECT OVERVIEW & AUDIENCE
Build **CodeForge AI** — a high-performance, visually stunning platform that helps software engineers practice Data Structures & Algorithms (DSA), execute code across 5 languages, compete in weekly rated contests and private friend speed battles, and receive instant AI coaching for technical interview preparation.

* **Target Stack**: 100% Free & Open-Source Infrastructure.
* **Integrations**: Zero mandatory paid APIs. Uses Judge0 CE Cloud / Piston API for execution, FreeModel API for AI, SQLite + Prisma for database, and Next.js 14 App Router for deployment.

---

## 🛠️ ARCHITECTURE & 100% FREE TECH STACK

| Component | Selected Technology | Specification & Free Tier Endpoint |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | React + TypeScript + Serverless API Routes |
| **Styling & UI** | Tailwind CSS + Framer Motion | Dark Mode default, Glassmorphism, Neon/Cyan Accents |
| **Code Editor** | Monaco Editor | `@monaco-editor/react` (VS Code engine in browser) |
| **Database & ORM** | SQLite via Prisma ORM | `prisma/dev.db` (Serverless WAL fallback to `/tmp/codeforge.db`) |
| **Code Execution Engine** | Judge0 CE Cloud / Piston API | `https://ce.judge0.com/submissions?wait=true` (Python, C++, JS, Java, Go) |
| **AI Engine** | FreeModel API (OpenAI Compatible) | Base: `https://api.freemodel.dev/v1`<br/>Key: `fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f`<br/>Fast Model: `gpt-5.4-mini`<br/>Reasoning Model: `gpt-5.6-sol` |
| **Problem Data Source** | Open-Source Repositories | Scraping `doocs/leetcode` raw GitHub markdown + LeetCode public API |
| **Authentication** | Email + Password Auth | Native Node `crypto.pbkdf2Sync` hashing + HMAC-SHA256 JWT sessions |
| **Deployment** | Vercel | Free tier deployment via `npx vercel --prod --yes` |

---

## 📋 CORE SYSTEM REQUIREMENTS

### R1. Problem Dataset (600+ Real DSA Problems)
- Implement an automated ingestion script (`scripts/generate-leetcode-dataset.ts`) that fetches genuine LeetCode problems from open-source GitHub repositories (`doocs/leetcode` raw README markdown).
- Store 600+ problems in Prisma SQLite database with metadata:
  - Title, Slug, Difficulty (`EASY`, `MEDIUM`, `HARD`), Statement, Input/Output Format, Constraints, Topic Tags, Company Tags (Google, Amazon, Meta, Apple, Microsoft, Netflix, Uber, Flipkart), Editorial.
  - At least 3–5 Test Cases per problem (sample test cases exposed to user, hidden test cases for submission).
  - Multi-language starter code templates (Python, C++, JavaScript, Java, Go).

### R2. Online Judge & Multi-Language Execution
- Create execution engine wrapper (`lib/piston.ts`) using Judge0 CE API (`ce.judge0.com`).
- Wrap Python & JavaScript solutions in harness wrappers (`PYTHON_SOLUTION_HARNESS`, `JS_SOLUTION_HARNESS`) to parse standard input, invoke `Solution` class methods, and compare output.
- Return standardized verdicts: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Runtime Error`, `Compilation Error` with execution time (ms) and failed test case details.

### R3. AI Coaching Suite (5 Capabilities)
1. **Post-Submission AI Code Review**: Triggered after solution submission (`gpt-5.6-sol`). Analyzes Time/Space complexity, Code Quality Score (0–100), edge case gaps, and optimal approach diffs.
2. **3-Level Progressive Hints**: Level 1 (Intuition/Concept), Level 2 (Algorithm/Data Structure), Level 3 (Code Skeleton) using `gpt-5.4-mini`.
3. **Interactive AI Chat Tutor**: Sliding drawer Q&A assistant on problem pages (`gpt-5.4-mini`).
4. **AI Mock Interview Simulator**: `/mock-interview` page where AI acts as a FAANG interviewer, asks DSA questions, evaluates candidate responses, and generates a detailed report card.
5. **AI System Design Evaluator**: `/company/system-design` interactive architecture design feedback.

### R4. Email + Password Authentication System
- `User` model in Prisma schema (`id`, `email`, `name`, `passwordHash`, `role`).
- API Endpoints:
  - `/api/auth/signup`: Hashes passwords using `crypto.pbkdf2Sync` (1000 iterations, sha512), saves user, creates progress record, returns JWT session token in HTTP-only cookie.
  - `/api/auth/login`: Authenticates credentials and returns session.
  - `/api/auth/me`: Hydrates active user profile.
  - `/api/auth/logout`: Clears session cookies.
- `/login` and `/register` pages with dark glassmorphism styling.
- Dynamic Navbar: Displays **Sign In** / **Sign Up** buttons when unauthenticated; displays User Avatar + Name + Logout dropdown when logged in.

### R5. Rated Contests & Private 1v1 - 10 Player Speed Battle Arena
- **Weekly Rated Contests**: 4 problems, 90-minute countdown timer, Elo rating updates (800–3500 range).
- **Private Friend Speed Battle Arena**:
  - Host creates a room specifying Room Name, Difficulty, and Question Count.
  - Generates a unique 6-character Room Code (e.g., `BATTLE-7892`).
  - **10-Player Max Limit**: Strictly limits room capacity to max 10 friends.
  - **First-Solve Speed Points**: First coder to submit an Accepted solution gets **100 Base Points + 50 Speed Bonus**!
  - **Live Leaderboard**: Real-time standings with 🥇 1st, 🥈 2nd, and 🥉 3rd place badges.

### R6. Progress Dashboard & Leaderboards
- `/dashboard`: Personal stats overview showing Easy/Medium/Hard solved breakdown, topic mastery radar chart, submission heat matrix, streak calendar, and unlocked achievement badges.
- `/leaderboard`: Global rankings computed dynamically from user submissions.

### R7. Spaced Repetition DSA Revision Flashcard System (Key LeetCode Differentiator)
- **Automatic Card Creation**: Submitting an `Accepted` solution automatically creates or updates a `RevisionCard` for that problem.
- **SM-2 Spaced Repetition Intervals**: Schedules review dates based on memory retention (1 day → 3 days → 7 days → 14 days).
- **Interactive Revision Deck (`/revision`)**:
  - Flip-card UI (Front: Problem title, pattern pill, difficulty; Back: Socratic key logic, O(N) Time/Space complexity, optimal approach).
  - Self-rating recall buttons: 🔴 Hard (1 day), 🔵 Good (3 days), 🟢 Easy (7 days).
  - Tracks "Due Today" cards count, mastered cards (3+ reviews), and total revision deck.

---

## 🗄️ DATABASE SCHEMA (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  passwordHash String
  role         String        @default("USER")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Problem {
  id              String           @id @default(uuid())
  slug            String           @unique
  title           String
  statement       String
  inputFormat     String
  outputFormat    String
  constraints     String
  difficulty      String           // EASY, MEDIUM, HARD
  topicTags       String           // JSON string array
  companyTags     String           // JSON string array
  editorial       String
  timeLimit       Float            @default(1.0)
  memoryLimit     Int              @default(256)
  createdAt       DateTime         @default(now())
  codeTemplates   CodeTemplate[]
  testCases       TestCase[]
  submissions     Submission[]
  contestProblems ContestProblem[]
  companyProblems CompanyProblem[]
}

model CodeTemplate {
  id        String   @id @default(uuid())
  problemId String
  problem   Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  language  String   // python, cpp, javascript, java, go
  code      String
}

model TestCase {
  id             String   @id @default(uuid())
  problemId      String
  problem        Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  input          String
  expectedOutput String
  isSample       Boolean  @default(false)
  explanation    String?
}

model Submission {
  id             String   @id @default(uuid())
  userId         String?  @default("guest")
  problemId      String
  problem        Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  code           String
  language       String
  status         String   // Accepted, Wrong Answer, TLE, MLE, Runtime Error, Compilation Error
  executionTime  Float?
  memory         Float?
  failedTestCase String?
  createdAt      DateTime @default(now())
}

model CustomRoom {
  id           String            @id @default(uuid())
  code         String            @unique
  name         String
  hostName     String
  maxPlayers   Int               @default(10)
  difficulty   String            @default("MIXED")
  problemCount Int               @default(3)
  status       String            @default("WAITING")
  problemIds   String            // JSON string array of problem IDs
  createdAt    DateTime          @default(now())
  participants RoomParticipant[]
}

model RoomParticipant {
  id        String     @id @default(uuid())
  roomId    String
  room      CustomRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  userId    String
  userName  String
  score     Int        @default(0)
  solved    Int        @default(0)
  joinedAt  DateTime   @default(now())

  @@unique([roomId, userId])
}
```

---

## 💻 STEP-BY-STEP IMPLEMENTATION ROADMAP

### Step 1: Initialize Project & Environment
1. Run `npx create-next-app@latest ./ --typescript --tailwind --app --eslint`.
2. Install dependencies:
   ```bash
   npm i @prisma/client @monaco-editor/react framer-motion lucide-react recharts
   npm i -D prisma @types/node
   ```
3. Create `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="codeforge_jwt_secret_key_2026"
   FREEMODEL_API_KEY="fe_oa_058124071b87b1a4c0677776c264ed56b0463b70257c750f"
   FREEMODEL_BASE_URL="https://api.freemodel.dev/v1"
   ```

### Step 2: Configure Prisma & Vercel SQLite Client (`lib/prisma.ts`)
On Vercel serverless environments, copy `prisma/dev.db` to `/tmp/codeforge.db` on cold starts so SQLite can write in WAL mode:
```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function prepareDatabase() {
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/codeforge.db';
    if (!fs.existsSync(tmpDbPath)) {
      const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

prepareDatabase();
export const prisma = new PrismaClient();
```

### Step 3: Integrate Code Execution Engine (`lib/piston.ts`)
Implement Judge0 CE Cloud execution:
```typescript
const JUDGE0_URL = 'https://ce.judge0.com/submissions?wait=true';

const LANGUAGE_MAP: Record<string, number> = {
  python: 71,    // Python 3.8.1
  cpp: 54,       // C++ (GCC 9.2.0)
  javascript: 63,// JavaScript (Node.js 12.14.0)
  java: 62,      // Java (OpenJDK 13.0.1)
  go: 60,        // Go (1.13.5)
};

export async function executeCode(language: string, sourceCode: string, stdin: string = '') {
  const languageId = LANGUAGE_MAP[language] || 71;
  const res = await fetch(JUDGE0_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 4.0,
      memory_limit: 256000,
    }),
  });

  const data = await res.json();
  const stdout = data.stdout || '';
  const stderr = data.stderr || data.compile_output || '';
  const statusId = data.status?.id;

  let verdict = 'Accepted';
  if (statusId === 3) verdict = 'Accepted';
  else if (statusId === 4) verdict = 'Wrong Answer';
  else if (statusId === 5) verdict = 'Time Limit Exceeded';
  else if (statusId === 6) verdict = 'Compilation Error';
  else verdict = 'Runtime Error';

  return {
    verdict,
    stdout,
    stderr,
    executionTime: (data.time || 0) * 1000,
    memory: data.memory || 0,
  };
}
```

### Step 4: Seed 600+ Real LeetCode Problems
Create `scripts/generate-leetcode-dataset.ts` to fetch metadata from `doocs/leetcode` raw GitHub README markdown and public APIs, then execute `npx ts-node scripts/seed-real-problems.ts` to populate `prisma/dev.db`.

### Step 5: Build UI Pages & Features
- `/problems`: Filterable table by difficulty, topic tags, company tags, and search.
- `/problems/[id]`: Split-pane layout (Monaco Editor on right, statement & AI tools on left).
- `/login` & `/register`: Dark glassmorphism email authentication pages.
- `/contests`: Rated contest portal + **Friend Battle Arena** (create/join room with 10 player max limit).
- `/contests/room/[code]`: Live battle workspace with real-time rankings & speed bonuses.

---

## 🚀 VERIFICATION & DEPLOYMENT

1. **Verify Build**:
   ```bash
   npm run build
   ```
2. **Git Commit & Push**:
   ```bash
   git add -f prisma/dev.db
   git add -A
   git commit -m "feat: complete CodeForge AI platform build"
   git push origin main
   ```
3. **Deploy to Production**:
   ```bash
   npx vercel --prod --yes
   ```

---
*Built with ❤️ for Developers & Competitive Coders worldwide.*
