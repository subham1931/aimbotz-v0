import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { completeSession } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();
  const db = await readDb();
  let sessions = db.sessions;

  if (status === "active" || status === "completed") {
    sessions = sessions.filter((s) => s.status === status);
  }
  if (q) {
    sessions = sessions.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) ||
        s.bookingId.toLowerCase().includes(q) ||
        s.stationName.toLowerCase().includes(q)
    );
  }

  // Today's sessions filter optional
  const today = searchParams.get("today");
  if (today === "1") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    sessions = sessions.filter((s) => new Date(s.startedAt) >= start);
  }

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "complete" && body.sessionId) {
      let session;
      await updateDb((db) => {
        session = completeSession(db, body.sessionId);
      });
      return NextResponse.json({ session });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
