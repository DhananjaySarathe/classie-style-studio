import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { StyleStudioTeaser } from "@/components/StyleStudioTeaser";
import { ModularStoryStrip } from "@/components/ModularStoryStrip";
import { CommunityMosaic } from "@/components/CommunityMosaic";
import { useProducts } from "@/lib/queries";
import { ARTICLES } from "@/data/journal";

export const Route = createFileRoute("/")({ component: HomePage });

const editions = [
  "The Date Edit",
  "The Everyday Edit",
  "The Festive Edit",
  "The Party Edit",
  "The Work Edit",
];

function HomePage() {
  const { data: heels = [] } = useProducts({ category: "heel", sort: "newest" });
  const grid = heels.slice(0, 6);
  const articles = ARTICLES.slice(0, 3);

  return (
    <SiteLayout>
      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 2. EDITORIAL MARQUEE */}
      <section className="bg-ink overflow-hidden">
        <div className="py-[20px] overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...editions, ...editions, ...editions].map((label, i) => (
              <Link
                key={i}
                to="/collections/$slug"
                params={{ slug: "heels" }}
                className="flex items-center gap-8 px-8 shrink-0"
              >
                <span
                  className="font-display italic text-[28px] text-bg transition-opacity"
                  style={{ opacity: i % 2 === 0 ? 1 : 0.35 }}
                >
                  {label}
                </span>
                <span className="w-2 h-2 rounded-full bg-burgundy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MODULAR STORY STRIP — the USP visualised */}
      <ModularStoryStrip />

      {/* 4. STYLE STUDIO TEASER */}
      <StyleStudioTeaser />

      {/* 5. NEW THIS SEASON GRID */}
      <section className="bg-bg">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-24 md:py-32">
          <div className="flex items-end justify-between mb-12 md:mb-14 gap-6">
            <div>
              <div className="caps mb-4 flex items-center gap-2">
                <span className="rule" />
                THE COLLECTION
              </div>
              <h2 className="display-section text-ink">New this season.</h2>
            </div>
            <Link
              to="/collections/$slug"
              params={{ slug: "heels" }}
              className="text-[12px] uppercase tracking-[0.18em] border-b border-ink pb-1 hover:text-burgundy hover:border-burgundy transition-colors"
            >
              View all →
            </Link>
          </div>

          {grid.length === 0 ? (
            <div className="text-center text-stone text-[13px] py-12">Loading the collection…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {grid.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. JOURNAL — 3-up on soft band */}
      <section className="bg-bg-soft">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-6">
            <div>
              <div className="caps mb-4 flex items-center gap-2">
                <span className="rule" />
                JOURNAL
              </div>
              <h2 className="display-section text-ink max-w-[460px]">
                Quiet notes on <span className="italic-burgundy">style</span>, design and craft.
              </h2>
            </div>
            <Link
              to="/journal"
              className="text-[12px] uppercase tracking-[0.18em] border-b border-ink pb-1 hover:text-burgundy hover:border-burgundy transition-colors"
            >
              Read more →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {articles.map((a) => (
              <Link
                key={a.slug}
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="group block"
              >
                <div className="aspect-[4/5] bg-card-tint overflow-hidden">
                  <img
                    src={a.hero}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="caps mt-5 mb-2">{a.readMinutes} MIN READ</div>
                <h3 className="font-display text-[22px] text-ink leading-tight mb-2">{a.title}</h3>
                <p className="text-[13px] text-stone leading-[1.7] mb-4 line-clamp-2">
                  {a.subtitle}
                </p>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink border-b border-ink pb-0.5">
                  Read the story
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY MOSAIC */}
      <CommunityMosaic />
    </SiteLayout>
  );
}
