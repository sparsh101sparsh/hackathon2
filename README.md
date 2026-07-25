# CodeForge AI — Enterprise AI-Powered DSA & Competitive Programming Platform

CodeForge AI is a state-of-the-art, production-grade competitive programming and technical interview preparation platform. Powered by Next.js 14 App Router, Monaco Editor, Piston Code Execution API, and FreeModel AI (`gpt-5.6-sol` & `gpt-5.4-mini`), CodeForge AI delivers an unmatched developer experience combining real-time multi-language code execution, Socratic AI tutoring, system design evaluations, Codeforces-style rated contests, and company-targeted problem archives.

---

## 🌟 Key Features & Showcase

### 1. ⚡ Interactive Code Execution & Problem Solving
- **Monaco Code Editor**: Professional-grade IDE experience with syntax highlighting, custom keybindings, and automatic code formatting for Python, JavaScript, and C++.
- **Piston API Engine**: Isolated, low-latency multi-language code execution with stdin/stdout piping, execution time profiling, and memory limit enforcement.
- **Detailed Verdicts**: Real-time feedback covering `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Runtime Error`, and `Compilation Error`.

### 2. 🤖 Socratic AI DSA Tutor & Progressive 3-Level Hints
- **Socratic Assistant**: Instant interactive DSA assistant (`gpt-5.4-mini`) that guides candidates through problem-solving without revealing full solutions outright.
- **3-Level Hint System**:
  - **Level 1**: High-Level Intuition & Mental Model
  - **Level 2**: Algorithmic Strategy & Data Structure Selection
  - **Level 3**: Code Skeleton & Key Logic Pattern

### 3. 🔍 Deep AI Code Auditor & Automated Refactoring
- **Automated Code Review**: Powered by `gpt-5.6-sol` to analyze submitted solutions for asymptotic Time and Space Complexity ($O(N)$, $O(N \log N)$), Code Quality Score (0–100), key strengths, subtle edge case vulnerabilities, and refactored optimal code.

### 4. 🎙️ AI Mock Interviewer & System Design Evaluator
- **Interactive Technical Interview**: AI interviewer conducts multi-turn audio/text technical interviews, asking probing questions, testing algorithmic edge cases, and evaluating technical communication.
- **Comprehensive Candidate Scoring**: Generates structured hiring verdicts (`Hire`, `Strong Hire`, `No Hire`) with granular breakdown across problem-solving, code quality, and communication.
- **System Design Architecture Evaluator**: Evaluates high-level system design proposals (e.g., Rate Limiters, Distributed Caches, URL Shorteners) against scalability, bottlenecks, trade-offs, and failure recovery.

### 5. 🏢 Tech Giant Company Problem Archive
- Dedicated problem curation for Top 8 Tech Giants: **Google**, **Amazon**, **Microsoft**, **Meta**, **Apple**, **Netflix**, **Uber**, and **Flipkart**.
- Linked problem tagged archives with frequency scores, difficulty distributions, and company-specific interview insights.

### 6. 🏆 Codeforces-Style Contest System & Rating Engine
- Real-time competitive programming contests with live countdown timers and problem point weighting.
- Dynamic Elo-like rating calculation engine scaling ratings between **800** and **3500**, featuring badge tiers (**Newbie**, **Pupil**, **Specialist**, **Expert**, **Candidate Master**, **Master**, **Grandmaster**).

### 7. 📊 Interactive Analytics Dashboard
- Beautiful interactive data visualization powered by **Recharts**.
- Live tracking of total solved problems, submission accuracy, rating history progression, topic mastery distribution, and recent activity logs.

