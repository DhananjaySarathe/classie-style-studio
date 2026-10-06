import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";
import heroHeel from "@/assets/hero-heel.jpg";
import heroCharm from "@/assets/hero-charm.jpg";
import modivaWine from "@/assets/product-modiva-wine.jpg";
import veloraNude from "@/assets/product-velora-nude.jpg";
import clessiaBlack from "@/assets/product-clessia-black.jpg";

type HeelOption = {
  slug: string;
  name: string;
  shortName: string;
  price: number;
  image: string;
};

type CharmOption = {
  slug: string;
  name: string;
  color: string;
  price: number;
  image: string;
};

// Fallback options used when Supabase data isn't loaded.
// Keep slug consistent with seed data so the deep-link to Style Studio still works.
const FALLBACK_HEELS: HeelOption[] = [
  { slug: "clessia-rose-gold", name: "Clessia Rose Gold", shortName: "Clessia", price: 169900, image: heroHeel },
  { slug: "modiva-wine", name: "Modiva Wine", shortName: "Modiva", price: 169900, image: modivaWine },
  { slug: "velora-nude", name: "Velora Nude", shortName: "Velora", price: 149900, image: veloraNude },
];

const FALLBACK_CHARMS: CharmOption[] = [
  { slug: "bloom-pearl", name: "Bloom Pearl", color: "#F4ECDE", price: 44900, image: heroCharm },
  { slug: "rhinestone-classic", name: "Rhinestone Classic", color: "#EAE7DD", price: 49900, image: heroCharm },
  { slug: "rhinestone-noir", name: "Rhinestone Noir", color: "#2B2521", price: 69900, image: clessiaBlack },
  { slug: "bloom-rose", name: "Bloom Rose", color: "#E5C9C0", price: 39900, image: heroCharm },
  { slug: "bow-ivory", name: "Bow Ivory", color: "#F8F0DE", price: 37900, image: heroCharm },
];

