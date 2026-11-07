import { NextResponse } from "next/server";
import { type Difficulty, type Question, TOPICS } from "@/lib/questions";
import { getLlmConfig } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const diffParam = url.searchParams.get("difficulty") || "beginner";
  const difficulty: Difficulty = ["beginner", "intermediate", "advanced"].includes(diffParam)
    ? (diffParam as Difficulty)
    : "beginner";

  // Plural endpoint delegates to individual question generator or returns redirect
  return NextResponse.json({
    message: "Use /api/question?index=X&difficulty=Y for fast streaming question generation.",
    difficulty,
  });
}
