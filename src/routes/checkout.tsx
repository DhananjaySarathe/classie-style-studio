import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart, selectSubtotal, selectBundleDiscount } from "@/stores/cart";
import { formatPrice, supabase, getOrCreateGuestSessionId } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { callEdge } from "@/routes/auth.login";
import { openRazorpay } from "@/lib/razorpay";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code : undefined,
  }),
});

type Section = "address" | "shipping" | "payment";

function CheckoutPage() {
  const navigate = useNavigate();
  const { code } = Route.useSearch();
  const { user, profile } = useAuth();
  const cart = useCart();
  const subtotal = useCart(selectSubtotal);
  const bundleDiscount = useCart(selectBundleDiscount);

  const [open, setOpen] = useState<Section>("address");
  const [done, setDone] = useState<Record<Section, boolean>>({
    address: false,
    shipping: false,
    payment: false,
  });

  const [addr, setAddr] = useState({
    full_name: profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "",
    email: profile?.email ?? "",
    mobile: profile?.phone ?? "",
    line1: "",
    line2: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (cart.items.length === 0) navigate({ to: "/cart" });
  }, [cart.items.length, navigate]);

  async function pincodeBlur() {
    if (!/^\d{6}$/.test(addr.pincode)) return;
    const res = await callEdge("check-pincode-serviceability", { pincode: addr.pincode });
    if (res.ok) {
      const d = res as { city?: string; state?: string };
      if (d.city) setAddr((a) => ({ ...a, city: d.city as string }));
      if (d.state) setAddr((a) => ({ ...a, state: d.state as string }));
    }
  }

  const codeDiscount = 0; // (already applied at cart; future enhancement to revalidate here)
  const totalDiscount = bundleDiscount + codeDiscount;
  const afterDiscount = Math.max(0, subtotal - totalDiscount);
  const FREE = 99900;
  const shipCost = shipping === "express" ? 14900 : afterDiscount >= FREE ? 0 : 9900;
  const total = afterDiscount + shipCost;

  function gotoNext(from: Section) {
    setDone((d) => ({ ...d, [from]: true }));
    if (from === "address") setOpen("shipping");
    else if (from === "shipping") setOpen("payment");
  }

  async function placeOrder() {
    if (
      !Object.values(addr)
        .slice(0, 7)
        .every((v) => String(v).trim().length > 0)
    ) {
      toast.error("Fill in the address");
      return;
    }
    setPlacing(true);
    try {
      const sessionId = user ? null : getOrCreateGuestSessionId();
      const payload = {
        items: cart.items.map((i) => ({
          product_id: i.productId,
          variant_id: i.variantId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          product_snapshot: { name: i.name, image: i.image, variantLabel: i.variantLabel },
          is_bundle: i.isBundle,
        })),
        address: addr,
        shipping_method: shipping,
        shipping_cost: shipCost,
        subtotal,
        discount: totalDiscount,
        total,
        discount_code: code ?? null,
        guest_email: user ? null : addr.email,
        guest_phone: user ? null : addr.mobile,
        session_id: sessionId,
      };

      if (payment === "cod") {
        const res = await callEdge("create-cod-order", payload);
        if (!res.ok) throw new Error((res as { error?: string }).error ?? "Could not place order");
        const order = res as unknown as { order_id: string };
        cart.clear();
        navigate({ to: "/order/$id/confirmation", params: { id: order.order_id } });
      } else {
        const res = await callEdge("create-razorpay-order", payload);
        if (!res.ok)
          throw new Error((res as { error?: string }).error ?? "Could not start payment");
        const data = res as unknown as {
          razorpay_order_id: string;
          key_id: string;
          amount: number;
          order_id: string;
        };
        await openRazorpay({
          key: data.key_id,
          amount: data.amount,
          currency: "INR",
          name: "CLASSIE",
          description: `Order ${data.order_id.slice(0, 8)}`,
          order_id: data.razorpay_order_id,
          prefill: { name: addr.full_name, email: addr.email, contact: addr.mobile },
          theme: { color: "#6B1A2D" },
          handler: async (resp) => {
            const verify = await callEdge("verify-razorpay-payment", {
              order_id: data.order_id,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            if (!verify.ok) {
              toast.error("Payment verification failed");
              return;
            }
            cart.clear();
            navigate({ to: "/order/$id/confirmation", params: { id: data.order_id } });
          },
          modal: { ondismiss: () => toast("Payment cancelled") },
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (cart.items.length === 0) return null;

  return (
    <SiteLayout>
      <section className="max-w-[1200px] mx-auto px-4 md:px-7 py-14 grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-10">
        <div className="space-y-4">
          <h1 className="font-display text-[32px] mb-4">Checkout</h1>

          <Section
            n={1}
            title="Contact & address"
            open={open === "address"}
            done={done.address}
            onOpen={() => setOpen("address")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <In
                label="Email"
                type="email"
                value={addr.email}
                onChange={(v) => setAddr({ ...addr, email: v })}
              />
              <In
                label="Mobile"
                type="tel"
                value={addr.mobile}
                onChange={(v) => setAddr({ ...addr, mobile: v.replace(/\D/g, "").slice(0, 10) })}
              />
              <In
                label="Full name"
                value={addr.full_name}
                onChange={(v) => setAddr({ ...addr, full_name: v })}
                full
              />
              <In
                label="Address line 1"
                value={addr.line1}
                onChange={(v) => setAddr({ ...addr, line1: v })}
                full
              />
              <In
                label="Address line 2 (optional)"
                value={addr.line2}
                onChange={(v) => setAddr({ ...addr, line2: v })}
                full
              />
              <In
                label="Pincode"
                value={addr.pincode}
                onChange={(v) => setAddr({ ...addr, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                onBlur={pincodeBlur}
              />
              <In label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
              <In
                label="State"
                value={addr.state}
                onChange={(v) => setAddr({ ...addr, state: v })}
              />
            </div>
            <button onClick={() => gotoNext("address")} className="btn-primary mt-6">
              Continue to shipping
            </button>
          </Section>

          <Section
            n={2}
            title="Shipping & delivery"
            open={open === "shipping"}
            done={done.shipping}
            locked={!done.address}
            onOpen={() => done.address && setOpen("shipping")}
          >
            <div className="space-y-3">
              <Radio
                checked={shipping === "standard"}
                onChange={() => setShipping("standard")}
                label="Standard · 3–5 days"
                detail={afterDiscount >= FREE ? "Free above ₹999" : "₹99"}
              />
              <Radio
                checked={shipping === "express"}
                onChange={() => setShipping("express")}
                label="Express · 1–2 days"
                detail="₹149"
              />
            </div>
            <button onClick={() => gotoNext("shipping")} className="btn-primary mt-6">
              Continue to payment
            </button>
          </Section>

          <Section
            n={3}
            title="Payment"
            open={open === "payment"}
            done={done.payment}
            locked={!done.shipping}
            onOpen={() => done.shipping && setOpen("payment")}
          >
            <div className="space-y-3">
              <Radio
                checked={payment === "razorpay"}
                onChange={() => setPayment("razorpay")}
                label="Razorpay · UPI, Cards, Net Banking"
                detail="Secure"
              />
              <Radio
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                label="Cash on Delivery"
                detail="OTP on delivery"
              />
            </div>
            {payment === "cod" && (
              <div className="text-[11px] text-stone mt-3">
                COD orders require OTP confirmation on delivery.
              </div>
            )}
            <button onClick={placeOrder} disabled={placing} className="btn-primary w-full mt-6">
              {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
            </button>
          </Section>
        </div>

        <aside className="md:sticky md:top-24 md:self-start border-[0.5px] border-soft-border p-6 space-y-3">
          <h2 className="caps caps-ink mb-3">Order summary</h2>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {cart.items.map((i) => (
              <div key={i.productId + (i.variantId ?? "")} className="flex gap-3 text-[12px]">
                <div className="w-[48px] h-[60px] bg-card-tint flex-shrink-0">
                  {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[14px] truncate">{i.name}</div>
                  <div className="text-stone">
                    Qty {i.quantity}
                    {i.variantLabel ? ` · ${i.variantLabel}` : ""}
                  </div>
                </div>
                <div className="text-right">{formatPrice(i.unitPrice * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-soft-border pt-3 space-y-1.5 text-[13px]">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {bundleDiscount > 0 && (
              <Row label="Bundle discount" value={`− ${formatPrice(bundleDiscount)}`} />
            )}
            <Row label="Shipping" value={shipCost === 0 ? "FREE" : formatPrice(shipCost)} />
            <div className="border-t border-soft-border my-2" />
            <Row
              label="Total"
              value={<span className="font-display text-[18px]">{formatPrice(total)}</span>}
            />
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Section({
  n,
  title,
  open,
  done,
  locked,
  onOpen,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  done?: boolean;
  locked?: boolean;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-[0.5px] border-soft-border">
      <button
        onClick={onOpen}
        disabled={locked}
        className="w-full flex items-center justify-between px-5 py-4 disabled:opacity-50"
      >
        <span className="caps caps-ink">
          {n}. {title}
        </span>
        {done && !open && <span className="text-[11px] text-success">✓ Saved</span>}
      </button>
      {open && <div className="px-5 pb-6 border-t border-soft-border pt-5">{children}</div>}
    </div>
  );
}

function In(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
  onBlur?: () => void;
}) {
  return (
    <div className={props.full ? "sm:col-span-2" : ""}>
      <div className="caps caps-ink mb-2">{props.label}</div>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
      />
    </div>
  );
}

function Radio({
  checked,
  onChange,
  label,
  detail,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  detail?: string;
}) {
  return (
    <label className="flex items-center justify-between border-[0.5px] border-soft-border px-4 py-3 cursor-pointer hover:border-ink">
      <div className="flex items-center gap-3">
        <input type="radio" checked={checked} onChange={onChange} className="accent-ink" />
        <span className="text-[13px]">{label}</span>
      </div>
      {detail && <span className="text-[11px] text-stone">{detail}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-stone">{label}</span>
      <span>{value}</span>
    </div>
  );
}
