"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking, User } from "@/lib/types";

type Lookup = {
  booking: Booking;
  user: User | null;
};

export default function AdminScanPage() {
  const [manualId, setManualId] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);

  const loadBooking = useCallback(async (idOrPayload: string) => {
    setError("");
    setSuccess("");
    setLookup(null);
    let bookingId = idOrPayload.trim();
    try {
      const parsed = JSON.parse(idOrPayload);
      if (parsed?.bookingId) bookingId = parsed.bookingId;
    } catch {
      /* raw id */
    }

    const res = await fetch(`/api/bookings/${bookingId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Not found");
      return;
    }
    setLookup({ booking: data.booking, user: data.user });
  }, []);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => undefined);
        html5QrRef.current.clear();
      }
    };
  }, []);

  async function startScanner() {
    setError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerRef.current) return;
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          loadBooking(decoded);
          stopScanner();
        },
        () => undefined
      );
    } catch (e) {
      setScanning(false);
      setError(
        e instanceof Error
          ? `Camera error: ${e.message}. Use manual ID below.`
          : "Camera unavailable"
      );
    }
  }

  async function stopScanner() {
    try {
      if (html5QrRef.current) {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    } catch {
      /* ignore */
    }
    setScanning(false);
  }

  async function verify() {
    if (!lookup) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${lookup.booking.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrPayload: lookup.booking.qrPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(
        `Session started for ${data.user.name} · ${data.booking.stationName}`
      );
      setLookup({
        booking: data.booking,
        user: data.user,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-white">
        QR Scanner
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Scan a ticket QR or enter booking ID manually
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#121212] p-4">
          <div
            id="qr-reader"
            ref={scannerRef}
            className="overflow-hidden rounded-lg bg-black"
          />
          <div className="mt-3 flex gap-2">
            {!scanning ? (
              <button
                type="button"
                onClick={startScanner}
                className="rounded-lg bg-[#F5C518] px-4 py-2 text-sm font-bold uppercase text-black"
              >
                Start Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold uppercase text-white"
              >
                Stop Camera
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <label className="text-xs font-bold uppercase text-white/40">
              Manual booking ID
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="bk-xxxxxxxx"
                className="flex-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => loadBooking(manualId)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold uppercase"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          {success && (
            <p className="mb-3 text-sm text-emerald-400">{success}</p>
          )}
          {!lookup ? (
            <p className="text-sm text-white/40">
              Scan or look up a ticket to see details.
            </p>
          ) : (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold uppercase text-[#F5C518]">
                Booking details
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">Player</dt>
                  <dd>{lookup.user?.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">Station</dt>
                  <dd>{lookup.booking.stationName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">When</dt>
                  <dd>
                    {lookup.booking.date} {lookup.booking.startTime}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">Duration</dt>
                  <dd>{lookup.booking.durationHours}h</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">Status</dt>
                  <dd className="uppercase text-[#F5C518]">
                    {lookup.booking.status}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/40">ID</dt>
                  <dd className="font-mono text-xs">{lookup.booking.id}</dd>
                </div>
              </dl>
              {lookup.booking.status === "upcoming" && (
                <button
                  type="button"
                  disabled={verifying}
                  onClick={verify}
                  className="mt-4 w-full rounded-lg bg-emerald-500 py-3 text-sm font-bold uppercase text-black disabled:opacity-50"
                >
                  {verifying ? "Starting…" : "Verify & Start Session"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
