import { NextResponse } from "next/server";
import { fetchAttemptsAny, getDbSource, saveAttemptAny } from "@/lib/attempts";
import type { AttemptRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const source = getDbSource();
  if (source === "none") return NextResponse.json({ configured: false, source, attempts: [] });
  return NextResponse.json({ configured: true, source, attempts: await fetchAttemptsAny(100) });
}

export async function POST(req: Request) {
  const row = (await req.json()) as AttemptRow;
  const res = await saveAttemptAny(row);
  return NextResponse.json(res);
}
