-- CLASSIE schema — phase 1
-- All money in paise (bigint). All IDs uuid.

create extension if not exists "pgcrypto";

-- =====================================================================
-- Enums
-- =====================================================================
do $$ begin
  create type product_category as enum ('heel', 'clip-on');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_collection_t as enum ('rhinestone-charm', 'bloom-bow');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method_t as enum ('razorpay', 'cod');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status_t as enum ('pending', 'authorized', 'captured', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type_t as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_image_type as enum ('hero', 'side', 'sole', 'on-foot', 'lifestyle', 'with-charm');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- Helper: updated_at trigger
-- =====================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- Profiles (extends auth.users)
-- =====================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  default_address_id uuid,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, phone, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================================================================
-- Products
-- =====================================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category product_category not null,
  sub_collection sub_collection_t,
  description text,
  short_description text,
  price bigint not null,
  compare_at_price bigint,
  specs jsonb,
  care_instructions text,
  primary_color text,
  color_label text,
  is_active boolean not null default true,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  inventory_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_active_idx on products(category, is_active);
create index if not exists products_fts_idx on products using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  sku text not null unique,
  inventory integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on product_variants(product_id);
create trigger product_variants_updated_at before update on product_variants
  for each row execute function set_updated_at();

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  type product_image_type not null default 'hero',
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_order_idx on product_images(product_id, display_order);

-- =====================================================================
-- Collections
-- =====================================================================
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  hero_headline text,
  hero_image_url text,
  hero_secondary_image_url text,
  is_edit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_updated_at before update on collections
  for each row execute function set_updated_at();

create table if not exists product_collections (
  product_id uuid not null references products(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  display_order integer not null default 0,
  primary key (product_id, collection_id)
);
create index if not exists product_collections_collection_idx on product_collections(collection_id, display_order);

create table if not exists clip_on_compatibility (
  id uuid primary key default gen_random_uuid(),
  heel_product_id uuid not null references products(id) on delete cascade,
  clip_on_product_id uuid not null references products(id) on delete cascade,
  composite_image_url text,
  unique (heel_product_id, clip_on_product_id)
);

-- =====================================================================
-- Addresses
-- =====================================================================
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on addresses(user_id);
create trigger addresses_updated_at before update on addresses
  for each row execute function set_updated_at();

alter table profiles
  add constraint profiles_default_address_fk
  foreign key (default_address_id) references addresses(id) on delete set null
  not valid;

-- =====================================================================
-- Orders + order number generator
-- =====================================================================
create sequence if not exists order_number_seq;

create or replace function generate_order_number()
returns text language plpgsql as $$
declare
  yymm text := to_char(now(), 'YYMM');
  n bigint := nextval('order_number_seq');
begin
  return 'CL-' || yymm || '-' || lpad(n::text, 6, '0');
end;
$$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default generate_order_number(),
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  guest_phone text,
  status order_status not null default 'placed',
  payment_method payment_method_t not null,
  payment_status payment_status_t not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  subtotal bigint not null default 0,
  discount bigint not null default 0,
  shipping_cost bigint not null default 0,
  total bigint not null default 0,
  discount_code text,
  shipping_address_id uuid references addresses(id) on delete set null,
  shiprocket_order_id text,
  shiprocket_awb_code text,
  shiprocket_tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_status_idx on orders(user_id, status);
create index if not exists orders_created_idx on orders(created_at desc);
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  quantity integer not null,
  unit_price bigint not null,
  line_total bigint not null,
  product_snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on order_items(order_id);

-- =====================================================================
-- Cart
-- =====================================================================
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity integer not null default 1,
  is_bundle boolean not null default false,
  bundle_partner_product_id uuid references products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);
create unique index if not exists cart_items_user_product_uidx
  on cart_items(user_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where user_id is not null;
create unique index if not exists cart_items_session_product_uidx
  on cart_items(session_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where session_id is not null;
create trigger cart_items_updated_at before update on cart_items
  for each row execute function set_updated_at();

-- =====================================================================
-- Wishlist + saved looks
-- =====================================================================
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heel_product_id uuid not null references products(id) on delete cascade,
  clip_on_product_id uuid not null references products(id) on delete cascade,
  name text,
  shareable_slug text unique,
  created_at timestamptz not null default now()
);
create index if not exists saved_looks_user_idx on saved_looks(user_id);

-- =====================================================================
-- Reviews
-- =====================================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  headline text,
  body text,
  photos jsonb,
  helpful_count integer not null default 0,
  is_verified boolean not null default false,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews(product_id, status);
create trigger reviews_updated_at before update on reviews
  for each row execute function set_updated_at();

-- =====================================================================
-- Discounts
-- =====================================================================
create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type discount_type_t not null,
  discount_value bigint not null,
  min_order_value bigint not null default 0,
  max_discount bigint,
  usage_limit integer,
  used_count integer not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  applies_to text not null default 'all',
  product_ids jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger discount_codes_updated_at before update on discount_codes
  for each row execute function set_updated_at();

-- =====================================================================
-- Returns
-- =====================================================================
create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  reason text,
  items jsonb,
  refund_amount bigint,
  shiprocket_pickup_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists returns_order_idx on returns(order_id);
create trigger returns_updated_at before update on returns
  for each row execute function set_updated_at();

-- =====================================================================
-- Misc
-- =====================================================================
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

create table if not exists otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  hashed_otp text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists otps_phone_idx on otps(phone, used);

create table if not exists quiz_matrix (
  id uuid primary key default gen_random_uuid(),
  combination_key text not null unique,
  product_id uuid references products(id) on delete set null,
  clip_on_id uuid references products(id) on delete set null
);
