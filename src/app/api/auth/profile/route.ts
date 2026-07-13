import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  return ensureProfile();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return ensureProfile(body);
}

async function ensureProfile(body: {
  action?: string;
  display_name?: string;
  avatar_url?: string;
} = {}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = body.action ?? "ensure";
  const provider =
    (user.app_metadata?.provider as string | undefined) ?? "email";

  const displayName =
    body.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Player";

  const avatarUrl =
    body.avatar_url ||
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null;

  if (action === "update") {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.display_name?.trim()) updates.display_name = body.display_name.trim();
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

    const { data: profile, error } = await supabase
      .from("aimbotz_profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ profile });
  }

  const { data: existing } = await supabase
    .from("aimbotz_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { data: created, error: insertError } = await supabase
      .from("aimbotz_profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          display_name: displayName,
          avatar_url: avatarUrl,
          role: "user",
          coins: 50,
          total_hours: 0,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      profile: created,
      auth: { id: user.id, email: user.email, provider },
    });
  }

  return NextResponse.json({
    profile: existing,
    auth: { id: user.id, email: user.email, provider },
  });
}
