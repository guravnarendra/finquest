"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  Check,
  X,
  RotateCcw,
  BookOpen,
  Share2,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { type Difficulty, type Question, type Scenario, type Topic } from "@/lib/questions";
import { gradeFor, buildVerdict, scoreScenario } from "@/lib/scoring";
import { setPlayerName, getPlayerName, cleanupLegacyStorage } from "@/lib/store";

type ScenarioAns = {
  questionId: string;
  answer: string;
  title?: string;
  situation?: string;
  prompt?: string;
  keywords?: string[];
  redFlags?: string[];
  ideal?: string;
  topic?: string;
};

type VerdictData = {
  totalScore: number;
  mcqScore: number;
  scenarioScore: number;
  aiUsed: boolean;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  riskProfile: string;
  recommendations: string[];
  scenarioResults: {
    questionId: string;
    topic: string;
    title: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
};

export default function TestPage() {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mcqScore, setMcqScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [strong, setStrong] = useState<string[]>([]);
  const [weak, setWeak] = useState<string[]>([]);
  const [scenarioText, setScenarioText] = useState("");
  const [scenarioAnswers, setScenarioAnswers] = useState<ScenarioAns[]>([]);
  const [review, setReview] = useState<{ q: Question; picked: number | null; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [waitingNext, setWaitingNext] = useState(false);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelPrefetchRef = useRef<boolean>(false);

  const q = questions[idx];
  const isMcq = q ? q.kind === "mcq" : idx < 7;
  const totalTime = isMcq ? 30 : 120;
  const progress = ((idx + (picked !== null || phase === "result" ? 1 : 0)) / 10) * 100;

  useEffect(() => {
    setName(getPlayerName());
    cleanupLegacyStorage();
  }, []);

  // Timer logic for each question
  useEffect(() => {
    if (phase !== "playing" || !q || waitingNext) return;
    setTimeLeft(totalTime);
    timerRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, waitingNext]);

  // If time runs out, auto-submit
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0 && q && !waitingNext) {
      if (isMcq && picked === null) handleMcqPick(-1);
      else if (!isMcq) handleScenarioSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // When waiting for the next question, advance as soon as it arrives
  useEffect(() => {
    if (waitingNext && questions[idx + 1]) {
      setWaitingNext(false);
      setIdx((prev) => prev + 1);
      setPicked(null);
      setScenarioText("");
    }
  }, [waitingNext, questions, idx]);

  // Fetch a single question from backend
  const fetchSingleQuestion = useCallback(
    async (index: number, diff: Difficulty, usedTopics: string[]): Promise<Question | null> => {
      try {
        const query = new URLSearchParams({
          index: String(index),
          difficulty: diff,
          usedTopics: usedTopics.join(","),
        });
        const res = await fetch(`/api/question?${query.toString()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(18000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.question) {
            return data.question as Question;
          }
        }
      } catch (err) {
        console.warn(`[Client fetchSingleQuestion ${index}]:`, err);
      }
      return null;
    },
    []
  );

  // Background worker to prefetch questions 1 to 9 sequentially
  const startBackgroundPrefetch = useCallback(
    async (diff: Difficulty, initialTopic: string) => {
      const usedTopics = [initialTopic];
      for (let i = 1; i < 10; i++) {
        if (cancelPrefetchRef.current) break;
        const nextQ = await fetchSingleQuestion(i, diff, usedTopics);
        if (cancelPrefetchRef.current) break;
        if (nextQ) {
          if (nextQ.topic) usedTopics.push(nextQ.topic);
          setQuestions((prev) => {
            const updated = [...prev];
            updated[i] = nextQ;
            return updated;
          });
        }
      }
    },
    [fetchSingleQuestion]
  );

  // Start test: loads question 0 immediately (~3-5s), then streams the rest in the background
  async function start() {
    const finalName = (name || "").trim() || getPlayerName() || "Player";
    setName(finalName);
    setPlayerName(finalName);

    cancelPrefetchRef.current = true; // cancel previous runs if any
    setGenerating(true);
    setQuestions([]);
    setIdx(0);
    setPicked(null);
    setMcqScore(0);
    setCorrectCount(0);
    setStrong([]);
    setWeak([]);
    setScenarioText("");
    setScenarioAnswers([]);
    setReview([]);
    setVerdict(null);
    setWaitingNext(false);

    // Allow previous cycle to acknowledge cancellation
    await new Promise((r) => setTimeout(r, 60));
    cancelPrefetchRef.current = false;

    // Fetch Question 1 (index 0)
    let q0 = await fetchSingleQuestion(0, difficulty, []);

    // Guaranteed fallback if network is completely offline
    if (!q0) {
      q0 = {
        kind: "mcq",
        id: `q-1-${Date.now().toString(36)}`,
        topic: "SIP",
        difficulty,
        question: "Market crash me SIP continue rakhne ka sabse bada benefit kya hai?",
        options: [
          "Market timing perfect ho jati hai",
          "Rupee-cost averaging — saste NAV par automatically zyada units milte hain",
          "Guaranteed 25% return milta hai",
        ],
        correctIndex: 1,
        explanation: "Crash me SIP continue rakhne se saste NAV par zyada units milte hain, jo recovery me portfolio growth ko boost karte hain.",
      };
    }

    setQuestions([q0]);
    setPhase("playing");
    setGenerating(false);

    // Start background prefetching queue for questions 1 to 9
    startBackgroundPrefetch(difficulty, q0.topic);
  }

  function recordTopic(topic: string, correct: boolean) {
    if (correct) {
      setStrong((s) => (s.includes(topic) ? s : [...s, topic]));
      setWeak((w) => w.filter((t) => t !== topic));
    } else {
      setWeak((w) => (w.includes(topic) ? w : [...w, topic]));
      setStrong((s) => s.filter((t) => t !== topic));
    }
  }

  function handleMcqPick(i: number) {
    if (picked !== null || !q || q.kind !== "mcq") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPicked(i);
    const correct = i === q.correctIndex;
    if (correct) {
      setMcqScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }
    recordTopic(q.topic, correct);
    setReview((r) => [...r, { q, picked: i, correct }]);
  }

  function next(
    updatedAnswers?: ScenarioAns[],
    updatedReview?: { q: Question; picked: number | null; correct: boolean }[]
  ) {
    const finalAnswers = updatedAnswers || scenarioAnswers;
    const finalRev = updatedReview || review;

    // If reached end of test (10 questions)
    if (idx + 1 >= 10) {
      finish(finalAnswers, finalRev);
      return;
    }

    // If next question is already prefetched in memory, advance immediately
    if (questions[idx + 1]) {
      setIdx((prev) => prev + 1);
      setPicked(null);
      setScenarioText("");
    } else {
      // Background fetch is still finishing up; show seamless micro-loader
      setWaitingNext(true);
    }
  }

  function handleScenarioSubmit() {
    if (!q || q.kind !== "scenario") return;
    if (timerRef.current) clearInterval(timerRef.current);
    const ans = scenarioText.trim() || "(koi answer nahi likha)";
    const newAnswers: ScenarioAns[] = [
      ...scenarioAnswers,
      {
        questionId: q.id,
        answer: ans,
        title: q.title,
        situation: q.situation,
        prompt: q.prompt,
        keywords: q.keywords,
        redFlags: q.redFlags,
        ideal: q.ideal,
        topic: q.topic,
      },
    ];
    const newReview = [...review, { q, picked: null, correct: false }];
    setScenarioAnswers(newAnswers);
    setReview(newReview);
    next(newAnswers, newReview);
  }

  async function finish(finalAnswers = scenarioAnswers, finalReview = review) {
    cancelPrefetchRef.current = true;
    const finalName = (name || "").trim() || getPlayerName() || "Player";
    setName(finalName);
    setPlayerName(finalName);
    setPhase("result");
    setLoadingVerdict(true);

    let data: VerdictData | null = null;
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: finalName,
          difficulty,
          mcqScore,
          strongTopics: strong,
          weakTopics: weak,
          scenarioAnswers: finalAnswers,
        }),
        signal: AbortSignal.timeout(16000),
      });
      if (res.ok) {
        data = (await res.json()) as VerdictData;
      }
    } catch {
      // Network failed or offline fallback
    }

    // Local rule-based scoring & verdict fallback if offline
    if (!data || !data.verdict) {
      const scenarioResults = finalAnswers.map((a) => {
        const s: Scenario = {
          kind: "scenario",
          id: a.questionId,
          topic: (a.topic as Topic) || "Risk",
          difficulty,
          title: a.title || "Real-world Scenario",
          situation: a.situation || "Market scenario evaluation",
          prompt: a.prompt || "Tum kya karoge aur kyun? Apna decision likho.",
          keywords: a.keywords || ["sip", "invest", "long term"],
          redFlags: a.redFlags || ["panic", "sell all"],
          ideal: a.ideal || "Long term discipline aur emergency planning zaroori hai.",
          hint: "",
        };
        return scoreScenario(s, a.answer);
      });
      const scenarioScore = scenarioResults.reduce((acc, r) => acc + r.score, 0);
      const totalScore = mcqScore + scenarioScore;
      const fallback = buildVerdict({
        playerName: finalName,
        totalScore,
        mcqScore,
        scenarioResults,
        strongTopics: strong,
        weakTopics: weak,
      });
      data = {
        totalScore,
        mcqScore,
        scenarioScore,
        aiUsed: false,
        scenarioResults,
        ...fallback,
      };
    }

    setVerdict(data);
    setLoadingVerdict(false);

    // Save score directly to PostgreSQL Database across all devices
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: finalName,
          difficulty,
          score: data.totalScore,
          mcq_score: data.mcqScore,
          scenario_score: data.scenarioScore,
          correct_count: correctCount,
          total_questions: 10,
          grade: gradeFor(data.totalScore),
          risk_profile: data.riskProfile,
          verdict: data.verdict,
          answers: finalReview,
        }),
      });
    } catch (err) {
      console.error("[Save Attempt DB Error]:", err);
    }
  }

  const ring = useMemo(() => {
    const score = verdict?.totalScore || 0;
    const r = 52;
    const c = 2 * Math.PI * r;
    return { r, c, offset: c - (score / 100) * c };
  }, [verdict]);

  // ---- INTRO SCREEN ----
  if (phase === "intro") {
    if (generating) {
      return (
        <div className="space-y-4">
          <div className="card pop p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30">
              <Sparkles className="animate-pulse text-[#34d399]" size={34} />
            </div>
            <h2 className="text-[23px] font-black tracking-tight text-white">Your test is loading...</h2>
            <p className="muted mx-auto max-w-[320px] text-[14px] leading-relaxed">
              Preparing your personalized Investor IQ test...
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <span className="chip" style={{ color: "#34d399" }}>🎯 Real-time Adaptive</span>
              <span className="chip" style={{ color: "#f59e0b" }}>⚡ Difficulty: {difficulty}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="card pop p-5">
          <div className="chip" style={{ color: "#f59e0b" }}>
            🎯 INVESTOR IQ TEST • 10 QUESTIONS
          </div>
          <h1 className="mt-3 text-[26px] font-black leading-tight">
            Apna Investor IQ<br />check karo
          </h1>
          <p className="muted mt-1 text-[14px]">
            7 MCQ + 3 real-life practical scenarios. Har test real-time me fresh generate hota hai!
          </p>

          <div className="mt-4 flex items-center justify-between">
            <label className="text-[13px] font-bold">Tumhara naam (leaderboard ke liye)</label>
            {name.trim() ? (
              <span className="text-[11px] font-bold text-[#34d399] flex items-center gap-1">
                ✓ Saved
              </span>
            ) : null}
          </div>
          <input
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val);
              setPlayerName(val.trim());
            }}
            placeholder="e.g. Rahul Sharma"
            maxLength={20}
            className="mt-1 w-full rounded-2xl border bg-[#0d1f16] px-4 py-3.5 outline-none focus:border-[#10b981] transition-colors"
            style={{ borderColor: "#1e3a2c" }}
          />

          <label className="mt-4 block text-[13px] font-bold">Level chuno</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="rounded-2xl border px-2 py-3 text-[13px] font-black capitalize transition-all"
                style={{
                  borderColor: difficulty === d ? "#10b981" : "#1e3a2c",
                  background: difficulty === d ? "rgba(16,185,129,.18)" : "#0d1f16",
                }}
              >
                {d === "beginner" ? "🌱 Beginner" : d === "intermediate" ? "📈 Intermediate" : "🏆 Advanced"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px] font-bold">
            <div className="card2 p-2.5">
              ⏱️ MCQ 30s<br /><span className="muted">Scenario 2 min</span>
            </div>
            <div className="card2 p-2.5">
              💯 Total 100<br /><span className="muted">MCQ 70 + Scenarios 30</span>
            </div>
            <div className="card2 p-2.5">
              ⚡ Instant Stream<br /><span className="muted">10 Unique Ques</span>
            </div>
          </div>

          <button
            className="btn-primary mt-4 flex items-center justify-center gap-2"
            onClick={start}
            disabled={generating}
          >
            <Play size={19} /> Start Test
          </button>
          <Link href="/learn" className="btn-ghost mt-2 w-full text-center block">
            Pehle thoda seekh lun → Learn
          </Link>
        </div>
      </div>
    );
  }

  // ---- RESULT SCREEN ----
  if (phase === "result") {
    return (
      <div className="space-y-4">
        <div className="card pop p-5 text-center">
          <div className="chip" style={{ color: "#f59e0b" }}>
            🏁 TEST COMPLETE
          </div>
          {loadingVerdict || !verdict ? (
            <div className="py-8 space-y-3">
              <Sparkles className="mx-auto animate-pulse text-[#34d399]" size={36} />
              <p className="font-bold text-[16px]">Evaluating your decisions…</p>
              <p className="muted text-[13px]">Analyzing scenario answers and calculating Investor IQ</p>
            </div>
          ) : (
            <>
              <div className="relative mx-auto mt-4 h-[132px] w-[132px]">
                <svg className="score-ring" width="132" height="132" viewBox="0 0 132 132">
                  <circle cx="66" cy="66" r={ring.r} fill="none" stroke="#12291d" strokeWidth="11" />
                  <circle
                    cx="66"
                    cy="66"
                    r={ring.r}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={ring.c}
                    strokeDashoffset={ring.offset}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <div className="text-[32px] font-black leading-none">{verdict.totalScore}</div>
                    <div className="muted text-[11px] font-bold">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[19px] font-black">{gradeFor(verdict.totalScore)}</div>
              <div className="mt-1 flex justify-center gap-2">
                <span className="chip">MCQ {verdict.mcqScore}/70</span>
                <span className="chip">Scenario {verdict.scenarioScore}/30</span>
                <span className="chip" style={{ color: "#34d399" }}>AI Evaluation</span>
              </div>
              <div className="card2 mt-4 p-4 text-left">
                <div className="flex items-center gap-2 font-black">
                  <Sparkles size={16} style={{ color: "#f59e0b" }} /> Investor Verdict
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed">{verdict.verdict}</p>
                <div className="mt-2 chip" style={{ color: "#7dd3fc" }}>
                  Risk Profile: {verdict.riskProfile}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                <div className="card2 p-3">
                  <div className="font-black text-[13px]" style={{ color: "#34d399" }}>
                    ✅ Strengths
                  </div>
                  {verdict.strengths.map((s) => (
                    <div key={s} className="mt-1 text-[12.5px] leading-snug">
                      • {s}
                    </div>
                  ))}
                </div>
                <div className="card2 p-3">
                  <div className="font-black text-[13px]" style={{ color: "#fbbf24" }}>
                    🎯 Improve
                  </div>
                  {verdict.weaknesses.map((s) => (
                    <div key={s} className="mt-1 text-[12.5px] leading-snug">
                      • {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card2 mt-3 p-3 text-left">
                <div className="font-black text-[13px]">📌 Action Plan</div>
                {verdict.recommendations.map((s) => (
                  <div key={s} className="mt-1 text-[13px]">
                    • {s}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {verdict && (
          <div className="card p-4">
            <h2 className="font-black text-[16px]">Scenario Feedback — Real-world Analysis</h2>
            {verdict.scenarioResults.map((r) => (
              <div key={r.questionId} className="card2 mt-2.5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[14px]">{r.title}</b>
                  <span className="chip">{r.score}/10</span>
                </div>
                <div className="muted mt-1 text-[12.5px] italic">
                  “{r.answer.slice(0, 160)}
                  {r.answer.length > 160 ? "…" : ""}”
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed">{r.feedback}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card p-4">
          <h2 className="font-black text-[16px]">MCQ Review — Detailed Explanations</h2>
          {review
            .filter((r) => r.q.kind === "mcq")
            .map((r, i) => {
              const m = r.q.kind === "mcq" ? r.q : null;
              if (!m) return null;
              const originalIndex = questions.findIndex((item) => item?.id === m.id);
              return (
                <details key={m.id} className="card2 mt-2.5 p-3.5">
                  <summary className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                    <span style={{ color: r.correct ? "#34d399" : "#f87171" }}>
                      {r.correct ? <Check size={17} /> : <X size={17} />}
                    </span>
                    <span className="flex-1">
                      Question {originalIndex >= 0 ? originalIndex + 1 : i + 1}. {m.question}
                    </span>
                    <ChevronRight size={15} className="muted" />
                  </summary>
                  <div className="mt-2 space-y-1.5 text-[13.5px]">
                    {m.options.map((o, oi) => (
                      <div
                        key={oi}
                        className="rounded-xl px-3 py-2"
                        style={{
                          background:
                            oi === m.correctIndex
                              ? "rgba(16,185,129,.15)"
                              : r.picked === oi
                              ? "rgba(248,113,113,.13)"
                              : "#0d1f16",
                        }}
                      >
                        {oi === m.correctIndex ? "✅ " : r.picked === oi ? "❌ " : "• "}
                        {o}
                      </div>
                    ))}
                  </div>
                  <p className="muted mt-2 text-[13px] leading-relaxed">💡 {m.explanation}</p>
                </details>
              );
            })}
        </div>

        <div className="flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              setPhase("intro");
            }}
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw size={17} /> Dobara Khelo
            </span>
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              const score = verdict?.totalScore || 0;
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const t = `FinQuest: maine ${score}/100 score kiya! ${gradeFor(score)} — tum bhi try karo: ${origin}`;
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ title: "FinQuest InvestIQ", text: t, url: origin }).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(t);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
          >
            <Share2 size={17} /> {copied ? "Copied!" : "Share"}
          </button>
        </div>
        <Link href="/learn" className="btn-gold flex items-center justify-center gap-2">
          <BookOpen size={17} /> Weak topics seekho →
        </Link>
        <Link href="/leaderboard" className="btn-ghost w-full flex items-center justify-center gap-2">
          <Trophy size={16} /> Leaderboard dekho
        </Link>
      </div>
    );
  }

  // ---- PLAYING / QUESTION SCREEN ----
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[13px] font-black">
        <span>
          Question {idx + 1} / 10 • {isMcq ? "MCQ" : "SCENARIO ✍️"}
        </span>
        <span className="chip" style={{ color: timeLeft <= 10 ? "#f87171" : "#eafff3" }}>
          <Clock size={13} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="chip" style={{ color: "#f59e0b" }}>
          Score {mcqScore}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {waitingNext ? (
        <div className="card pop p-8 text-center space-y-3">
          <Sparkles className="mx-auto animate-pulse text-[#34d399]" size={32} />
          <h3 className="text-[18px] font-bold text-white">Preparing question {idx + 2}...</h3>
          <p className="muted text-[13px]">Personalizing your next challenge...</p>
        </div>
      ) : q ? (
        <div key={q.id} className="card pop p-5">
          <div className="flex gap-2">
            <span className="chip">{q.topic}</span>
            <span className="chip capitalize">{q.difficulty}</span>
          </div>

          {isMcq && q.kind === "mcq" ? (
            <>
              <h2 className="mt-3 text-[19px] font-black leading-snug">{q.question}</h2>
              <div className="mt-4 space-y-2.5">
                {q.options.map((o, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isPicked = picked === i;
                  const cls =
                    picked === null
                      ? ""
                      : isCorrect
                      ? "opt-correct"
                      : isPicked
                      ? "opt-wrong"
                      : "opt-dim";
                  return (
                    <button
                      key={i}
                      disabled={picked !== null}
                      onClick={() => handleMcqPick(i)}
                      className={`opt ${cls}`}
                    >
                      <span className="mr-2 font-black" style={{ color: "#f59e0b" }}>
                        {["A", "B", "C"][i]}.
                      </span>
                      {o}
                      {picked !== null && isCorrect ? " ✅" : picked !== null && isPicked ? " ❌" : ""}
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div className="pop mt-4">
                  <div
                    className="card2 p-3.5 text-[14px] leading-relaxed"
                    style={{
                      borderColor: picked === q.correctIndex ? "#10b981" : "#f87171",
                    }}
                  >
                    <b>
                      {picked === q.correctIndex
                        ? "✅ Sahi jawab! +10"
                        : picked === -1
                        ? "⏰ Time up! Sahi jawab:"
                        : "❌ Galat — sahi jawab:"}
                    </b>
                    {picked !== q.correctIndex && (
                      <div className="mt-1 font-bold" style={{ color: "#34d399" }}>
                        {q.options[q.correctIndex]}
                      </div>
                    )}
                    <p className="muted mt-2">💡 {q.explanation}</p>
                  </div>
                  <button className="btn-primary mt-3" onClick={() => next()}>
                    {idx + 1 >= 10 ? "Result Dekho →" : "Next Question →"}
                  </button>
                </div>
              )}

              {picked === null && (
                <p className="muted mt-3 text-center text-[12.5px]">
                  Ek option chuno — turant pata chalega sahi hai ya galat.
                </p>
              )}
            </>
          ) : q.kind === "scenario" ? (
            <>
              <h2 className="mt-3 text-[19px] font-black leading-snug">{q.title}</h2>
              <p className="mt-2 rounded-2xl bg-[#12291d] p-3.5 text-[14.5px] leading-relaxed">
                🎬 {q.situation}
              </p>
              <p className="mt-3 font-bold text-[15px]">{q.prompt}</p>
              <textarea
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                rows={5}
                placeholder="Apna answer yahan likho… kya karoge aur kyun? (kam se kam 2-3 lines)"
                className="mt-3 w-full rounded-2xl border bg-[#0d1f16] p-4 outline-none focus:border-[#10b981]"
                style={{ borderColor: "#1e3a2c" }}
              />
              <div className="mt-1 flex justify-between text-[12px]">
                <span className="muted">💡 Hint: {q.hint}</span>
                <span className="font-bold">
                  {scenarioText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <button
                className="btn-primary mt-3"
                onClick={handleScenarioSubmit}
                disabled={scenarioText.trim().length < 10}
              >
                {idx + 1 >= 10 ? "Submit & Result Dekho →" : "Submit & Next →"}
              </button>
              <p className="muted mt-2 text-center text-[12px]">
                Kam se kam 10 characters likho. End me iska evaluation + feedback milega.
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <div className="card pop p-8 text-center space-y-3">
          <Sparkles className="mx-auto animate-pulse text-[#34d399]" size={32} />
          <h3 className="text-[18px] font-bold text-white">Preparing question {idx + 1}...</h3>
          <p className="muted text-[13px]">Personalizing your question...</p>
        </div>
      )}

      <p className="muted text-center text-[12px]">
        Har test me real-time questions generate hote hain — har run completely unique hota hai.
      </p>
    </div>
  );
}
