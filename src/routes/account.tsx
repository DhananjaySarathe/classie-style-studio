import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";

export const Route = createFileRoute("/account")({ component: AccountDashboard });

function AccountDashboard() {
  const { profile } = useAuth();
  const { data: orders = [] } = useOrders();
  const recent = orders[0];

  return (
    <AccountLayout title={`Welcome back, ${profile?.first_name ?? "friend"}.`}>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Saved looks" value="—" />
        <Stat label="Wishlist" value="—" />
      </div>

      {recent ? (
        <div className="border-[0.5px] border-soft-border p-6 mb-10">
          <div className="caps mb-1">Most recent order</div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="font-display text-[18px]">{recent.order_number as string}</div>
              <div className="text-[11px] text-stone">
                {formatPrice(recent.total as number)} · {String(recent.status).replace(/_/g, " ")}
              </div>
            </div>
            <Link
              to="/account/orders/$id"
              params={{ id: recent.id as string }}
              className="btn-secondary"
            >
              View order
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-[13px] text-stone mb-10">
          You haven't placed an order yet.{" "}
          <Link to="/collections/$slug" params={{ slug: "heels" }} className="border-b border-ink">
            Start browsing.
          </Link>
        </div>
      )}
    </AccountLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[0.5px] border-soft-border p-5">
      <div className="caps mb-2">{label}</div>
      <div className="font-display text-[24px]">{value}</div>
    </div>
  );
}
