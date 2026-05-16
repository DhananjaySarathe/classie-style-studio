import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCollection, type Product } from "@/lib/queries";

export const Route = createFileRoute("/collections/$slug")({ component: CollectionPage });

const HEEL_TYPES = ["Sculpted", "Block", "Kitten", "Slim"] as const;
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
] as const;

function renderHeadline(html: string | null | undefined) {
  if (!html) return null;
  // Allow <i>...</i> markup; render with burgundy italic.
  const parts = html.split(/(<i>.*?<\/i>)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("<i>") ? (
          <span key={i} className="italic-burgundy">
            {p.replace(/<\/?i>/g, "")}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useCollection(slug);
  const collection = data?.collection ?? null;
  const allProducts = data?.products ?? [];

  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");
  const [visible, setVisible] = useState(9);

  const products = useMemo(
    () => filterAndSort(allProducts, activeType, activeColor, sort),
    [allProducts, activeType, activeColor, sort],
  );

  const colors = useMemo(() => {
    const s = new Set<string>();
    allProducts.forEach((p) => p.color_label && s.add(p.color_label));
    return Array.from(s);
  }, [allProducts]);

  const showWhyClassie = slug === "heels" || slug === "clip-ons";
  const isHeelCategory = (collection?.name ?? slug).toLowerCase().includes("heel");

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-7 pt-12 md:pt-14 pb-10 md:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 items-end">
          <div>
            <div className="caps flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy" />
              <span>
                THE {(collection?.name ?? slug).toUpperCase()} · {allProducts.length} STYLES
              </span>
            </div>
            <h1 className="display-hero mb-5">{renderHeadline(collection?.hero_headline)}</h1>
            <p className="text-[13px] text-stone max-w-[380px] leading-[1.85] mb-8">
              {collection?.description ?? "Curated for every moment."}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/style-studio" className="btn-primary">
                Style your pair
              </Link>
              <Link to="/style-quiz" className="btn-secondary">
                Take the quiz
              </Link>
            </div>
          </div>
          <div className="relative h-[260px] md:h-[340px]">
            {collection?.hero_image_url && (
              <img
                src={collection.hero_image_url}
                alt=""
                className="absolute top-0 right-0 w-[78%] h-[200px] md:h-[260px] object-cover bg-cream-warm"
              />
            )}
            {collection?.hero_secondary_image_url && (
              <img
                src={collection.hero_secondary_image_url}
                alt=""
                className="absolute bottom-0 left-0 w-[52%] h-[150px] md:h-[180px] object-cover border-[7px] border-cream-bg"
              />
            )}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-ink text-cream-warm py-[22px] overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-[36px] font-display italic">
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="mx-8">
              The Date Edit <span className="text-burgundy mx-3">·</span>
              The Everyday Edit <span className="text-burgundy mx-3">·</span>
              The Festive Edit <span className="text-burgundy mx-3">·</span>
              The Party Edit <span className="text-burgundy mx-3">·</span>
              The Work Edit <span className="text-burgundy mx-3">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filter + sort bar */}
      <section className="border-b border-soft-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-5 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setActiveType(null)} className={chip(activeType === null)}>
              All · {allProducts.length}
            </button>
            {isHeelCategory &&
              HEEL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setActiveType((cur) => (cur === t.toLowerCase() ? null : t.toLowerCase()))
                  }
                  className={chip(activeType === t.toLowerCase())}
                >
                  {t}
                </button>
              ))}
            {colors.length > 0 && (
              <>
                <span className="w-px h-5 bg-soft-border mx-2 hidden md:inline-block" />
                <Dropdown label={activeColor ?? "Colour"}>
                  <button
                    onClick={() => setActiveColor(null)}
                    className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-cream-warm"
                  >
                    All colours
                  </button>
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveColor(c)}
                      className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-cream-warm"
                    >
                      {c}
                    </button>
                  ))}
                </Dropdown>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone hidden sm:inline">{products.length} items</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="text-[11px] uppercase tracking-[0.18em] bg-transparent border-[0.5px] border-ink px-3 py-1.5"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-7 py-10 md:py-14">
        {isLoading ? (
          <div className="text-center py-20 text-stone text-[13px]">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-stone text-[13px]">
            No products match these filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {products.slice(0, visible).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {products.length > visible && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisible((v) => v + 9)}
                  className="border-[0.5px] border-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.18em]"
                >
                  Load more · {visible} of {products.length}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {showWhyClassie && (
        <section className="bg-cream-warm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-14">
            <div className="caps mb-3">WHY CLASSIE</div>
            <h2 className="display-section mb-10">Built around one quiet idea.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                [
                  "01",
                  "Designed to transform",
                  "Interchangeable clip-ons that let one heel match every look.",
                ],
                ["02", "Made for everyday wear", "Comfort-focused designs made for real movement."],
                [
                  "03",
                  "Style that lasts",
                  "Reusable clip-ons designed to be worn again and again.",
                ],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <div className="font-display text-burgundy text-[28px] mb-2">{n}</div>
                  <div className="text-[13px] font-medium mb-2">{t}</div>
                  <div className="text-[11px] text-stone leading-[1.85]">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function chip(active: boolean) {
  return (
    "text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border-[0.5px] " +
    (active ? "bg-ink text-cream-bg border-ink" : "border-ink/40 text-ink hover:border-ink")
  );
}

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={chip(false) + " flex items-center gap-1"}
      >
        {label} <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 bg-cream-bg border-[0.5px] border-soft-border w-44 py-2 z-40">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function filterAndSort(
  rows: Product[],
  type: string | null,
  color: string | null,
  sort: string,
): Product[] {
  let out = rows;
  if (type) out = out.filter((p) => (p.specs?.heel_type ?? "").toLowerCase() === type);
  if (color) out = out.filter((p) => (p.color_label ?? "") === color);
  const sorted = [...out];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      sorted.sort((a, b) => Number(b.is_new) - Number(a.is_new));
      break;
    case "best-selling":
      sorted.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
      break;
  }
  return sorted;
}
