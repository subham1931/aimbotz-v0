import Link from "next/link";
import { Crown } from "lucide-react";
import { formatCoins, maskUsername } from "@/lib/utils";
import type { User } from "@/lib/types";
import { Countdown } from "@/components/ui/Countdown";

type Entry = {
  rank: number;
  user: User;
  rewardCoins: number;
};

const podiumStyles = [
  {
    // gold — center, tallest
    order: "order-1 md:order-2",
    height: "md:pt-2",
    footer: "bg-gradient-to-r from-amber-600 to-[#F5C518]",
    scale: "md:scale-110 md:z-10",
    crown: true,
  },
  {
    // silver — left
    order: "order-2 md:order-1",
    height: "md:pt-8",
    footer: "bg-gradient-to-r from-slate-500 to-slate-300",
    scale: "",
    crown: false,
  },
  {
    // bronze — right
    order: "order-3 md:order-3",
    height: "md:pt-8",
    footer: "bg-gradient-to-r from-amber-800 to-amber-600",
    scale: "",
    crown: false,
  },
];

export function LeaderboardPreview({
  top3,
  nextResetAt,
}: {
  top3: Entry[];
  nextResetAt: string;
}) {
  // Ensure order: rank2, rank1, rank3 for desktop podium visual
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);
  const stylesFor = (rank: number) =>
    podiumStyles[rank === 1 ? 0 : rank === 2 ? 1 : 2];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 flex items-center justify-center gap-2">
        <Crown className="h-6 w-6 text-[#F5C518]" />
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          Leaderboard
        </h2>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-4 md:flex-row md:items-end md:justify-center md:gap-3">
        {ordered.map((entry) => {
          if (!entry) return null;
          const style = stylesFor(entry.rank);
          return (
            <div
              key={entry.user.id}
              className={`card-surface flex flex-1 flex-col overflow-hidden ${style.order} ${style.height} ${style.scale}`}
            >
              <div className="flex flex-col items-center px-4 py-6">
                {style.crown && (
                  <Crown className="mb-2 h-5 w-5 text-[#F5C518]" />
                )}
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#F5C518]/50 bg-[#1a1a1a] text-lg font-bold text-[#F5C518]">
                  {entry.user.name.slice(0, 1).toUpperCase()}
                </div>
                <p className="font-display text-lg font-bold tracking-wide text-white">
                  {maskUsername(entry.user.name)}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  {entry.user.totalHours}h played
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  {formatCoins(entry.user.coins)}{" "}
                  <span className="text-xs text-white/40">COINS</span>
                </p>
              </div>
              <div
                className={`${style.footer} py-2.5 text-center text-sm font-bold text-black`}
              >
                Prize · {formatCoins(entry.rewardCoins)} coins
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile single-card fallback when fewer than 3 — also show MORE */}
      {top3.length === 1 && (
        <div className="mx-auto mt-4 max-w-xs card-surface p-6 text-center md:hidden">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#F5C518]/50 bg-[#1a1a1a] text-lg font-bold text-[#F5C518]">
            {top3[0].user.name.slice(0, 1)}
          </div>
          <p className="font-bold">{maskUsername(top3[0].user.name)}</p>
          <p className="text-[#F5C518]">
            {formatCoins(top3[0].user.coins)} COINS
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/leaderboard"
          className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#F5C518] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black hover:brightness-110"
        >
          More
        </Link>
      </div>

      <div className="mt-14">
        <Countdown
          targetIso={nextResetAt}
          label="Next leaderboard reset counter"
        />
      </div>
    </section>
  );
}
