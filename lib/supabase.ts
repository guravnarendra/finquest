import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_CONFIGURED) return null;
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return client;
}

export type AttemptRow = {
  id?: string;
  player_name: string;
  difficulty: string;
  score: number;
  mcq_score: number;
  scenario_score: number;
  correct_count: number;
  total_questions: number;
  grade: string;
  risk_profile: string;
  verdict: string;
  answers: unknown;
  created_at?: string;
};

export async function saveAttempt(row: AttemptRow): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase-not-configured" };
  const { error } = await sb.from("test_attempts").insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchAttempts(limit = 20): Promise<AttemptRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("test_attempts").select("*").order("score", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return data as AttemptRow[];
}
