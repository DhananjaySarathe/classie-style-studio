// Validates a discount code against the discount_codes table and returns the
// computed discount amount (in paise).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const { code, subtotal } = await req.json();
    if (!code || typeof subtotal !== "number") return json({ error: "Missing fields" }, 400);

    const sb = serviceClient();
    const { data, error } = await sb
      .from("discount_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "Invalid code" }, 400);
    if (!data.is_active) return json({ error: "Code is inactive" }, 400);
    if (data.valid_until && new Date(data.valid_until) < new Date())
      return json({ error: "Code expired" }, 400);
    if (data.usage_limit && data.used_count >= data.usage_limit)
      return json({ error: "Code exhausted" }, 400);
    if (subtotal < (data.min_order_value ?? 0)) {
      return json(
        { error: `Minimum order ₹${((data.min_order_value ?? 0) / 100).toFixed(0)}` },
        400,
      );
    }

    let amount =
      data.discount_type === "percentage"
        ? Math.round((subtotal * data.discount_value) / 100)
        : data.discount_value;
    if (data.max_discount) amount = Math.min(amount, data.max_discount);
    amount = Math.min(amount, subtotal);

    return json({ ok: true, code: data.code, amount });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
