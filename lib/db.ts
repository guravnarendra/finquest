import { Pool } from "pg";
import type { AttemptRow } from "./supabase";

const FALLBACK_DB_URL =
  "postgresql://postgres:Z2hQu8rM_m-9._$@db.zrfycafnmavktwiwbcag.supabase.co:5432/postgres";

export function getDatabaseUrl(): string {
  return (process.env.DATABASE_URL || FALLBACK_DB_URL).trim();
}

export function isDirectDbConfigured(): boolean {
  return !!getDatabaseUrl();
}

export const DIRECT_DB_CONFIGURED = true;

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!pool) {
    const needsSsl =
      url.includes("sslmode=require") ||
      url.includes("supabase.co") ||
      process.env.NODE_ENV === "production";

    pool = new Pool({
      connectionString: url,
      max: 5,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
    });
    pool.on("error", (err) => {
      console.error("[Postgres Pool Error]:", err?.message);
    });
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
  try {
    await p.query(CREATE_TABLE_SQL);
    ensured = true;
  } catch (err) {
    console.warn("[ensureTable warning]:", err instanceof Error ? err.message : String(err));
    // If the table already exists, continue
    ensured = true;
  }
}

export async function pingDirect(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  try {
    await p.query("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function saveAttemptDirect(row: AttemptRow): Promise<{ ok: boolean; error?: string; id?: string }> {
  const p = getPool();
  if (!p) return { ok: false, error: "database-url-not-configured" };
  try {
    await ensureTable(p);
    const score = Math.max(0, Math.min(100, Math.round(row.score ?? 0)));
    const mcqScore = Math.max(0, Math.round(row.mcq_score ?? 0));
    const scenarioScore = Math.max(0, Math.round(row.scenario_score ?? 0));
    const correctCount = Math.max(0, Math.round(row.correct_count ?? 0));
    const diff = (row.difficulty || "beginner").toLowerCase();
    const validDiff = ["beginner", "intermediate", "advanced"].includes(diff) ? diff : "beginner";

    const query = row.created_at
      ? `insert into public.test_attempts
         (player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         returning id`
      : `insert into public.test_attempts
         (player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         returning id`;

    const values = row.created_at
      ? [
          row.player_name || "Player",
          validDiff,
          score,
          mcqScore,
          scenarioScore,
          correctCount,
          row.total_questions ?? 10,
          row.grade ?? null,
          row.risk_profile ?? null,
          row.verdict ?? null,
          JSON.stringify(row.answers ?? []),
          row.created_at,
        ]
      : [
          row.player_name || "Player",
          validDiff,
          score,
          mcqScore,
          scenarioScore,
          correctCount,
          row.total_questions ?? 10,
          row.grade ?? null,
          row.risk_profile ?? null,
          row.verdict ?? null,
          JSON.stringify(row.answers ?? []),
        ];

    const result = await p.query(query, values);
    const id = result.rows[0]?.id;
    return { ok: true, id };
  } catch (e) {
    console.error("[saveAttemptDirect Error]:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchAttemptsDirect(limit = 100): Promise<AttemptRow[]> {
  const p = getPool();
  if (!p) return [];
  try {
    await ensureTable(p);
    const { rows } = await p.query(
      `select id, player_name, difficulty, score, mcq_score, scenario_score, correct_count, total_questions, grade, risk_profile, verdict, answers, created_at
       from public.test_attempts order by score desc, created_at desc limit $1`,
      [limit]
    );
    return rows as AttemptRow[];
  } catch (e) {
    console.error("[fetchAttemptsDirect Error]:", e);
    return [];
  }
}
