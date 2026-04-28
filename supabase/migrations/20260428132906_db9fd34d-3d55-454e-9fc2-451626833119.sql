-- Extensions first
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- Personalization columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#1E4E8C',
  ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#F28C28';

-- Slug helper
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(public.unaccent(coalesce(input, ''))),
    '[^a-z0-9]+', '-', 'g'
  ))
$$;

-- Backfill slugs
UPDATE public.profiles
SET slug = COALESCE(NULLIF(slug, ''), public.slugify(store_name) || '-' || substr(id::text, 1, 6))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_unique ON public.profiles(slug);

-- Public read of profiles
DROP POLICY IF EXISTS "Public can view storefront profiles" ON public.profiles;
CREATE POLICY "Public can view storefront profiles"
ON public.profiles FOR SELECT USING (true);

-- handle_new_user generates a unique slug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  base := public.slugify(coalesce(new.raw_user_meta_data->>'store_name', 'minha-loja'));
  if base is null or base = '' then base := 'loja'; end if;
  candidate := base;
  while exists(select 1 from public.profiles where slug = candidate) loop
    i := i + 1;
    candidate := base || '-' || i;
  end loop;

  insert into public.profiles (id, store_name, slug)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', 'Minha Loja'), candidate);
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- Storage policies (idempotent)
DROP POLICY IF EXISTS "Logos are publicly readable" ON storage.objects;
CREATE POLICY "Logos are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'store-logos');

DROP POLICY IF EXISTS "Owners upload their logo" ON storage.objects;
CREATE POLICY "Owners upload their logo" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners update their logo" ON storage.objects;
CREATE POLICY "Owners update their logo" ON storage.objects FOR UPDATE
USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners delete their logo" ON storage.objects;
CREATE POLICY "Owners delete their logo" ON storage.objects FOR DELETE
USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
CREATE POLICY "Product images are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Owners upload their product images" ON storage.objects;
CREATE POLICY "Owners upload their product images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners update their product images" ON storage.objects;
CREATE POLICY "Owners update their product images" ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners delete their product images" ON storage.objects;
CREATE POLICY "Owners delete their product images" ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);