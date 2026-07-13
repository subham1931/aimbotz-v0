"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/types";

export default function AdminHomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/sessions?today=1")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []));
  }, []);

  const active = sessions.filter((s) => s.status === "active");
  const done = sessions.filter((s) => s.status === "completed");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-white/45">Today&apos;s floor overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase text-white/40">Active sessions</p>
          <p className="mt-1 font-display text-4xl font-bold text-emerald-400">
            {active.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase text-white/40">Completed today</p>
          <p className="mt-1 font-display text-4xl font-bold text-[#F5C518]">
            {done.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase text-white/40">Total today</p>
          <p className="mt-1 font-display text-4xl font-bold text-white">
            {sessions.length}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/scan"
          className="rounded-lg bg-[#F5C518] px-5 py-2.5 text-sm font-bold uppercase text-black"
        >
          Open QR Scanner
        </Link>
        <Link
          href="/admin/sessions"
          className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold uppercase text-white"
        >
          All Sessions
        </Link>
      </div>
    </div>
  );
}
