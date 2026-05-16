import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/supabase";

export const Route = createFileRoute("/track-order")({ component: TrackOrderPage });

type LookupResult = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shiprocket_tracking_url: string | null;
  guest_phone: string | null;
};

function TrackOrderPage() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setResult(null);
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, shiprocket_tracking_url, guest_phone")
      .eq("order_number", orderNo.trim().toUpperCase())
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      setErr("We couldn't find that order.");
      return;
    }
    const row = data as unknown as LookupResult;
    if (row.guest_phone && row.guest_phone !== phone.replace(/\D/g, "").slice(-10)) {
      setErr("Phone doesn't match this order.");
      return;
    }
    setResult(row);
  }

  return (
    <SiteLayout>
      <section className="max-w-[560px] mx-auto px-4 py-20">
        <div className="caps mb-3 text-center">TRACKING</div>
        <h1 className="display-page text-center mb-10">Where's my order?</h1>

        <form onSubmit={lookup} className="space-y-5">
          <Field
            label="Order number"
            value={orderNo}
            onChange={setOrderNo}
            placeholder="CL-2511-000001"
          />
          <Field
            label="Phone number"
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
            placeholder="10 digits"
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Looking up…" : "Track"}
          </button>
        </form>

        {err && <div className="mt-6 text-[12px] text-danger text-center">{err}</div>}

        {result && (
          <div className="mt-10 border-[0.5px] border-soft-border p-6">
            <div className="caps mb-1">Order</div>
            <div className="font-display text-[20px]">{result.order_number}</div>
            <div className="text-[12px] text-stone">
              {new Date(result.created_at).toLocaleString("en-IN")}
            </div>
            <div className="mt-4 text-[13px]">
              Status:{" "}
              <span className="font-medium">{String(result.status).replace(/_/g, " ")}</span>
            </div>
            <div className="mt-1 text-[13px]">Total: {formatPrice(result.total)}</div>
            {result.shiprocket_tracking_url && (
              <a
                href={result.shiprocket_tracking_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary inline-block mt-5"
              >
                Live tracking →
              </a>
            )}
            <div className="mt-5 text-[11px] text-stone">
              For more,{" "}
              <a href="/auth/login" className="border-b border-ink">
                sign in
              </a>{" "}
              to your account.
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="caps caps-ink mb-2">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required
        className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
      />
    </div>
  );
}
