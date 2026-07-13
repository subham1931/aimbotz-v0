"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Countdown } from "@/components/ui/Countdown";
import { formatCoins, maskUsername } from "@/lib/utils";
import type { User } from "@/lib/types";

type Entry = {
  rank: number;
  user: User;
  maskedName: string;
  rewardTier: string;
  rewardCoins: number;
};

export default function LeaderboardPage() {
  const [board, setBoard] = useState<Entry[]>([]);
  const [nextResetAt, setNextResetAt] = useState<string>();

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setBoard(d.leaderboard || []);
        setNextResetAt(d.nextResetAt);
      });
  }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center justify-center gap-2">
        <Crown className="h-7 w-7 text-[#F5C518]" />
        <h1 className="font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
          Leaderboard
        </h1>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {top3.map((e) => {
          const footer =
            e.rank === 1
              ? "bg-gradient-to-r from-amber-600 to-[#F5C518]"
              : e.rank === 2
                ? "bg-gradient-to-r from-slate-500 to-slate-300"
                : "bg-gradient-to-r from-amber-800 to-amber-600";
          return (
            <div
              key={e.user.id}
              className={`card-surface overflow-hidden ${e.rank === 1 ? "neon-border sm:scale-105" : ""}`}
            >
              <div className="flex flex-col items-center px-4 py-6">
                {e.rank === 1 && (
                  <Crown className="mb-2 h-5 w-5 text-[#F5C518]" />
                )}
                <span className="mb-2 text-xs font-bold uppercase text-white/40">
                  #{e.rank} {e.rewardTier}
                </span>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#F5C518]/40 bg-[#1a1a1a] font-bold text-[#F5C518]">
                  {e.user.name.slice(0, 1)}
                </div>
                <p className="font-display text-lg font-bold">
                  {maskUsername(e.user.name)}
                </p>
                <p className="text-sm text-white/50">{e.user.totalHours}h</p>
                <p className="mt-1 font-bold text-white">
                  {formatCoins(e.user.coins)} coins
                </p>
              </div>
              <div className={`${footer} py-2 text-center text-xs font-bold text-black`}>
                Reward · {formatCoins(e.rewardCoins)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-12 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Hours</th>
              <th className="hidden px-4 py-3 sm:table-cell">Coins</th>
              <th className="px-4 py-3">Tier</th>
            </tr>
          </thead>
          <tbody>
            {[...top3, ...rest].map((e) => (
              <tr
                key={e.user.id}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 font-bold text-[#F5C518]">
                  #{e.rank}
                </td>
                <td className="px-4 py-3">{e.maskedName}</td>
                <td className="px-4 py-3">{e.user.totalHours}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {e.user.coins}
                </td>
                <td className="px-4 py-3 text-white/50">{e.rewardTier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Countdown
        targetIso={nextResetAt}
        label="Reward for top rankers delivered when time is up"
      />
    </div>
  );
}
