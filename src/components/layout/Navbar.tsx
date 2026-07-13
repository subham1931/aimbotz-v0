"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  Home,
  LogIn,
  Menu,
  ShoppingCart,
  Ticket,
  Trophy,
  Gift,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/book", label: "Book a Slot", icon: CalendarClock },
  { href: "/tickets", label: "My Tickets", icon: Ticket },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/store", label: "Store", icon: ShoppingCart },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
            {user ? (
              <>
                <span className="text-xs text-white/60">
                  {user.name.split(" ")[0]} ·{" "}
                  <span className="text-[#F5C518]">{user.coins}</span> coins
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
                >
                  Logout
                </button>
              </>
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

          <button
            type="button"
            className="lg:hidden p-2 text-white"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer — slides from right to match prompt; overlays content */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-visibility ${
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
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white"
              >
                Logout ({user.name.split(" ")[0]})
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
