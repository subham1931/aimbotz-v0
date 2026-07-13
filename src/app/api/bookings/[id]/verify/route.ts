import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { parseQrPayload, verifyBooking } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const qrRaw = body.qrPayload as string | undefined;

    let bookingId = id;
    if (qrRaw) {
      const parsed = parseQrPayload(qrRaw);
      if (parsed?.bookingId) bookingId = parsed.bookingId;
    }

    let result;
    await updateDb((db) => {
      result = verifyBooking(db, bookingId);
    });

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verify failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
