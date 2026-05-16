// Creates a COD order. Server re-computes totals from the cart payload.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient, userFromRequest } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const body = await req.json();
    const items = body.items as Array<{
      product_id: string;
      variant_id: string | null;
      quantity: number;
      product_snapshot: Record<string, unknown>;
      is_bundle: boolean;
    }>;
    if (!items?.length) return json({ error: "Cart is empty" }, 400);

    const user = await userFromRequest(req);
    const sb = serviceClient();

    const ids = Array.from(new Set(items.map((i) => i.product_id)));
    const { data: products, error: pErr } = await sb
      .from("products")
      .select("id, price")
      .in("id", ids);
    if (pErr) return json({ error: pErr.message }, 500);
    const priceById = new Map(
      (products as { id: string; price: number }[]).map((p) => [p.id, p.price]),
    );

    let subtotal = 0;
    let bundleDiscount = 0;
    for (const i of items) {
      const p = priceById.get(i.product_id);
      if (!p) return json({ error: "Unknown product" }, 400);
      const line = p * i.quantity;
      subtotal += line;
      if (i.is_bundle) bundleDiscount += Math.round(line * 0.05);
    }
    const FREE = 99900;
    const shipping =
      body.shipping_method === "express" ? 14900 : subtotal - bundleDiscount >= FREE ? 0 : 9900;
    const total = subtotal - bundleDiscount + shipping;

    let shippingAddressId: string | null = null;
    if (user && body.address) {
      const { data: addr } = await sb
        .from("addresses")
        .insert({
          user_id: user.id,
          full_name: body.address.full_name,
          mobile: body.address.mobile,
          line1: body.address.line1,
          line2: body.address.line2,
          pincode: body.address.pincode,
          city: body.address.city,
          state: body.address.state,
        })
        .select("id")
        .single();
      shippingAddressId = addr?.id ?? null;
    }

    const { data: order, error: oErr } = await sb
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_email: user ? null : body.guest_email,
        guest_phone: user ? null : body.guest_phone,
        status: "confirmed",
        payment_method: "cod",
        payment_status: "pending",
        subtotal,
        discount: bundleDiscount,
        shipping_cost: shipping,
        total,
        shipping_address_id: shippingAddressId,
      })
      .select("id")
      .single();
    if (oErr) return json({ error: oErr.message }, 500);

    await sb.from("order_items").insert(
      items.map((i) => ({
        order_id: order!.id,
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: priceById.get(i.product_id)!,
        line_total: priceById.get(i.product_id)! * i.quantity,
        product_snapshot: i.product_snapshot,
      })),
    );

    return json({ ok: true, order_id: order!.id });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
