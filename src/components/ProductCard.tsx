import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import { useWishlist } from "@/stores/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const active = wishlist.has(product.slug);
  const image = product.images?.[0]?.url ?? product.primary_color ?? "";

  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group block">
      <div className="relative aspect-[4/5] bg-card-tint overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: product.primary_color ?? "var(--card-tint)" }}
          />
        )}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-2 left-2 bg-ink text-cream-bg text-[10px] uppercase tracking-[0.18em] px-2 py-1">
            −
            {Math.round(
              ((product.compare_at_price - product.price) / product.compare_at_price) * 100,
            )}
            %
          </span>
        )}
        {product.is_new && !product.compare_at_price && (
          <span className="absolute top-2 left-2 bg-burgundy text-cream-bg text-[10px] uppercase tracking-[0.18em] px-2 py-1">
            New
          </span>
        )}
        <button
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            wishlist.toggle(product.slug);
          }}
          className="absolute top-2 right-2 p-1.5"
        >
          <Heart
            size={16}
            strokeWidth={1.25}
            className={active ? "fill-burgundy text-burgundy" : "text-ink/55 hover:text-ink"}
          />
        </button>
      </div>

      <div className="flex justify-between items-start mt-3">
        <h3 className="display-product">{product.name}</h3>
        <div className="text-right">
          <span className="text-[13px]">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="ml-1 text-[11px] text-stone line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
      {product.short_description && (
        <div className="text-[11px] text-stone mt-1">{product.short_description}</div>
      )}
      <div className="flex gap-1.5 mt-2">
        {(product.swatches ?? []).slice(0, 4).map((c, i) => (
          <span
            key={i}
            className="inline-block w-[11px] h-[11px] rounded-full border-[0.5px] border-ink/30"
            style={{ background: c, padding: 1, backgroundClip: "content-box" }}
          />
        ))}
      </div>
    </Link>
  );
}
