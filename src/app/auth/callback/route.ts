import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure AimBotz profile exists (edge function + local fallback)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-profile`;
        await fetch(fnUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "ensure" }),
        }).catch(() => undefined);

        // Client-side fallback upsert if edge fn not deployed yet
        const meta = session.user.user_metadata ?? {};
        await supabase.from("aimbotz_profiles").upsert(
          {
            id: session.user.id,
            email: session.user.email,
            display_name:
              meta.full_name ||
              meta.name ||
              session.user.email?.split("@")[0] ||
              "Player",
            avatar_url: meta.avatar_url || meta.picture || null,
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
