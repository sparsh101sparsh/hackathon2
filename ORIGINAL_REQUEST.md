# Original User Request

## Initial Request — 2026-07-25T16:46:44Z

<USER_REQUEST>
Build a high-quality 7-slide PowerPoint (`CodeForge_AI_Tech4Hack_Buildathon2.pptx`) for the **Tech4Hack Buildathon 2** hackathon using python3 + python-pptx. Replace the previous OrgOS project with **CodeForge AI**.

Working directory: /Users/iamsparsh00321/Documents/antigravity/happy-carson

## STEP 1 — READ THE ORIGINAL TEMPLATE FIRST
Before writing any slides, read and analyze `/Users/iamsparsh00321/Documents/antigravity/happy-carson/finalppt1 (4) (2).pptx` using python-pptx to extract exact positions, sizes, colors, and fonts for shapes on all slides. This is mandatory.

## DESIGN SYSTEM (from original template analysis)
- **Slide background**: Pure WHITE #FFFFFF (critical — NOT black)
- **Slide size**: 10 × 5.62 inches
- **Fonts**: Georgia (headings), Cambria (project title), Lexend Medium (labels), Roboto/Roboto SemiBold (body), Inter/Inter SemiBold (tech desc), Calibri (college), Spectral Medium (conclusion)
- **Colors**:
  - #FF0000 — RED section headings (Georgia, bold)
  - #1E2761 — Navy (secondary headings)
  - #B45309 — Amber (label text: TEAM NAME, COLLEGE, TEAM MEMBERS)
  - #F2A93B — Gold (accent separators, highlights)
  - #111827 — Near-black (main title text)
  - #475569 — Steel grey (body text)
  - #EEF3FD — Light blue panel backgrounds
  - #F8FAFC — Near-white card backgrounds
  - #000000 — Black (thin accent strips only)

## CRITICAL PYTHON-PPTX RULES
1. **NEVER set fill on a text box that sits ON TOP of a card rectangle** — text boxes must have NO fill (transparent) when layered over a colored card
2. To create a card: `add_shape(rectangle)` with light fill, then `add_textbox` (NO fill) positioned on top
3. Slide 1 team info box: use `add_shape(rectangle)` with `fill.background()` (transparent) + `line.color.rgb = RGBColor(0,0,0)` + `line.width = Pt(1.5)` → bordered box, not black filled
4. For rounded corners on the box: set `shape.adjustments[0] = 0.05`
5. Textboxes' `word_wrap = True` for all body text

