// Direct Postgres via DATABASE_URL — server only, never import from a
// client component. This is the PRIMARY db route now.
// Example (Supabase Postgres, Settings -> Database -> Connection string):
//   DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
// For the Supabase pooler use port 6543 with ?pgbouncer=true instead.
// Any plain Postgres 14+ URL works the same way.
import { Pool } from "pg";
import type { AttemptRow } from "./supabase";

export const DIRECT_DB_CONFIGURED = !!process.env.DATABASE_URL;

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!DIRECT_DB_CONFIGURED) return null;
  if (!pool) {
    const url = process.env.DATABASE_URL!;
    const needsSsl = url.includes("sslmode=require") || url.includes("supabase.co") || process.env.NODE_ENV === "production";
    pool = new Pool({ connectionString: url, max: 5, ssl: needsSsl ? { rejectUnauthorized: false } : undefined });
    pool.on("error", () => { /* keep the server alive on idle-client errors */ });
  }
  return pool;
}

const CREATE_TABLE_SQL = `
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  player_name text not null default 'Player',
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  score int not null default 0 check (score >= 0 and score <= 100),
  mcq_score int not null default 0,
  scenario_score int not null default 0,
  correct_count int not null default 0,
  total_questions int not null default 10,
  grade text,
  risk_profile text,
  verdict text,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists test_attempts_score_idx on public.test_attempts (score desc, created_at desc);
create index if not exists test_attempts_created_idx on public.test_attempts (created_at desc);
`;

let ensured = false;
async function ensureTable(p: Pool): Promise<void> {
  if (ensured) return;
  await p.query(CREATE_TABLE_SQL);
  ensured = true;
}

export async function pingDirect(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  await p.query("select 1");
  return true;
}

export async function saveAttemptDirect(row: AttemptRow): Promise<{ ok: boolean; error?: string }> {
  const p = getPool();
  if (!p) return { ok: false, error: "database-url-not-configured" };
  try {
    await ensureTable(p);
    if (row.created_at) {
      await p.query(
        `insert into public.test_attempts
         (player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [row.player_name, row.difficulty, row.score, row.mcq_score, row.scenario_score, row.correct_count, row.total_questions ?? 10, row.grade ?? null, row.risk_profile ?? null, row.verdict ?? null, JSON.stringify(row.answers ?? []), row.created_at]
      );
    } else {
      await p.query(
        `insert into public.test_attempts
         (player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [row.player_name, row.difficulty, row.score, row.mcq_score, row.scenario_score, row.correct_count, row.total_questions ?? 10, row.grade ?? null, row.risk_profile ?? null, row.verdict ?? null, JSON.stringify(row.answers ?? [])]
      );
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchAttemptsDirect(limit = 100): Promise<AttemptRow[]> {
  const p = getPool();
  if (!p) return [];
  await ensureTable(p);
  const { rows } = await p.query(
    `select id, player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers, created_at
     from public.test_attempts order by score desc, created_at desc limit $1`,
    [limit]
  );
  return rows as AttemptRow[];
}
