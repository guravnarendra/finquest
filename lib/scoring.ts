// Rule-based scenario scoring + AI verdict fallback.
// Used by /api/verdict when no LLM key is set, so the app works out of
// the box. The LLM route (when configured) replaces the verdict text,
// but scenario scores always come from here for consistency.

import type { Scenario } from "./questions";

export type ScenarioResult = {
  questionId: string;
  topic: string;
  title: string;
  answer: string;
  score: number; // 0-10
  feedback: string;
};

export function scoreScenario(s: Scenario, answer: string): ScenarioResult {
  const text = (answer || "").toLowerCase().trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 5) {
    return { questionId: s.id, topic: s.topic, title: s.title, answer, score: 1, feedback: `Answer bahut chhota tha (${words} words). Apni reasoning likho — kya karoge aur kyun, dono batao.` };
  }
  const hits = s.keywords.filter((k) => text.includes(k.toLowerCase()));
  const flags = s.redFlags.filter((f) => text.includes(f.toLowerCase()));
  let score = 3 + Math.min(5, hits.length); // 3 base + up to 5 for concepts
  if (words >= 40) score += 1;
  if (words >= 80) score += 1;
  score -= Math.min(3, flags.length * 2);
  score = Math.max(1, Math.min(10, score));
  const feedback =
    score >= 8
      ? `Strong answer — tumne ${hits.slice(0, 3).join(", ")} jaise sahi concepts use kiye. Ideal approach: ${s.ideal}`
      : score >= 5
        ? `Sahi direction me ho, par thoda aur depth chahiye. Ideal approach: ${s.ideal}`
        : `Isme main concept miss ho gaya. Ideal approach: ${s.ideal}`;
  return { questionId: s.id, topic: s.topic, title: s.title, answer, score, feedback };
}

export function gradeFor(score: number): string {
  if (score >= 85) return "Pro Investor 🏆";
  if (score >= 70) return "Smart Saver 🟢";
  if (score >= 50) return "Learning Investor 📈";
  if (score >= 30) return "Beginner 🌱";
  return "Newbie — Start Fresh 🔰";
}

export function riskProfileFor(scenarioAvg: number, mcqScore: number): string {
  // High scenario score = calm, long-term thinking = Balanced/Aggressive-ready.
  // Low = panic-prone = Conservative for now.
  if (scenarioAvg >= 7 && mcqScore >= 50) return "Balanced — Growth Ready";
  if (scenarioAvg >= 5) return "Balanced — Cautious";
  return "Conservative — Pehle Seekho";
}

export function buildVerdict(input: {
  playerName: string;
  totalScore: number;
  mcqScore: number;
  scenarioResults: ScenarioResult[];
  strongTopics: string[];
  weakTopics: string[];
}): { verdict: string; strengths: string[]; weaknesses: string[]; riskProfile: string; recommendations: string[] } {
  const { playerName, totalScore, mcqScore, scenarioResults, strongTopics, weakTopics } = input;
  const scenAvg = scenarioResults.length ? scenarioResults.reduce((a, r) => a + r.score, 0) / scenarioResults.length : 0;
  const riskProfile = riskProfileFor(scenAvg, mcqScore);
  const name = playerName || "Player";
  let verdict = "";
  const cleanWeak = weakTopics.filter((w) => !strongTopics.includes(w));
  const finalWeak = cleanWeak.length ? cleanWeak : weakTopics;
  if (totalScore >= 85) verdict = `${name}, outstanding! Tumhare concepts clear hain aur scenario me tumne panic nahi, plan dikhaya. Tum long-term investor wali soch rakhte ho — ab real SIP / diversified portfolio par focus karo aur har mahine seekhte raho.`;
  else if (totalScore >= 70) verdict = `${name}, bahut badhiya! Tumhare basics strong hain aur decisions mostly sahi direction me hain. Thoda aur depth chahiye — khaas kar ${finalWeak[0] || "risk management"} me. Agla test Advanced level par try karo.`;
  else if (totalScore >= 50) verdict = `${name}, tum learning track par ho. Basics aane lage hain, par scenario wale questions me tumhari decision-making abhi emotional ho jati hai. Panic sell aur tip-based investing se bacho — SIP aur diversification par focus karo.`;
  else verdict = `${name}, koi baat nahi — yahi se start hota hai! Tumhare basics abhi weak hain, par ye test hi pehla step hai. Pehle SIP, compounding aur emergency fund seekho, phir dobara test do — score pakka badhega.`;
  const strengths = strongTopics.length ? strongTopics.slice(0, 3).map((t) => `${t} me tumhare answers sahi the`) : ["Tumne test complete kiya — yehi sabse bada first step hai"];
  const weaknesses = finalWeak.length ? finalWeak.slice(0, 3).map((t) => `${t} — is topic par aur practice chahiye`) : ["Scenario answers me aur detail likho — reasoning hi score badhata hai"];
  const recommendations = [
    ...(finalWeak[0] ? [`Learn section me "${finalWeak[0]}" wala lesson padho`] : ["Learn section me SIP wala lesson padho"]),
    "Kal phir ek test do — har roz 10 questions, 15 din me level up",
    "Virtual ₹1,00,000 portfolio socho: 60% equity SIP, 30% debt, 10% gold — aur us par tikke raho",
  ];
  return { verdict, strengths, weaknesses, riskProfile, recommendations };
}
