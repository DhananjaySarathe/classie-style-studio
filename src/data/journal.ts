export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  readMinutes: number;
  hero: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "art-of-styling-one-heel",
    title: "The art of styling one heel for every occasion",
    subtitle: "Why one pair, well chosen, almost always beats five.",
    readMinutes: 3,
    hero: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600",
    body: [
      "A modular heel is built on a quiet promise: that the work of dressing for the day can be made simpler. A clip-on swap turns a meeting shoe into an evening shoe in under a minute.",
      "We design our heels so that the silhouette stays neutral enough to hold its own, then let the charm carry the personality.",
      "It's why our customers tell us they reach for the same pair more often than they expected — and end up with a closet that feels lighter.",
    ],
  },
  {
    slug: "modular-design-thinking",
    title: "Modular design, quietly applied",
    subtitle: "What we learned from designing one pair for many lives.",
    readMinutes: 4,
    hero: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1600",
    body: [
      "Modularity in product design isn't new — but in footwear, it's surprisingly rare. We took inspiration from architecture and editorial design: small, restrained pieces that can be re-arranged.",
      "The trick is keeping the base piece quiet. A loud heel with a louder charm wears thin fast. A quiet heel with one accent? You notice it differently every time.",
    ],
  },
  {
    slug: "made-in-india",
    title: "Why we make it here.",
    subtitle: "A small story about workshops, people, and patience.",
    readMinutes: 2,
    hero: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=1600",
    body: [
      "Every Classie pair is made in small workshops we visit and people we know. We chose this slower path because the alternative — faster, further away — didn't sit with us.",
      "It also means batches are limited. When a piece is sold out, it's genuinely sold out for a season.",
    ],
  },
];
