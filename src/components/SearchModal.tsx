import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products, type Product } from "@/data/products";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const categories = ["all", "heels", "clip-ons"] as const;
const colors = ["all", "burgundy", "nude", "black"] as const;
const sorts = ["relevance", "price-asc", "price-desc", "newest"] as const;

export function SearchModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [color, setColor] = useState<(typeof colors)[number]>("all");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sort, setSort] = useState<(typeof sorts)[number]>("relevance");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r: Product[] = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (color !== "all" && p.color !== color) return false;
      if (p.price > maxPrice) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.material.includes(q) ||
        p.color.includes(q)
      );
    });
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "newest") r = [...r].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return r;
  }, [query, category, color, maxPrice, sort]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-cream-bg border-soft-border p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col"
      >
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
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Colour">
            {colors.map((c) => (
              <Chip key={c} active={color === c} onClick={() => setColor(c)}>
                {c}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Sort">
            {sorts.map((s) => (
              <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                {s.replace("-", " ")}
              </Chip>
            ))}
          </FilterRow>
          <div className="flex items-center gap-4 pt-1">
            <span className="w-[72px]">Max ₹</span>
            <input
              type="range"
              min={500}
              max={2500}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 accent-burgundy"
            />
            <span className="text-ink font-medium tabular-nums">₹{maxPrice}</span>
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
                <li key={p.slug}>
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => onOpenChange(false)}
                    className="flex gap-4 p-2 -m-2 rounded hover:bg-ink/[0.03] transition-colors"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-24 object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[18px] text-ink leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[12px] text-ink/60 mt-1">{p.desc}</div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[13px] text-ink">₹{p.price}</span>
                        {p.compare && (
                          <span className="text-[11px] text-ink/40 line-through">
                            ₹{p.compare}
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
      className={`px-3 py-1 border text-[11px] tracking-[0.18em] uppercase transition-colors ${
        active
          ? "bg-ink text-cream-bg border-ink"
          : "bg-transparent text-ink/70 border-soft-border hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
