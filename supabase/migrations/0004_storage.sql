-- CLASSIE storage buckets + policies

insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('composite-previews', 'composite-previews', true),
  ('review-photos', 'review-photos', true),
  ('user-uploads', 'user-uploads', false),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do update set public = excluded.public;

-- ---------- product-images: admin write ----------
drop policy if exists "product-images read" on storage.objects;
create policy "product-images read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product-images admin write" on storage.objects;
create policy "product-images admin write" on storage.objects
  for all using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());

-- ---------- composite-previews ----------
drop policy if exists "composite-previews read" on storage.objects;
create policy "composite-previews read" on storage.objects
  for select using (bucket_id = 'composite-previews');

drop policy if exists "composite-previews admin write" on storage.objects;
create policy "composite-previews admin write" on storage.objects
  for all using (bucket_id = 'composite-previews' and is_admin())
  with check (bucket_id = 'composite-previews' and is_admin());

-- ---------- review-photos: auth users write to their own folder ----------
drop policy if exists "review-photos read" on storage.objects;
create policy "review-photos read" on storage.objects
  for select using (bucket_id = 'review-photos');

drop policy if exists "review-photos owner write" on storage.objects;
create policy "review-photos owner write" on storage.objects
  for insert with check (
    bucket_id = 'review-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "review-photos owner delete" on storage.objects;
create policy "review-photos owner delete" on storage.objects
  for delete using (
    bucket_id = 'review-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );

-- ---------- user-uploads: private, owner read/write ----------
drop policy if exists "user-uploads owner all" on storage.objects;
create policy "user-uploads owner all" on storage.objects
  for all using (
    bucket_id = 'user-uploads'
    and (auth.uid()::text = split_part(name, '/', 1) or is_admin())
  )
  with check (
    bucket_id = 'user-uploads'
    and auth.uid()::text = split_part(name, '/', 1)
  );

-- ---------- brand-assets ----------
drop policy if exists "brand-assets read" on storage.objects;
create policy "brand-assets read" on storage.objects
  for select using (bucket_id = 'brand-assets');

drop policy if exists "brand-assets admin write" on storage.objects;
create policy "brand-assets admin write" on storage.objects
  for all using (bucket_id = 'brand-assets' and is_admin())
  with check (bucket_id = 'brand-assets' and is_admin());
