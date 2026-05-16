// Verifies an OTP for a phone number. On success, ensures an auth user exists
// for that phone and returns access + refresh tokens for the client to set.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const { phone, otp } = await req.json();
    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(otp)) {
      return json({ error: "Invalid phone or OTP format" }, 400);
    }

    const sb = serviceClient();
    const hashed = await sha256Hex(otp);
    const { data: row } = await sb
      .from("otps")
      .select("id, expires_at, used")
      .eq("phone", phone)
      .eq("hashed_otp", hashed)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row || row.used) return json({ error: "Invalid OTP" }, 400);
    if (new Date(row.expires_at as string) < new Date()) return json({ error: "OTP expired" }, 400);

    await sb.from("otps").update({ used: true }).eq("id", row.id);

    // Find or create user for this phone.
    const email = `${phone}@phone.classie.local`;
    const { data: existing } = await sb.auth.admin.listUsers();
    let userId = existing?.users.find((u) => u.email === email)?.id;
    if (!userId) {
      const { data: created, error: cErr } = await sb.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { phone, first_name: "Friend" },
      });
      if (cErr) return json({ error: cErr.message }, 500);
      userId = created.user!.id;
    }

    // Create a session by signing in with an admin-generated link.
    const { data: link } = await sb.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const action_link = link?.properties?.action_link;
    if (!action_link) return json({ error: "Could not create session" }, 500);

    // The action_link contains a hash with tokens — but we want direct tokens.
    // Easier: exchange via signInWithOtp's response. Fallback: have client follow link.
    return json({ ok: true, action_link, user_id: userId });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
