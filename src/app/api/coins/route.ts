import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { COIN_CONFIG } from "@/lib/config";
import { redeemFreeHour } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const db = await readDb();

  if (!userId) {
    return NextResponse.json({
      config: {
        coinsPerHour: COIN_CONFIG.coinsPerHour,
        coinsPerFreeHour: COIN_CONFIG.coinsPerFreeHour,
      },
    });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ledger = db.coinLedger.filter((e) => e.userId === userId);
  return NextResponse.json({
    user,
    ledger,
    config: {
      coinsPerHour: COIN_CONFIG.coinsPerHour,
      coinsPerFreeHour: COIN_CONFIG.coinsPerFreeHour,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, stationId, action } = body;

    if (action === "redeem_hour") {
      if (!userId || !stationId) {
        return NextResponse.json(
          { error: "userId and stationId required" },
          { status: 400 }
        );
      }
      let result;
      await updateDb((db) => {
        result = redeemFreeHour(db, userId, stationId);
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Redeem failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
