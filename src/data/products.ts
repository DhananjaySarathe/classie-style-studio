import modivaWine from "@/assets/product-modiva-wine.jpg";
import veloraNude from "@/assets/product-velora-nude.jpg";
import clessiaBlack from "@/assets/product-clessia-black.jpg";

export type Product = {
  slug: string;
  name: string;
  desc: string;
  price: number;
  compare: number | null;
  image: string;
  badge: string;
  isNew: boolean;
  swatches: string[];
  category: "heels" | "clip-ons";
  color: "burgundy" | "nude" | "black";
  material: "satin" | "suede" | "leather";
};

export const products: Product[] = [
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
    category: "heels",
    color: "burgundy",
    material: "satin",
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
    category: "heels",
    color: "nude",
    material: "suede",
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
    category: "heels",
    color: "black",
    material: "leather",
  },
];
