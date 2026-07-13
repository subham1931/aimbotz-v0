"use client";

import { QRCodeSVG } from "qrcode.react";
import type { Booking } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export function TicketCard({
  booking,
  large = false,
  onClick,
}: {
  booking: Booking;
  large?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-surface neon-border w-full text-left transition hover:border-[#F5C518]/60 ${
        large ? "p-6 sm:p-8" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={`mx-auto flex shrink-0 items-center justify-center rounded-xl bg-white p-3 ${
            large ? "p-4" : ""
          }`}
        >
          <QRCodeSVG
            value={booking.qrPayload}
            size={large ? 220 : 96}
            level="M"
            includeMargin={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.type !== "paid" && (
              <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                Free voucher
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
            {booking.stationName}
          </h3>
          <p className="mt-1 text-sm text-white/60">
            {booking.date} · {booking.startTime} · {booking.durationHours}h
          </p>
          <p className="mt-1 text-xs text-white/40">ID: {booking.id}</p>
          <p className="mt-2 text-sm text-white/70">
            {booking.price > 0 ? formatCurrency(booking.price) : "FREE"} · Est.{" "}
            <span className="text-[#F5C518]">{booking.coinsEarned} coins</span>
          </p>
          {large && (
            <p className="mt-4 rounded-lg bg-[#F5C518]/10 px-3 py-2 text-sm font-medium text-[#F5C518]">
              Show this QR at the counter to start your session
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
