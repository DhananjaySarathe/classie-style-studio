import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useOrder } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";

export const Route = createFileRoute("/order/$id/confirmation")({ component: ConfirmationPage });

function ConfirmationPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-[720px] mx-auto px-4 py-24 text-center text-stone text-[13px]">
          Loading order…
        </div>
      </SiteLayout>
    );
  }

  if (!order) {
    return (
      <SiteLayout>
        <div className="max-w-[720px] mx-auto px-4 py-24 text-center">
          <h1 className="display-page mb-3">Order not found</h1>
          <p className="text-[13px] text-stone">
            If you just placed it, give us a moment and refresh.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const name = order.shipping_address?.full_name ?? "there";
  const eta = new Date(new Date(order.created_at as string).getTime() + 4 * 24 * 60 * 60 * 1000);

  return (
    <SiteLayout>
      <section className="max-w-[720px] mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="caps mb-3">CONFIRMED</div>
          <h1 className="font-display text-[36px] mb-3">
            Thank you, {String(name).split(" ")[0]}.
          </h1>
          <p className="text-[13px] text-stone">Your order is placed and we're getting it ready.</p>
        </div>

        <div className="border-[0.5px] border-soft-border p-6 mb-8 grid grid-cols-2 gap-5 text-[13px]">
          <Item label="Order number" value={order.order_number as string} />
          <Item
            label="Estimated delivery"
            value={eta.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          />
          <Item label="Total" value={formatPrice(order.total as number)} />
          <Item
            label="Tracking"
            value={
              <Link
                to="/account/orders/$id"
                params={{ id }}
                className="text-ink border-b border-ink"
              >
                Track this order
              </Link>
            }
          />
        </div>

        <h2 className="caps caps-ink mb-4">Items</h2>
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
                <div className="font-display text-[15px]">
                  {it.product_snapshot?.name ?? "Item"}
                </div>
                <div className="text-[11px] text-stone">
                  Qty {it.quantity}
                  {it.product_snapshot?.variantLabel
                    ? ` · Size ${it.product_snapshot.variantLabel}`
                    : ""}
                </div>
              </div>
              <div className="text-[13px]">{formatPrice(it.line_total)}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/" className="btn-secondary">
            Continue shopping
          </Link>
        </div>

        <p className="text-[11px] text-stone text-center mt-10">
          A confirmation has been sent to{" "}
          {order.shipping_address?.email ?? order.guest_email ?? "your email"}
          {order.guest_phone ? ` and ${order.guest_phone}.` : "."}
        </p>
      </section>
    </SiteLayout>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="caps mb-1">{label}</div>
      <div className="text-[14px]">{value}</div>
    </div>
  );
}
