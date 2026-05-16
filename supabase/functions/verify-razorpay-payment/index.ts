// Verifies Razorpay payment signature and marks the order as captured.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();
    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: "Missing fields" }, 400);
    }
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) return json({ error: "Razorpay secret not set" }, 500);

    const expected = await hmacHex(secret, `${razorpay_order_id}|${razorpay_payment_id}`);
    const valid = timingSafeEqual(expected, razorpay_signature);

    const sb = serviceClient();
    if (!valid) {
      await sb.from("orders").update({ payment_status: "failed" }).eq("id", order_id);
      return json({ error: "Invalid signature" }, 400);
    }
    await sb
      .from("orders")
      .update({
        payment_status: "captured",
        razorpay_payment_id,
        status: "confirmed",
      })
      .eq("id", order_id);

    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
