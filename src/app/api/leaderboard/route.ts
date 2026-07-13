import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getLeaderboard } from "@/lib/utils";
import { COIN_CONFIG } from "@/lib/config";

export async function GET() {
  const db = await readDb();
  const leaderboard = getLeaderboard(db);
  return NextResponse.json({
    leaderboard,
    nextResetAt: db.nextResetAt,
    config: {
      coinsPerHour: COIN_CONFIG.coinsPerHour,
      coinsPerFreeHour: COIN_CONFIG.coinsPerFreeHour,
      rewardCycleDays: COIN_CONFIG.rewardCycleDays,
    },
  });
}
