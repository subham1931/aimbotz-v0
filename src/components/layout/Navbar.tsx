"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Coins,
  Gift,
  Home,
  LogIn,
  LogOut,
  Menu,
  ShoppingCart,
  Ticket,
  Trophy,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/book", label: "Book a Slot", icon: CalendarClock },
  { href: "/tickets", label: "My Tickets", icon: Ticket },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/store", label: "Store", icon: ShoppingCart },
];

function UserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const initial = (user.name || user.email || "P").slice(0, 1).toUpperCase();

  if (user.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name}
        className={`${dim} rounded-full object-cover ring-2 ring-[#F5C518]/40`}
      />
    );
  }

  return (
    <span
      className={`${dim} inline-flex items-center justify-center rounded-full bg-[#F5C518] font-bold text-black ring-2 ring-[#F5C518]/30`}
    >
      {initial}
    </span>
  );
}

function ProfileMenu({
  user,
  logout,
}: {
  user: User;
  logout: () => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-[#F5C518]/40 hover:bg-white/10"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <UserAvatar user={user} />
        <span className="max-w-[100px] truncate text-left text-xs font-bold uppercase tracking-wider text-white">
          {user.name.split(" ")[0]}
        </span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl"
        >
          <div className="border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-white/45">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#F5C518]/10 px-2.5 py-1.5 text-xs font-bold text-[#F5C518]">
              <Coins className="h-3.5 w-3.5" />
              {user.coins} coins
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/rewards"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-[#F5C518]"
            >
              <Gift className="h-3.5 w-3.5 text-[#F5C518]" />
              Rewards
            </Link>
            <Link
              href="/tickets"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-[#F5C518]"
            >
              <Ticket className="h-3.5 w-3.5 text-[#F5C518]" />
              My Tickets
            </Link>
            <Link
              href="/store"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-[#F5C518]"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-[#F5C518]" />
              Store
            </Link>
          </div>

          <div className="border-t border-white/5 p-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setMenuOpen(false);
                await logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.filter((n) => n.href !== "/").map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? "text-[#F5C518]"
                      : "text-white/80 hover:text-[#F5C518]"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${active ? "text-[#F5C518]" : "text-[#F5C518]/80"}`}
                    strokeWidth={2}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {loading ? (
              <span className="h-9 w-28 animate-pulse rounded-full bg-white/5" />
            ) : user ? (
              <ProfileMenu user={user} logout={logout} />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-[#F5C518]"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {!loading && user && (
              <Link href="/rewards" className="shrink-0" aria-label="Profile">
                <UserAvatar user={user} size="sm" />
              </Link>
            )}
            <button
              type="button"
              className="p-2 text-white"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-[#121212] shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
            <Logo />
            <button
              type="button"
              className="p-1 text-white"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-7 w-7" strokeWidth={2} />
            </button>
          </div>

          {user && (
            <div className="border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{user.name}</p>
                  <p className="truncate text-xs text-white/45">{user.email}</p>
                  <p className="mt-1 text-xs font-bold text-[#F5C518]">
                    {user.coins} coins
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-1 flex items-center gap-4 rounded-lg px-4 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? "bg-white/5 text-[#F5C518]"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-[#F5C518]"
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/5 p-4">
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
