import Link from "next/link";
import type { ComponentType } from "react";
import {
  Cpu,
  Gamepad2,
  Gauge,
  Headphones,
  Monitor,
  Users,
} from "lucide-react";
import type { Station } from "@/lib/types";
import { accentClasses, formatCurrency } from "@/lib/utils";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  headphones: Headphones,
  gauge: Gauge,
  "gamepad-2": Gamepad2,
  monitor: Monitor,
  cpu: Cpu,
  users: Users,
};

export function StationCards({ stations }: { stations: Station[] }) {
  return (
    <section id="stations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-[#F5C518] sm:text-4xl">
          Our Stations
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Pick a station. Book by the hour. Show your ticket at the counter.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stations.map((s) => {
          const a = accentClasses(s.accent);
          const Icon = ICONS[s.icon] ?? Gamepad2;
          return (
            <article
              key={s.id}
              className={`card-surface flex flex-col overflow-hidden ${a.glow}`}
            >
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${a.border} border`}
                  >
                    <Icon className={`h-6 w-6 ${a.text}`} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Station
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {s.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                  {s.description}
                </p>
                <p className="mt-4 font-display text-3xl font-bold text-white">
                  {formatCurrency(s.pricePerHour)}
                  <span className="ml-1 text-sm font-medium text-white/45">
                    / hour
                  </span>
                </p>
              </div>
              <Link
                href={`/book?station=${s.id}`}
                className={`block py-3.5 text-center text-sm font-bold uppercase tracking-wider ${a.btn}`}
              >
                Book Now
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
