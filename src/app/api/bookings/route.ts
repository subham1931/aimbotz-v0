import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { createBookingRecord } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const db = await readDb();
  let bookings = db.bookings;
  if (userId) bookings = bookings.filter((b) => b.userId === userId);
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, stationId, date, startTime, durationHours } = body;

    if (!userId || !stationId || !date || !startTime || !durationHours) {
      return NextResponse.json(
        { error: "Missing booking fields" },
        { status: 400 }
      );
    }

    let booking;
    await updateDb((db) => {
      if (!db.users.find((u) => u.id === userId)) {
        throw new Error("User not found — please log in");
      }
      booking = createBookingRecord(db, {
        userId,
        stationId,
        date,
        startTime,
        durationHours: Number(durationHours),
      });
      db.bookings.unshift(booking);
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
