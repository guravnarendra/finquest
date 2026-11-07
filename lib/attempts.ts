// Unified attempts storage — priority order:
//   1. Direct Postgres via DATABASE_URL  (lib/db.ts)  <- user asked for this
//   2. Supabase anon client              (lib/supabase.ts)
//   3. None — the browser keeps scores in localStorage instead.
import { DIRECT_DB_CONFIGURED, fetchAttemptsDirect, saveAttemptDirect } from "./db";
import { SUPABASE_CONFIGURED, fetchAttempts, saveAttempt, type AttemptRow } from "./supabase";

export type DbSource = "direct" | "supabase" | "none";

export function getDbSource(): DbSource {
  if (DIRECT_DB_CONFIGURED) return "direct";
  if (SUPABASE_CONFIGURED) return "supabase";
  return "none";
}

export async function saveAttemptAny(row: AttemptRow): Promise<{ ok: boolean; source: DbSource; error?: string }> {
  const source = getDbSource();
  if (source === "direct") {
    const r = await saveAttemptDirect(row);
    if (r.ok) return { ok: true, source };
    // Direct DB failed (bad URL / table) — don't silently lose the score,
    // report the real error so /api/health shows it.
    return { ok: false, source, error: r.error };
  }
  if (source === "supabase") {
    const r = await saveAttempt(row);
    return { ...r, source };
  }
  return { ok: false, source, error: "no-database-configured" };
}

export async function fetchAttemptsAny(limit = 100): Promise<AttemptRow[]> {
  const source = getDbSource();
  if (source === "direct") {
    try { return await fetchAttemptsDirect(limit); } catch { return []; }
  }
  if (source === "supabase") return fetchAttempts(limit);
  return [];
}
