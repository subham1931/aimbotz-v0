import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await readDb();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const user = db.users.find((u) => u.id === booking.userId);
  return NextResponse.json({ booking, user: user ?? null });
}
