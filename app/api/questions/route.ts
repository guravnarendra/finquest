import { NextResponse } from "next/server";
import { pickTest, type Difficulty } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const difficulty = (url.searchParams.get("difficulty") || "beginner") as Difficulty;
  const questions = pickTest(["beginner", "intermediate", "advanced"].includes(difficulty) ? difficulty : "beginner");
  // Don't leak MCQ answers to the client up front — the client checks
  // locally, so strip correctIndex/explanation until answered.
  // (Kept simple: the test page imports the bank directly for offline play;
  // this route is for future server-driven tests.)
  return NextResponse.json({ count: questions.length, questions });
}
