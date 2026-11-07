// Local storage manager — ONLY stores the player's username as requested.
// All attempts and leaderboard data are stored in and fetched from the real-time database.

const NAME_KEY = "finquest_name";

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setPlayerName(n: string): void {
  if (typeof window === "undefined") return;
  try {
    const val = (n || "").trim();
    if (val) {
      localStorage.setItem(NAME_KEY, val);
    } else {
      localStorage.removeItem(NAME_KEY);
    }
  } catch {
    // ignore
  }
}

// Cleanup helper to ensure legacy attempts are removed from local storage
export function cleanupLegacyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("finquest_history_v1");
    localStorage.removeItem("finquest_best_v1");
    localStorage.removeItem("finquest_streak_v1");
  } catch {
    // ignore
  }
}
