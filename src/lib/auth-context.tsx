"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User as SbUser, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { User } from "./types";

type OAuthProvider = "google" | "discord" | "github";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

function mapProfile(
  sbUser: SbUser,
  profile: {
    display_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
    coins?: number | null;
    total_hours?: number | null;
    email?: string | null;
  } | null
): User {
  return {
    id: sbUser.id,
    name:
      profile?.display_name ||
      (sbUser.user_metadata?.full_name as string) ||
      (sbUser.user_metadata?.name as string) ||
      sbUser.email?.split("@")[0] ||
      "Player",
    email: profile?.email || sbUser.email || "",
    avatar: profile?.avatar_url || undefined,
    coins: profile?.coins ?? 0,
    totalHours: Number(profile?.total_hours ?? 0),
    role: profile?.role === "admin" ? "admin" : "user",
    createdAt: sbUser.created_at,
  };
}

async function fetchProfileViaEdge(accessToken: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Prefer Supabase edge function when deployed
  if (base && anon) {
    const edgeRes = await fetch(`${base}/functions/v1/auth-profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anon,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "ensure" }),
    });
    if (edgeRes.ok) {
      const data = await edgeRes.json();
      if (data.profile) return data.profile;
    }
  }

  // Fallback: Next.js API route
  const res = await fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "ensure" }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.profile ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const hydrate = useCallback(
    async (sbUser: SbUser, accessToken: string) => {
      let profile = await fetchProfileViaEdge(accessToken);

      if (!profile) {
        const { data } = await supabase
          .from("aimbotz_profiles")
          .select("*")
          .eq("id", sbUser.id)
          .maybeSingle();
        profile = data;

        if (!profile) {
          const meta = sbUser.user_metadata ?? {};
          const { data: upserted } = await supabase
            .from("aimbotz_profiles")
            .upsert(
              {
                id: sbUser.id,
                email: sbUser.email,
                display_name:
                  meta.full_name ||
                  meta.name ||
                  sbUser.email?.split("@")[0] ||
                  "Player",
                avatar_url: meta.avatar_url || meta.picture || null,
              },
              { onConflict: "id" }
            )
            .select("*")
            .single();
          profile = upserted;
        }
      }

      setUser(mapProfile(sbUser, profile));
    },
    [supabase]
  );

  const refreshUser = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    setSession(current);
    if (!current?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    await hydrate(current.user, current.access_token);
    setLoading(false);
  }, [supabase, hydrate]);

  useEffect(() => {
    refreshUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        hydrate(nextSession.user, nextSession.access_token).finally(() =>
          setLoading(false)
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, refreshUser, hydrate]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.user || !data.session) throw new Error("Login failed");
      await hydrate(data.user, data.session.access_token);
      setSession(data.session);
      return mapProfile(data.user, {
        display_name: data.user.user_metadata?.full_name,
        email: data.user.email,
        role: "user",
        coins: 50,
        total_hours: 0,
      });
    },
    [supabase, hydrate]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Signup failed");

      if (data.session) {
        await hydrate(data.user, data.session.access_token);
        setSession(data.session);
      } else {
        // Email confirmation may be required
        setUser(
          mapProfile(data.user, {
            display_name: name,
            email: data.user.email,
            coins: 50,
            total_hours: 0,
            role: "user",
          })
        );
      }

      return mapProfile(data.user, {
        display_name: name,
        email: data.user.email,
        coins: 50,
        total_hours: 0,
        role: "user",
      });
    },
    [supabase, hydrate]
  );

  const loginWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams:
            provider === "google"
              ? { access_type: "offline", prompt: "consent" }
              : undefined,
        },
      });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      login,
      signup,
      loginWithOAuth,
      logout,
      refreshUser,
      setUser,
    }),
    [
      user,
      session,
      loading,
      login,
      signup,
      loginWithOAuth,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
