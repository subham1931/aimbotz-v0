import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { createBookingRecord, createId } from "@/lib/utils";
import { COIN_CONFIG } from "@/lib/config";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ items: db.storeItems });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, itemId } = body;
    if (!userId || !itemId) {
      return NextResponse.json(
        { error: "userId and itemId required" },
        { status: 400 }
      );
    }

    let result: Record<string, unknown> = {};

    await updateDb((db) => {
      const user = db.users.find((u) => u.id === userId);
      const item = db.storeItems.find((i) => i.id === itemId);
      if (!user) throw new Error("User not found");
      if (!item) throw new Error("Item not found");
      if (item.stock <= 0) throw new Error("Out of stock");
      if (user.coins < item.coinCost) throw new Error("Insufficient coins");

      user.coins -= item.coinCost;
      item.stock -= 1;

      db.coinLedger.unshift({
        id: createId("cl"),
        userId,
        amount: -item.coinCost,
        reason: `Store redeem — ${item.name}`,
        createdAt: new Date().toISOString(),
      });

      // Hour vouchers create a free booking ticket
      if (item.category === "hours") {
        const hours = item.id.includes("2hr") ? 2 : 1;
        const stationId = db.stations[0]?.id;
        if (!stationId) throw new Error("No stations");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const booking = createBookingRecord(db, {
          userId,
          stationId,
          date: tomorrow.toISOString().slice(0, 10),
          startTime: "15:00",
          durationHours: hours,
          type: "store_redeem",
          priceOverride: 0,
        });
        // Override coins earned estimate still applies on completion
        booking.coinsEarned = hours * COIN_CONFIG.coinsPerHour;
        db.bookings.unshift(booking);
        result = { user, item, booking };
      } else {
        result = {
          user,
          item,
          message: `Redeemed ${item.name}. Collect at the counter.`,
        };
      }
    });

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Redeem failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