## SLIDE 1 — TITLE SLIDE
Exact layout from original (WHITE background):
- Top area: "TECH4HACK BUILDATHON 2" — Georgia, 30pt, bold, RED #FF0000 (original had "COGNITIVE CHAOS 2026")
- Middle-left: "CodeForge AI" — Cambria, 48pt, bold, #111827 (original had "OrgOS")
- Below title: "THEME : COMPETITIVE PROGRAMMING & AI COACHING" — Lexend Medium, 12pt, #111827
- Bottom 40% of slide: A ROUNDED RECTANGLE (TRANSPARENT FILL, BLACK BORDER 1.5pt) containing:
  - LEFT half: TEAM NAME (Lexend Medium, 10pt, #B45309 amber) → "WinterIsComing" (Cambria, 24pt, bold, #111827) → TEAM ID: 8D89660080E1 (Lexend Medium, 10pt, #B45309) → COLLEGE (Lexend Medium, 10pt, #B45309) → "ABES Engineering College, Ghaziabad" (Calibri, 12pt, bold, #111827)
  - RIGHT half: TEAM MEMBERS (Lexend Medium, 10pt, #B45309) → bullet list: Sparsh Singh, Shashwat Rastogi, Sumit Singh, Sudiksha Singh (Lexend Medium, 12pt, #111827)

## SLIDE 2 — PROBLEM STATEMENT
- Header: "PROBLEM STATEMENT" — Georgia, 22pt, bold, RED
- Subheader: "Why Competitive Programmers & Developers Need CodeForge AI" — Lexend Medium, 11pt, Navy #1E2761
- LEFT PANEL (dark fill #111827, WHITE text): Title "The Challenge" (Cambria, 14pt, bold, #F2A93B gold), then 5 bullet points with ✕ prefix (Roboto, 9pt, #CBD5E1 light grey text):
  1. Fragmented Learning — No unified DSA + AI platform
  2. No Real-Time Feedback — Judges give only Accept/Reject
  3. Interview Gap — Practice and interview prep are disconnected
  4. No AI Coaching — No Socratic tutoring or deep code review
  5. No Rated Contests — Can't benchmark via ELO competitions
- RIGHT PANEL: 3 cards (light #F8FAFC background with thin border), each with title (Inter SemiBold, 10pt, Navy) + description (Inter, 8.5pt, Steel grey):
  1. LeetCode / HackerRank — no AI coaching, no rated ELO system
  2. ChatGPT / Generic AI — gives answers, no code execution or Socratic guidance
  3. Coding Bootcamps — expensive, not self-paced, no real-time AI feedback
- BOTTOM BLACK BAR (#000000): "Result: Developers juggle 5+ platforms, wasting hours instead of building real skills." (Spectral Medium, 11pt, bold, #F2A93B gold)

## SLIDE 3 — PROPOSED SOLUTION
- Header: "PROPOSED SOLUTION" — Georgia, 22pt, bold, RED
- Description box (dark #111827 fill): "CodeForge AI in simple terms" (Cambria, 13pt, bold, #F2A93B), then explanation paragraph (Calibri, 11pt, #94A3B8)
- LEFT dark panel (#111827): "How CodeForge AI Works" (Cambria, 12pt, bold, gold), then numbered steps [01]-[05] (Roboto, 9pt)
- RIGHT light panel (#EEF3FD): "The CodeForge AI Advantage" (Cambria, 12pt, bold, Navy), then 6 metrics with ► prefix

## SLIDE 4 — ARCHITECTURE + TECH STACK
- Background: Light blue #EEF3FD
- Header: "ARCHITECTURE + TECH STACK" — Georgia, 16pt, bold, RED
- Subheader: "System Flow (The complete execution pipeline of CodeForge AI)" — Inter SemiBold, 11pt, Navy
- Flow bar (dark #111827): flow text in gold — "User Auth (JWT) → Problem Selection → Monaco Editor → Piston API → AI Analysis (gpt-5.6-sol) → Dashboard & Rating"
- 8 white cards in 2 rows of 4: System Components row + Tech Stack row
  - Row 1 cards: Next.js 14 App, Prisma ORM, Piston Code Engine, FreeModel AI
  - Row 2 cards: Monaco Editor, SQLite/PostgreSQL, JWT Auth, Vercel Deployment

## SLIDE 5 — KEY FEATURES
- Background: Light blue #EEF3FD
- Header: "KEY FEATURES" — Georgia, 22pt, bold, RED
- Subheader: "The core AI capabilities, real-time code execution, and contest system" — Inter, 11pt, Navy
- 12 white cards in 3 rows of 4 (each card: icon character, title in Inter SemiBold Navy, 2-3 line description in Inter #475569):
  Row 1: ⚡ Code Execution, 🤖 AI Socratic Tutor, 🏆 Contest System, 💼 Mock Interviews
  Row 2: 📊 Code Review, 🎯 Company Archives, 🔍 System Design, 📈 ELO Rating
  Row 3: 🧩 Problem Library, 💡 Hint System, 🌐 Multi-Language, 📋 Progress Dashboard

## SLIDE 6 — IMPACT & FEASIBILITY
- Background: White
- Header: "Impact & Feasibility" — Georgia, 24pt, bold, RED
- Subheader: "An overview of targeted beneficiaries, real-world outcomes, scalability, and deployment readiness" — Inter, 10pt, Navy
- 4 column cards with WHITE (#F8FAFC) background and thin border:
  - Column 1: "Who Will Benefit" — Students, Working Devs, CS Faculty, Startups
  - Column 2: "Real-World Outcomes" — Faster interview prep, AI coaching 24/7, ELO tracking, Company-specific prep
  - Column 3: "Scalability" — Stateless Next.js, Prisma migrations, PostgreSQL for prod, Docker-ready
  - Column 4: "Cost & Deployment" — Vercel free tier, FreeModel AI (no cost), Open source MIT, <$5/mo infra cost

## SLIDE 7 — DEMO & CONCLUSION
- Background: White
- Header: "Demo & Conclusion" — Georgia, 22pt, bold, RED
- Subheader: "What Makes CodeForge AI Special?" — Inter SemiBold, 11pt, #475569
- Description: "CodeForge AI redefines competitive programming by combining production-grade code execution with AI coaching, mock interviews, and rated contests — all while keeping human learning at the center." — Spectral Medium, 11pt
- "Why this should be selected?" — Lexend Medium, 13pt, Navy
- 3 cards (WHITE fill with thin border, NOT dark fill):
  - Card 1: 🔴 Live Demo — Try our working platform: hackathon2-olive-eight.vercel.app (gold link text) — description
  - Card 2: ⭐ GitHub Repo — Full source code: github.com/sparsh101sparsh/hackathon2 (gold) — 52+ problems, full API, Prisma schema
  - Card 3: 🏆 Why Choose Us — CodeForge AI = LeetCode + AI Coaching + Mock Interviews + Rated Contests
- Bottom footer bar (dark): URL in gold: https://hackathon2-olive-eight.vercel.app

## OUTPUT
Save to: `/Users/iamsparsh00321/Documents/antigravity/happy-carson/CodeForge_AI_Tech4Hack_Buildathon2.pptx`

After saving, verify with python-pptx:
- Exactly 7 slides
- Slide size 10x5.62 inches  
- No shape has a black fill on slides 1, 6, 7 except accent bars
- Print shape count and first text on each slide

## Acceptance Criteria
- [ ] All slide backgrounds are white or light
- [ ] Slide 1: Team box has transparent fill + black border (not black fill)
- [ ] Cards on all slides use light backgrounds with READABLE dark text
- [ ] RED Georgia headings on every slide
- [ ] AMBER labels where appropriate (TEAM NAME, COLLEGE)
- [ ] "TECH4HACK BUILDATHON 2" on slide 1
- [ ] "CodeForge AI" as project name throughout
- [ ] All 4 team members present
- [ ] Both URLs present (vercel + github)
- [ ] Verification script passes
</USER_REQUEST>
