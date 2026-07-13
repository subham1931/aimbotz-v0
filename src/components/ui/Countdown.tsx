"use client";

import { useEffect, useState } from "react";

type Props = {
  targetIso?: string;
  label?: string;
};

function getParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

export function Countdown({
  targetIso,
  label = "Next reward cycle resets in",
}: Props) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = targetIso
      ? new Date(targetIso)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          return d;
        })();

    const tick = () => setParts(getParts(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const boxes = [
    { v: parts.days, l: "DD" },
    { v: parts.hours, l: "HH" },
    { v: parts.mins, l: "MM" },
    { v: parts.secs, l: "SS" },
  ];

  return (
    <div className="text-center">
      {label && (
        <p className="mb-4 text-xs sm:text-sm uppercase tracking-[0.2em] text-white/70">
          {label}
        </p>
      )}
      <div className="flex justify-center gap-2 sm:gap-3">
        {boxes.map((b) => (
          <div key={b.l} className="flex flex-col items-center gap-1.5">
            <div className="min-w-[3.25rem] sm:min-w-[4rem] rounded-xl bg-[#1a1a1a] border border-white/10 px-3 py-3 shadow-[0_0_20px_rgba(245,197,24,0.08)]">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#F5C518] tabular-nums">
                {String(b.v).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/50">
              {b.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
