// Stub: returns a synthetic timeline based on the order's age.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const { order_id } = await req.json();
  if (!order_id) return json({ error: "Missing order_id" }, 400);

  const sb = serviceClient();
  const { data: order } = await sb
    .from("orders")
    .select("created_at, status")
    .eq("id", order_id)
    .maybeSingle();
  if (!order) return json({ ok: true, events: [] });

  const t0 = new Date(order.created_at as string).getTime();
  const events = [
    { at: new Date(t0).toISOString(), label: "Order placed" },
    { at: new Date(t0 + 6 * 3600_000).toISOString(), label: "Order confirmed" },
    { at: new Date(t0 + 24 * 3600_000).toISOString(), label: "Picked up from warehouse" },
    { at: new Date(t0 + 48 * 3600_000).toISOString(), label: "In transit" },
    { at: new Date(t0 + 72 * 3600_000).toISOString(), label: "Out for delivery" },
  ].filter((e) => new Date(e.at).getTime() <= Date.now());

  return json({ ok: true, events });
});
