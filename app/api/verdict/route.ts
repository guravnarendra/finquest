import { NextResponse } from "next/server";
import { buildVerdict, scoreScenario, type ScenarioResult } from "@/lib/scoring";
import { SCENARIOS, type Scenario, type Topic, type Difficulty } from "@/lib/questions";
import { getLlmConfig } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ScenarioPayload = {
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

type Body = {
  playerName?: string;
  difficulty?: string;
  mcqScore?: number;
  totalMcq?: number;
  strongTopics?: string[];
  weakTopics?: string[];
  scenarioAnswers?: ScenarioPayload[];
};

async function llmVerdict(body: Body, scenarioResults: ScenarioResult[], mcqScore: number) {
  const { apiKey: key, baseUrl: base, model } = getLlmConfig();
  if (!key) return null;
  const total = mcqScore + scenarioResults.reduce((a, r) => a + r.score, 0);
  const prompt = `You are a friendly Indian financial-literacy coach. A player just finished a 10-question investing quiz (7 MCQ out of 70, 3 scenario answers out of 30). Total score ${total}/100, MCQ ${mcqScore}/70. Strong topics: ${(body.strongTopics || []).join(", ") || "none"}. Weak topics: ${(body.weakTopics || []).join(", ") || "none"}. Scenario feedback: ${scenarioResults.map((r) => `${r.title}: ${r.score}/10 — ${r.feedback}`).join(" | ")}. Reply ONLY as JSON: {"verdict":"2-3 sentences in simple Hinglish (Hindi in Roman + English mix), encouraging, specific","strengths":["...","..."],"weaknesses":["...","..."],"riskProfile":"Conservative — Pehle Seekho | Balanced — Cautious | Balanced — Growth Ready","recommendations":["...","...","..."]}`;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.7 }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const scenarioResults: ScenarioResult[] = (body.scenarioAnswers || []).map((a) => {
      let s = SCENARIOS.find((x: Scenario) => x.id === a.questionId);
      if (!s && a.situation) {
        s = {
          kind: "scenario",
          id: a.questionId,
          topic: (a.topic as Topic) || "Risk",
          difficulty: (body.difficulty as Difficulty) || "beginner",
          title: a.title || "Scenario Question",
          situation: a.situation,
          prompt: a.prompt || "Tum kya karoge aur kyun? Apna decision likho.",
          keywords: Array.isArray(a.keywords) ? a.keywords : ["sip", "invest", "long term", "average", "patience"],
          redFlags: Array.isArray(a.redFlags) ? a.redFlags : ["panic sell", "sab bech do"],
          ideal: a.ideal || "Long term discipline aur emergency fund zaroori hai.",
          hint: "",
        };
      }
      if (!s) {
        return {
          questionId: a.questionId,
          topic: "General",
          title: a.title || "Scenario",
          answer: a.answer,
          score: 6,
          feedback: "Smart decision and discipline noted.",
        };
      }
      return scoreScenario(s, a.answer);
    });

    const mcqScore = body.mcqScore || 0;
    const totalScore = mcqScore + scenarioResults.reduce((a, r) => a + r.score, 0);
    const fallback = buildVerdict({
      playerName: body.playerName || "Player",
      totalScore,
      mcqScore,
      scenarioResults,
      strongTopics: body.strongTopics || [],
      weakTopics: body.weakTopics || [],
    });

    const llm = await llmVerdict(body, scenarioResults, mcqScore);
    const verdict =
      llm && llm.verdict
        ? {
            verdict: llm.verdict,
            strengths: llm.strengths || fallback.strengths,
            weaknesses: llm.weaknesses || fallback.weaknesses,
            riskProfile: llm.riskProfile || fallback.riskProfile,
            recommendations: llm.recommendations || fallback.recommendations,
          }
        : fallback;

    return NextResponse.json({
      totalScore,
      mcqScore,
      scenarioScore: scenarioResults.reduce((a, r) => a + r.score, 0),
      scenarioResults,
      aiUsed: !!llm,
      ...verdict,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
