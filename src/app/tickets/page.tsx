"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { TicketCard } from "@/components/booking/TicketCard";
import type { Booking } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

export default function TicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch(`/api/bookings?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center text-white/50">Loading tickets…</div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase text-[#F5C518]">
          My Tickets
        </h1>
        <p className="mt-4 text-white/55">Log in to view your QR tickets.</p>
        <Link
          href="/login?redirect=/tickets"
          className="mt-6 inline-flex rounded-full bg-[#F5C518] px-8 py-3 text-sm font-bold uppercase text-black"
        >
          Login
        </Link>
      </div>
    );
  }

  const upcoming = bookings.filter((b) =>
    ["upcoming", "active"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ["completed", "expired", "used"].includes(b.status)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518] sm:text-4xl">
        My Tickets
      </h1>

      {bookings.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-white/55">No tickets yet.</p>
          <Link
            href="/book"
            className="mt-4 inline-flex rounded-full bg-[#F5C518] px-6 py-2.5 text-sm font-bold uppercase text-black"
          >
            Book a Slot
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                Upcoming / Active
              </h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <TicketCard
                    key={b.id}
                    booking={b}
                    onClick={() => setFullscreen(b)}
                  />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                Past
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((b) => (
                  <TicketCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {fullscreen && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 p-6">
          <button
            type="button"
            className="absolute right-4 top-4 p-2 text-white"
            onClick={() => setFullscreen(null)}
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>
          <p className="mb-4 font-display text-xl font-bold uppercase text-[#F5C518]">
            {fullscreen.stationName}
          </p>
          <div className="rounded-2xl bg-white p-6">
            <QRCodeSVG value={fullscreen.qrPayload} size={280} level="M" />
          </div>
          <p className="mt-4 text-sm text-white/50">{fullscreen.id}</p>
          <p className="mt-2 text-center text-sm text-[#F5C518]">
            Show this at the counter
          </p>
        </div>
      )}
    </div>
  );
}
