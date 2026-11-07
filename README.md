# FinQuest — InvestIQ 📈🎮

Mobile-first investing quiz game — Next.js + Direct Postgres (DATABASE_URL) + TokenHarbor AI.

**Kya hai:** 10-question AI test — **7 MCQ (3 options, turant Right/Wrong + explanation)** + **3 real-life scenario questions (apna answer likho)**. End me score /100, grade, risk profile, strengths/weaknesses aur **AI verdict**.

## Run karo (Mac / local)

```bash
npm install
npm run dev        # http://localhost:3000 — phone view ke liye browser ko mobile size me karo
npm run build      # production check
npm start
```

Node 22+ chahiye. Agar `magic-string` / Tailwind wala error aaye to `rm -rf node_modules .next && npm install` karo — `next.config.ts` me koi Turbopack CSS rule nahi hai, isiliye ye error is project me nahi aana chahiye.

## Pages

| Route | Kya hai |
|---|---|
| `/` | Home — virtual ₹1,00,000 portfolio (live ticking chart), best score / streak, lessons |
| `/test` | Test — level chuno, 10 questions, timer (MCQ 30s, scenario 2 min), result + AI verdict |
| `/learn` | 8 lessons: SIP, Mutual Funds, Stocks, Risk, Compounding, Inflation, Diversification, Emergency Fund |
| `/history` | Tumhare saare tests (localStorage + Supabase) |
| `/leaderboard` | Top scores — Supabase live, warna demo + tumhare scores |

## Supabase setup (optional, par recommended)

**Primary route — direct DB URL.** Supabase Postgres ki connection string lo:
Dashboard → Settings → Database → Connection string (URI), password daalo, aur `.env.local` me daalo:

```bash
cp .env.example .env.local
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

Table khud ban jayegi — app pehli save par `test_attempts` table auto-create karta hai (`lib/db.ts` → `ensureTable`). `supabase/schema.sql` wahi schema hai, agar tum manually SQL Editor se banana chaho to. Direct 5432 blocked ho to pooler use karo: port `6543` + `?pgbouncer=true`.

**Alternative (sirf agar DATABASE_URL nahi hai):** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — tab Supabase client se save hoga.

Priority: `DATABASE_URL` → Supabase anon → kuch nahi (scores phone me). Check karo: `GET /api/health` batayega `db.source` (`direct` / `supabase` / `none`) aur ping status.

## AI verdict — kaise kaam karta hai

- **Bina key ke:** built-in rule-based AI (`lib/scoring.ts`) — scenario answers ko keywords / red-flags / length se 0-10 score karta hai aur template verdict banata hai. Offline bhi chalta hai.
- **Key ke saath (real LLM — TokenHarbor):** `.env.local` me teeno vars daalo, `/api/verdict` unhi se TokenHarbor ko call karega (`lib/llm.ts`):
```bash
TOKENHARBOR_BASE_URL=https://api.tokenharbor.ai/v1
TOKENHARBOR_MODEL=mimo-v2.6-flash:free
TOKENHARBOR_API_KEY=your-tokenharbor-api-key
```
Check karo: `GET /api/health` → `llm: { configured, baseUrl, model }` (key kabhi expose nahi hoti).
LLM se verdict, strengths, weaknesses, risk profile aur recommendations aate hain; scenario scores hamesha rule-based rehte hain (consistent).

## Question bank

`lib/questions.ts` — 18 MCQ + 9 scenario. Har test me random 7 MCQ + 3 scenario pick hote hain, isiliye har run alag hota hai. Naye questions add karna ho to isi file me add karo — format same rakho.

## Scoring

- MCQ: sahi = +10, galat = 0 (no negative). Total 70.
- Scenario: AI/rule score 0-10 each. Total 30.
- Grade: 85+ Pro Investor 🏆, 70+ Smart Saver, 50+ Learning Investor, 30+ Beginner, else Newbie.
- Risk profile scenario answers se: Conservative / Balanced — Cautious / Balanced — Growth Ready.

## Tech

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + `pg` (direct Postgres via `DATABASE_URL`) + Supabase JS (fallback) + TokenHarbor LLM via 3 env vars + lucide-react.

⚠️ Education game hai, investment advice nahi. Real paisa lagane se pehle SEBI-registered advisor se salah lo.
