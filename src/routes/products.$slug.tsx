import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProduct, useProducts, useReviews, type Product } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { callEdge } from "@/routes/auth.login";

export const Route = createFileRoute("/products/$slug")({ component: PdpPage });

function PdpPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-20 text-center text-stone text-[13px]">
          Loading…
        </div>
      </SiteLayout>
    );
  }
  if (!product) {
    return (
      <SiteLayout>
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-20 text-center">
          <h1 className="display-page mb-4">Not found</h1>
          <Link
            to="/collections/$slug"
            params={{ slug: "heels" }}
            className="btn-secondary inline-block"
          >
            Browse heels
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return <PdpContent product={product} />;
}

function PdpContent({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const isWish = wishlist.has(product.slug);

  const images = product.images?.length
    ? product.images
    : [{ url: "", alt_text: product.name, type: "hero", display_order: 0 }];
  const [mainIdx, setMainIdx] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState<string>("description");

  const isHeel = product.category === "heel";
  const variants = product.variants ?? [];
  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;

  // Recently viewed
  useEffect(() => {
    const KEY = "classie.recent";
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
      const next = [product.slug, ...raw.filter((s) => s !== product.slug)].slice(0, 8);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* localStorage unavailable; recently-viewed silently skipped */
    }
  }, [product.slug]);

  const { data: reviews = [] } = useReviews(product.id);
  const ratingAvg = reviews.length
    ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
    : 0;

  function addToBag() {
    if (isHeel && !variantId) {
      toast.error("Select a size");
      return;
    }
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0]?.url ?? "",
      unitPrice: product.price,
      compareAtPrice: product.compare_at_price,
      variantId,
      variantLabel: selectedVariant?.size ?? null,
      quantity: qty,
      isBundle: false,
      bundlePartnerSlug: null,
    });
    toast.success(`Added ${product.name} to bag`);
  }

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-7 pt-6 pb-2 text-[11px] text-stone">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          to="/collections/$slug"
          params={{ slug: product.category === "heel" ? "heels" : "clip-ons" }}
          className="hover:text-ink"
        >
          {product.category === "heel" ? "Heels" : "Clip-ons"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-7 pt-4 pb-14 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] bg-card-tint overflow-hidden">
            {images[mainIdx]?.url && (
              <img
                src={images[mainIdx].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setMainIdx(i)}
                  className={
                    "w-[14%] aspect-[4/5] flex-shrink-0 bg-card-tint border " +
                    (i === mainIdx ? "border-ink" : "border-transparent")
                  }
                >
                  {img.url && <img src={img.url} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="caps mb-3">
            {product.is_bestseller
              ? "MULTI-STYLE HEEL · BESTSELLER"
              : product.category === "heel"
                ? "MULTI-STYLE HEEL"
                : "CLIP-ON CHARM"}
          </div>
          <h1 className="font-display text-[32px] leading-tight mb-3">{product.name}</h1>
          <div className="text-[11px] text-stone mb-5">
            {"★".repeat(Math.round(ratingAvg) || 5)}{" "}
            <span className="ml-1">
              {ratingAvg.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-7">
            <span className="font-display text-[24px]">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-[13px] text-stone line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="text-[11px] text-burgundy">
                  −
                  {Math.round(
                    ((product.compare_at_price - product.price) / product.compare_at_price) * 100,
                  )}
                  % off
                </span>
              </>
            )}
          </div>

          {isHeel && variants.length > 0 && (
            <>
              <div className="caps caps-ink mb-3">Shoe size</div>
              <div className="flex flex-wrap gap-2 mb-7">
                {variants
                  .slice()
                  .sort((a, b) => a.size.localeCompare(b.size))
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      disabled={v.inventory === 0}
                      className={
                        "w-10 h-10 flex items-center justify-center text-[12px] border-[0.5px] transition-colors " +
                        (variantId === v.id
                          ? "bg-ink text-cream-bg border-ink"
                          : v.inventory === 0
                            ? "border-soft-border text-stone line-through cursor-not-allowed"
                            : "border-ink/40 hover:border-ink")
                      }
                    >
                      {v.size}
                    </button>
                  ))}
              </div>
            </>
          )}

          <PincodeCheck />

          <div className="flex items-center gap-4 mt-7 mb-3">
            <div className="flex items-center border-[0.5px] border-ink">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5">
                <Minus size={12} />
              </button>
              <span className="px-3 text-[13px] min-w-[30px] text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2.5">
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-stretch gap-3">
            <button onClick={addToBag} className="btn-primary flex-1">
              Add to bag · {formatPrice(product.price * qty)}
            </button>
            <button
              onClick={() => wishlist.toggle(product.slug)}
              aria-label="Wishlist"
              className="border-[0.5px] border-ink px-4"
            >
              <Heart size={16} className={isWish ? "fill-burgundy text-burgundy" : "text-ink"} />
            </button>
          </div>

          <div className="mt-4 text-[11px] text-stone">
            Free shipping above ₹999 · 7-day returns · COD available
          </div>

          {/* Accordions */}
          <div className="mt-10 border-t border-soft-border">
            {[
              ["description", "Description", product.description ?? "No description."],
              [
                "specifications",
                "Specifications",
                product.specs
                  ? Object.entries(product.specs)
                      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                      .join(" · ")
                  : "—",
              ],
              [
                "style",
                "Style this",
                "Try this heel with one of our clip-on charms in Style Studio.",
              ],
              [
                "care",
                "Care instructions",
                product.care_instructions ?? "Wipe with a soft cloth. Store in dust bag.",
              ],
              [
                "shipping",
                "Shipping & returns",
                "Free shipping above ₹999. 7-day returns, doorstep pickup.",
              ],
            ].map(([key, label, body]) => (
              <div key={key} className="border-b border-soft-border">
                <button
                  onClick={() => setOpenAcc(openAcc === key ? "" : (key as string))}
                  className="w-full py-4 flex justify-between items-center"
                >
                  <span className="caps caps-ink">{label as string}</span>
                  <ChevronDown
                    size={14}
                    className={"transition-transform " + (openAcc === key ? "rotate-180" : "")}
                  />
                </button>
                {openAcc === key && (
                  <div className="pb-5 text-[13px] text-stone leading-[1.85]">{body as string}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link
              to="/style-studio"
              search={{ heel: product.slug } as never}
              className="btn-secondary"
            >
              Open in Style Studio
            </Link>
          </div>
        </div>
      </div>

      {/* You may also like */}
      <RelatedRail current={product} />
      <RecentlyViewed currentSlug={product.slug} />
    </SiteLayout>
  );
}

function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<null | { ok: boolean; msg: string }>(null);
  const [busy, setBusy] = useState(false);

  async function check() {
    if (!/^\d{6}$/.test(pin)) {
      setState({ ok: false, msg: "Enter a valid 6-digit pincode" });
      return;
    }
    setBusy(true);
    const res = await callEdge("check-pincode-serviceability", { pincode: pin });
    setBusy(false);
    if (!res.ok) {
      setState({ ok: false, msg: (res as { error?: string }).error ?? "Could not check pincode" });
      return;
    }
    const data = res as unknown as { deliverable: boolean; days?: number; cod_supported?: boolean };
    setState({
      ok: data.deliverable,
      msg: data.deliverable
        ? `Delivers in ${data.days} days${data.cod_supported ? " · COD available" : ""}`
        : "Not deliverable",
    });
  }

  return (
    <div className="mt-4">
      <div className="caps caps-ink mb-2">Check delivery</div>
      <div className="flex items-end gap-3">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit pincode"
          className="flex-1 bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
        />
        <button
          onClick={check}
          disabled={busy}
          className="text-[11px] uppercase tracking-[0.18em] border-b-[0.5px] border-ink py-2"
        >
          {busy ? "…" : "Check"}
        </button>
      </div>
      {state && (
        <div className={"text-[11px] mt-2 " + (state.ok ? "text-success" : "text-danger")}>
          {state.msg}
        </div>
      )}
    </div>
  );
}

function RelatedRail({ current }: { current: Product }) {
  const { data: all = [] } = useProducts({ category: current.category });
  const related = all.filter((p) => p.id !== current.id).slice(0, 8);
  if (related.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-7 py-14 border-t border-soft-border">
      <h2 className="display-section mb-8">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {related.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("classie.recent") ?? "[]") as string[];
      setSlugs(raw.filter((s) => s !== currentSlug));
    } catch {
      setSlugs([]);
    }
  }, [currentSlug]);

  const { data: all = [] } = useProducts({});
  const items = useMemo(
    () => slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean) as Product[],
    [slugs, all],
  );
  if (items.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-7 py-14 border-t border-soft-border">
      <h2 className="display-section mb-8">Recently viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
