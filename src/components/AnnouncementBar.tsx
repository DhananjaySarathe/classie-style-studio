import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  "✦ ONE HEEL · ENDLESS LOOKS",
  "CODE FIRST10 · 10% OFF YOUR FIRST PAIR",
  "FREE SHIPPING ABOVE ₹999",
  "EASY 7-DAY RETURNS",
  "VERIFIED COD ACROSS INDIA",
];

export function AnnouncementBar() {
  const loop = [...items, ...items, ...items];
  return (
    <div className="bg-ink text-cream-warm overflow-hidden relative">
      <div className="flex items-center">
        <button aria-label="Previous" className="px-3 py-2 opacity-60 hover:opacity-100 shrink-0">
          <ChevronLeft size={12} />
        </button>
        <div className="flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee-fast">
            {loop.map((item, i) => (
              <span
                key={i}
                className="px-8 py-[9px] text-[10px] tracking-[0.18em] uppercase font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <button aria-label="Next" className="px-3 py-2 opacity-60 hover:opacity-100 shrink-0">
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
