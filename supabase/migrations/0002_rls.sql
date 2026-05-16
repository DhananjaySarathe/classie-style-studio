-- CLASSIE RLS policies
-- Strategy:
--   public-readable catalog tables: products, product_images, product_variants,
--   collections, product_collections, clip_on_compatibility, quiz_matrix,
--   approved reviews.
--   owner-only: profiles, addresses, wishlist_items, saved_looks, cart_items
--   owner or admin: orders, order_items, returns
--   service-role only: otps, newsletter_subscribers, discount_codes (mutations)

-- Helper to check admin role
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$;

-- ---------- products ----------
alter table products enable row level security;
drop policy if exists "products read public" on products;
create policy "products read public" on products
  for select using (is_active = true or is_admin());
drop policy if exists "products write admin" on products;
create policy "products write admin" on products
  for all using (is_admin()) with check (is_admin());

-- ---------- product_images ----------
alter table product_images enable row level security;
drop policy if exists "product_images read public" on product_images;
create policy "product_images read public" on product_images for select using (true);
drop policy if exists "product_images write admin" on product_images;
create policy "product_images write admin" on product_images
  for all using (is_admin()) with check (is_admin());

-- ---------- product_variants ----------
alter table product_variants enable row level security;
drop policy if exists "product_variants read public" on product_variants;
create policy "product_variants read public" on product_variants for select using (true);
drop policy if exists "product_variants write admin" on product_variants;
create policy "product_variants write admin" on product_variants
  for all using (is_admin()) with check (is_admin());

-- ---------- collections ----------
alter table collections enable row level security;
drop policy if exists "collections read public" on collections;
create policy "collections read public" on collections for select using (true);
drop policy if exists "collections write admin" on collections;
create policy "collections write admin" on collections
  for all using (is_admin()) with check (is_admin());

-- ---------- product_collections ----------
alter table product_collections enable row level security;
drop policy if exists "product_collections read public" on product_collections;
create policy "product_collections read public" on product_collections for select using (true);
drop policy if exists "product_collections write admin" on product_collections;
create policy "product_collections write admin" on product_collections
  for all using (is_admin()) with check (is_admin());

-- ---------- clip_on_compatibility ----------
alter table clip_on_compatibility enable row level security;
drop policy if exists "clip_on_compatibility read public" on clip_on_compatibility;
create policy "clip_on_compatibility read public" on clip_on_compatibility for select using (true);
drop policy if exists "clip_on_compatibility write admin" on clip_on_compatibility;
create policy "clip_on_compatibility write admin" on clip_on_compatibility
  for all using (is_admin()) with check (is_admin());

-- ---------- profiles ----------
alter table profiles enable row level security;
drop policy if exists "profiles self select" on profiles;
create policy "profiles self select" on profiles
  for select using (auth.uid() = id or is_admin());
drop policy if exists "profiles self upsert" on profiles;
create policy "profiles self upsert" on profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- addresses ----------
alter table addresses enable row level security;
drop policy if exists "addresses owner all" on addresses;
create policy "addresses owner all" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- wishlist_items ----------
alter table wishlist_items enable row level security;
drop policy if exists "wishlist owner all" on wishlist_items;
create policy "wishlist owner all" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- saved_looks ----------
alter table saved_looks enable row level security;
drop policy if exists "saved_looks owner all" on saved_looks;
create policy "saved_looks owner all" on saved_looks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "saved_looks shareable read" on saved_looks;
create policy "saved_looks shareable read" on saved_looks
  for select using (shareable_slug is not null);

-- ---------- cart_items ----------
-- Owner or guest matching session_id (passed via request header `x-session-id`).
alter table cart_items enable row level security;
drop policy if exists "cart_items owner all" on cart_items;
create policy "cart_items owner all" on cart_items
  for all
  using (
    auth.uid() = user_id
    or (user_id is null and session_id = current_setting('request.headers', true)::jsonb->>'x-session-id')
  )
  with check (
    auth.uid() = user_id
    or (user_id is null and session_id = current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ---------- orders ----------
alter table orders enable row level security;
drop policy if exists "orders owner select" on orders;
create policy "orders owner select" on orders
  for select using (auth.uid() = user_id or is_admin());
-- Inserts/updates go through edge functions (service role bypasses RLS).

-- ---------- order_items ----------
alter table order_items enable row level security;
drop policy if exists "order_items owner select" on order_items;
create policy "order_items owner select" on order_items
  for select using (
    is_admin() or exists (
      select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ---------- reviews ----------
alter table reviews enable row level security;
drop policy if exists "reviews read approved" on reviews;
create policy "reviews read approved" on reviews
  for select using (status = 'approved' or auth.uid() = user_id or is_admin());
drop policy if exists "reviews insert owner" on reviews;
create policy "reviews insert owner" on reviews
  for insert with check (auth.uid() = user_id);
drop policy if exists "reviews update admin" on reviews;
create policy "reviews update admin" on reviews
  for update using (is_admin()) with check (is_admin());

-- ---------- discount_codes ----------
alter table discount_codes enable row level security;
drop policy if exists "discount_codes read active" on discount_codes;
create policy "discount_codes read active" on discount_codes
  for select using (is_active = true);
drop policy if exists "discount_codes write admin" on discount_codes;
create policy "discount_codes write admin" on discount_codes
  for all using (is_admin()) with check (is_admin());

-- ---------- returns ----------
alter table returns enable row level security;
drop policy if exists "returns owner all" on returns;
create policy "returns owner all" on returns
  for all using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- ---------- newsletter_subscribers ----------
alter table newsletter_subscribers enable row level security;
drop policy if exists "newsletter insert anyone" on newsletter_subscribers;
create policy "newsletter insert anyone" on newsletter_subscribers
  for insert with check (true);
drop policy if exists "newsletter read admin" on newsletter_subscribers;
create policy "newsletter read admin" on newsletter_subscribers
  for select using (is_admin());

-- ---------- otps ----------
alter table otps enable row level security;
-- No public policy. Only service role (edge functions) can read/write.

-- ---------- quiz_matrix ----------
alter table quiz_matrix enable row level security;
drop policy if exists "quiz_matrix read public" on quiz_matrix;
create policy "quiz_matrix read public" on quiz_matrix for select using (true);
drop policy if exists "quiz_matrix write admin" on quiz_matrix;
create policy "quiz_matrix write admin" on quiz_matrix
  for all using (is_admin()) with check (is_admin());
