import { NextResponse } from "next/server";
import { type Difficulty, type Question, type Topic, TOPICS } from "@/lib/questions";
import { getLlmConfig } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function pickTopic(usedTopics: string[]): Topic {
  const unused = TOPICS.filter((t) => !usedTopics.includes(t));
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

async function generateSingleQuestionWithLlm(
  index: number,
  diff: Difficulty,
  topic: Topic
): Promise<Question | null> {
  const { apiKey, baseUrl, model } = getLlmConfig();
  if (!apiKey) return null;

  const isMcq = index < 7;
  const prompt = isMcq
    ? `You are a financial literacy quiz game designer for young Indian investors.
Generate exactly 1 fresh MCQ quiz question in simple, natural Hinglish (Hindi written in English alphabet).
Topic: ${topic}
Difficulty level: ${diff}
Question index: ${index + 1} of 10.

REQUIREMENTS:
- kind: "mcq"
- id: "q-${index + 1}-${Date.now().toString(36)}"
- topic: "${topic}"
- difficulty: "${diff}"
- question: Engaging 1-sentence question in Hinglish.
- options: Exactly 3 distinct options [option 0, option 1, option 2].
- correctIndex: 0, 1, or 2.
- explanation: Clear 1-2 sentence explanation in Hinglish why this is correct.

Reply ONLY with valid raw JSON object. Do not wrap in markdown or add notes.
Format:
{"kind":"mcq","id":"...","topic":"${topic}","difficulty":"${diff}","question":"...","options":["...","...","..."],"correctIndex":0,"explanation":"..."}`
    : `You are a financial literacy coach for young Indian investors.
Generate exactly 1 realistic real-life investing scenario challenge in natural Hinglish (Hindi in English alphabet).
Topic: ${topic}
Difficulty level: ${diff}
Scenario number: ${index - 6} of 3.

REQUIREMENTS:
- kind: "scenario"
- id: "sc-${index + 1}-${Date.now().toString(36)}"
- topic: "${topic}"
- difficulty: "${diff}"
- title: Short catchy title in Hinglish (e.g. "Market crash me SIP roke ya continue karein?")
- situation: Realistic 2-3 sentence Indian practical situation (salary, friend tip, crash, emergency, tax, etc.)
- prompt: "Tum kya karoge aur kyun? Apna decision likho."
- keywords: 4-6 smart lowercase keywords a good answer should mention (e.g. ["sip", "long term", "average", "patience"])
- redFlags: 2-4 panic/bad advice phrases (e.g. ["panic sell", "sab bech do", "loan lo"])
- ideal: 1-2 sentence ideal financial decision
- hint: Short 1-sentence thought-starter hint

Reply ONLY with valid raw JSON object. Do not wrap in markdown or add notes.
Format:
{"kind":"scenario","id":"...","topic":"${topic}","difficulty":"${diff}","title":"...","situation":"...","prompt":"Tum kya karoge aur kyun? Apna decision likho.","keywords":["..."],"redFlags":["..."],"ideal":"...","hint":"..."}`;

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
        max_tokens: isMcq ? 400 : 550,
      }),
      signal: AbortSignal.timeout(14000),
    });

    if (!res.ok) {
      console.warn(`[Single Question LLM] Status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || "";
    const startIdx = rawText.indexOf("{");
    const endIdx = rawText.lastIndexOf("}");
    if (startIdx === -1 || endIdx === -1) return null;

    const parsed = JSON.parse(rawText.slice(startIdx, endIdx + 1));

    if (isMcq) {
      if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 3) {
        return null;
      }
      const cIdx = [0, 1, 2].includes(parsed.correctIndex) ? parsed.correctIndex : 0;
      return {
        kind: "mcq",
        id: parsed.id || `q-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
        topic,
        difficulty: diff,
        question: parsed.question,
        options: [String(parsed.options[0]), String(parsed.options[1]), String(parsed.options[2])],
        correctIndex: cIdx as 0 | 1 | 2,
        explanation: parsed.explanation || "Correct option selected.",
      };
    } else {
      if (!parsed.situation) return null;
      return {
        kind: "scenario",
        id: parsed.id || `sc-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
        topic,
        difficulty: diff,
        title: parsed.title || "Real-world Scenario",
        situation: parsed.situation,
        prompt: parsed.prompt || "Tum kya karoge aur kyun? Apna decision likho.",
        keywords: Array.isArray(parsed.keywords) && parsed.keywords.length > 0
          ? parsed.keywords.map(String)
          : ["sip", "invest", "long term", "patience"],
        redFlags: Array.isArray(parsed.redFlags) && parsed.redFlags.length > 0
          ? parsed.redFlags.map(String)
          : ["panic sell", "sab bech do"],
        ideal: parsed.ideal || "Long-term financial discipline aur emergency planning zaroori hai.",
        hint: parsed.hint || "Socho: long-term me wealth create karne ka sabse smart tarika kya hai?",
      };
    }
  } catch (err) {
    console.warn(
      `[Single Question LLM Error for idx ${index}]:`,
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

/**
 * Real-time algorithmic procedural generation in case of network timeout.
 * Dynamically constructs unique questions with randomized figures and logic on the fly.
 */
function generateProceduralQuestion(index: number, diff: Difficulty, topic: Topic): Question {
  const id = `dyn-${index + 1}-${Math.random().toString(36).slice(2, 8)}`;
  const amounts = [3000, 5000, 10000, 15000];
  const amt = amounts[Math.floor(Math.random() * amounts.length)];
  const years = [5, 10, 15, 20];
  const yr = years[Math.floor(Math.random() * years.length)];

  if (index < 7) {
    if (topic === "Compounding") {
      return {
        kind: "mcq",
        id,
        topic,
        difficulty: diff,
        question: `₹${amt.toLocaleString("en-IN")}/month ki SIP ${yr} saal tak 12% annual return par chalayein, to sabse bada wealth driver kya hoga?`,
        options: [
          "Sirf invested amount ka size",
          "Compounding — return par milne wala return jo time ke saath exponential hota hai",
          "Daily market ko time karna",
        ],
        correctIndex: 1,
        explanation: "Compounding me time sabse powerful factor hai. Jitna lamba samay paisa compound hota hai, corpus utna bada banta hai.",
      };
    }
    if (topic === "SIP") {
      return {
        kind: "mcq",
        id,
        topic,
        difficulty: diff,
        question: "Market crash ke dauran SIP continue rakhne ka sabse bada scientific fayda kya hai?",
        options: [
          "Har crash me guaranteed double return milta hai",
          "Rupee-Cost Averaging — saste NAV par automatically zyada units milte hain",
          "Tax zero ho jata hai",
        ],
        correctIndex: 1,
        explanation: "Rupee-cost averaging se market dip par aapko saste me zyada units milte hain, jo recovery me profit ko boost karte hain.",
      };
    }
    if (topic === "Inflation") {
      return {
        kind: "mcq",
        id,
        topic,
        difficulty: diff,
        question: "Agar inflation 6% hai aur aapka investment 6% return de raha hai, to real wealth growth kitni hui?",
        options: [
          "6% ki solid kamai",
          "0% real return — purchasing power wahi ki wahi rahi",
          "12% total return",
        ],
        correctIndex: 1,
        explanation: "Real Return = Nominal Return - Inflation. Agar return aur inflation barabar hain, to purchasing power me koi badhotari nahi hui.",
      };
    }
    if (topic === "Emergency Fund") {
      return {
        kind: "mcq",
        id,
        topic,
        difficulty: diff,
        question: "Financial experts ke mutabik ek smart emergency fund kahan park hona chahiye?",
        options: [
          "High risk small-cap stocks me",
          "Liquid fund ya High-yield savings/sweep-in FD me jahan capital safe ho aur turant mile",
          "Crypto aur NFT me",
        ],
        correctIndex: 1,
        explanation: "Emergency fund ka goal capital safety aur instant liquidity hota hai, returns kamana nahi.",
      };
    }
    if (topic === "Tax") {
      return {
        kind: "mcq",
        id,
        topic,
        difficulty: diff,
        question: "Equity investments par Long-Term Capital Gains (LTCG) tax kab lagta hai?",
        options: [
          "Shares ko 1 saal se zyada hold karke bechne par hone wale munafay par",
          "Same day intra-day trade karne par",
          "Dividend account me aate hi 50% tax",
        ],
        correctIndex: 0,
        explanation: "Listed equity me 12 mahine se zyada hold karne par LTCG lagta hai (current rules me 12.5% above exemption limit).",
      };
    }
    return {
      kind: "mcq",
      id,
      topic,
      difficulty: diff,
      question: `${topic} ke sandarbh me disciplined long-term investing ka basic rule kya hai?`,
      options: [
        "Emotion aur panic ke bajaye strategic asset allocation aur patience maintain karna",
        "WhatsApp tips dekh kar har hafte poora portfolio badalna",
        "Short-term noise par react karke panic selling karna",
      ],
      correctIndex: 0,
      explanation: "Disciplined investing aur clear asset allocation hi market volatility ke dauran consistent wealth create karta hai.",
    };
  }

  // Scenarios (index 7, 8, 9)
  return {
    kind: "scenario",
    id,
    topic,
    difficulty: diff,
    title: `${topic}: Achanak Market Fall me Strategy`,
    situation: `Aap ₹${amt.toLocaleString("en-IN")}/month invest kar rahe hain. Achanak market 15% neeche aata hai aur friends bol rahe hain 'sab nikal lo, aur girega'. Aapka time horizon 7+ saal ka hai.`,
    prompt: "Tum kya karoge aur kyun? Apna decision likho.",
    keywords: ["sip", "continue", "long term", "average", "patience", "units", "discipline"],
    redFlags: ["panic sell", "sab bech", "loan lo", "tips"],
    ideal: "SIP continue rakhna chahiye kyunki market dip par saste NAV me zyada units milte hain aur 7+ saal me recovery strong hoti hai.",
    hint: "Socho: kya 7 saal ke goal me temporary 15% dip par panic sell karna samajhdari hai?",
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const index = Math.max(0, Math.min(9, parseInt(url.searchParams.get("index") || "0", 10)));
  const diffParam = url.searchParams.get("difficulty") || "beginner";
  const difficulty: Difficulty = ["beginner", "intermediate", "advanced"].includes(diffParam)
    ? (diffParam as Difficulty)
    : "beginner";

  const usedTopicsParam = url.searchParams.get("usedTopics") || "";
  const usedTopics = usedTopicsParam
    ? usedTopicsParam.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const topic = pickTopic(usedTopics);

  // 1. Try real-time LLM generation for this single question
  const aiQ = await generateSingleQuestionWithLlm(index, difficulty, topic);

  if (aiQ) {
    return NextResponse.json({
      success: true,
      source: "ai",
      index,
      question: aiQ,
    });
  }

  // 2. Procedural algorithmic generation (instant fallback if LLM is unreachable)
  const proceduralQ = generateProceduralQuestion(index, difficulty, topic);
  return NextResponse.json({
    success: true,
    source: "procedural",
    index,
    question: proceduralQ,
  });
}
