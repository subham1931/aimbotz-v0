"use client";

import Link from "next/link";
import { BRAND } from "@/lib/config";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "px-2.5 py-1 text-xl sm:text-2xl"
      : size === "sm"
        ? "px-1.5 py-0.5 text-xs"
        : "px-2 py-0.5 text-sm sm:text-base";
  const zone =
    size === "lg"
      ? "text-xl sm:text-2xl"
      : size === "sm"
        ? "text-xs"
        : "text-sm sm:text-base";

  return (
    <Link href="/" className="inline-flex items-center gap-1.5 group">
      <span
        className={`${box} font-display font-bold tracking-wide bg-[#F5C518] text-black rounded-sm`}
      >
        {BRAND.nameParts[0]}
      </span>
      <span
        className={`${zone} font-display font-bold tracking-widest text-white group-hover:text-[#F5C518] transition-colors`}
      >
        {BRAND.nameParts[1]}
      </span>
    </Link>
  );
}
