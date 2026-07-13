"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { CoinLedgerEntry, Station } from "@/lib/types";
import { TicketCard } from "@/components/booking/TicketCard";
import type { Booking } from "@/lib/types";

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [ledger, setLedger] = useState<CoinLedgerEntry[]>([]);
  const [config, setConfig] = useState({
    coinsPerHour: 50,
    coinsPerFreeHour: 150,
  });
  const [stations, setStations] = useState<Station[]>([]);
  const [stationId, setStationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voucher, setVoucher] = useState<Booking | null>(null);

  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.json())
      .then((d) => {
        setStations(d.stations || []);
        setStationId(d.stations?.[0]?.id || "");
      });
  }, []);

  useEffect(() => {
    if (!user) {
      fetch("/api/coins")
        .then((r) => r.json())
        .then((d) => d.config && setConfig(d.config));
      return;
    }
    fetch(`/api/coins?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig(d.config);
        setLedger(d.ledger || []);
      });
  }, [user]);

  async function redeem() {
    if (!user || !stationId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redeem_hour",
          userId: user.id,
          stationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVoucher(data.booking);
      setLedger((prev) => [data.entry, ...prev]);
      await refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518] sm:text-4xl">
        Rewards
      </h1>
      <p className="mb-10 text-center text-sm text-white/50">
        Earn coins when sessions are verified. Redeem free play hours.
      </p>

      <div className="card-surface neon-border mb-8 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">
          Your balance
        </p>
        <p className="glow-text mt-2 font-display text-6xl font-extrabold text-[#F5C518]">
          {user?.coins ?? "—"}
        </p>
        <p className="mt-1 text-sm text-white/45">coins</p>
        {!user && (
          <Link
            href="/login?redirect=/rewards"
            className="mt-4 inline-block text-sm text-[#F5C518] underline"
          >
            Login to see balance
          </Link>
        )}
      </div>

      <div className="card-surface mb-8 space-y-2 p-5 text-sm text-white/70">
        <p>
          Every verified hour earns{" "}
          <strong className="text-white">{config.coinsPerHour} coins</strong>.
        </p>
        <p>
          Redeem{" "}
          <strong className="text-[#F5C518]">
            {config.coinsPerFreeHour} coins = 1 free hour
          </strong>{" "}
          of game time at any station.
        </p>
      </div>

      {user && (
        <div className="card-surface mb-8 space-y-4 p-5">
          <h2 className="font-display text-xl font-bold uppercase text-white">
            Redeem free hour
          </h2>
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={redeem}
            disabled={loading || (user.coins ?? 0) < config.coinsPerFreeHour}
            className="w-full rounded-full bg-[#F5C518] py-3 text-sm font-bold uppercase text-black disabled:opacity-40"
          >
            {loading
              ? "Redeeming…"
              : `Redeem (${config.coinsPerFreeHour} coins)`}
          </button>
        </div>
      )}

      {voucher && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase text-[#F5C518]">
            Voucher ticket created
          </h2>
          <TicketCard booking={voucher} large />
        </div>
      )}

      {user && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
            Coin history
          </h2>
          <ul className="space-y-2">
            {ledger.length === 0 && (
              <li className="text-sm text-white/40">No activity yet.</li>
            )}
            {ledger.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-[#121212] px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-white/80">{e.reason}</p>
                  <p className="text-xs text-white/35">
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-bold ${e.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {e.amount >= 0 ? "+" : ""}
                  {e.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
