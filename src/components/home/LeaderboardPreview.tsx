import Image from "next/image";
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

const PODIUM = {
  1: {
    order: "order-1 md:order-2",
    scale: "md:scale-110 md:z-20",
    padTop: "md:pt-0",
    image: "/images/podium/gold.png",
    tag: "Rank 1",
    label: "Champion",
    text: "text-[#F5C518]",
    glow: "shadow-[0_0_28px_rgba(245,197,24,0.4)]",
    btn: "bg-[#F5C518] text-black",
    ring: "ring-[#F5C518]/50",
  },
  2: {
    order: "order-2 md:order-1",
    scale: "md:z-10",
    padTop: "md:pt-10",
    image: "/images/podium/silver.png",
    tag: "Rank 2",
    label: "Runner Up",
    text: "text-slate-300",
    glow: "shadow-[0_0_28px_rgba(148,163,184,0.35)]",
    btn: "bg-gradient-to-r from-slate-400 to-slate-200 text-black",
    ring: "ring-slate-300/50",
  },
  3: {
    order: "order-3 md:order-3",
    scale: "md:z-10",
    padTop: "md:pt-10",
    image: "/images/podium/bronze.png",
    tag: "Rank 3",
    label: "Bronze",
    text: "text-amber-600",
    glow: "shadow-[0_0_28px_rgba(180,83,9,0.35)]",
    btn: "bg-gradient-to-r from-amber-800 to-amber-500 text-black",
    ring: "ring-amber-600/50",
  },
} as const;

export function LeaderboardPreview({
  top3,
  nextResetAt,
}: {
  top3: Entry[];
  nextResetAt: string;
}) {
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-14 flex items-center justify-center gap-2">
        <Crown className="h-6 w-6 text-[#F5C518]" />
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          Leaderboard
        </h2>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-16 md:flex-row md:items-end md:justify-center md:gap-4">
        {ordered.map((entry) => {
          if (!entry) return null;
          const style = PODIUM[entry.rank as 1 | 2 | 3] ?? PODIUM[3];
          const initial = entry.user.name.slice(0, 1).toUpperCase();

          return (
            <article
              key={entry.user.id}
              className={`group relative flex flex-1 flex-col pt-[7.5rem] ${style.order} ${style.padTop} ${style.scale}`}
            >
              <div className="pointer-events-none absolute inset-x-0 -top-2 z-30 flex justify-center">
                <div className="relative h-40 w-40 transition duration-300 group-hover:-translate-y-2 group-hover:scale-105 sm:h-48 sm:w-48">
                  <Image
                    src={style.image}
                    alt={`Rank ${entry.rank} trophy`}
                    fill
                    sizes="192px"
                    className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.75)]"
                    priority
                  />
                </div>
              </div>

              <div
                className={`station-card relative z-10 flex flex-1 flex-col bg-[#141414] ${style.glow}`}
              >
                <div className="flex flex-1 flex-col items-center px-4 pb-6 pt-14 text-center sm:pt-16">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.28em] ${style.text}`}
                  >
                    {style.tag}
                  </p>

                  <div
                    className={`relative mt-3 mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a] text-lg font-bold ring-2 ${style.ring} ${style.text}`}
                  >
                    {entry.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.user.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                    {entry.rank === 1 && (
                      <Crown className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 text-[#F5C518]" />
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white">
                    {maskUsername(entry.user.name)}
                  </h3>
                  <p className={`mt-1 text-xs font-bold uppercase ${style.text}`}>
                    {style.label} · {entry.user.totalHours}h played
                  </p>
                  <p className="mt-3 font-display text-3xl font-extrabold text-white">
                    {formatCoins(entry.user.coins)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-white/35">
                    Coins earned
                  </p>
                </div>

                <div
                  className={`py-3 text-center text-sm font-extrabold uppercase tracking-[0.15em] ${style.btn}`}
                >
                  Prize · {formatCoins(entry.rewardCoins)} coins
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
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
