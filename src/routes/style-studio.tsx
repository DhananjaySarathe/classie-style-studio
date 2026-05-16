import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useProducts, type Product } from "@/lib/queries";
import { formatPrice, supabase } from "@/lib/supabase";
import { useCart } from "@/stores/cart";
import { useAuth } from "@/lib/auth";

type Search = { heel?: string; charm?: string };

export const Route = createFileRoute("/style-studio")({
  component: StyleStudioPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    heel: typeof s.heel === "string" ? s.heel : undefined,
    charm: typeof s.charm === "string" ? s.charm : undefined,
  }),
});

function StyleStudioPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data: heels = [], isLoading: lh } = useProducts({ category: "heel" });
  const { data: charms = [], isLoading: lc } = useProducts({ category: "clip-on" });

  const heel = useMemo(
    () => heels.find((p) => p.slug === search.heel) ?? heels[0],
    [heels, search.heel],
  );
  const charm = useMemo(
    () => charms.find((p) => p.slug === search.charm) ?? null,
    [charms, search.charm],
  );

  const { user } = useAuth();
  const cart = useCart();

  function setSel(next: Partial<Search>) {
    navigate({ to: "/style-studio", search: { ...search, ...next }, replace: true });
  }

  const heelPrice = heel?.price ?? 0;
  const charmPrice = charm?.price ?? 0;
  const total = heelPrice + charmPrice;
  const bundle = charm ? Math.round(total * 0.05) : 0;
  const finalTotal = total - bundle;

  function addBundle() {
    if (!heel) return;
    cart.add({
      productId: heel.id,
      slug: heel.slug,
      name: heel.name,
      image: heel.images?.[0]?.url ?? "",
      unitPrice: heel.price,
      compareAtPrice: heel.compare_at_price,
      variantId: null,
      variantLabel: null,
      isBundle: !!charm,
      bundlePartnerSlug: charm?.slug ?? null,
    });
    if (charm) {
      cart.add({
        productId: charm.id,
        slug: charm.slug,
        name: charm.name,
        image: charm.images?.[0]?.url ?? "",
        unitPrice: charm.price,
        compareAtPrice: charm.compare_at_price,
        variantId: null,
        variantLabel: null,
        isBundle: true,
        bundlePartnerSlug: heel.slug,
      });
    }
    toast.success(charm ? "Bundle added to bag" : "Added to bag");
  }

  async function saveLook() {
    if (!user) {
      toast("Sign in to save this look", {
        action: {
          label: "Sign in",
          onClick: () => navigate({ to: "/auth/login", search: {} as never }),
        },
      });
      return;
    }
    if (!heel || !charm) {
      toast.error("Pick a heel and a charm first");
      return;
    }
    const { error } = await supabase.from("saved_looks").insert({
      user_id: user.id,
      heel_product_id: heel.id,
      clip_on_product_id: charm.id,
      name: `${heel.name} + ${charm.name}`,
    });
    if (error) toast.error(error.message);
    else toast.success("Look saved");
  }

  function shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Could not copy link"),
    );
  }

  return (
    <SiteLayout>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6 md:gap-8 max-w-[1440px] mx-auto px-4 md:px-7 py-10 pb-24">
        <SidePicker
          title="Choose your heel"
          items={heels}
          selectedSlug={heel?.slug}
          loading={lh}
          onPick={(slug) => setSel({ heel: slug })}
        />

        <div>
          <div className="aspect-[4/5] bg-card-tint relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-3 right-3 caps flex items-center gap-2 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy" /> LIVE
            </div>
            {heel?.images?.[0]?.url && (
              <img
                src={heel.images[0].url}
                alt={heel.name}
                className="w-full h-full object-cover"
              />
            )}
            {charm?.images?.[0]?.url && (
              <img
                src={charm.images[0].url}
                alt={charm.name}
                className="absolute bottom-[18%] right-[14%] w-[28%] aspect-square object-cover rounded-full border-[3px] border-cream-bg"
              />
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[11px] uppercase tracking-[0.18em]">
            <button
              onClick={() => setSel({ heel: undefined, charm: undefined })}
              className="text-stone hover:text-ink"
            >
              Reset
            </button>
            <button onClick={saveLook} className="text-stone hover:text-ink">
              Save look
            </button>
            <button onClick={shareLink} className="text-stone hover:text-ink">
              Share link
            </button>
          </div>
        </div>

        <SidePicker
          title="Choose a charm"
          items={charms}
          selectedSlug={charm?.slug}
          loading={lc}
          onPick={(slug) => setSel({ charm: slug === charm?.slug ? undefined : slug })}
        />
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-ink text-bg z-30 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
            Your look:{" "}
            <span className="opacity-100">
              {heel?.name ?? "—"}
              {charm ? ` + ${charm.name}` : ""}
            </span>
          </div>
          <div className="font-display text-[18px]">
            {formatPrice(heelPrice)}
            {charm ? ` + ${formatPrice(charmPrice)} = ${formatPrice(total)}` : ""}
            {charm && (
              <span className="ml-2 text-[12px]">→ {formatPrice(finalTotal)} (5% bundle)</span>
            )}
          </div>
          <button
            onClick={addBundle}
            className="bg-bg text-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-burgundy hover:text-bg transition-colors"
          >
            {charm ? "Add bundle to bag" : "Add heel to bag"}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}

function SidePicker({
  title,
  items,
  selectedSlug,
  loading,
  onPick,
}: {
  title: string;
  items: Product[];
  selectedSlug?: string;
  loading: boolean;
  onPick: (slug: string) => void;
}) {
  return (
    <div>
      <div className="caps caps-ink mb-4">{title}</div>
      <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="text-[12px] text-stone py-8 text-center">Loading…</div>
        ) : items.length === 0 ? (
          <>
            <div className="text-[12px] text-stone py-8 text-center">Nothing here yet.</div>
            <Link
              to="/collections/$slug"
              params={{ slug: "heels" }}
              className="block text-[11px] mt-3 text-stone hover:text-ink text-center"
            >
              Browse the catalog →
            </Link>
          </>
        ) : (
          items.map((p) => {
            const active = p.slug === selectedSlug;
            return (
              <button
                key={p.id}
                onClick={() => onPick(p.slug)}
                className={
                  "w-full flex items-center gap-3 p-2 border " +
                  (active ? "border-ink" : "border-transparent hover:border-soft-border")
                }
              >
                <div className="w-[80px] aspect-[4/5] bg-card-tint flex-shrink-0">
                  {p.images?.[0]?.url && (
                    <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-display text-[14px] truncate">{p.name}</div>
                  <div className="text-[11px] text-stone">{formatPrice(p.price)}</div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
