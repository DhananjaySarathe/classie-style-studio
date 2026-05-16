import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  compareAtPrice: number | null;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  isBundle: boolean;
  bundlePartnerSlug: string | null;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  remove: (productId: string, variantId: string | null) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;
};

const sameLine = (
  a: { productId: string; variantId: string | null },
  b: { productId: string; variantId: string | null },
) => a.productId === b.productId && a.variantId === b.variantId;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const qty = item.quantity ?? 1;
          const idx = s.items.findIndex((i) =>
            sameLine(i, { productId: item.productId, variantId: item.variantId }),
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
            return { items: next };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      remove: (productId, variantId) =>
        set((s) => ({ items: s.items.filter((i) => !sameLine(i, { productId, variantId })) })),
      setQty: (productId, variantId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (sameLine(i, { productId, variantId }) ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "classie.cart" },
  ),
);

export function selectCartCount(s: CartState): number {
  return s.items.reduce((t, i) => t + i.quantity, 0);
}

export function selectSubtotal(s: CartState): number {
  return s.items.reduce((t, i) => t + i.unitPrice * i.quantity, 0);
}

export function selectBundleDiscount(s: CartState): number {
  return s.items
    .filter((i) => i.isBundle)
    .reduce((t, i) => t + Math.round(i.unitPrice * i.quantity * 0.05), 0);
}
