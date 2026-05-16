import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/supabase";

export function StyleStudioTeaser() {
  const { data: heels = [] } = useProducts({ category: "heel" });
  const { data: charms = [] } = useProducts({ category: "clip-on" });

  const heelChoices = useMemo(() => heels.slice(0, 3), [heels]);
  const charmChoices = useMemo(() => charms.slice(0, 5), [charms]);

  const [heelIdx, setHeelIdx] = useState(0);
  const [charmIdx, setCharmIdx] = useState(0);

  const heel = heelChoices[heelIdx];
  const charm = charmChoices[charmIdx];

  // Reset indices if data length changes
  useEffect(() => {
    if (heelIdx >= heelChoices.length) setHeelIdx(0);
    if (charmIdx >= charmChoices.length) setCharmIdx(0);
  }, [heelChoices.length, charmChoices.length, heelIdx, charmIdx]);

  const total = (heel?.price ?? 0) + (charm?.price ?? 0);
  const bundle = Math.round(total * 0.05);
  const final = total - bundle;

  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="max-w-[1440px] mx-auto px-4 md:px-7">
        <div className="text-center mb-12 md:mb-16 max-w-[520px] mx-auto">
          <div className="caps mb-4 flex items-center gap-2 justify-center">
            <span className="rule" />
            THE SIGNATURE EXPERIENCE
            <span className="rule" />
          </div>
          <h2 className="display-section text-ink mb-5">
            Style it <span className="italic-burgundy">before</span> you buy it.
          </h2>
          <p className="text-[14px] text-stone leading-[1.85]">
            Mix any heel with any clip-on charm in our live preview. Save the look, share it, or add
            the bundle to your bag.
          </p>
        </div>

        <div className="max-w-[640px] mx-auto border-[0.5px] border-border bg-bg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Preview */}
            <div className="relative aspect-square bg-card-tint overflow-hidden">
              {heel?.images?.[0]?.url && (
                <img
                  src={heel.images[0].url}
                  alt={heel.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
              )}
              {charm?.images?.[0]?.url && (
                <img
                  src={charm.images[0].url}
                  alt={charm.name}
                  className="absolute bottom-[14%] right-[14%] w-[32%] aspect-square object-cover rounded-full border-[3px] border-bg transition-all duration-500"
                />
              )}
              <div className="absolute top-3 left-3 caps caps-ink flex items-center gap-1.5 bg-bg/90 px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 md:p-7 flex flex-col gap-6">
              <div>
                <div className="caps caps-ink mb-3">Heel</div>
                <div className="flex flex-wrap gap-2">
                  {heelChoices.length === 0 ? (
                    <div className="text-[12px] text-stone">Loading…</div>
                  ) : (
                    heelChoices.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setHeelIdx(i)}
                        className={
                          "text-[11px] uppercase tracking-[0.18em] px-2.5 py-1.5 border-[0.5px] transition-colors " +
                          (i === heelIdx
                            ? "bg-ink text-bg border-ink"
                            : "border-ink/40 text-ink hover:border-ink")
                        }
                      >
                        {p.name.split(" ")[0]}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="caps caps-ink mb-3">Charm</div>
                <div className="flex gap-3 items-center">
                  {charmChoices.length === 0 ? (
                    <div className="text-[12px] text-stone">Loading…</div>
                  ) : (
                    charmChoices.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setCharmIdx(i)}
                        aria-label={p.name}
                        className="relative w-[18px] h-[18px] rounded-full"
                        style={{ background: p.primary_color ?? "#888" }}
                      >
                        <span
                          className={
                            "absolute -inset-[3px] rounded-full border " +
                            (i === charmIdx ? "border-ink" : "border-transparent")
                          }
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-auto border-t border-border pt-5">
                <div className="caps mb-1">Your pair</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[26px] text-ink">
                    {formatPrice(final || 214800)}
                  </span>
                  {bundle > 0 && (
                    <span className="text-[11px] text-stone line-through">
                      {formatPrice(total)}
                    </span>
                  )}
                </div>
                {bundle > 0 && (
                  <div className="text-[11px] text-burgundy mt-1">5% bundle discount applied</div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/style-studio"
                  search={{ heel: heel?.slug, charm: charm?.slug } as never}
                  className="btn-primary w-full"
                >
                  Open Style Studio
                </Link>
                <Link
                  to="/style-studio"
                  search={{ heel: heel?.slug, charm: charm?.slug } as never}
                  className="text-[11px] uppercase tracking-[0.18em] text-stone hover:text-ink text-center pt-2"
                >
                  Save this look →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
