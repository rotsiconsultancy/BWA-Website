-- Beads World Africa: Supabase Storage Configuration for Product Images
-- Execute this script in your Supabase SQL Editor to create the storage bucket
-- and configure Row Level Security (RLS) policies for product image uploads.

-- 1. Create public 'product-images' storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 MB limit per image file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Enable public read access for product images
drop policy if exists "Public product images read access" on storage.objects;
create policy "Public product images read access"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 3. Allow uploading images into the 'product-images' bucket
drop policy if exists "Upload product images policy" on storage.objects;
create policy "Upload product images policy"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- 4. Allow updating images in the 'product-images' bucket
drop policy if exists "Update product images policy" on storage.objects;
create policy "Update product images policy"
  on storage.objects for update
  with check (bucket_id = 'product-images');

-- 5. Allow deleting images from the 'product-images' bucket
drop policy if exists "Delete product images policy" on storage.objects;
create policy "Delete product images policy"
  on storage.objects for delete
  using (bucket_id = 'product-images');
