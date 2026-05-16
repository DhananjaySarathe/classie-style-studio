import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart, selectSubtotal, selectBundleDiscount } from "@/stores/cart";
import { formatPrice } from "@/lib/supabase";
import { callEdge } from "@/routes/auth.login";

export const Route = createFileRoute("/cart")({ component: CartPage });

const FREE_SHIP_THRESHOLD = 99900; // ₹999

function CartPage() {
  const cart = useCart();
  const subtotal = useCart(selectSubtotal);
  const bundleDiscount = useCart(selectBundleDiscount);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<null | { code: string; amount: number }>(null);
  const [busy, setBusy] = useState(false);

  const codeDiscount = applied?.amount ?? 0;
  const totalDiscount = bundleDiscount + codeDiscount;
  const afterDiscount = Math.max(0, subtotal - totalDiscount);
  const shipping = afterDiscount >= FREE_SHIP_THRESHOLD || cart.items.length === 0 ? 0 : 9900;
  const total = afterDiscount + shipping;

  async function applyCode() {
    if (!code.trim()) return;
    setBusy(true);
    const res = await callEdge("validate-discount", { code: code.trim().toUpperCase(), subtotal });
    setBusy(false);
    if (!res.ok) {
      toast.error((res as { error?: string }).error ?? "Invalid code");
      return;
    }
    const data = res as unknown as { code: string; amount: number };
    setApplied({ code: data.code, amount: data.amount });
    toast.success(`Code ${data.code} applied`);
  }

  if (cart.items.length === 0) {
    return (
      <SiteLayout>
        <section className="max-w-[480px] mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-[28px] mb-3">Your bag is empty</h1>
          <p className="text-[13px] text-stone mb-8">
            Find a heel you love and pair it with a charm.
          </p>
          <Link
            to="/collections/$slug"
            params={{ slug: "heels" }}
            className="btn-primary inline-block"
          >
            Shop heels
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="max-w-[1200px] mx-auto px-4 md:px-7 py-14 grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-10">
        <div>
          <h1 className="font-display text-[32px] mb-1">Your bag</h1>
          <div className="text-[11px] text-stone mb-8">
            {cart.items.length} item{cart.items.length === 1 ? "" : "s"}
          </div>

          <div className="divide-y divide-soft-border">
            {cart.items.map((i) => (
              <div key={i.productId + (i.variantId ?? "")} className="py-6 flex gap-4">
                <div className="w-[80px] h-[100px] bg-card-tint flex-shrink-0 overflow-hidden">
                  {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/products/$slug"
                    params={{ slug: i.slug }}
                    className="font-display text-[16px]"
                  >
                    {i.name}
                  </Link>
                  <div className="text-[11px] text-stone mt-1">
                    {i.variantLabel ? `Size ${i.variantLabel}` : "Universal fit"}
                  </div>
                  {i.isBundle && (
                    <div className="text-[11px] text-burgundy mt-1">5% bundle discount applied</div>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center border-[0.5px] border-ink">
                      <button
                        onClick={() => cart.setQty(i.productId, i.variantId, i.quantity - 1)}
                        className="p-2"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-2 text-[13px] min-w-[24px] text-center">
                        {i.quantity}
                      </span>
                      <button
                        onClick={() => cart.setQty(i.productId, i.variantId, i.quantity + 1)}
                        className="p-2"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="text-[12px] text-stone">{formatPrice(i.unitPrice)} each</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px]">{formatPrice(i.unitPrice * i.quantity)}</div>
                  <button
                    onClick={() => cart.remove(i.productId, i.variantId)}
                    aria-label="Remove"
                    className="text-stone hover:text-ink mt-3"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:sticky md:top-24 md:self-start border-[0.5px] border-soft-border p-6">
          <h2 className="caps caps-ink mb-5">Order summary</h2>
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          {bundleDiscount > 0 && (
            <SummaryRow label="Bundle discount" value={`− ${formatPrice(bundleDiscount)}`} />
          )}
          {applied && (
            <SummaryRow
              label={`Code ${applied.code}`}
              value={
                <span className="flex items-center gap-2">
                  − {formatPrice(applied.amount)}
                  <button onClick={() => setApplied(null)} className="text-stone hover:text-ink">
                    <X size={11} />
                  </button>
                </span>
              }
            />
          )}
          <SummaryRow label="Shipping" value={shipping === 0 ? "FREE" : formatPrice(shipping)} />
          <div className="border-t border-soft-border mt-3 pt-3" />
          <SummaryRow
            label="Total"
            value={<span className="font-display text-[18px]">{formatPrice(total)}</span>}
            bold
          />

          <div className="mt-6">
            <div className="caps caps-ink mb-2">Discount code</div>
            <div className="flex items-end gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="FIRST10"
                className="flex-1 bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
              />
              <button
                onClick={applyCode}
                disabled={busy}
                className="text-[11px] uppercase tracking-[0.18em] border-b-[0.5px] border-ink py-2"
              >
                {busy ? "…" : "Apply"}
              </button>
            </div>
          </div>

          <Link
            to="/checkout"
            search={{ code: applied?.code } as never}
            className="btn-primary w-full mt-6 text-center"
          >
            Proceed to checkout
          </Link>

          <div className="text-[11px] text-stone mt-4 text-center">
            Secure checkout · Free returns · COD available
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className={"flex justify-between py-1.5 text-[13px] " + (bold ? "" : "text-stone")}>
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
