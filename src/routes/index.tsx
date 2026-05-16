import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/queries";
import heroHeel from "@/assets/hero-heel.jpg";
import heroCharm from "@/assets/hero-charm.jpg";
import journalImg from "@/assets/journal-feature.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const editions = [
  "The Date Edit",
  "The Everyday Edit",
  "The Festive Edit",
  "The Party Edit",
  "The Work Edit",
];

function HomePage() {
  const { data: heels = [] } = useProducts({ category: "heel", sort: "newest" });
  const grid = heels.slice(0, 3);
  const community = heels.slice(0, 8);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-7 pt-14 md:pt-20 pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 items-end">
          <div>
            <div className="caps flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy inline-block" />
              VOLUME 02 · THE MODULAR HEEL
            </div>
            <h1 className="display-hero text-ink mb-7">
              One pair.
              <br />
              <span className="italic-burgundy">A wardrobe</span>
              <br />
              of looks.
            </h1>
            <p className="text-[13px] text-stone max-w-[380px] leading-[1.85] mb-9">
              Sculpted heels and clip-on charms that snap together. Built around one quiet idea —
              your favourite pair, restyled endlessly, no closet overflow.
            </p>
            <div className="flex items-center gap-7">
              <Link to="/style-studio" className="btn-primary">
                Style your pair
              </Link>
              <Link to="/style-quiz" className="btn-secondary">
                Take the quiz
              </Link>
            </div>
          </div>

          <div className="relative h-[420px] md:h-[480px] max-w-[460px] mx-auto md:ml-auto md:mr-0 w-full">
            <div className="absolute top-0 right-0 w-[78%] h-[78%] bg-cream-warm overflow-hidden">
              <img
                src={heroHeel}
                alt="Clessia rose gold sculpted heel"
                className="w-full h-full object-cover"
                width={896}
                height={1152}
              />
            </div>
            <div className="absolute bottom-0 left-0 w-[52%] h-[52%] bg-card-tint overflow-hidden border-[7px] border-cream-bg">
              <img
                src={heroCharm}
                alt="Bloom pearl clip-on charm"
                className="w-full h-full object-cover"
                width={768}
                height={768}
              />
            </div>
            <div className="absolute -bottom-8 left-0 caps">FEATURED: CLESSIA + BLOOM PEARL</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-ink overflow-hidden">
        <div className="py-[22px] overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...editions, ...editions, ...editions].map((label, i) => (
              <Link
                key={i}
                to="/collections/$slug"
                params={{ slug: "heels" }}
                className="flex items-center gap-8 px-8 shrink-0"
              >
                <span
                  className="font-display italic text-[36px] text-cream-warm transition-opacity"
                  style={{ opacity: i % 2 === 0 ? 1 : 0.45 }}
                >
                  {label}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STYLE STUDIO TEASER */}
      <section className="bg-cream-warm py-20 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 text-center">
          <div className="caps mb-4">THE SIGNATURE EXPERIENCE</div>
          <h2 className="display-section mb-5">
            Style it <span className="italic-burgundy">before</span> you buy it.
          </h2>
          <p className="text-[13px] text-stone max-w-[420px] mx-auto leading-[1.85] mb-8">
            Mix any heel with any clip-on charm in our live preview. Save the look, share it, or add
            the bundle to your bag.
          </p>
          <Link to="/style-studio" className="btn-primary">
            Open Style Studio
          </Link>
        </div>
      </section>

      {/* COLLECTION GRID */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-7 py-20 md:py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="caps mb-3">THE COLLECTION</div>
            <h2 className="display-section">New this season</h2>
          </div>
          <Link
            to="/collections/$slug"
            params={{ slug: "heels" }}
            className="text-[12px] border-b border-ink pb-1 hover:text-burgundy hover:border-burgundy transition-colors"
          >
            View all →
          </Link>
        </div>

        {grid.length === 0 ? (
          <div className="text-center text-stone text-[13px] py-12">Loading the collection…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {grid.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* EDITORIAL JOURNAL */}
      <section className="bg-ink text-cream-warm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="caps text-cream-warm/60 mb-5">JOURNAL · 03 MIN READ</div>
            <h2 className="display-section text-cream-warm mb-6">
              The art of <span className="italic-burgundy">styling one heel</span> for every
              occasion.
            </h2>
            <p className="text-[13px] opacity-75 max-w-[420px] leading-[1.85] mb-7">
              A weekend wedding, a Tuesday meeting, dinner on a rooftop — one pair, three clip-ons,
              four moods.
            </p>
            <Link
              to="/journal"
              className="text-[11px] tracking-[0.18em] uppercase border-b border-cream-warm/60 pb-1 hover:border-cream-warm"
            >
              Read the story
            </Link>
          </div>
          <div className="aspect-[4/3] overflow-hidden bg-cream-warm/10">
            <img
              src={journalImg}
              alt="Editorial feature"
              className="w-full h-full object-cover"
              loading="lazy"
              width={1280}
              height={960}
            />
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-7 py-20 md:py-24">
        <div className="text-center mb-10">
          <div className="caps mb-3">@_CLASSIE_IN</div>
          <h2 className="display-section">Styled by our community</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(community.length ? community : Array.from({ length: 8 })).map((p, i) => {
            const img =
              (p as { images?: { url: string }[] } | undefined)?.images?.[0]?.url ?? heroHeel;
            return (
              <a key={i} href="#" className="aspect-square overflow-hidden bg-card-tint group">
                <img
                  src={img}
                  alt="Community style"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </a>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
