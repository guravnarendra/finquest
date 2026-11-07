"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Play } from "lucide-react";
import { loadHistory, syncLocalAttemptsToDb, type SavedAttempt } from "@/lib/store";

export default function HistoryPage() {
  const [list, setList] = useState<SavedAttempt[]>([]);
  useEffect(() => {
    setList(loadHistory());
    syncLocalAttemptsToDb().catch(() => {});
  }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><div><h1 className="text-[24px] font-black">My History 📜</h1><p className="muted text-[14px]">Tumhare pichle saare tests ka record aur scores.</p></div>
      {list.length > 0 && <button className="btn-ghost px-3 py-2 text-[13px]" onClick={() => { localStorage.removeItem("finquest_history_v1"); setList([]); }}><Trash2 size={15} className="inline" /> Clear</button>}</div>
      {list.length === 0 ? (
        <div className="card p-6 text-center"><div className="text-[40px]">🎯</div><p className="mt-2 font-black">Abhi koi test nahi diya</p><p className="muted text-[13.5px]">Pehla test do — score yahin dikhega.</p><Link href="/test" className="btn-primary mt-4 flex items-center justify-center gap-2"><Play size={17} /> Start First Test</Link></div>
      ) : list.map((a) => (
        <div key={a.id} className="card p-4">
          <div className="flex items-center justify-between gap-2"><b className="text-[15px]">{a.grade}</b><span className="text-[22px] font-black">{a.score}<span className="muted text-[13px]">/100</span></span></div>
          <div className="mt-1 flex flex-wrap gap-1.5"><span className="chip capitalize">{a.difficulty}</span><span className="chip">MCQ {a.mcqScore}/70</span><span className="chip">Scenario {a.scenarioScore}/30</span><span className="chip">{a.riskProfile}</span></div>
          <p className="muted mt-2 text-[13px] leading-relaxed line-clamp-2">“{a.verdict}”</p>
          <div className="muted mt-1 text-[12px]">{new Date(a.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {a.playerName}</div>
        </div>
      ))}
      <Link href="/test" className="btn-ghost w-full">Dobara test do →</Link>
    </div>
  );
}
