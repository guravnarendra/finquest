// Local (browser) storage — the offline fallback when Supabase is not
// configured. Every finished test is saved here AND (if configured) to
// Supabase, so History / Leaderboard always work.

export type SavedAttempt = {
  id: string;
  playerName: string;
  difficulty: string;
  score: number;
  mcqScore: number;
  scenarioScore: number;
  correctCount: number;
  grade: string;
  riskProfile: string;
  verdict: string;
  date: string;
  synced?: boolean;
};

const KEY = "finquest_history_v1";
const BEST_KEY = "finquest_best_v1";
const STREAK_KEY = "finquest_streak_v1";

export function loadHistory(): SavedAttempt[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function saveLocalAttempt(a: SavedAttempt): void {
  if (typeof window === "undefined") return;
  const list = [a, ...loadHistory()].slice(0, 30);
  localStorage.setItem(KEY, JSON.stringify(list));
  const best = getBest();
  if (a.score > best) localStorage.setItem(BEST_KEY, String(a.score));
  // Streak: one test per day counts
  const today = new Date().toDateString();
  const streak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"last":"","count":0}');
  if (streak.last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const count = streak.last === yesterday ? streak.count + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count }));
  }
}

export function getBest(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(BEST_KEY) || "0");
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const streak = JSON.parse(raw);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.last === today || streak.last === yesterday) {
      return streak.count || 0;
    }
    return 0;
  } catch { return 0; }
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("finquest_name") || "";
}

export function setPlayerName(n: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("finquest_name", n);
}

export function markAttemptSynced(id: string): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const idx = history.findIndex((h) => h.id === id);
  if (idx !== -1) {
    history[idx].synced = true;
    localStorage.setItem(KEY, JSON.stringify(history));
  }
}

export async function syncLocalAttemptsToDb(): Promise<void> {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const unsynced = history.filter((a) => !a.synced);
  if (unsynced.length === 0) return;

  let updated = false;
  const copy = [...history];

  for (const item of unsynced) {
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: item.playerName || "Player",
          difficulty: item.difficulty || "beginner",
          score: item.score ?? 0,
          mcq_score: item.mcqScore ?? 0,
          scenario_score: item.scenarioScore ?? 0,
          correct_count: item.correctCount ?? 0,
          total_questions: 10,
          grade: item.grade || "",
          risk_profile: item.riskProfile || "",
          verdict: item.verdict || "",
          answers: [],
          created_at: item.date,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          const idx = copy.findIndex((h) => h.id === item.id);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], synced: true };
            updated = true;
          }
        }
      }
    } catch {
      // Offline / network failure - will retry on next sync
    }
  }

  if (updated) {
    localStorage.setItem(KEY, JSON.stringify(copy));
  }
}
