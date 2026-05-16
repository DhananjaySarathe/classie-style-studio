import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import heroHeel from "@/assets/hero-heel.jpg";
import heroCharm from "@/assets/hero-charm.jpg";
import journalImg from "@/assets/journal-feature.jpg";

type Slide = {
  eyebrow: string;
  title: { line: string; italic?: boolean }[];
  body: string;
  image: string;
  primaryCta: { label: string; to: string; params?: Record<string, string> };
  secondaryCta: { label: string; to: string; params?: Record<string, string> };
  featured: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "VOLUME 02 · THE MODULAR HEEL",
    title: [{ line: "One pair." }, { line: "A wardrobe", italic: true }, { line: "of looks." }],
    body: "Sculpted heels and clip-on charms that snap together. One favourite pair, restyled endlessly — no closet overflow.",
    image: heroHeel,
    primaryCta: { label: "Style your pair", to: "/style-studio" },
    secondaryCta: { label: "Take the quiz", to: "/style-quiz" },
    featured: "FEATURED · CLESSIA + BLOOM PEARL",
  },
  {
    eyebrow: "NEW IN · BLOOM & BOW",
    title: [{ line: "Quiet detail." }, { line: "Loud", italic: true }, { line: "personality." }],
    body: "Hand-finished clip-on charms in pearl, satin and ribbon. Snap one on, the heel becomes a different shoe.",
    image: heroCharm,
    primaryCta: { label: "Shop charms", to: "/collections/$slug", params: { slug: "clip-ons" } },
    secondaryCta: { label: "See the look", to: "/style-studio" },
    featured: "FEATURED · BLOOM PEARL + ROSE",
  },
  {
    eyebrow: "EDIT 03 · THE FESTIVE EDIT",
    title: [{ line: "Festive," }, { line: "not", italic: true }, { line: "fussy." }],
    body: "Quietly dressed-up pieces made for the celebrations on your calendar. Pair, swap, and reuse.",
    image: journalImg,
    primaryCta: {
      label: "Shop the edit",
      to: "/collections/$slug",
      params: { slug: "festive-edit" },
    },
    secondaryCta: { label: "Browse heels", to: "/collections/$slug", params: { slug: "heels" } },
    featured: "FEATURED · ARIA EMERALD + RHINESTONE",
  },
];

const ROTATE_MS = 7000;

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // re-render trigger for progress bar restart
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi],
  );

  // Track active slide
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setIndex(emblaApi.selectedScrollSnap());
      setTick((t) => t + 1);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Auto-rotate
  useEffect(() => {
    if (!emblaApi || paused) return;
    timerRef.current = setTimeout(() => emblaApi.scrollNext(), ROTATE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [emblaApi, paused, index]);

  const prev = () => emblaApi?.scrollPrev();
  const next = () => emblaApi?.scrollNext();

  return (
    <section
      className="relative bg-bg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <SlideContent slide={slide} isActive={i === index} />
            </div>
          ))}
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute right-4 top-6 md:right-7 md:top-8 caps tracking-[0.24em] text-stone select-none">
        {String(index + 1).padStart(2, "0")}
        <span className="mx-1 opacity-40">/</span>
        {String(SLIDES.length).padStart(2, "0")}
      </div>

      {/* Nav arrows */}
      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-7 flex items-center gap-3 z-20">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="w-9 h-9 grid place-items-center border-[0.5px] border-ink text-ink hover:bg-ink hover:text-bg transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.4} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="w-9 h-9 grid place-items-center border-[0.5px] border-ink text-ink hover:bg-ink hover:text-bg transition-colors"
        >
          <ArrowRight size={14} strokeWidth={1.4} />
        </button>
      </div>

      {/* Progress segments */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-4 md:px-7 pb-4">
        {SLIDES.map((_, i) => (
          <div key={i} className="flex-1 h-[1px] bg-border overflow-hidden">
            <div
              key={`${i}-${tick}`}
              className={
                "h-full bg-ink origin-left " + (i === index && !paused ? "progress-fill" : "")
              }
              style={
                i === index && !paused
                  ? { animationDuration: `${ROTATE_MS}ms` }
                  : i < index
                    ? { transform: "scaleX(1)" }
                    : { transform: "scaleX(0)" }
              }
            />
          </div>
        ))}
      </div>

      {/* Dots — alt nav */}
      <div className="sr-only">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}>
            Go to slide {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

function SlideContent({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-7 pt-10 md:pt-14 pb-20 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 md:gap-14 items-stretch min-h-[68vh] md:min-h-[78vh]">
        {/* Image */}
        <div className="order-2 md:order-1 relative bg-card-tint">
          <img
            src={slide.image}
            alt=""
            className={
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 " +
              (isActive ? "opacity-100" : "opacity-0")
            }
          />
          <div className="absolute left-4 bottom-4 caps tracking-[0.22em] text-bg/90 bg-ink/55 backdrop-blur-[2px] px-2.5 py-1.5">
            {slide.featured}
          </div>
        </div>

        {/* Caption */}
        <div className="order-1 md:order-2 flex flex-col justify-end md:justify-center pr-0 md:pr-12">
          {isActive && (
            <div
              className="caps flex items-center gap-2.5 mb-6 rise-in"
              style={{ animationDelay: "0ms" }}
            >
              <span className="dot-burgundy" />
              {slide.eyebrow}
            </div>
          )}
          <h1 className="display-hero text-ink mb-7">
            {slide.title.map((t, i) => (
              <span
                key={i}
                className={"block rise-in " + (t.italic ? "italic-burgundy" : "")}
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                {t.line}
              </span>
            ))}
          </h1>
          {isActive && (
            <p
              className="text-[14px] text-stone max-w-[420px] leading-[1.85] mb-9 rise-in"
              style={{ animationDelay: "420ms" }}
            >
              {slide.body}
            </p>
          )}
          {isActive && (
            <div
              className="flex flex-wrap items-center gap-7 rise-in"
              style={{ animationDelay: "520ms" }}
            >
              {slide.primaryCta.params ? (
                <Link
                  to={slide.primaryCta.to as "/collections/$slug"}
                  params={slide.primaryCta.params as { slug: string }}
                  className="btn-primary"
                >
                  {slide.primaryCta.label}
                </Link>
              ) : (
                <Link to={slide.primaryCta.to as "/style-studio"} className="btn-primary">
                  {slide.primaryCta.label}
                </Link>
              )}
              {slide.secondaryCta.params ? (
                <Link
                  to={slide.secondaryCta.to as "/collections/$slug"}
                  params={slide.secondaryCta.params as { slug: string }}
                  className="btn-secondary"
                >
                  {slide.secondaryCta.label}
                </Link>
              ) : (
                <Link to={slide.secondaryCta.to as "/style-studio"} className="btn-secondary">
                  {slide.secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
