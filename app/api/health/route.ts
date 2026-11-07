import { NextResponse } from "next/server";
import { getDbSource } from "@/lib/attempts";
import { pingDirect } from "@/lib/db";
import { llmPublicInfo } from "@/lib/llm";

export const dynamic = "force-dynamic";

// GET /api/health — check what is actually wired up, without leaking keys.
// { db: { source: "direct"|"supabase"|"none", pingOk }, llm: { configured, baseUrl, model } }
export async function GET() {
  const source = getDbSource();
  let pingOk: boolean | null = null;
  let dbError: string | null = null;
  if (source === "direct") {
    try {
      pingOk = await Promise.race([
        pingDirect(),
        new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error("db ping timeout (4s)")), 4000)),
      ]);
    } catch (e) { pingOk = false; dbError = e instanceof Error ? e.message : String(e); }
  }
  return NextResponse.json({
    ok: true,
    db: { source, configured: source !== "none", pingOk, error: dbError },
    llm: llmPublicInfo(),
  });
}
