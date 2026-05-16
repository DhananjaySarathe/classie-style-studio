// Generates a 6-digit OTP, stores hashed in `otps`, and (stubbed) "sends" it.
// Real MSG91 integration commented out below — swap when creds are available.

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
    const { phone } = await req.json();
    if (!/^\d{10}$/.test(phone)) return json({ error: "Phone must be 10 digits" }, 400);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = await sha256Hex(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const sb = serviceClient();
    // Invalidate previous OTPs for this phone.
    await sb.from("otps").delete().eq("phone", phone).eq("used", false);
    await sb.from("otps").insert({ phone, hashed_otp: hashed, expires_at: expiresAt });

    // TODO: real MSG91 send
    // await fetch("https://control.msg91.com/api/v5/otp", { ... });
    console.log(`[send-otp] STUB — OTP for ${phone}: ${otp}`);

    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
