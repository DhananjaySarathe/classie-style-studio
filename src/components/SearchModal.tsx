import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useProducts, type ProductFilters } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const categories = [
  { value: undefined, label: "All" },
  { value: "heel", label: "Heels" },
  { value: "clip-on", label: "Clip-ons" },
] as const;

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "newest", label: "Newest" },
] as const;

export function SearchModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductFilters["category"]>(undefined);
  const [maxPrice, setMaxPrice] = useState(250000);
  const [sort, setSort] = useState<ProductFilters["sort"]>("featured");

  const { data: results = [] } = useProducts(
    { category, maxPrice, sort, search: query || undefined },
    { staleTime: 30_000 },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-cream-bg border-soft-border p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-soft-border pr-12">
          <Search size={16} strokeWidth={1.25} className="text-ink/60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search heels, charms, colours…"
            className="flex-1 bg-transparent outline-none text-[14px] text-ink placeholder:text-ink/40"
          />
        </div>

        <div className="px-6 py-4 border-b border-soft-border grid gap-3 text-[11px] tracking-[0.18em] uppercase text-ink/70">
          <FilterRow label="Category">
            {categories.map((c) => (
              <Chip
                key={c.label}
                active={category === c.value}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Sort">
            {sorts.map((s) => (
              <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>
                {s.label}
              </Chip>
            ))}
          </FilterRow>
          <div className="flex items-center gap-4 pt-1">
            <span className="w-[72px]">Max ₹</span>
            <input
              type="range"
              min={50000}
              max={250000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 accent-burgundy"
            />
            <span className="text-ink font-medium tabular-nums">{formatPrice(maxPrice)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="text-[11px] tracking-[0.18em] uppercase text-ink/60 mb-4">
            {results.length} {results.length === 1 ? "result" : "results"}
          </div>
          {results.length === 0 ? (
            <div className="py-16 text-center text-ink/60 text-[13px]">
              No matches. Try a different search or loosen filters.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => onOpenChange(false)}
                    className="flex gap-4 p-2 -m-2 rounded hover:bg-ink/[0.03] transition-colors"
                  >
                    <div className="w-20 h-24 flex-shrink-0 bg-card-tint overflow-hidden">
                      {p.images?.[0]?.url && (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[18px] text-ink leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[12px] text-ink/60 mt-1">{p.short_description}</div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[13px] text-ink">{formatPrice(p.price)}</span>
                        {p.compare_at_price && (
                          <span className="text-[11px] text-ink/40 line-through">
                            {formatPrice(p.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="w-[72px] shrink-0">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 border text-[11px] tracking-[0.18em] uppercase transition-colors " +
        (active
          ? "bg-ink text-cream-bg border-ink"
          : "bg-transparent text-ink/70 border-soft-border hover:border-ink")
      }
    >
      {children}
    </button>
  );
}
