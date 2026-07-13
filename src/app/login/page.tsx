"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("sam@demo.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user =
        mode === "login"
          ? await login(email, password)
          : await signup(name, email);
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold uppercase text-[#F5C518]">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>
      <p className="mb-8 text-center text-sm text-white/50">
        Demo player: sam@demo.local · Admin: admin@aimbotz.local / admin123
      </p>

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
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none focus:border-[#F5C518]/50"
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
            className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none focus:border-[#F5C518]/50"
          />
        </div>
        {mode === "login" && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-white/50">
              Password{" "}
              <span className="normal-case text-white/30">
                (admin only)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none focus:border-[#F5C518]/50"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
