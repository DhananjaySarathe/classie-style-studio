import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";
import { useOrders } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account/returns/new")({
  component: NewReturnPage,
  validateSearch: (s: Record<string, unknown>) => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
});

function NewReturnPage() {
  const { order } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [] } = useOrders();
  const [orderId, setOrderId] = useState<string>(order ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) return toast.error("Pick an order and tell us why");
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("returns").insert({
      order_id: orderId,
      user_id: user.id,
      reason,
      status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Return request submitted");
    navigate({ to: "/account" });
  }

  return (
    <AccountLayout title="Request a return">
      <form onSubmit={submit} className="space-y-5 max-w-[520px]">
        <div>
          <div className="caps caps-ink mb-2">Which order?</div>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
          >
            <option value="">Select an order…</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} · {new Date(o.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="caps caps-ink mb-2">Reason</div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full bg-transparent border-[0.5px] border-soft-border focus:border-ink p-3 text-[14px] outline-none"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Sending…" : "Submit return request"}
        </button>
      </form>
    </AccountLayout>
  );
}
