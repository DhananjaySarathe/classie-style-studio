-- CLASSIE seed — products, collections, variants, images, quiz matrix, sample discount.
-- Idempotent: re-running upserts rather than duplicates.

-- ============== Collections ==============
insert into collections (slug, name, description, hero_headline, hero_image_url, hero_secondary_image_url, is_edit) values
  ('heels', 'Heels', 'Modular heels designed for every occasion.', 'One pair. <i>A wardrobe</i> of looks.',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600',
    'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=1200', false),
  ('clip-ons', 'Clip-ons', 'Snap-on charms that transform any heel.', 'One heel. <i>Endless</i> looks.',
    'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=1600',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200', false),
  ('rhinestone-charm', 'Rhinestone Charm', 'Sparkle for night, polish for day.', 'A little <i>sparkle</i>, always.',
    'https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=1600',
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200', false),
  ('bloom-bow', 'Bloom & Bow', 'Soft florals and quiet ribbons.', 'Quiet detail, <i>loud</i> personality.',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1600',
    'https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=1200', false),
  ('date-edit', 'The Date Edit', 'Curated for soft, romantic evenings.', 'Made for <i>that night out</i>.',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600',
    null, true),
  ('everyday-edit', 'The Everyday Edit', 'Comfort-first staples.', 'Quiet, <i>everyday</i> ease.',
    'https://images.unsplash.com/photo-1581252584837-9f0b1d3bf82c?w=1600',
    null, true),
  ('festive-edit', 'The Festive Edit', 'Pieces dressed up for celebration.', 'Festive, <i>not fussy</i>.',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1600',
    null, true),
  ('party-edit', 'The Party Edit', 'Heels and charms made to dance.', 'Until the <i>last song</i>.',
    'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=1600',
    null, true),
  ('work-edit', 'The Work Edit', 'Pieces that quietly mean business.', 'Sharp, <i>not sharp-edged</i>.',
    'https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=1600',
    null, true),
  ('sale', 'Hot Deals', 'Limited-time edits at a kinder price.', 'Selected pairs, <i>kinder prices</i>.',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600',
    null, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  hero_headline = excluded.hero_headline,
  hero_image_url = excluded.hero_image_url,
  hero_secondary_image_url = excluded.hero_secondary_image_url,
  is_edit = excluded.is_edit;

-- ============== Products ==============
-- Heels (₹1,499 - ₹1,899)
insert into products (slug, name, category, sub_collection, description, short_description, price, compare_at_price, specs, care_instructions, primary_color, color_label, is_active, is_bestseller, is_new, inventory_count) values
  ('clessia-rose-gold', 'Clessia Rose Gold', 'heel', null,
    'A sculpted 3-inch heel with a soft rose gold finish. Lined in cushioned leatherette for hours of wear. Pairs with every clip-on in the catalog.',
    'Rose Gold · Satin · 3″ Sculpted', 169900, 189900,
    '{"heel_type":"sculpted","toe_style":"pointed","fit":"true to size","height":"3 inches","material":"satin"}'::jsonb,
    'Wipe with a soft dry cloth. Store in dust bag away from direct sunlight.',
    '#C9A87A', 'Rose Gold', true, true, false, 24),
  ('modiva-wine', 'Modiva Wine', 'heel', null,
    'A 2.5-inch block heel in deep burgundy satin. Designed for long days and longer nights.',
    'Burgundy · Satin · 2.5″ Block', 169900, 189900,
    '{"heel_type":"block","toe_style":"almond","fit":"true to size","height":"2.5 inches","material":"satin"}'::jsonb,
    'Wipe with a soft dry cloth. Store in dust bag.',
    '#6B1A2D', 'Wine', true, true, false, 18),
  ('velora-nude', 'Velora Nude', 'heel', null,
    'A 2-inch kitten heel in soft beige suede. The everyday neutral.',
    'Soft Beige · Suede · 2″ Kitten', 149900, null,
    '{"heel_type":"kitten","toe_style":"pointed","fit":"true to size","height":"2 inches","material":"suede"}'::jsonb,
    'Brush suede gently with a soft suede brush. Spot clean.',
    '#D8C3A5', 'Nude', true, false, true, 22),
  ('clessia-noir', 'Clessia Noir', 'heel', null,
    'Black leather, 3-inch slim heel. Classic with the room to dress up or down.',
    'Black · Leather · 3″ Slim', 179900, 199900,
    '{"heel_type":"slim","toe_style":"pointed","fit":"true to size","height":"3 inches","material":"leather"}'::jsonb,
    'Polish leather with a soft cloth. Use leather conditioner monthly.',
    '#2B2521', 'Noir', true, true, false, 30),
  ('liora-blush', 'Liora Blush', 'heel', null,
    'A 1.5-inch kitten heel in dusty blush. Soft enough for daytime, sharp enough for evenings.',
    'Blush · Satin · 1.5″ Kitten', 149900, null,
    '{"heel_type":"kitten","toe_style":"almond","fit":"true to size","height":"1.5 inches","material":"satin"}'::jsonb,
    'Wipe with a soft dry cloth. Store in dust bag.',
    '#E5C9C0', 'Blush', true, false, true, 15),
  ('aria-emerald', 'Aria Emerald', 'heel', null,
    'A 2.5-inch sculpted heel in deep emerald velvet. Made for festive evenings.',
    'Emerald · Velvet · 2.5″ Sculpted', 189900, null,
    '{"heel_type":"sculpted","toe_style":"pointed","fit":"true to size","height":"2.5 inches","material":"velvet"}'::jsonb,
    'Brush velvet against the grain with a soft brush. Avoid moisture.',
    '#13533B', 'Emerald', true, false, true, 12)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  short_description = excluded.short_description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  specs = excluded.specs,
  care_instructions = excluded.care_instructions,
  primary_color = excluded.primary_color,
  color_label = excluded.color_label,
  is_active = excluded.is_active,
  is_bestseller = excluded.is_bestseller,
  is_new = excluded.is_new,
  inventory_count = excluded.inventory_count;

-- Clip-ons (₹379 - ₹699)
insert into products (slug, name, category, sub_collection, description, short_description, price, compare_at_price, specs, care_instructions, primary_color, color_label, is_active, is_bestseller, is_new, inventory_count) values
  ('bloom-pearl', 'Bloom Pearl', 'clip-on', 'bloom-bow',
    'A cluster of freshwater-style pearls on a satin bow. Clips on, snaps off.',
    'Pearl · Bow · Universal Fit', 44900, null,
    '{"fit":"universal","material":"pearl, satin"}'::jsonb,
    'Wipe with a dry cloth. Avoid perfume contact.',
    '#F4ECDE', 'Pearl', true, true, false, 60),
  ('bloom-rose', 'Bloom Rose', 'clip-on', 'bloom-bow',
    'A small fabric rose, hand-stitched, in dusty pink.',
    'Rose · Fabric · Universal Fit', 39900, null,
    '{"fit":"universal","material":"fabric"}'::jsonb,
    'Spot clean only.',
    '#E5C9C0', 'Rose', true, false, true, 45),
  ('rhinestone-classic', 'Rhinestone Classic', 'clip-on', 'rhinestone-charm',
    'A row of clear rhinestones set on an ink base. Day-to-night without effort.',
    'Clear · Rhinestone · Universal Fit', 49900, null,
    '{"fit":"universal","material":"rhinestone, brass"}'::jsonb,
    'Wipe with a soft cloth. Store separately.',
    '#EAE7DD', 'Crystal', true, true, false, 80),
  ('rhinestone-noir', 'Rhinestone Noir', 'clip-on', 'rhinestone-charm',
    'Black rhinestones on a satin base. Quietly dressed up.',
    'Onyx · Rhinestone · Universal Fit', 69900, null,
    '{"fit":"universal","material":"rhinestone, satin"}'::jsonb,
    'Wipe with a soft cloth.',
    '#2B2521', 'Onyx', true, false, false, 35),
  ('bow-ivory', 'Bow Ivory', 'clip-on', 'bloom-bow',
    'A simple satin bow in soft ivory. Quiet by design.',
    'Ivory · Satin · Universal Fit', 37900, null,
    '{"fit":"universal","material":"satin"}'::jsonb,
    'Spot clean.',
    '#F8F0DE', 'Ivory', true, false, false, 50)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  short_description = excluded.short_description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  specs = excluded.specs,
  primary_color = excluded.primary_color,
  color_label = excluded.color_label,
  is_active = excluded.is_active,
  is_bestseller = excluded.is_bestseller,
  is_new = excluded.is_new,
  inventory_count = excluded.inventory_count;

-- ============== Variants (sizes 35-39 for heels only) ==============
-- Clean and reseed deterministically.
delete from product_variants where product_id in (select id from products where category = 'heel');

insert into product_variants (product_id, size, sku, inventory)
select p.id, s.size, upper(replace(p.slug, '-', '')) || '-' || s.size, 5
from products p
cross join (values ('35'), ('36'), ('37'), ('38'), ('39')) as s(size)
where p.category = 'heel';

-- ============== Product images ==============
delete from product_images where product_id in (select id from products);

with imgs(slug, url, alt, ord, type) as (values
  ('clessia-rose-gold','https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200','Clessia Rose Gold — front',0,'hero'::product_image_type),
  ('clessia-rose-gold','https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=1200','Clessia Rose Gold — side',1,'side'::product_image_type),
  ('clessia-rose-gold','https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=1200','Clessia Rose Gold — lifestyle',2,'lifestyle'::product_image_type),
  ('modiva-wine','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200','Modiva Wine — front',0,'hero'::product_image_type),
  ('modiva-wine','https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=1200','Modiva Wine — side',1,'side'::product_image_type),
  ('modiva-wine','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200','Modiva Wine — lifestyle',2,'lifestyle'::product_image_type),
  ('velora-nude','https://images.unsplash.com/photo-1581252584837-9f0b1d3bf82c?w=1200','Velora Nude — front',0,'hero'::product_image_type),
  ('velora-nude','https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=1200','Velora Nude — side',1,'side'::product_image_type),
  ('velora-nude','https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1200','Velora Nude — lifestyle',2,'lifestyle'::product_image_type),
  ('clessia-noir','https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=1200','Clessia Noir — front',0,'hero'::product_image_type),
  ('clessia-noir','https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?w=1200','Clessia Noir — side',1,'side'::product_image_type),
  ('clessia-noir','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200','Clessia Noir — lifestyle',2,'lifestyle'::product_image_type),
  ('liora-blush','https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1200','Liora Blush — front',0,'hero'::product_image_type),
  ('liora-blush','https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=1200','Liora Blush — side',1,'side'::product_image_type),
  ('aria-emerald','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200','Aria Emerald — front',0,'hero'::product_image_type),
  ('aria-emerald','https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=1200','Aria Emerald — side',1,'side'::product_image_type),
  ('bloom-pearl','https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200','Bloom Pearl charm',0,'hero'::product_image_type),
  ('bloom-rose','https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200','Bloom Rose charm',0,'hero'::product_image_type),
  ('rhinestone-classic','https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=1200','Rhinestone Classic charm',0,'hero'::product_image_type),
  ('rhinestone-noir','https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=1200','Rhinestone Noir charm',0,'hero'::product_image_type),
  ('bow-ivory','https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200','Bow Ivory charm',0,'hero'::product_image_type)
)
insert into product_images (product_id, url, alt_text, display_order, type)
select p.id, i.url, i.alt, i.ord, i.type
from imgs i join products p on p.slug = i.slug;

-- ============== Product ↔ Collection mappings ==============
delete from product_collections;

insert into product_collections (product_id, collection_id, display_order)
select p.id, c.id, p.is_bestseller::int * 10 + p.is_new::int * 5
from products p, collections c
where (c.slug = 'heels' and p.category = 'heel')
   or (c.slug = 'clip-ons' and p.category = 'clip-on')
   or (c.slug = 'rhinestone-charm' and p.sub_collection = 'rhinestone-charm')
   or (c.slug = 'bloom-bow' and p.sub_collection = 'bloom-bow');

-- Map a couple of products into edit collections for fun
insert into product_collections (product_id, collection_id, display_order)
select p.id, c.id, 0
from products p, collections c
where (c.slug = 'date-edit' and p.slug in ('modiva-wine','aria-emerald','bloom-pearl'))
   or (c.slug = 'everyday-edit' and p.slug in ('velora-nude','liora-blush','bow-ivory'))
   or (c.slug = 'festive-edit' and p.slug in ('aria-emerald','clessia-rose-gold','rhinestone-classic'))
   or (c.slug = 'party-edit' and p.slug in ('clessia-noir','rhinestone-noir','modiva-wine'))
   or (c.slug = 'work-edit' and p.slug in ('velora-nude','clessia-noir','bow-ivory'))
   or (c.slug = 'sale' and p.compare_at_price is not null);

-- ============== Clip-on compatibility (all heels ↔ all clip-ons) ==============
delete from clip_on_compatibility;
insert into clip_on_compatibility (heel_product_id, clip_on_product_id, composite_image_url)
select h.id, c.id, null
from products h, products c
where h.category = 'heel' and c.category = 'clip-on';

-- ============== Discount codes ==============
insert into discount_codes (code, description, discount_type, discount_value, min_order_value, max_discount, is_active)
values
  ('FIRST10', '10% off your first order', 'percentage', 10, 0, 50000, true),
  ('FREESHIP', 'Free shipping under threshold', 'fixed', 9900, 0, 9900, true)
on conflict (code) do update set
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_order_value = excluded.min_order_value,
  max_discount = excluded.max_discount,
  is_active = excluded.is_active;

-- ============== Quiz matrix ==============
-- Compact: a handful of representative combos. The frontend gracefully falls
-- back to a default pair if a combo is missing.
delete from quiz_matrix;
insert into quiz_matrix (combination_key, product_id, clip_on_id)
select 'day|soft|low|minimal', (select id from products where slug = 'velora-nude'), (select id from products where slug = 'bow-ivory');
insert into quiz_matrix (combination_key, product_id, clip_on_id)
select 'night|bold|tall|playful', (select id from products where slug = 'clessia-noir'), (select id from products where slug = 'rhinestone-noir');
insert into quiz_matrix (combination_key, product_id, clip_on_id)
select 'special|warm|balanced|romantic', (select id from products where slug = 'modiva-wine'), (select id from products where slug = 'bloom-pearl');
insert into quiz_matrix (combination_key, product_id, clip_on_id)
select 'both|all|balanced|classic', (select id from products where slug = 'clessia-rose-gold'), (select id from products where slug = 'rhinestone-classic');
insert into quiz_matrix (combination_key, product_id, clip_on_id)
select 'special|bold|tall|classic', (select id from products where slug = 'aria-emerald'), (select id from products where slug = 'rhinestone-classic');
