// FinQuest Question Models & Types.
// All questions are generated dynamically in real-time.
// Zero static/dummy question banks.

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Topic =
  | "SIP"
  | "Mutual Funds"
  | "Stocks"
  | "Risk"
  | "Compounding"
  | "Inflation"
  | "Diversification"
  | "Emergency Fund"
  | "Tax";

export const TOPICS: Topic[] = [
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

export type Mcq = {
  kind: "mcq";
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
};

export type Scenario = {
  kind: "scenario";
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  title: string;
  situation: string;
  prompt: string;
  keywords: string[];
  redFlags: string[];
  ideal: string;
  hint: string;
};

export type Question = Mcq | Scenario;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
