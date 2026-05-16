import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { supabase, hasSupabaseEnv } from "./supabase";

// ============== Types surfaced to UI ==============
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "heel" | "clip-on";
  sub_collection: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  specs: Record<string, string> | null;
  care_instructions: string | null;
  primary_color: string | null;
  color_label: string | null;
  is_bestseller: boolean;
  is_new: boolean;
  inventory_count: number;
  images: { url: string; alt_text: string | null; type: string; display_order: number }[];
  variants: { id: string; size: string; sku: string; inventory: number }[];
  swatches?: string[];
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_headline: string | null;
  hero_image_url: string | null;
  hero_secondary_image_url: string | null;
  is_edit: boolean;
};

export type ProductFilters = {
  category?: "heel" | "clip-on";
  heelType?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "best-selling" | "price-asc" | "price-desc" | "newest";
  search?: string;
};

// ============== Helpers ==============
async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];

  let q = supabase
    .from("products")
    .select(
      `
      id, slug, name, category, sub_collection, description, short_description,
      price, compare_at_price, specs, care_instructions, primary_color,
      color_label, is_bestseller, is_new, inventory_count,
      product_images(url, alt_text, type, display_order),
      product_variants(id, size, sku, inventory)
    `,
    )
    .eq("is_active", true);

  if (filters.category) q = q.eq("category", filters.category);
  if (filters.color) q = q.eq("color_label", filters.color);
  if (filters.minPrice != null) q = q.gte("price", filters.minPrice);
  if (filters.maxPrice != null) q = q.lte("price", filters.maxPrice);
  if (filters.search) {
    const s = filters.search.replace(/[%_]/g, "");
    q = q.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
  }

  switch (filters.sort) {
    case "price-asc":
      q = q.order("price", { ascending: true });
      break;
    case "price-desc":
      q = q.order("price", { ascending: false });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    case "best-selling":
      q = q.order("is_bestseller", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      q = q.order("is_new", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as unknown as Product[];
  if (filters.heelType) {
    rows = rows.filter((p) => (p.specs?.heel_type ?? "") === filters.heelType);
  }
  return rows.map(enrich);
}

function enrich(p: Product): Product {
  const swatches = [p.primary_color, "#2B2521", "#6B1A2D"].filter(Boolean) as string[];
  const images = (p.images ?? []).sort((a, b) => a.display_order - b.display_order);
  return { ...p, swatches: Array.from(new Set(swatches)).slice(0, 4), images };
}

// ============== Hooks ==============
export function useProducts(
  filters: ProductFilters = {},
  options?: Partial<UseQueryOptions<Product[]>>,
) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 60_000,
    ...options,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: !!slug && hasSupabaseEnv(),
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, slug, name, category, sub_collection, description, short_description,
          price, compare_at_price, specs, care_instructions, primary_color,
          color_label, is_bestseller, is_new, inventory_count,
          product_images(url, alt_text, type, display_order),
          product_variants(id, size, sku, inventory)
        `,
        )
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data ? enrich(data as unknown as Product) : null;
    },
  });
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ["collection", slug],
    enabled: !!slug && hasSupabaseEnv(),
    queryFn: async (): Promise<{ collection: Collection | null; products: Product[] }> => {
      const { data: col, error: e1 } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (e1) throw e1;

      const { data: prodRows, error: e2 } = await supabase
        .from("product_collections")
        .select(
          `
          display_order,
          products!inner(
            id, slug, name, category, sub_collection, description, short_description,
            price, compare_at_price, specs, care_instructions, primary_color,
            color_label, is_bestseller, is_new, inventory_count,
            product_images(url, alt_text, type, display_order),
            product_variants(id, size, sku, inventory)
          )
        `,
        )
        .eq(
          "collection_id",
          (col as Collection | null)?.id ?? "00000000-0000-0000-0000-000000000000",
        )
        .order("display_order", { ascending: false });
      if (e2) throw e2;

      const products = ((prodRows ?? []) as unknown as { products: Product }[])
        .map((row) => row.products)
        .filter(Boolean)
        .map(enrich);
      return { collection: (col as Collection | null) ?? null, products };
    },
  });
}

export type AddressShape = {
  full_name?: string;
  email?: string;
  mobile?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
};

export type OrderItemSnapshot = {
  name?: string;
  image?: string;
  variantLabel?: string | null;
};

export type OrderItem = {
  quantity: number;
  unit_price: number;
  line_total: number;
  product_snapshot: OrderItemSnapshot;
};

export type OrderWithItems = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  discount_code: string | null;
  razorpay_payment_id: string | null;
  shiprocket_awb_code: string | null;
  shiprocket_tracking_url: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at: string;
  shipping_address: AddressShape | null;
  items: OrderItem[];
};

export function useOrder(orderId: string | undefined) {
  return useQuery<OrderWithItems | null>({
    queryKey: ["order", orderId],
    enabled: !!orderId && hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id, order_number, status, payment_method, payment_status,
          subtotal, discount, shipping_cost, total, discount_code,
          razorpay_payment_id, shiprocket_awb_code, shiprocket_tracking_url,
          guest_email, guest_phone, created_at,
          shipping_address:addresses(*),
          items:order_items(quantity, unit_price, line_total, product_snapshot)
        `,
        )
        .eq("id", orderId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as OrderWithItems | null) ?? null;
    },
  });
}

export type OrderSummary = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

export function useOrders() {
  return useQuery<OrderSummary[]>({
    queryKey: ["orders"],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderSummary[];
    },
  });
}

export type Review = {
  id: string;
  rating: number;
  headline: string | null;
  body: string | null;
  helpful_count: number;
  is_verified: boolean;
  created_at: string;
  user_id: string | null;
};

export function useReviews(productId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    enabled: !!productId && hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, headline, body, helpful_count, is_verified, created_at, user_id")
        .eq("product_id", productId!)
        .eq("status", "approved")
        .order("helpful_count", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Review[];
    },
  });
}

export function useCompatibility(heelId: string | undefined) {
  return useQuery({
    queryKey: ["compatibility", heelId],
    enabled: !!heelId && hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clip_on_compatibility")
        .select("clip_on_product_id, composite_image_url, products:products!clip_on_product_id(*)")
        .eq("heel_product_id", heelId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type Address = {
  id: string;
  full_name: string;
  mobile: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ["addresses"],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Address[];
    },
  });
}
