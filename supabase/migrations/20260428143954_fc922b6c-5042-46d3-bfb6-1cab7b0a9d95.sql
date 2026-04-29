-- Adicionar coluna de múltiplas imagens (até 5)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

-- Backfill: trazer image_url existente para o array images
UPDATE public.products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Constraint: máximo 5 imagens
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_images_max_5;
ALTER TABLE public.products
  ADD CONSTRAINT products_images_max_5
  CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 5);

-- Trigger: manter image_url sincronizado com a primeira imagem do array
CREATE OR REPLACE FUNCTION public.sync_product_main_image()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.images IS NOT NULL AND array_length(NEW.images, 1) >= 1 THEN
    NEW.image_url := NEW.images[1];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_sync_main_image ON public.products;
CREATE TRIGGER trg_products_sync_main_image
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_main_image();