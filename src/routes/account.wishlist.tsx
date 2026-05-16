import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AccountLayout } from "@/components/AccountLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/queries";
import { useWishlist } from "@/stores/wishlist";

export const Route = createFileRoute("/account/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { slugs } = useWishlist();
  const { data: all = [] } = useProducts({});
  const items = useMemo(() => all.filter((p) => slugs.includes(p.slug)), [all, slugs]);

  return (
    <AccountLayout title="Wishlist">
      {items.length === 0 ? (
        <div>
          <p className="text-[13px] text-stone mb-6">
            Tap the heart on any product to save it here.
          </p>
          <Link
            to="/collections/$slug"
            params={{ slug: "heels" }}
            className="btn-primary inline-block"
          >
            Browse heels
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
