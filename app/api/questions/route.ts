import { NextResponse } from "next/server";
import { pickTest, type Difficulty, type Question, type Mcq, type Scenario, type Topic } from "@/lib/questions";
import { getLlmConfig } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TOPICS: Topic[] = [
  "SIP",
  "Mutual Funds",
  "Stocks",
  "Risk",
  "Compounding",
  "Inflation",
  "Diversification",
  "Emergency Fund",
  "Tax",
];

async function generateQuestionsWithLlm(diff: Difficulty): Promise<Question[] | null> {
  const { apiKey, baseUrl, model } = getLlmConfig();
  if (!apiKey) return null;

  const prompt = `You are a financial literacy quiz game designer for Indian young investors and students.
Generate a fresh, unique 10-question investing quiz in natural, simple Hinglish (Hindi written in Roman English script).
Level: ${diff} (difficulty: ${diff}).
Topics must be chosen from: SIP, Mutual Funds, Stocks, Risk, Compounding, Inflation, Diversification, Emergency Fund, Tax.

REQUIREMENTS:
1. Exactly 7 MCQs (kind: "mcq"):
   - id: unique string (e.g. "ai-m1", "ai-m2", etc.)
   - topic: valid topic from the list
   - difficulty: "${diff}"
   - question: engaging question in Hinglish
   - options: exactly 3 distinct choices [choice 0, choice 1, choice 2]
   - correctIndex: integer 0, 1, or 2 pointing to the correct option
   - explanation: clear 1-2 sentence explanation in Hinglish of why it is right

2. Exactly 3 real-world scenarios (kind: "scenario"):
   - id: unique string (e.g. "ai-s1", "ai-s2", "ai-s3")
   - topic: valid topic from the list
   - difficulty: "${diff}"
   - title: short catchy title in Hinglish (e.g. "Market crash me kya karoge?", "Job chali gayi — ab kya?")
   - situation: realistic 2-3 sentence Indian scenario (salary, market drop, friend's tip, emergency, etc.)
   - prompt: "Tum kya karoge aur kyun? Apna decision likho."
   - keywords: array of 5-8 smart keywords a good answer should mention (lowercase, e.g. ["sip", "emergency", "liquid fund", "long term", "average", "patience"])
   - redFlags: array of 3-5 panic/bad advice phrases (lowercase, e.g. ["panic sell", "loan lo", "sab bech do", "tips le lo"])
   - ideal: 1-2 sentence ideal answer
   - hint: short helpful hint

Reply ONLY with a raw JSON object containing the "questions" array. Do NOT wrap in markdown code blocks or add any other text.
Format:
{"questions": [ ... 7 mcqs, followed by 3 scenarios ... ]}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.warn(`[LLM Questions] API responded with HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || "";
    const startIdx = rawText.indexOf("{");
    const endIdx = rawText.lastIndexOf("}");
    if (startIdx === -1 || endIdx === -1) return null;

    const parsed = JSON.parse(rawText.slice(startIdx, endIdx + 1));
    if (!Array.isArray(parsed.questions) || parsed.questions.length < 10) return null;

    // Validate and sanitize the generated questions
    const sanitized: Question[] = [];

    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      if (sanitized.length < 7 && q.kind === "mcq" && Array.isArray(q.options) && q.options.length >= 3) {
        const cIdx = typeof q.correctIndex === "number" && [0, 1, 2].includes(q.correctIndex) ? q.correctIndex : 0;
        const topic: Topic = VALID_TOPICS.includes(q.topic) ? q.topic : "SIP";
        sanitized.push({
          kind: "mcq",
          id: q.id || `ai-m${sanitized.length + 1}`,
          topic,
          difficulty: diff,
          question: q.question,
          options: [String(q.options[0]), String(q.options[1]), String(q.options[2])],
          correctIndex: cIdx as 0 | 1 | 2,
          explanation: q.explanation || "Correct answer explained.",
        });
      } else if (sanitized.length >= 7 && sanitized.length < 10 && q.kind === "scenario" && q.situation) {
        const topic: Topic = VALID_TOPICS.includes(q.topic) ? q.topic : "Risk";
        sanitized.push({
          kind: "scenario",
          id: q.id || `ai-s${sanitized.length - 6}`,
          topic,
          difficulty: diff,
          title: q.title || "Real-life Scenario",
          situation: q.situation,
          prompt: q.prompt || "Tum kya karoge aur kyun? Apna decision likho.",
          keywords: Array.isArray(q.keywords) ? q.keywords.map(String) : ["sip", "invest", "long term"],
          redFlags: Array.isArray(q.redFlags) ? q.redFlags.map(String) : ["panic", "sell all"],
          ideal: q.ideal || "Long term discipline aur emergency planning zaroori hai.",
          hint: q.hint || "Socho: long term me kya best hoga?",
        });
      }
    }

    if (sanitized.length === 10) {
      return sanitized;
    }
    return null;
  } catch (err) {
    console.warn("[LLM Questions Generation Error]:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const diffParam = url.searchParams.get("difficulty") || "beginner";
  const difficulty: Difficulty = ["beginner", "intermediate", "advanced"].includes(diffParam)
    ? (diffParam as Difficulty)
    : "beginner";

  // Attempt live AI generation first
  const aiQuestions = await generateQuestionsWithLlm(difficulty);

  if (aiQuestions && aiQuestions.length === 10) {
    return NextResponse.json({
      source: "ai",
      count: aiQuestions.length,
      questions: aiQuestions,
    });
  }

  // Graceful fallback to randomized bank questions
  const fallback = pickTest(difficulty);
  return NextResponse.json({
    source: "bank",
    count: fallback.length,
    questions: fallback,
  });
}