export function StyleStudioTeaser() {
  const { data: heelsRemote = [] } = useProducts({ category: "heel" });
  const { data: charmsRemote = [] } = useProducts({ category: "clip-on" });

  // Hydrate fallbacks with real product data where the slug matches, otherwise keep the local asset.
  const heels = useMemo<HeelOption[]>(() => {
    if (heelsRemote.length === 0) return FALLBACK_HEELS;
    return FALLBACK_HEELS.map((fb) => {
      const real = heelsRemote.find((p) => p.slug === fb.slug);
      if (!real) return fb;
      return {
        ...fb,
        name: real.name,
        price: real.price,
        image: real.images?.[0]?.url ?? fb.image,
      };
    });
  }, [heelsRemote]);

  const charms = useMemo<CharmOption[]>(() => {
    if (charmsRemote.length === 0) return FALLBACK_CHARMS;
    return FALLBACK_CHARMS.map((fb) => {
      const real = charmsRemote.find((p) => p.slug === fb.slug);
      if (!real) return fb;
      return {
        ...fb,
        name: real.name,
        color: real.primary_color ?? fb.color,
        price: real.price,
        image: real.images?.[0]?.url ?? fb.image,
      };
    });
  }, [charmsRemote]);

  const [heelIdx, setHeelIdx] = useState(0);
  const [charmIdx, setCharmIdx] = useState(0);

  const heel = heels[heelIdx];
  const charm = charms[charmIdx];
  const total = heel.price + charm.price;
  const bundle = Math.round(total * 0.05);
  const final = total - bundle;

  return (
    <section className="bg-bg-soft relative overflow-hidden">
      {/* Decorative editorial markers — paint the corners with quiet rules */}
      <div className="absolute top-0 left-0 w-12 h-px bg-ink" />
      <div className="absolute top-0 left-0 w-px h-12 bg-ink" />
      <div className="absolute top-0 right-0 w-12 h-px bg-ink" />
      <div className="absolute top-0 right-0 w-px h-12 bg-ink" />

      <div className="max-w-[1320px] mx-auto px-4 md:px-7 py-20 md:py-28">
        {/* Header strip */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-[640px]">
            <div className="caps mb-5 flex items-center gap-2">
              <span className="rule" />
              THE SIGNATURE EXPERIENCE
            </div>
            <h2 className="display-section text-ink mb-4">
              Style it <span className="italic-burgundy">before</span> you buy it.
            </h2>
            <p className="text-[14px] text-stone leading-[1.85] max-w-[480px]">
              Mix any heel with any charm in a live preview. Save the combination, share the link
              with a friend, or send the bundle straight to your bag at 5% off.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
            <div className="caps mb-1">CURRENT LOOK</div>
            <div className="font-display text-[16px] text-ink leading-tight">
              {heel.shortName} <span className="italic-burgundy">+</span> {charm.name.split(" ")[0]}
            </div>
          </div>
        </div>

        {/* Main split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10 items-stretch">
          {/* LEFT — live preview */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px] bg-card-tint overflow-hidden">
            {/* Heel image */}
            <img
              src={heel.image}
              alt={heel.name}
              key={`heel-${heel.slug}`}
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
            {/* Charm overlay — positioned over the heel */}
            <div
              key={`charm-${charm.slug}`}
              className="absolute bottom-[16%] right-[12%] w-[30%] aspect-square rounded-full overflow-hidden border-[5px] border-bg animate-fade-in"
              style={{ boxShadow: "0 0 0 0.5px var(--ink)" }}
            >
              <img src={charm.image} alt={charm.name} className="w-full h-full object-cover" />
            </div>

            {/* LIVE badge */}
            <div className="absolute top-5 left-5 caps caps-ink bg-bg/95 px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse" />
              LIVE PREVIEW
            </div>

            {/* Slide counter — heel position */}
            <div className="absolute top-5 right-5 caps caps-ink bg-bg/95 px-2.5 py-1.5">
              {String(heelIdx + 1).padStart(2, "0")} <span className="opacity-40 mx-0.5">/</span>{" "}
              {String(heels.length).padStart(2, "0")}
            </div>

            {/* Combo caption — bottom overlay */}
            <div className="absolute left-5 bottom-5 right-5 flex items-end justify-between gap-4">
              <div className="bg-ink/55 backdrop-blur-[2px] text-bg px-3 py-2">
                <div className="caps text-bg/70 mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  THE PAIR
                </div>
                <div className="font-display text-[15px] leading-tight">
                  {heel.name} + {charm.name}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — controls */}
          <div className="bg-bg border-[0.5px] border-border p-7 md:p-9 flex flex-col">
            {/* Heel chooser — image chips */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="caps caps-ink">01 · Choose a heel</div>
                <div className="text-[11px] text-stone">{heel.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {heels.map((h, i) => {
                  const active = i === heelIdx;
                  return (
                    <button
                      key={h.slug}
                      onClick={() => setHeelIdx(i)}
                      aria-label={h.name}
                      className={
                        "group relative aspect-[4/5] overflow-hidden bg-card-tint transition-all " +
                        (active ? "ring-[1.5px] ring-ink ring-offset-2 ring-offset-bg" : "")
                      }
                    >
                      <img
                        src={h.image}
                        alt={h.shortName}
                        className={
                          "absolute inset-0 w-full h-full object-cover transition-all " +
                          (active ? "scale-105" : "group-hover:scale-105 opacity-80 group-hover:opacity-100")
                        }
                      />
                      <span
                        className={
                          "absolute bottom-0 left-0 right-0 caps text-center py-1 transition-colors " +
                          (active ? "bg-ink text-bg" : "bg-bg/90 text-ink")
                        }
                      >
                        {h.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Charm chooser — large swatches with hover labels */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="caps caps-ink">02 · Snap a charm</div>
                <div className="text-[11px] text-stone">{charm.name}</div>
              </div>
              <div className="flex flex-wrap gap-3.5">
                {charms.map((c, i) => {
                  const active = i === charmIdx;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setCharmIdx(i)}
                      aria-label={c.name}
                      className="group relative"
                    >
                      <span
                        className="block w-9 h-9 rounded-full border-[0.5px] border-ink/20"
                        style={{ background: c.color }}
                      />
                      <span
                        className={
                          "absolute -inset-[3px] rounded-full border transition-colors " +
                          (active ? "border-ink" : "border-transparent")
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + actions */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="caps mb-1">YOUR PAIR · 5% BUNDLE</div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-[32px] leading-none text-ink">
                      {formatPrice(final)}
                    </span>
                    <span className="text-[12px] text-stone line-through">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone leading-[1.5]">
                  <div>{heel.shortName} {formatPrice(heel.price)}</div>
                  <div>+ {charm.name.split(" ")[0]} {formatPrice(charm.price)}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/style-studio"
                  search={{ heel: heel.slug, charm: charm.slug } as never}
                  className="btn-primary flex-1 text-center"
                >
                  Open Style Studio →
                </Link>
                <Link
                  to="/products/$slug"
                  params={{ slug: heel.slug }}
                  className="border-[0.5px] border-ink px-5 inline-flex items-center text-[11px] uppercase tracking-[0.18em] hover:bg-ink hover:text-bg transition-colors"
                >
                  Shop heel
                </Link>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-stone text-center mt-5">
                Free shipping above ₹999 · 7-day returns
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative markers */}
      <div className="absolute bottom-0 left-0 w-12 h-px bg-ink" />
      <div className="absolute bottom-0 left-0 w-px h-12 bg-ink" />
      <div className="absolute bottom-0 right-0 w-12 h-px bg-ink" />
      <div className="absolute bottom-0 right-0 w-px h-12 bg-ink" />
    </section>
  );
}
