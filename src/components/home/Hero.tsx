import Image from "next/image";
import Link from "next/link";
import { ChevronsDown } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-arcade relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-24 text-center sm:min-h-[92vh]">
      {/* Full-bleed synthwave + arcade background */}
      <Image
        src="/images/hero-arcade-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />
      {/* Soft center shade for copy — keeps cabinets & sun visible */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_42%,rgba(8,0,12,0.55)_0%,rgba(8,0,12,0.2)_55%,transparent_75%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0d0d0d]/70 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.95] tracking-[0.04em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          <span className="block">Book Your Next</span>
          <span className="mt-1 block text-[#F5C518] drop-shadow-[0_0_28px_rgba(245,197,24,0.45)]">
            Game Session
          </span>
        </h1>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            href="/book"
            className="btn-hero-primary inline-flex min-w-[200px] items-center justify-center px-10 py-3.5 text-sm font-extrabold uppercase tracking-[0.18em] text-black transition hover:brightness-110 sm:min-w-[220px] sm:text-base"
          >
            Book Now
          </Link>
          <Link
            href="/leaderboard"
            className="btn-hero-secondary inline-flex min-w-[200px] items-center justify-center px-10 py-3.5 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:border-[#F5C518] hover:text-[#F5C518] sm:min-w-[220px] sm:text-base"
          >
            Leaderboard
          </Link>
        </div>
      </div>

      <a
        href="#stations"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[#F5C518]"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/90">
          Scroll Down
        </span>
        <ChevronsDown className="h-6 w-6 animate-bounce-chevron" strokeWidth={2.5} />
      </a>
    </section>
  );
}
