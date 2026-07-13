import Link from "next/link";
import { ChevronRight, Coins } from "lucide-react";
import { COIN_CONFIG } from "@/lib/config";

export function CoinsBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="neon-border-blue card-surface relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
        <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-[#F5C518] sm:text-4xl">
              How Coins Work
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              Play sessions earn coins —{" "}
              <strong className="text-white">
                {COIN_CONFIG.coinsPerHour} coins per hour
              </strong>{" "}
              verified at the counter. Stack them up and redeem{" "}
              <strong className="text-white">
                {COIN_CONFIG.coinsPerFreeHour} coins for 1 free hour
              </strong>{" "}
              of game time, or swap for merch in the Store.
            </p>
            <Link
              href="/rewards"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#F5C518] hover:underline"
            >
              View Rewards
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-900/50 to-purple-900/40 shadow-[0_0_40px_rgba(59,130,246,0.35)] sm:h-48 sm:w-48">
              <Coins className="h-20 w-20 text-[#F5C518]" strokeWidth={1.25} />
              <span className="absolute -bottom-3 rounded-full bg-[#F5C518] px-3 py-1 text-xs font-bold uppercase text-black">
                Earn &amp; Redeem
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
