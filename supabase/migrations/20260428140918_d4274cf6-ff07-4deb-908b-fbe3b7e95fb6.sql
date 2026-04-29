
-- 1. Profiles: address e bio
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS bio text;

-- 2. Products: filtros, destaque, preço antigo
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type_pet text,
  ADD COLUMN IF NOT EXISTS pet_stage text,
  ADD COLUMN IF NOT EXISTS pet_size text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS old_price numeric;

-- 3. Categories: ícone visual
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS icon text;

-- 4. Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  image_url text NOT NULL,
  position text NOT NULL DEFAULT 'topo',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners are viewable by everyone"
  ON public.banners FOR SELECT USING (true);
CREATE POLICY "Owners can insert their banners"
  ON public.banners FOR INSERT WITH CHECK (auth.uid() = store_id);
CREATE POLICY "Owners can update their banners"
  ON public.banners FOR UPDATE USING (auth.uid() = store_id);
CREATE POLICY "Owners can delete their banners"
  ON public.banners FOR DELETE USING (auth.uid() = store_id);

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-banners', 'store-banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Banner images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'store-banners');
CREATE POLICY "Owners can upload banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners can update their banner images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners can delete their banner images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Customers (clientes finais por loja)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  user_id uuid,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  address text,
  tag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, whatsapp)
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their customers"
  ON public.customers FOR SELECT USING (auth.uid() = store_id);
CREATE POLICY "Customers can view themselves"
  ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can register as customer"
  ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owners can update their customers"
  ON public.customers FOR UPDATE USING (auth.uid() = store_id);
CREATE POLICY "Customers can update themselves"
  ON public.customers FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Orders (pedidos)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  customer_id uuid,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  address text,
  notes text,
  coupon text,
  delivery_method text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their orders"
  ON public.orders FOR SELECT USING (auth.uid() = store_id);
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT WITH CHECK (true);
