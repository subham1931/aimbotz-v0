"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { QrCode, LayoutDashboard, List, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@aimbotz.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const u = await login(email, password);
      if (u.role !== "admin") {
        logout();
        setError("Admin credentials required");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white/50">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121212] p-6"
        >
          <h1 className="font-display text-2xl font-bold uppercase text-[#F5C518]">
            Staff Login
          </h1>
          <p className="mt-1 text-xs text-white/40">
            admin@aimbotz.local / admin123
          </p>
          <input
            className="mt-6 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-[#F5C518] py-2.5 text-sm font-bold uppercase text-black"
          >
            Enter Dashboard
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-xs text-white/40 hover:text-white"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/scan", label: "QR Scan", icon: QrCode },
    { href: "/admin/sessions", label: "Sessions", icon: List },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-bold uppercase tracking-wide text-[#F5C518]">
              AimBotz Admin
            </span>
            <nav className="hidden gap-1 sm:flex">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-[#F5C518]"
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-2 py-2 sm:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold uppercase text-white/70"
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
