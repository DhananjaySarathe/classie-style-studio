import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Heart } from "lucide-react";
import heroHeel from "@/assets/hero-heel.jpg";
import heroCharm from "@/assets/hero-charm.jpg";
import journalImg from "@/assets/journal-feature.jpg";
import modivaWine from "@/assets/product-modiva-wine.jpg";
import veloraNude from "@/assets/product-velora-nude.jpg";
import clessiaBlack from "@/assets/product-clessia-black.jpg";

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

const products = [
  {
    slug: "modiva-wine",
    name: "Modiva Wine",
    desc: "Burgundy · Satin · 2.5″ Block",
    price: 1699,
    compare: 1899,
    image: modivaWine,
    badge: "−10%",
    isNew: false,
    swatches: ["#6B1A2D", "#2B2521", "#C9A87A"],
  },
  {
    slug: "velora-nude",
    name: "Velora Nude",
    desc: "Soft Beige · Suede · 2″ Kitten",
    price: 1499,
    compare: null,
    image: veloraNude,
    badge: "NEW",
    isNew: true,
    swatches: ["#D8C3A5", "#2B2521", "#6B1A2D"],
  },
  {
    slug: "clessia-noir",
    name: "Clessia Noir",
    desc: "Black · Leather · 3″ Slim",
    price: 1799,
    compare: 1999,
    image: clessiaBlack,
    badge: "−10%",
    isNew: false,
    swatches: ["#2B2521", "#6B1A2D", "#D8C3A5"],
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 pt-14 md:pt-20 pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 items-end">
          <div>
            <div className="caps flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy inline-block" />
              VOLUME 02 · THE MODULAR HEEL
            </div>
            <h1 className="display-hero text-ink mb-7">
              One pair.<br />
              <span className="italic-burgundy">A wardrobe</span><br />
              of looks.
            </h1>
            <p className="text-[13px] text-stone max-w-[380px] leading-[1.85] mb-9">
              Sculpted heels and clip-on charms that snap together. Built around one quiet idea — your favourite pair, restyled endlessly, no closet overflow.
            </p>
            <div className="flex items-center gap-7">
              <Link to="/style-studio" className="btn-primary">Style your pair</Link>
              <Link to="/style-quiz" className="btn-secondary">Take the quiz</Link>
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
            <div className="absolute -bottom-8 left-0 caps">
              FEATURED: CLESSIA + BLOOM PEARL
            </div>
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
                to="/collections/heels"
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
        <div className="max-w-[1440px] mx-auto px-7 md:px-7 px-4">
          <div className="text-center mb-12">
            <div className="caps mb-4">THE SIGNATURE EXPERIENCE</div>
            <h2 className="display-section mb-5">
              Style it <span className="italic-burgundy">before</span> you buy it.
            </h2>
            <p className="text-[13px] text-stone max-w-[420px] mx-auto leading-[1.85]">
              Mix any heel with any clip-on charm in our live preview. Save the look, share it, or add the bundle to your bag.
            </p>
          </div>

          <div className="bg-cream-bg border border-soft-border max-w-[540px] mx-auto p-7">
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square bg-card-tint relative overflow-hidden">
                <img src={modivaWine} alt="Live preview" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-3 right-3 caps caps-ink flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse inline-block" />
                  LIVE
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="caps mb-3">HEEL</div>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {["Clessia", "Modiva", "Velora"].map((h, i) => (
                      <button
                        key={h}
                        className={`text-[11px] px-2.5 py-1 border ${i === 1 ? "bg-ink text-cream-bg border-ink" : "border-ink/40"}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className="caps mb-3">CHARM</div>
                  <div className="flex gap-2.5 mb-5">
                    {["#F0E5D2", "#6B1A2D", "#2B2521", "#C9A87A", "#88A0A8"].map((c, i) => (
                      <button
                        key={c}
                        aria-label="swatch"
                        className="w-[14px] h-[14px] rounded-full"
                        style={{
                          background: c,
                          outline: "0.5px solid #2B2521",
                          outlineOffset: "1.5px",
                          boxShadow: i === 1 ? "0 0 0 1px #2B2521" : undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="caps mb-1">YOUR PAIR</div>
                  <div className="font-display text-[22px] mb-4">₹2,148</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 mt-6 pt-5 border-t border-soft-border">
              <button className="btn-primary w-full">Add to bag</button>
              <button className="btn-secondary">Save</button>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION GRID */}
      <section className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-20 md:py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="caps mb-3">THE COLLECTION</div>
            <h2 className="display-section">New this season</h2>
          </div>
          <Link to="/collections/heels" className="text-[12px] border-b border-ink pb-1 hover:text-burgundy hover:border-burgundy transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }} className="group block">
              <div className="relative bg-card-tint overflow-hidden mb-5" style={{ aspectRatio: "4/5" }}>
                {p.badge && (
                  <div
                    className={`absolute top-3 left-3 z-10 px-2 py-1 text-[10px] tracking-[0.18em] uppercase ${
                      p.isNew ? "bg-burgundy text-cream-bg" : "bg-ink text-cream-bg"
                    }`}
                  >
                    {p.badge}
                  </div>
                )}
                <button
                  aria-label="Add to wishlist"
                  className="absolute top-3 right-3 z-10 text-ink/55 hover:text-burgundy transition-colors"
                  onClick={(e) => { e.preventDefault(); }}
                >
                  <Heart size={16} strokeWidth={1.25} />
                </button>
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={768}
                  height={960}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="display-product">{p.name}</div>
                <div className="text-[13px] flex items-baseline gap-2">
                  {p.compare && (
                    <span className="text-[11px] text-stone line-through">₹{p.compare}</span>
                  )}
                  <span>₹{p.price}</span>
                </div>
              </div>
              <div className="text-[11px] text-stone mt-1">{p.desc}</div>
              <div className="flex gap-2 mt-3">
                {p.swatches.map((c) => (
                  <span
                    key={c}
                    className="w-[10px] h-[10px] rounded-full"
                    style={{ background: c, outline: "0.5px solid #2B2521", outlineOffset: "1.5px" }}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL JOURNAL */}
      <section className="bg-ink text-cream-warm">
        <div className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="caps text-cream-warm/60 mb-5">JOURNAL · 03 MIN READ</div>
            <h2 className="display-section text-cream-warm mb-6">
              The art of <span className="italic-burgundy">styling one heel</span> for every occasion.
            </h2>
            <p className="text-[13px] opacity-75 max-w-[420px] leading-[1.85] mb-7">
              A weekend wedding, a Tuesday meeting, dinner on a rooftop — one pair, three clip-ons, four moods. Our stylist breaks down a real wardrobe edit from a Mumbai-based reader.
            </p>
            <Link to="/journal" className="text-[11px] tracking-[0.18em] uppercase border-b border-cream-warm/60 pb-1 hover:border-cream-warm">
              Read the story
            </Link>
          </div>
          <div className="aspect-[4/3] overflow-hidden bg-cream-warm/10">
            <img src={journalImg} alt="Editorial feature" className="w-full h-full object-cover" loading="lazy" width={1280} height={960} />
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-20 md:py-24">
        <div className="text-center mb-10">
          <div className="caps mb-3">@_CLASSIE_IN</div>
          <h2 className="display-section">Styled by our community</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[modivaWine, veloraNude, clessiaBlack, journalImg, heroHeel, heroCharm, modivaWine, veloraNude].map((img, i) => (
            <a key={i} href="#" className="aspect-square overflow-hidden bg-card-tint group">
              <img src={img} alt="Community style" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </a>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
