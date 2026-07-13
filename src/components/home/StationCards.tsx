import Image from "next/image";
import Link from "next/link";
import type { Station } from "@/lib/types";
import { accentClasses, formatCurrency } from "@/lib/utils";

/** Hard fallbacks so images always show even if DB is stale */
const STATION_IMAGES: Record<string, string> = {
  "st-vr": "/images/stations/vr.png",
  "st-racing": "/images/stations/racing.png",
  "st-ps5": "/images/stations/ps5.png",
  "st-console": "/images/stations/console.png",
  "st-pc": "/images/stations/pc.png",
  "st-party": "/images/stations/party.png",
};

export function StationCards({ stations }: { stations: Station[] }) {
  return (
    <section
      id="stations"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mb-14 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-[#F5C518] sm:text-4xl">
          Our Stations
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Pick a station. Book by the hour. Show your ticket at the counter.
        </p>
      </div>

      <div className="grid gap-x-5 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {stations.map((s) => {
          const a = accentClasses(s.accent);
          const image = s.image || STATION_IMAGES[s.id];
          const highlight = s.highlight || formatCurrency(s.pricePerHour);
          const tag = s.tag || "Station";

          return (
            <article
              key={s.id}
              className="group relative flex flex-col pt-[7.5rem]"
            >
              {image && (
                <div className="pointer-events-none absolute inset-x-0 -top-2 z-30 flex justify-center">
                  <div className="relative h-44 w-44 transition duration-300 group-hover:-translate-y-2 group-hover:scale-105 sm:h-52 sm:w-52">
                    <Image
                      src={image}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 176px, 208px"
                      className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.75)]"
                      priority
                    />
                  </div>
                </div>
              )}

              <div
                className={`station-card relative z-10 flex flex-1 flex-col bg-[#141414] ${a.glow}`}
              >
                <div className="flex flex-1 flex-col px-5 pb-6 pt-16 text-center sm:pt-20">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.28em] ${a.text}`}
                  >
                    {tag}
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-wide text-white">
                    {highlight}
                  </h3>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wide text-white">
                    {s.name}
                  </p>
                  <p
                    className={`mt-3 text-xs font-bold uppercase leading-snug tracking-wide ${a.text}`}
                  >
                    {s.description}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-white/35">
                    Per hour rate
                  </p>
                </div>

                <Link
                  href={`/book?station=${s.id}`}
                  className={`relative z-10 block py-3.5 text-center text-sm font-extrabold uppercase tracking-[0.2em] transition hover:brightness-110 ${a.btnSolid}`}
                >
                  Book Now
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
