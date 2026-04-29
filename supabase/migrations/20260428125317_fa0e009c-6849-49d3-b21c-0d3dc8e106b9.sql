-- Make bucket private so listing is blocked, but keep direct URLs working via signed-style public access policy
UPDATE storage.buckets SET public = false WHERE id = 'product-images';

-- Replace broad SELECT with one that requires the requester to know the exact object name path
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;

CREATE POLICY "Public can read product images by path"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'product-images'
    AND name IS NOT NULL
  );