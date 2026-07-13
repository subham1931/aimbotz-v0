import { Hero } from "@/components/home/Hero";
import { StationCards } from "@/components/home/StationCards";
import { CoinsBanner } from "@/components/home/CoinsBanner";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { Socials } from "@/components/home/Socials";
import { readDb } from "@/lib/db";
import { getLeaderboard } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const board = getLeaderboard(db).slice(0, 3);

  return (
    <>
      <Hero />
      <StationCards stations={db.stations} />
      <CoinsBanner />
      <LeaderboardPreview
        top3={board.map((e) => ({
          rank: e.rank,
          user: e.user,
          rewardCoins: e.rewardCoins,
        }))}
        nextResetAt={db.nextResetAt}
      />
      <Socials />
    </>
  );
}
