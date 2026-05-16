// Refund a Razorpay payment. Admin only.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient, userFromRequest } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const user = await userFromRequest(req);
  if (!user) return json({ error: "Unauthenticated" }, 401);

  const sb = serviceClient();
  const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") return json({ error: "Admin only" }, 403);

  const { payment_id, amount } = await req.json();
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) return json({ error: "Razorpay env not configured" }, 500);

  const basic = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}/refund`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data?.error?.description ?? "Refund failed" }, 500);
  return json({ ok: true, refund: data });
});
