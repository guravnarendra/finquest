"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { getPlayerName } from "@/lib/store";

type HistoryItem = {
  id?: string;
  playerName: string;
  difficulty: string;
  score: number;
  mcqScore: number;
  scenarioScore: number;
  grade: string;
  riskProfile: string;
  verdict: string;
  date: string;
};

export default function HistoryPage() {
  const [list, setList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = (getPlayerName() || "").trim().toLowerCase();
    fetch("/api/attempts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.attempts)) {
          const mine = data.attempts
            .filter((a: { player_name?: string }) => {
              if (!name) return true;
              return (a.player_name || "").trim().toLowerCase() === name;
            })
            .map(
              (a: {
                id?: string;
                player_name: string;
                difficulty: string;
                score: number;
                mcq_score: number;
                scenario_score: number;
                grade: string;
                risk_profile: string;
                verdict: string;
                created_at: string;
              }) => ({
                id: a.id,
                playerName: a.player_name,
                difficulty: a.difficulty,
                score: a.score,
                mcqScore: a.mcq_score,
                scenarioScore: a.scenario_score,
                grade: a.grade || "",
                riskProfile: a.risk_profile || "",
                verdict: a.verdict || "",
                date: a.created_at
                  ? new Date(a.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent",
              })
            );
          setList(mine);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-black">My History 📜</h1>
          <p className="muted text-[14px]">Tumhare pichle saare tests ka record aur scores.</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-muted">Loading history...</div>
      ) : list.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="text-[40px]">🎯</div>
          <p className="mt-2 font-black">Abhi koi test nahi diya</p>
          <p className="muted text-[13.5px]">Pehla test do — score yahin dikhega.</p>
          <Link href="/test" className="btn-primary mt-4 flex items-center justify-center gap-2">
            <Play size={17} /> Start First Test
          </Link>
        </div>
      ) : (
        list.map((a, i) => (
          <div key={a.id || i} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <b className="text-[15px]">{a.grade}</b>
              <span className="text-[22px] font-black">
                {a.score}
                <span className="muted text-[13px]">/100</span>
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="chip capitalize">{a.difficulty}</span>
              <span className="chip">MCQ {a.mcqScore}/70</span>
              <span className="chip">Scenario {a.scenarioScore}/30</span>
              {a.riskProfile && <span className="chip">{a.riskProfile}</span>}
            </div>
            {a.verdict && (
              <p className="muted mt-2 text-[13px] leading-relaxed line-clamp-2">“{a.verdict}”</p>
            )}
            <div className="muted mt-1 text-[12px]">
              {a.date} • {a.playerName}
            </div>
          </div>
        ))
      )}

      <Link href="/test" className="btn-ghost w-full">
        Dobara test do →
      </Link>
    </div>
  );
}
