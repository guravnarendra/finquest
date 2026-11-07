import { isDirectDbConfigured, fetchAttemptsDirect, saveAttemptDirect } from "./db";
import { SUPABASE_CONFIGURED, fetchAttempts, saveAttempt, type AttemptRow } from "./supabase";

export type DbSource = "direct" | "supabase" | "none";

export function getDbSource(): DbSource {
  if (isDirectDbConfigured()) return "direct";
  if (SUPABASE_CONFIGURED) return "supabase";
  return "none";
}

export async function saveAttemptAny(
  row: AttemptRow
): Promise<{ ok: boolean; source: DbSource; error?: string; id?: string }> {
  const source = getDbSource();
  if (source === "direct") {
    const r = await saveAttemptDirect(row);
    if (r.ok) return { ok: true, source, id: r.id };
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
    return await fetchAttemptsDirect(limit);
  }
  if (source === "supabase") return fetchAttempts(limit);
  return [];
}
