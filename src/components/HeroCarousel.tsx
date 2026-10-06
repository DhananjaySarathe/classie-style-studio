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
  image: string;
  cta: { label: string; to: string; params?: Record<string, string> };
};

const SLIDES: Slide[] = [
  {
    eyebrow: "VOLUME 02 · THE MODULAR HEEL",
    title: [{ line: "One pair." }, { line: "A wardrobe of looks.", italic: true }],
    image: heroHeel,
    cta: { label: "Style your pair", to: "/style-studio" },
  },
  {
    eyebrow: "NEW IN · BLOOM & BOW",
    title: [{ line: "Quiet detail." }, { line: "Loud personality.", italic: true }],
    image: heroCharm,
    cta: { label: "Shop charms", to: "/collections/$slug", params: { slug: "clip-ons" } },
  },
  {
    eyebrow: "EDIT 03 · THE FESTIVE EDIT",
    title: [{ line: "Festive," }, { line: "not fussy.", italic: true }],
    image: journalImg,
    cta: { label: "Shop the edit", to: "/collections/$slug", params: { slug: "festive-edit" } },
  },
];

const ROTATE_MS = 7000;

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

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
      <div className="absolute right-5 top-6 md:right-8 md:top-8 caps tracking-[0.24em] text-bg/90 bg-ink/35 backdrop-blur-[2px] px-2.5 py-1.5 z-20">
        {String(index + 1).padStart(2, "0")}
        <span className="mx-1 opacity-50">/</span>
        {String(SLIDES.length).padStart(2, "0")}
      </div>

      {/* Nav arrows */}
      <div className="absolute bottom-10 right-5 md:bottom-12 md:right-8 flex items-center gap-2 z-20">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="w-10 h-10 grid place-items-center bg-bg/85 backdrop-blur-[2px] text-ink hover:bg-ink hover:text-bg transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.4} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="w-10 h-10 grid place-items-center bg-bg/85 backdrop-blur-[2px] text-ink hover:bg-ink hover:text-bg transition-colors"
        >
          <ArrowRight size={15} strokeWidth={1.4} />
        </button>
      </div>

      {/* Progress segments */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-4 md:px-7 pb-4 z-20">
        {SLIDES.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-bg/30 overflow-hidden">
            <div
              key={`${i}-${tick}`}
              className={"h-full bg-bg origin-left " + (i === index && !paused ? "progress-fill" : "")}
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

      {/* Sr-only dot nav */}
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
    <div className="relative h-[78vh] md:h-[86vh] min-h-[520px] bg-card-tint overflow-hidden">
      <img
        src={slide.image}
        alt=""
        className={
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 " +
          (isActive ? "opacity-100" : "opacity-0")
        }
      />
      {/* Bottom gradient for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-ink/55 via-ink/15 to-transparent" />

      {/* Caption overlay (bottom-left) */}
      <div className="absolute left-5 md:left-8 bottom-12 md:bottom-16 max-w-[640px] text-bg z-10">
        {isActive && (
          <div
            className="caps caps-ink text-bg/95 flex items-center gap-2.5 mb-5 rise-in"
            style={{ animationDelay: "0ms" }}
          >
            <span className="dot-burgundy" />
            {slide.eyebrow}
          </div>
        )}
        <h1 className="display-hero text-bg mb-7">
          {slide.title.map((t, i) => (
            <span
              key={i}
              className={"block rise-in " + (t.italic ? "italic text-bg" : "")}
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              {t.line}
            </span>
          ))}
        </h1>
        {isActive && (
          <div className="rise-in" style={{ animationDelay: "360ms" }}>
            {slide.cta.params ? (
              <Link
                to={slide.cta.to as "/collections/$slug"}
                params={slide.cta.params as { slug: string }}
                className="inline-flex items-center bg-bg text-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-burgundy hover:text-bg transition-colors"
              >
                {slide.cta.label} →
              </Link>
            ) : (
              <Link
                to={slide.cta.to as "/style-studio"}
                className="inline-flex items-center bg-bg text-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-burgundy hover:text-bg transition-colors"
              >
                {slide.cta.label} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
