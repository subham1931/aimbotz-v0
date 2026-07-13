"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { StoreItem } from "@/lib/types";
import { accentClasses } from "@/lib/utils";

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
        <p className="mb-10 text-center text-sm">
          Balance:{" "}
          <span className="font-bold text-[#F5C518]">{user.coins} coins</span>
        </p>
      ) : (
        <p className="mb-10 text-center text-sm">
          <Link href="/login?redirect=/store" className="text-[#F5C518] underline">
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const a = accentClasses(item.accent);
          return (
            <article key={item.id} className={`card-surface flex flex-col ${a.glow}`}>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {item.category}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold uppercase text-white">
                  {item.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-white/55">
                  {item.description}
                </p>
                <p className="mt-4 font-display text-2xl font-bold text-[#F5C518]">
                  {item.coinCost}{" "}
                  <span className="text-sm text-white/40">coins</span>
                </p>
                <p className="text-xs text-white/35">Stock: {item.stock}</p>
              </div>
              <button
                type="button"
                disabled={!user || busy === item.id || item.stock <= 0}
                onClick={() => redeem(item.id)}
                className={`py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-40 ${a.btn}`}
              >
                {busy === item.id ? "…" : "Redeem"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