### 8. 🔐 Admin Portal & Management Suite
- Complete administrative dashboard for managing problem archives, test cases, code templates, user roles (`REGISTERED`, `ADMIN`), and overall system health telemetry.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (100% Type-Safe) |
| **Frontend UI** | [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/) |
| **Code Editor** | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| **Data Visualization**| [Recharts](https://recharts.org/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with SQLite / PostgreSQL |
| **Code Execution** | [Piston API](https://github.com/engineer-man/piston) |
| **AI Models** | FreeModel API — `gpt-5.6-sol` (Complex Reasoning & Audits) & `gpt-5.4-mini` (Fast Socratic Tutor) |
| **Authentication** | JWT (JSON Web Tokens) with `bcryptjs` password hashing & Role-Based Middleware |

---

## 🔑 Environment Variables Documentation

Create a `.env` file in the root directory with the following configuration:

```env
# Database Connection String
DATABASE_URL="file:./dev.db"

# JWT Secret for Session & Authentication Tokens
JWT_SECRET="codeforge-ai-super-secret-jwt-key-2026"

# FreeModel AI Engine Credentials
FREEMODEL_API_KEY="freemodel-sk-live-codeforge-2026"
FREEMODEL_BASE_URL="https://freemodel.ai/v1"

# Piston Code Execution Engine API Endpoint
PISTON_API_URL="https://emkc.org/api/v2/piston"
```

---

## 🚀 Local Setup & Installation Instructions

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/<owner>/hackathon2.git
cd hackathon2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
Push the Prisma schema to create the local SQLite database and populate seed data (users, 52+ problem sets, test cases, code templates, companies, and contests):
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the Verification Test Suite
Execute the master E2E verification test suite to confirm database integrity, Piston execution, Auth/Admin APIs, AI features, and contest engines:
```bash
npx tsx scripts/run-all-tests.ts
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore CodeForge AI.

---

## 🗄️ Database Schema & API Route Reference

### Core Database Entities
- **User**: Authentication, role (`REGISTERED` / `ADMIN`), rating, avatar, bio.
- **Problem**: DSA problem metadata, title, slug, statement, constraints, difficulty, tags.
- **TestCase**: Sample and hidden test cases with input, expected output, and explanations.
- **CodeTemplate**: Language-specific starter code for Python, C++, and JavaScript.
- **Submission**: Execution results, verdict, time/memory stats, submitted code.
- **Company**: Tech giant profiles (Google, Amazon, Meta, etc.) with company problem mappings.
- **Contest**: Rated/unrated contest events with participant registrations and problem scores.
- **MockInterviewSession**: Multi-turn AI interview sessions and candidate evaluation reports.
- **SystemDesignSubmission**: System architecture submissions and AI breakdown scores.

### Key API Endpoints

#### Authentication & User
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Authenticate user and issue JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile

#### Code Execution & Submissions
- `POST /api/execute` — Execute sample test cases via Piston API
- `POST /api/submissions` — Full test suite submission and verdict logging

#### AI Intelligence Services
- `POST /api/ai/review` — Request deep AI code review and complexity analysis
- `POST /api/ai/hint` — Request progressive 3-level Socratic hints
- `POST /api/ai/tutor` — Interactive Socratic DSA chat tutor stream
- `POST /api/ai/interview` — Initialize or progress AI mock interview session
- `POST /api/ai/system-design` — Evaluate system design architecture proposal

#### Admin Portal
- `GET /api/admin/stats` — Platform summary telemetry
- `GET / POST /api/admin/problems` — List and create problem entries
- `PUT / DELETE /api/admin/problems/[id]` — Modify or remove problem entries
- `GET / PATCH /api/admin/users/[id]` — Manage user accounts and roles

#### Companies & Contests
- `GET /api/companies` — List company archives and problem breakdown
- `GET /api/companies/[slug]` — Detailed company problem view
- `GET / POST /api/contests` — Contest archive and registration management
- `GET /api/analytics/dashboard` — User analytics and performance metrics

---

## 🔗 Deployment & Links

- **GitHub Repository**: [https://github.com/sparsh101sparsh/hackathon2](https://github.com/sparsh101sparsh/hackathon2)
- **Vercel Live Production URL**: [https://hackathon2-olive-eight.vercel.app](https://hackathon2-olive-eight.vercel.app)

---

Developed with ❤️ by CodeForge AI Team.
