import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import { useWishlist } from "@/stores/wishlist";
import { QuickViewSheet } from "@/components/QuickViewSheet";

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const active = wishlist.has(product.slug);
  const [quickOpen, setQuickOpen] = useState(false);

  const image = product.images?.[0]?.url ?? "";
  const alt = product.images?.[1]?.url ?? null;
  const hasSwap = !!alt && alt !== image;

  return (
    <>
      <div className="group">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block"
          aria-label={product.name}
        >
          <div className="relative aspect-[4/5] bg-card-tint overflow-hidden">
            {image && (
              <img
                src={image}
                alt={product.name}
                className={
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 " +
                  (hasSwap ? "group-hover:opacity-0" : "")
                }
              />
            )}
            {hasSwap && alt && (
              <img
                src={alt}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}

            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="absolute top-3 left-3 bg-ink text-bg text-[10px] uppercase tracking-[0.18em] px-2 py-1 z-10">
                −
                {Math.round(
                  ((product.compare_at_price - product.price) / product.compare_at_price) * 100,
                )}
                %
              </span>
            )}
            {product.is_new && !product.compare_at_price && (
              <span className="absolute top-3 left-3 bg-burgundy text-bg text-[10px] uppercase tracking-[0.18em] px-2 py-1 z-10">
                New
              </span>
            )}

            <button
              aria-label="Wishlist"
              onClick={(e) => {
                e.preventDefault();
                wishlist.toggle(product.slug);
              }}
              className="absolute top-3 right-3 p-1.5 z-10"
            >
              <Heart
                size={16}
                strokeWidth={1.25}
                className={active ? "fill-burgundy text-burgundy" : "text-ink/55 hover:text-ink"}
              />
            </button>

            {/* Quick view overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickOpen(true);
              }}
              className="absolute bottom-0 left-0 right-0 bg-ink/0 group-hover:bg-ink text-bg/0 group-hover:text-bg text-[10px] uppercase tracking-[0.22em] py-3 transition-all duration-300 z-10"
            >
              Quick view
            </button>
          </div>
        </Link>

        <div className="flex justify-between items-start mt-4">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="display-product text-ink"
          >
            {product.name}
          </Link>
          <div className="text-right">
            <span className="text-[13px] text-ink">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="ml-1.5 text-[11px] text-stone line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
        {product.short_description && (
          <div className="text-[11px] text-stone mt-1">{product.short_description}</div>
        )}
        <div className="flex gap-1.5 mt-3">
          {(product.swatches ?? []).slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="inline-block w-[11px] h-[11px] rounded-full border-[0.5px] border-ink/30"
              style={{ background: c, padding: 1, backgroundClip: "content-box" }}
            />
          ))}
        </div>
      </div>

      <QuickViewSheet product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}
