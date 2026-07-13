import Link from "next/link";
import { Logo } from "./Logo";

const COL1 = [
  { href: "/store", label: "Shop" },
  { href: "/book", label: "Bookings" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/rewards", label: "Rewards" },
];

const COL2 = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Book arcade stations by the hour. Earn coins. Redeem free play.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div className="flex flex-col gap-2">
              {COL1.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/70 hover:text-[#F5C518]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {COL2.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/70 hover:text-[#F5C518]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {["Kick", "Instagram", "YouTube", "Facebook", "X"].map((s) => (
            <span
              key={s}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white/60"
            >
              {s.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>

        <p className="mt-8 text-justify text-[11px] leading-relaxed text-white/35">
          AimBotz is a physical arcade and entertainment venue. Bookings are
          for in-store game sessions only. Players must follow house rules and
          fair-play policies. Guests under 16 require guardian supervision for
          certain stations. Coins and vouchers have no cash value and are
          non-transferable. Management reserves the right to refuse service.
        </p>
      </div>
    </footer>
  );
}
