import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AccountLayout } from "@/components/AccountLayout";
import { useOrder } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import { callEdge } from "@/routes/auth.login";

export const Route = createFileRoute("/account/orders/$id")({ component: OrderDetail });

const STATUSES = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"] as const;

function OrderDetail() {
  const { id } = Route.useParams();
  const { data: order } = useOrder(id);
  const [tracking, setTracking] = useState<{ at: string; label: string }[]>([]);

  useEffect(() => {
    if (!order) return;
    callEdge("get-shipment-tracking", { order_id: id }).then((r) => {
      const events = (r as unknown as { events?: { at: string; label: string }[] }).events;
      if (r.ok && Array.isArray(events)) setTracking(events);
    });
  }, [order, id]);

  if (!order) {
    return (
      <AccountLayout title="Order">
        <div className="text-stone text-[13px]">Loading…</div>
      </AccountLayout>
    );
  }

  const statusIdx = STATUSES.indexOf(order.status as (typeof STATUSES)[number]);

  return (
    <AccountLayout title={`Order ${order.order_number as string}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="text-[12px] text-stone">
          Placed{" "}
          {new Date(order.created_at as string).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <span className="caps px-3 py-1 bg-cream-warm text-ink">
          {String(order.status).replace(/_/g, " ")}
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STATUSES.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div
              className={
                "w-3 h-3 rounded-full " + (i <= statusIdx ? "bg-burgundy" : "bg-soft-border")
              }
            />
            {i < STATUSES.length - 1 && (
              <div
                className={"flex-1 h-[1px] " + (i < statusIdx ? "bg-burgundy" : "bg-soft-border")}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-stone mb-10 -mt-8">
        {STATUSES.map((s) => (
          <span key={s} className="text-center flex-1">
            {s.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      {tracking.length > 0 && (
        <div className="mb-10">
          <h2 className="caps caps-ink mb-3">Tracking timeline</h2>
          <ul className="border-l border-soft-border pl-5 space-y-3">
            {tracking.map((t, i) => (
              <li key={i} className="text-[12px]">
                <div className="text-stone">{new Date(t.at).toLocaleString("en-IN")}</div>
                <div>{t.label}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="caps caps-ink mb-3">Items</h2>
      <div className="divide-y divide-soft-border mb-10">
        {(order.items ?? []).map((it, idx) => (
          <div key={idx} className="py-4 flex gap-4">
            <div className="w-[60px] h-[75px] bg-card-tint flex-shrink-0">
              {it.product_snapshot?.image && (
                <img
                  src={it.product_snapshot.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-display text-[15px]">{it.product_snapshot?.name ?? "Item"}</div>
              <div className="text-[11px] text-stone">Qty {it.quantity}</div>
            </div>
            <div className="text-[13px]">{formatPrice(it.line_total)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 text-[12px] text-stone mb-10">
        <div>
          <div className="caps caps-ink mb-2">Shipping address</div>
          <pre className="font-sans whitespace-pre-wrap leading-[1.7]">
            {order.shipping_address
              ? `${order.shipping_address.full_name ?? ""}
${order.shipping_address.line1 ?? ""}
${order.shipping_address.line2 ?? ""}
${order.shipping_address.city ?? ""}, ${order.shipping_address.state ?? ""} ${order.shipping_address.pincode ?? ""}`
              : "—"}
          </pre>
        </div>
        <div>
          <div className="caps caps-ink mb-2">Payment</div>
          <div>
            {String(order.payment_method).toUpperCase()} · {String(order.payment_status)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/account/returns/new" search={{ order: id } as never} className="btn-secondary">
          Return this order
        </Link>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Order ${order.order_number} — need help`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          Need help?
        </a>
      </div>
    </AccountLayout>
  );
}
