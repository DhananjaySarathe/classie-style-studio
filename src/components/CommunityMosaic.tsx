import { useProducts } from "@/lib/queries";
import heroHeel from "@/assets/hero-heel.jpg";
import heroCharm from "@/assets/hero-charm.jpg";
import journalImg from "@/assets/journal-feature.jpg";

const FALLBACKS = [heroHeel, heroCharm, journalImg];

// Variable-span mosaic. Each tile has a span class that creates the broken grid.
const SPANS = [
  "row-span-2", // 0 — tall
  "", // 1
  "", // 2
  "col-span-2", // 3 — wide
  "", // 4
  "", // 5
  "row-span-2", // 6 — tall
  "", // 7
] as const;

export function CommunityMosaic() {
  const { data: products = [] } = useProducts({});

  const tiles = Array.from({ length: 8 }).map((_, i) => {
    const product = products[i % Math.max(products.length, 1)];
    const img = product?.images?.[0]?.url ?? FALLBACKS[i % FALLBACKS.length];
    return { img, alt: product?.name ?? "Community look" };
  });

  return (
    <section className="bg-bg">
      <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-24 md:py-32">
        <div className="text-center mb-12 md:mb-16 max-w-[520px] mx-auto">
          <div className="caps mb-4 flex items-center gap-2 justify-center">
            <span className="rule" />
            @_CLASSIE_IN
            <span className="rule" />
          </div>
          <h2 className="display-section text-ink mb-4">Styled by our community.</h2>
          <p className="text-[14px] text-stone leading-[1.85]">
            Tag <span className="text-ink">@_classie_in</span> on Instagram to be featured.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] md:auto-rows-[200px] gap-2 md:gap-3">
          {tiles.map((t, i) => (
            <a
              key={i}
              href="#"
              className={"relative bg-card-tint overflow-hidden group block " + (SPANS[i] ?? "")}
            >
              <img
                src={t.img}
                alt={t.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
