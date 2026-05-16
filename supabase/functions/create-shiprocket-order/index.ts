// Stub: generates fake AWB + tracking URL and stores on the order.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const { order_id } = await req.json();
  if (!order_id) return json({ error: "Missing order_id" }, 400);

  const awb = "AWB" + Date.now().toString().slice(-9);
  const sb = serviceClient();
  await sb
    .from("orders")
    .update({
      shiprocket_order_id: "SR" + Date.now(),
      shiprocket_awb_code: awb,
      shiprocket_tracking_url: `https://shiprocket.co/tracking/${awb}`,
      status: "shipped",
    })
    .eq("id", order_id);

  return json({ ok: true, awb });
});
