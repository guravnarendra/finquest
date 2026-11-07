"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Play, RotateCw, Trophy } from "lucide-react";
import { loadHistory, getPlayerName, syncLocalAttemptsToDb, type SavedAttempt } from "@/lib/store";

type Row = {
  name: string;
  score: number;
  grade: string;
  date: string;
  rawDate: number;
  you?: boolean;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const fetchScores = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const localPlayer = (getPlayerName() || "").trim().toLowerCase();

    // Local attempts from this device
    const localAttempts: Row[] = loadHistory().map((a: SavedAttempt) => {
      const ts = a.date ? new Date(a.date).getTime() : Date.now();
      return {
        name: a.playerName || "Player",
        score: a.score ?? 0,
        grade: a.grade || "",
        date: a.date
          ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "Today",
        rawDate: isNaN(ts) ? 0 : ts,
        you: true,
      };
    });

    try {
      // Sync any pending local attempts from this device to DB first
      await syncLocalAttemptsToDb();

      const res = await fetch("/api/attempts", { cache: "no-store" });
      const data = await res.json();

      if (!mountedRef.current) return;

      const playerMap = new Map<string, Row>();

      if (data.configured && Array.isArray(data.attempts)) {
        // Process live attempts across all users
        for (const a of data.attempts) {
          const playerName = (a.player_name || "").trim() || "Anonymous";
          const key = playerName.toLowerCase();
          const ts = a.created_at ? new Date(a.created_at).getTime() : 0;
          const score = typeof a.score === "number" ? a.score : 0;
          const isYou = localPlayer ? key === localPlayer : false;

          const row: Row = {
            name: playerName,
            score,
            grade: a.grade || "",
            date: a.created_at
              ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              : "Recent",
            rawDate: isNaN(ts) ? 0 : ts,
            you: isYou,
          };

          // Keep highest score per player; tie-break with most recent date
          const existing = playerMap.get(key);
          if (
            !existing ||
            row.score > existing.score ||
            (row.score === existing.score && row.rawDate > existing.rawDate)
          ) {
            playerMap.set(key, row);
          }
        }
      }

      // Merge local attempts (so current user's latest local attempt is never lost)
      for (const row of localAttempts) {
        const key = row.name.toLowerCase();
        const existing = playerMap.get(key);
        if (
          !existing ||
          row.score > existing.score ||
          (row.score === existing.score && row.rawDate > existing.rawDate)
        ) {
          playerMap.set(key, { ...row, you: true });
        }
      }

      // Sort descending by score, tie-break by recent date
      const sorted = Array.from(playerMap.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.rawDate - a.rawDate;
      });

      setRows(sorted.slice(0, 50));
    } catch {
      if (!mountedRef.current) return;
      // If network fails, show local storage attempts without mock data
      const playerMap = new Map<string, Row>();
      for (const row of localAttempts) {
        const key = row.name.toLowerCase();
        const existing = playerMap.get(key);
        if (!existing || row.score > existing.score) {
          playerMap.set(key, { ...row, you: true });
        }
      }
      setRows(Array.from(playerMap.values()).sort((a, b) => b.score - a.score));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchScores();

    // Real-time polling every 15 seconds
    const interval = setInterval(() => {
      fetchScores();
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchScores]);

  const medals = ["🥇", "🥈", "🥉"];
  const userRowIndex = rows.findIndex((r) => r.you);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card pop p-5">
        <div className="flex items-center justify-between">
          <div className="chip" style={{ color: "#f59e0b" }}>
            🏆 REAL-TIME LEADERBOARD
          </div>
          <button
            onClick={() => fetchScores(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold transition-all hover:bg-[#12291d]"
            style={{ borderColor: "#1e3a2c", color: "#9ca3af" }}
            title="Refresh scores"
          >
            <RotateCw size={13} className={refreshing ? "animate-spin text-[#10b981]" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        <h1 className="mt-3 text-[26px] font-black leading-tight">Top Investors Ranking</h1>
        <p className="muted mt-1 text-[13.5px]">
          Sabhi players ke real-time scores aur rankings. Test complete karo aur top rank banao!
        </p>

        {/* Player stats */}
        {(rows.length > 0 || userRowIndex >= 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {rows.length > 0 && (
              <span className="rounded-full bg-[#12291d] px-2.5 py-1 text-[11px] font-bold text-gray-300 border border-[#1e3a2c]">
                {rows.length} {rows.length === 1 ? "Player" : "Players"} Ranked
              </span>
            )}

            {userRowIndex >= 0 && (
              <span className="rounded-full bg-[#10b981]/20 px-2.5 py-1 text-[11px] font-bold text-[#34d399] border border-[#10b981]/40">
                Your Rank: #{userRowIndex + 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard content */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card flex items-center gap-3 p-4 animate-pulse"
              style={{ opacity: 0.6 }}
            >
              <div className="h-7 w-7 rounded-full bg-[#12291d]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-[#12291d]" />
                <div className="h-3 w-20 rounded bg-[#12291d]" />
              </div>
              <div className="h-6 w-12 rounded bg-[#12291d]" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        /* Zero Dummy Data Empty State */
        <div className="card pop p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#12291d] border border-[#1e3a2c]">
            <Trophy size={28} className="text-[#f59e0b]" />
          </div>
          <h2 className="mt-4 text-[19px] font-black">Abhi koi scores nahi hain</h2>
          <p className="muted mx-auto mt-1 max-w-[280px] text-[13.5px]">
            Pehla test complete karo aur leaderboard par rank #1 bano! 🎯
          </p>
          <Link
            href="/test"
            className="btn-primary mt-5 inline-flex items-center justify-center gap-2 px-6"
          >
            <Play size={18} /> Start First Test
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => {
            const isTop3 = i < 3;
            const medal = medals[i];

            return (
              <div
                key={`${r.name}-${i}`}
                className="card flex items-center gap-3.5 p-4 transition-all"
                style={{
                  borderColor: r.you ? "#10b981" : isTop3 ? "rgba(245,158,11,.3)" : "#1e3a2c",
                  background: r.you
                    ? "linear-gradient(135deg, rgba(16,185,129,.12), rgba(13,31,22,.9))"
                    : undefined,
                  boxShadow: r.you ? "0 0 20px rgba(16,185,129,.15)" : undefined,
                }}
              >
                {/* Rank number or medal */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0a1610] border border-[#1e3a2c] text-[15px] font-black">
                  {medal ? (
                    <span className="text-[20px]">{medal}</span>
                  ) : (
                    <span className="text-gray-400">#{i + 1}</span>
                  )}
                </div>

                {/* Player details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-black text-[15.5px] text-white">{r.name}</span>
                    {r.you && (
                      <span className="shrink-0 rounded-full bg-[#10b981]/25 px-2 py-0.5 text-[10.5px] font-black text-[#34d399] border border-[#10b981]/40">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="muted mt-0.5 flex items-center gap-1.5 text-[12px]">
                    <span className="truncate">{r.grade || "Completed"}</span>
                    <span>•</span>
                    <span className="shrink-0">{r.date}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-[22px] font-black leading-none text-white">
                    {r.score}
                    <span className="muted text-[12px] font-semibold">/100</span>
                  </div>
                  {r.score >= 80 ? (
                    <span className="text-[10.5px] font-bold text-[#34d399]">Pro</span>
                  ) : r.score >= 60 ? (
                    <span className="text-[10.5px] font-bold text-yellow-400">Good</span>
                  ) : (
                    <span className="muted text-[10.5px] font-bold">Learner</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-2">
        <Link href="/test" className="btn-primary flex items-center justify-center gap-2">
          <Play size={18} /> Test do, score badhao
        </Link>
      </div>
    </div>
  );
}
