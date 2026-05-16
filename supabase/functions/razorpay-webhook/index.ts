// Razorpay webhook receiver. Validates signature, handles payment.captured /
// payment.failed / refund.processed. Idempotent on razorpay_payment_id.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });
  const sig = req.headers.get("X-Razorpay-Signature");
  const raw = await req.text();
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!sig || !secret) return new Response("missing config", { status: 400 });

  const expected = await hmacHex(secret, raw);
  if (expected !== sig) return new Response("bad signature", { status: 400 });

  const evt = JSON.parse(raw);
  const sb = serviceClient();
  const paymentId = evt.payload?.payment?.entity?.id as string | undefined;
  const orderId = evt.payload?.payment?.entity?.order_id as string | undefined;

  switch (evt.event) {
    case "payment.captured":
      if (paymentId && orderId) {
        await sb
          .from("orders")
          .update({
            payment_status: "captured",
            status: "confirmed",
            razorpay_payment_id: paymentId,
          })
          .eq("razorpay_order_id", orderId);
      }
      break;
    case "payment.failed":
      if (orderId) {
        await sb
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("razorpay_order_id", orderId);
      }
      break;
    case "refund.processed":
      if (paymentId) {
        await sb
          .from("orders")
          .update({ payment_status: "refunded" })
          .eq("razorpay_payment_id", paymentId);
      }
      break;
  }
  return new Response("ok", { status: 200 });
});
