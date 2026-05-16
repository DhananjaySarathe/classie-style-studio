// supabase/functions/create-razorpay-order
// Creates an internal order, then a Razorpay order, returning the IDs needed by the client.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient, userFromRequest } from "../_shared/supabase.ts";

type LineItem = {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  product_snapshot: Record<string, unknown>;
  is_bundle: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const body = await req.json();
    const items = body.items as LineItem[];
    if (!Array.isArray(items) || items.length === 0) return json({ error: "Cart is empty" }, 400);

    const user = await userFromRequest(req);
    const sb = serviceClient();

    // Re-compute totals server-side from authoritative prices.
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

    // Insert address (if guest)
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

    // Create order
    const { data: order, error: oErr } = await sb
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_email: user ? null : body.guest_email,
        guest_phone: user ? null : body.guest_phone,
        status: "placed",
        payment_method: "razorpay",
        payment_status: "pending",
        subtotal,
        discount: bundleDiscount,
        shipping_cost: shipping,
        total,
        discount_code: body.discount_code ?? null,
        shipping_address_id: shippingAddressId,
      })
      .select("id, order_number")
      .single();
    if (oErr) return json({ error: oErr.message }, 500);

    // Insert line items
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

    // Call Razorpay
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) return json({ error: "Razorpay env not configured" }, 500);

    const basic = btoa(`${keyId}:${keySecret}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        currency: "INR",
        receipt: order!.order_number,
        notes: { internal_order_id: order!.id },
      }),
    });
    if (!rzpRes.ok) {
      const txt = await rzpRes.text();
      return json({ error: `Razorpay: ${txt}` }, 500);
    }
    const rzpOrder = await rzpRes.json();

    await sb.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", order!.id);

    return json({
      ok: true,
      order_id: order!.id,
      razorpay_order_id: rzpOrder.id,
      key_id: keyId,
      amount: total,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
