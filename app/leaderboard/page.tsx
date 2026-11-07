"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { loadHistory, getPlayerName, type SavedAttempt } from "@/lib/store";

type Row = { name: string; score: number; grade: string; date: string; you?: boolean };
const MOCK: Row[] = [
  { name: "Aarav", score: 92, grade: "Pro Investor 🏆", date: "Today" },
  { name: "Priya", score: 88, grade: "Pro Investor 🏆", date: "Today" },
  { name: "Rohan", score: 81, grade: "Smart Saver 🟢", date: "Yesterday" },
  { name: "Sneha", score: 76, grade: "Smart Saver 🟢", date: "Yesterday" },
];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [cloud, setCloud] = useState(false);
  const [source, setSource] = useState("");
  useEffect(() => {
    const localPlayer = (getPlayerName() || "").trim().toLowerCase();
    const mine: Row[] = loadHistory().map((a: SavedAttempt) => ({
      name: a.playerName,
      score: a.score,
      grade: a.grade,
      date: new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      you: true,
    }));

    fetch("/api/attempts").then((r) => r.json()).then((d) => {
      const playerMap = new Map<string, Row>();

      if (d.configured && d.attempts?.length) {
        setCloud(true);
        setSource(d.source === "direct" ? "Direct DB" : "Supabase");
        const cloudRows: Row[] = d.attempts.map((a: { player_name: string; score: number; grade: string; created_at: string }) => ({
          name: a.player_name,
          score: a.score,
          grade: a.grade || "",
          date: a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent",
          you: localPlayer ? a.player_name.trim().toLowerCase() === localPlayer : false,
        }));

        for (const row of cloudRows) {
          const key = row.name.toLowerCase();
          if (!playerMap.has(key) || (playerMap.get(key)!.score < row.score)) {
            playerMap.set(key, row);
          }
        }
        for (const row of mine) {
          const key = row.name.toLowerCase();
          if (!playerMap.has(key) || (playerMap.get(key)!.score < row.score)) {
            playerMap.set(key, row);
          }
        }
      } else {
        for (const row of [...mine, ...MOCK]) {
          const key = row.name.toLowerCase();
          if (!playerMap.has(key) || (playerMap.get(key)!.score < row.score)) {
            playerMap.set(key, row);
          }
        }
      }

      setRows(Array.from(playerMap.values()).sort((a, b) => b.score - a.score).slice(0, 10));
    }).catch(() => {
      const playerMap = new Map<string, Row>();
      for (const row of [...mine, ...MOCK]) {
        const key = row.name.toLowerCase();
        if (!playerMap.has(key) || (playerMap.get(key)!.score < row.score)) {
          playerMap.set(key, row);
        }
      }
      setRows(Array.from(playerMap.values()).sort((a, b) => b.score - a.score).slice(0, 10));
    });
  }, []);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-4">
      <div><h1 className="text-[24px] font-black">Leaderboard 🏆</h1><p className="muted text-[14px]">{cloud ? `Live — ${source} se top scores.` : "Tumhare scores + demo players. DATABASE_URL daalo to live leaderboard ban jayega."}</p></div>
      {rows.length === 0 ? (
        <div className="card p-6 text-center text-muted">Abhi koi scores nahi hain.</div>
      ) : rows.map((r, i) => (
        <div key={`${r.name}-${i}`} className="card flex items-center gap-3 p-4" style={r.you ? { borderColor: "#10b981" } : undefined}>
          <span className="w-8 text-center text-[20px]">{medals[i] || `#${i + 1}`}</span>
          <div className="flex-1"><div className="font-black">{r.name} {r.you && <span className="chip ml-1" style={{ color: "#34d399" }}>YOU</span>}</div><div className="muted text-[12.5px]">{r.grade} • {r.date}</div></div>
          <div className="text-[20px] font-black">{r.score}<span className="muted text-[12px]">/100</span></div>
        </div>
      ))}
      <Link href="/test" className="btn-primary flex items-center justify-center gap-2"><Play size={17} /> Test do, rank badhao</Link>
    </div>
  );
}
