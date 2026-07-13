import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type Body = {
  action?: "me" | "ensure" | "update";
  display_name?: string;
  avatar_url?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // User-scoped client to validate JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    let action: Body["action"] = "me";
    let body: Body = {};
    if (req.method === "POST") {
      body = (await req.json().catch(() => ({}))) as Body;
      action = body.action ?? "ensure";
    } else if (req.method === "GET") {
      action = "me";
    } else {
      return json({ error: "Method not allowed" }, 405);
    }

    if (action === "ensure" || action === "me") {
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

      const { data: existing } = await admin
        .from("aimbotz_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const { data: created, error: insertError } = await admin
          .from("aimbotz_profiles")
          .insert({
            id: user.id,
            email: user.email,
            display_name: displayName,
            avatar_url: avatarUrl,
            role: "user",
            coins: 50,
            total_hours: 0,
          })
          .select("*")
          .single();

        if (insertError) {
          return json({ error: insertError.message }, 400);
        }

        return json({
          profile: created,
          auth: {
            id: user.id,
            email: user.email,
            provider,
            providers: user.app_metadata?.providers ?? [provider],
          },
        });
      }

      // Refresh OAuth avatar/name if empty
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (!existing.avatar_url && avatarUrl) patch.avatar_url = avatarUrl;
      if (user.email && existing.email !== user.email) patch.email = user.email;

      if (Object.keys(patch).length > 1) {
        await admin.from("aimbotz_profiles").update(patch).eq("id", user.id);
      }

      const { data: profile } = await admin
        .from("aimbotz_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return json({
        profile,
        auth: {
          id: user.id,
          email: user.email,
          provider,
          providers: user.app_metadata?.providers ?? [provider],
        },
      });
    }

    if (action === "update") {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (body.display_name?.trim()) updates.display_name = body.display_name.trim();
      if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

      const { data: profile, error } = await admin
        .from("aimbotz_profiles")
        .update(updates)
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ profile });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return json({ error: message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
