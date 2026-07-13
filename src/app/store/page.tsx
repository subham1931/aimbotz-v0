"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { StoreItem } from "@/lib/types";
import { accentClasses } from "@/lib/utils";

const STORE_IMAGES: Record<string, string> = {
  "item-1hr": "/images/store/1hr.png",
  "item-2hr": "/images/store/2hr.png",
  "item-tee": "/images/store/tee.png",
  "item-snack": "/images/store/snack.png",
  "item-hood": "/images/store/hood.png",
  "item-vip": "/images/store/vip.png",
};

export default function StorePage() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);

  async function redeem(itemId: string) {
    if (!user) return;
    setBusy(itemId);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(
        data.booking
          ? `Ticket created: ${data.booking.id}`
          : data.message || "Redeemed!"
      );
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, stock: Math.max(0, i.stock - 1) } : i
        )
      );
      await refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518] sm:text-4xl">
        Store
      </h1>
      <p className="mb-4 text-center text-sm text-white/50">
        Spend coins on free hours, merch &amp; snacks.
      </p>
      {user ? (
        <p className="mb-12 text-center text-sm">
          Balance:{" "}
          <span className="font-bold text-[#F5C518]">{user.coins} coins</span>
        </p>
      ) : (
        <p className="mb-12 text-center text-sm">
          <Link
            href="/login?redirect=/store"
            className="text-[#F5C518] underline"
          >
            Login
          </Link>{" "}
          to redeem
        </p>
      )}

      {msg && (
        <p className="mb-4 text-center text-sm text-emerald-400">{msg}</p>
      )}
      {error && (
        <p className="mb-4 text-center text-sm text-red-400">{error}</p>
      )}

      <div className="grid gap-x-5 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const a = accentClasses(item.accent);
          const image = item.image || STORE_IMAGES[item.id];

          return (
            <article
              key={item.id}
              className="group relative flex flex-col pt-[7.5rem]"
            >
              {image && (
                <div className="pointer-events-none absolute inset-x-0 -top-2 z-30 flex justify-center">
                  <div className="relative h-44 w-44 transition duration-300 group-hover:-translate-y-2 group-hover:scale-105 sm:h-52 sm:w-52">
                    <Image
                      src={image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 176px, 208px"
                      className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.75)]"
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
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-wide text-white">
                    {item.coinCost}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-white/35">
                    Coins
                  </p>
                  <p className="mt-3 text-sm font-bold uppercase tracking-wide text-white">
                    {item.name}
                  </p>
                  <p
                    className={`mt-3 text-xs font-bold uppercase leading-snug tracking-wide ${a.text}`}
                  >
                    {item.description}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-white/35">
                    Stock · {item.stock}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!user || busy === item.id || item.stock <= 0}
                  onClick={() => redeem(item.id)}
                  className={`relative z-10 block w-full py-3.5 text-center text-sm font-extrabold uppercase tracking-[0.2em] transition hover:brightness-110 disabled:opacity-40 ${a.btnSolid}`}
                >
                  {busy === item.id
                    ? "…"
                    : item.stock <= 0
                      ? "Sold Out"
                      : "Redeem"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
