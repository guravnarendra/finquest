import { NextResponse } from "next/server";
import { fetchAttemptsAny, getDbSource, saveAttemptAny } from "@/lib/attempts";
import type { AttemptRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const source = getDbSource();
    if (source === "none") {
      return NextResponse.json({ configured: false, source, attempts: [] });
    }
    const attempts = await fetchAttemptsAny(100);
    return NextResponse.json({ configured: true, source, attempts });
  } catch (err) {
    console.error("[GET /api/attempts] Error:", err);
    return NextResponse.json(
      { configured: false, error: err instanceof Error ? err.message : String(err), attempts: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const row = (await req.json()) as AttemptRow;
    if (!row.player_name) {
      return NextResponse.json({ ok: false, error: "player_name is required" }, { status: 400 });
    }
    const res = await saveAttemptAny(row);
    if (!res.ok) {
      console.error("[POST /api/attempts] DB Save Failed:", res.error);
      return NextResponse.json(res, { status: 500 });
    }
    return NextResponse.json(res);
  } catch (err) {
    console.error("[POST /api/attempts] Exception:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
