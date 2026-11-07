"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Shield,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { getPlayerName, cleanupLegacyStorage } from "@/lib/store";

const LESSONS = [
  { icon: "💰", title: "SIP kya hai?", desc: "Har mahine thoda-thoda, bada corpus" },
  { icon: "📊", title: "Mutual Funds", desc: "Index vs Active — kaun jeetega?" },
  { icon: "📈", title: "Stocks 101", desc: "P/E, blue-chip, small-cap samjho" },
  { icon: "🛡️", title: "Risk samjho", desc: "Risk bina return nahi, panic bina loss nahi" },
];

export default function Home() {
  const [best, setBest] = useState<number | null>(null);
  const [totalTests, setTotalTests] = useState(0);
  const [balance, setBalance] = useState(100000);

  useEffect(() => {
    cleanupLegacyStorage();
    const name = (getPlayerName() || "").trim().toLowerCase();

    fetch("/api/attempts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.attempts)) {
          setTotalTests(d.attempts.length);
          if (name) {
            const myScores = d.attempts
              .filter(
                (a: { player_name?: string }) =>
                  (a.player_name || "").trim().toLowerCase() === name
              )
              .map((a: { score: number }) => (typeof a.score === "number" ? a.score : 0));

            if (myScores.length > 0) {
              setBest(Math.max(...myScores));
            }
          }
        }
      })
      .catch(() => {});

    const t = setInterval(
      () =>
        setBalance((b) =>
          Math.max(98000, Math.min(104000, b + Math.round((Math.random() - 0.48) * 320)))
        ),
      1800
    );
    return () => clearInterval(t);
  }, []);

  const gain = balance - 100000;

  return (
    <div className="space-y-4">
      <section
        className="card pop p-5"
        style={{ background: "linear-gradient(160deg,#0d2b1d,#0a1f16 55%,#12291d)" }}
      >
        <div className="flex items-center gap-2 text-[12px] font-black" style={{ color: "#f59e0b" }}>
          <Sparkles size={14} /> INVESTING GAME • NO REAL MONEY
        </div>
        <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-tight">
          Paisa seekho,
          <br />
          game khel ke. 🎮
        </h1>
        <p className="muted mt-2 text-[14px] leading-relaxed">
          10 questions. 7 MCQ + 3 real-life scenarios. Score pao,{" "}
          <b style={{ color: "#eafff3" }}>AI verdict</b> lo, aur apna Investor Level badhao.
        </p>
        <Link href="/test" className="btn-primary mt-4 flex items-center justify-center gap-2">
          <Play size={19} /> Start Test — 10 Questions
        </Link>
        <div className="mt-3 flex gap-2 text-center">
          <div className="card2 flex-1 p-2.5">
            <div className="text-[11px] muted font-bold">YOUR BEST</div>
            <div className="text-[17px] font-black">{best !== null ? `${best}/100` : "- / 100"}</div>
          </div>
          <div className="card2 flex-1 p-2.5">
            <div className="text-[11px] muted font-bold">TOTAL TESTS</div>
            <div className="text-[17px] font-black">{totalTests} given</div>
          </div>
          <div className="card2 flex-1 p-2.5">
            <div className="text-[11px] muted font-bold">LEADERBOARD</div>
            <div className="text-[17px] font-black">🏆 Live</div>
          </div>
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black">
            <TrendingUp size={17} style={{ color: "#34d399" }} /> Virtual Portfolio
          </div>
          <span className="chip" style={{ color: gain >= 0 ? "#34d399" : "#f87171" }}>
            {gain >= 0 ? "▲" : "▼"} ₹{Math.abs(gain).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-2 text-[30px] font-black tracking-tight">
          ₹{balance.toLocaleString("en-IN")}
        </div>
        <div className="muted text-[12px]">
          Demo balance — market simulation feel, real risk zero. Test score se apna investor level
          badhao.
        </div>
        <svg viewBox="0 0 400 90" className="mt-2 w-full">
          <polyline
            points="0,70 40,62 80,66 120,48 160,54 200,36 240,44 280,26 320,32 360,16 400,10"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <polyline
            points="0,70 40,62 80,66 120,48 160,54 200,36 240,44 280,26 320,32 360,16 400,10 400,90 0,90"
            fill="rgba(16,185,129,.12)"
            stroke="none"
          />
        </svg>
        <div className="flex gap-2 text-[12px] font-bold">
          <span className="chip">Equity 60%</span>
          <span className="chip">Debt 30%</span>
          <span className="chip">Gold 10%</span>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-black text-[16px]">Aaj kya seekhoge?</h2>
          <Link
            href="/learn"
            className="flex items-center gap-1 text-[13px] font-bold"
            style={{ color: "#34d399" }}
          >
            All lessons <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LESSONS.map((l) => (
            <Link
              key={l.title}
              href="/learn"
              className="card p-4 no-underline"
              style={{ color: "inherit" }}
            >
              <div className="text-[26px]">{l.icon}</div>
              <div className="mt-1 font-black">{l.title}</div>
              <div className="muted text-[12.5px] leading-snug">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-black">Kaise khelte hain?</h2>
        <ol className="mt-2 space-y-2.5 text-[14px] leading-relaxed">
          <li className="flex gap-2.5">
            <Target size={18} className="shrink-0" style={{ color: "#f59e0b" }} />
            <span>
              <b>1. Start Test</b> — level chuno: Beginner / Intermediate / Advanced
            </span>
          </li>
          <li className="flex gap-2.5">
            <Play size={18} className="shrink-0" style={{ color: "#34d399" }} />
            <span>
              <b>2. 10 Questions</b> — 7 MCQ (3 options, turant Right/Wrong) + 3 scenario (apna answer
              likho)
            </span>
          </li>
          <li className="flex gap-2.5">
            <Trophy size={18} className="shrink-0" style={{ color: "#fbbf24" }} />
            <span>
              <b>3. AI Verdict</b> — score /100, risk profile, strengths, weak topics aur next steps
            </span>
          </li>
          <li className="flex gap-2.5">
            <Shield size={18} className="shrink-0" style={{ color: "#7dd3fc" }} />
            <span>
              <b>4. Seekho aur compete karo</b> — har roz test do, rank badhao, aur leaderboard par
              top karo
            </span>
          </li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Link href="/leaderboard" className="btn-ghost flex-1">
            🏆 Leaderboard
          </Link>
          <Link href="/history" className="btn-ghost flex-1">
            <Flame size={15} className="inline" /> My History
          </Link>
        </div>
        <p className="muted mt-3 text-[11.5px] leading-relaxed">
          ⚠️ Ye sirf education game hai — investment advice nahi. Real paisa lagane se pehle
          SEBI-registered advisor se salah lo. <BookOpen size={11} className="inline" /> Pehle seekho,
          test do, aur real-time leaderboard par compete karo!
        </p>
      </section>
    </div>
  );
}
