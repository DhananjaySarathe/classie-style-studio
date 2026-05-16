import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Product } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import { useCart } from "@/stores/cart";

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function QuickViewSheet({ product, open, onOpenChange }: Props) {
  const cart = useCart();
  if (!product) return null;

  const image = product.images?.[0]?.url ?? "";

  function addToBag() {
    if (!product) return;
    if (product.category === "heel" && (product.variants?.length ?? 0) > 0) {
      // Heels require size — punt the user to the PDP.
      toast.message("Pick a size on the product page.", {
        action: { label: "Open", onClick: () => onOpenChange(false) },
      });
      return;
    }
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      unitPrice: product.price,
      compareAtPrice: product.compare_at_price,
      variantId: null,
      variantLabel: null,
      isBundle: false,
      bundlePartnerSlug: null,
    });
    toast.success(`Added ${product.name} to bag`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] bg-bg border-l-[0.5px] border-border p-0"
      >
        <SheetTitle className="sr-only">{product.name}</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="aspect-[4/5] bg-card-tint overflow-hidden">
            {image && <img src={image} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="caps mb-2">{product.category === "heel" ? "HEEL" : "CLIP-ON"}</div>
            <h2 className="font-display text-[24px] text-ink leading-tight mb-2">{product.name}</h2>
            {product.short_description && (
              <div className="text-[12px] text-stone mb-4">{product.short_description}</div>
            )}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-[22px] text-ink">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-[12px] text-stone line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[13px] text-stone leading-[1.8] mb-6 line-clamp-4">
                {product.description}
              </p>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <button onClick={addToBag} className="btn-primary w-full">
                {product.category === "heel" && (product.variants?.length ?? 0) > 0
                  ? "Choose size →"
                  : "Add to bag"}
              </button>
              <Link
                to="/products/$slug"
                params={{ slug: product.slug }}
                onClick={() => onOpenChange(false)}
                className="text-[11px] uppercase tracking-[0.18em] text-stone hover:text-ink text-center pt-2"
              >
                View full details
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
