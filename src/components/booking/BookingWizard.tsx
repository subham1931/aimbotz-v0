"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Station } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { accentClasses, estimateCoins, formatCurrency } from "@/lib/utils";
import { TicketCard } from "./TicketCard";
import type { Booking } from "@/lib/types";

const DURATIONS = [1, 2, 3];

export function BookingWizard({ stations }: { stations: Station[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialStation = searchParams.get("station") || stations[0]?.id || "";
  const [stationId, setStationId] = useState(initialStation);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState("14:00");
  const [duration, setDuration] = useState(1);
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const station = useMemo(
    () => stations.find((s) => s.id === stationId),
    [stations, stationId]
  );

  const price = station ? station.pricePerHour * duration : 0;
  const coins = estimateCoins(duration);

  async function submit() {
    if (!user) {
      router.push("/login?redirect=/book");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          stationId,
          date,
          startTime,
          durationHours: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBooking(data.booking);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518]">
          Booking Confirmed
        </h1>
        <p className="mb-8 text-center text-sm text-white/55">
          Your digital ticket is ready. Show it at the counter.
        </p>
        <TicketCard booking={booking} large />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tickets"
            className="flex-1 rounded-full bg-[#F5C518] py-3 text-center text-sm font-bold uppercase text-black"
          >
            My Tickets
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-full border border-white/30 py-3 text-center text-sm font-bold uppercase text-white"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase tracking-wide text-[#F5C518] sm:text-4xl">
        Book a Slot
      </h1>
      <p className="mb-10 text-center text-sm text-white/55">
        Select station, date &amp; duration — get a QR ticket instantly.
      </p>

      {!user && (
        <div className="mb-6 rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/10 px-4 py-3 text-sm text-[#F5C518]">
          <Link href="/login?redirect=/book" className="font-bold underline">
            Log in
          </Link>{" "}
          to confirm your booking. Demo: sam@demo.local
        </div>
      )}

      <div className="card-surface space-y-6 p-5 sm:p-8">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
            Station
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {stations.map((s) => {
              const a = accentClasses(s.accent);
              const selected = s.id === stationId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStationId(s.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? `${a.border} bg-white/5 ${a.glow}`
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <span className="font-display text-lg font-bold uppercase text-white">
                    {s.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/45">
                    {formatCurrency(s.pricePerHour)}/hr
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white outline-none focus:border-[#F5C518]/50"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
              Start time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white outline-none focus:border-[#F5C518]/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
            Duration
          </label>
          <div className="flex gap-2">
            {DURATIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDuration(h)}
                className={`flex-1 rounded-xl border py-3 text-sm font-bold uppercase tracking-wider transition ${
                  duration === h
                    ? "border-[#F5C518] bg-[#F5C518] text-black"
                    : "border-white/15 text-white hover:border-white/30"
                }`}
              >
                {h} hr
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Total</span>
            <span className="font-display text-2xl font-bold text-white">
              {formatCurrency(price)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-white/50">Est. coins earned</span>
            <span className="font-bold text-[#F5C518]">+{coins}</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {step === "form" ? (
          <button
            type="button"
            onClick={() => setStep("confirm")}
            disabled={!stationId}
            className="w-full rounded-full bg-[#F5C518] py-3.5 text-sm font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="flex-1 rounded-full border border-white/30 py-3.5 text-sm font-bold uppercase text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1 rounded-full bg-[#F5C518] py-3.5 text-sm font-bold uppercase text-black disabled:opacity-50"
            >
              {loading ? "Booking…" : "Confirm & Reserve"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
