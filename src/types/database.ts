// Placeholder Database type. Regenerate with:
//   npx supabase gen types typescript --linked > src/types/database.ts
// once your Supabase project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProductCategory = "heel" | "clip-on";
export type SubCollection = "rhinestone-charm" | "bloom-bow" | null;
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded";
export type UserRole = "customer" | "admin";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type DiscountType = "percentage" | "fixed";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  sub_collection: SubCollection;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  specs: Json | null;
  care_instructions: string | null;
  primary_color: string | null;
  color_label: string | null;
  is_active: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  inventory_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  type: "hero" | "side" | "sole" | "on-foot" | "lifestyle" | "with-charm";
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  inventory: number;
}

export interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_headline: string | null;
  hero_image_url: string | null;
  hero_secondary_image_url: string | null;
  is_edit: boolean;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  discount_code: string | null;
  shipping_address_id: string | null;
  shiprocket_order_id: string | null;
  shiprocket_awb_code: string | null;
  shiprocket_tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

// Loose Database shape — tighten by running supabase gen types.
// Until then, we don't bother enumerating individual tables: every table
// is typed as a generic Row to keep the surface flexible.
type AnyRow = Record<string, unknown>;
export interface Database {
  public: {
    Tables: Record<string, { Row: AnyRow; Insert: AnyRow; Update: AnyRow; Relationships: never[] }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
