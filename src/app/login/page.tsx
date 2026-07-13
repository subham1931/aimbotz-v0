"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const { login, signup, loginWithOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    authError ? "Authentication failed. Try again." : ""
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (mode === "login") {
        const user = await login(email, password);
        router.push(user.role === "admin" ? "/admin" : redirect);
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        await signup(name, email, password);
        setInfo(
          "Account created. If email confirmation is enabled, check your inbox — otherwise you’re signed in."
        );
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function onOAuth(provider: "google" | "discord" | "github") {
    setOauthLoading(provider);
    setError("");
    try {
      await loginWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
      setOauthLoading(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#F5C518]/50";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518]">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>
      <p className="mb-8 text-center text-sm text-white/50">
        AimBotz account — email or OAuth
      </p>

      <div className="mb-4 grid gap-2">
        <button
          type="button"
          onClick={() => onOAuth("google")}
          disabled={!!oauthLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-bold text-black hover:bg-white/90 disabled:opacity-50"
        >
          <GoogleIcon />
          {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => onOAuth("discord")}
          disabled={!!oauthLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#5865F2]/40 bg-[#5865F2] px-4 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          <DiscordIcon />
          {oauthLoading === "discord" ? "Redirecting…" : "Continue with Discord"}
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/35">
        <span className="h-px flex-1 bg-white/10" />
        or email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-white/50">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your display name"
              autoComplete="name"
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-white/50">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-white/50">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={
                mode === "signup" ? "At least 6 characters" : "Enter your password"
              }
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/45 transition hover:text-[#F5C518]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#F5C518] py-3.5 text-sm font-bold uppercase text-black disabled:opacity-50"
        >
          {loading ? "…" : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              type="button"
              className="text-[#F5C518] underline"
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Have an account?{" "}
            <button
              type="button"
              className="text-[#F5C518] underline"
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </>
        )}
      </p>
      <p className="mt-4 text-center">
        <Link href="/admin" className="text-xs text-white/30 hover:text-white/60">
          Staff / Admin →
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.317 4.37a19.8 19.8 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.127c.126-.094.252-.192.373-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.079.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
