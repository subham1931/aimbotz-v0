"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@/lib/types";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams({ today: "1" });
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    fetch(`/api/sessions?${params}`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []));
  }, [q, status]);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  async function complete(sessionId: string) {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", sessionId }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-white">
        Sessions
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Active &amp; completed sessions today (auto-refresh)
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, station, booking ID…"
          className="flex-1 rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#1a1a1a] text-xs uppercase text-white/40">
            <tr>
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3">Station</th>
              <th className="px-3 py-3">Started</th>
              <th className="px-3 py-3">Ends</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-white/40">
                  No sessions yet — scan a ticket to start one.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-white/5">
                <td className="px-3 py-3">{s.userName}</td>
                <td className="px-3 py-3">{s.stationName}</td>
                <td className="px-3 py-3 text-xs text-white/60">
                  {new Date(s.startedAt).toLocaleTimeString()}
                </td>
                <td className="px-3 py-3 text-xs text-white/60">
                  {new Date(s.endsAt).toLocaleTimeString()}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-xs font-bold uppercase ${
                      s.status === "active"
                        ? "text-emerald-400"
                        : "text-white/50"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {s.status === "active" && (
                    <button
                      type="button"
                      onClick={() => complete(s.id)}
                      className="rounded bg-white/10 px-2 py-1 text-xs font-bold uppercase hover:bg-[#F5C518] hover:text-black"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
