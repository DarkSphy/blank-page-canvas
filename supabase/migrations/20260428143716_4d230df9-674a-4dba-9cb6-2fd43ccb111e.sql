-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  store_name text not null default 'Minha Loja',
  whatsapp text,
  slug text unique,
  logo_url text,
  primary_color text not null default '#1E4E8C',
  accent_color text not null default '#F28C28',
  address text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Public can view storefront profiles" on public.profiles;
create policy "Public can view storefront profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Updated-at function
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Slug helper
create extension if not exists unaccent with schema public;
create or replace function public.slugify(input text)
returns text language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(lower(public.unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'))
$$;

-- New user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare base text; candidate text; i int := 0;
begin
  base := public.slugify(coalesce(new.raw_user_meta_data->>'store_name', 'minha-loja'));
  if base is null or base = '' then base := 'loja'; end if;
  candidate := base;
  while exists(select 1 from public.profiles where slug = candidate) loop
    i := i + 1; candidate := base || '-' || i;
  end loop;
  insert into public.profiles (id, store_name, slug)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', 'Minha Loja'), candidate);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Owners can insert their categories" on public.categories for insert with check (auth.uid() = store_id);
create policy "Owners can update their categories" on public.categories for update using (auth.uid() = store_id);
create policy "Owners can delete their categories" on public.categories for delete using (auth.uid() = store_id);
create index if not exists idx_categories_store on public.categories(store_id);
drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.update_updated_at_column();

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  promo_price numeric(10,2),
  old_price numeric,
  image_url text,
  available boolean not null default true,
  sort_order integer not null default 0,
  type_pet text,
  pet_stage text,
  pet_size text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Owners can insert their products" on public.products for insert with check (auth.uid() = store_id);
create policy "Owners can update their products" on public.products for update using (auth.uid() = store_id);
create policy "Owners can delete their products" on public.products for delete using (auth.uid() = store_id);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_products_category on public.products(category_id);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.update_updated_at_column();

-- Banners
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  image_url text not null,
  position text not null default 'topo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.banners enable row level security;
create policy "Banners are viewable by everyone" on public.banners for select using (true);
create policy "Owners can insert their banners" on public.banners for insert with check (auth.uid() = store_id);
create policy "Owners can update their banners" on public.banners for update using (auth.uid() = store_id);
create policy "Owners can delete their banners" on public.banners for delete using (auth.uid() = store_id);
drop trigger if exists update_banners_updated_at on public.banners;
create trigger update_banners_updated_at before update on public.banners
  for each row execute function public.update_updated_at_column();

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  user_id uuid,
  full_name text not null,
  whatsapp text not null,
  address text,
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, whatsapp)
);
alter table public.customers enable row level security;
create policy "Store owners can view their customers" on public.customers for select using (auth.uid() = store_id);
create policy "Customers can view themselves" on public.customers for select using (auth.uid() = user_id);
create policy "Anyone can register as customer" on public.customers for insert with check (true);
create policy "Store owners can update their customers" on public.customers for update using (auth.uid() = store_id);
create policy "Customers can update themselves" on public.customers for update using (auth.uid() = user_id);
drop trigger if exists update_customers_updated_at on public.customers;
create trigger update_customers_updated_at before update on public.customers
  for each row execute function public.update_updated_at_column();

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  customer_id uuid,
  full_name text not null,
  whatsapp text not null,
  address text,
  notes text,
  coupon text,
  delivery_method text,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Store owners can view their orders" on public.orders for select using (auth.uid() = store_id);
create policy "Anyone can create orders" on public.orders for insert with check (true);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('store-logos', 'store-logos', true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('store-banners', 'store-banners', true) on conflict (id) do update set public = true;

drop policy if exists "Logos are publicly readable" on storage.objects;
create policy "Logos are publicly readable" on storage.objects for select using (bucket_id = 'store-logos');
drop policy if exists "Owners upload their logo" on storage.objects;
create policy "Owners upload their logo" on storage.objects for insert with check (bucket_id = 'store-logos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners update their logo" on storage.objects;
create policy "Owners update their logo" on storage.objects for update using (bucket_id = 'store-logos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners delete their logo" on storage.objects;
create policy "Owners delete their logo" on storage.objects for delete using (bucket_id = 'store-logos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "Owners upload their product images" on storage.objects;
create policy "Owners upload their product images" on storage.objects for insert with check (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners update their product images" on storage.objects;
create policy "Owners update their product images" on storage.objects for update using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners delete their product images" on storage.objects;
create policy "Owners delete their product images" on storage.objects for delete using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Banner images are publicly accessible" on storage.objects;
create policy "Banner images are publicly accessible" on storage.objects for select using (bucket_id = 'store-banners');
drop policy if exists "Owners can upload banner images" on storage.objects;
create policy "Owners can upload banner images" on storage.objects for insert with check (bucket_id = 'store-banners' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners can update their banner images" on storage.objects;
create policy "Owners can update their banner images" on storage.objects for update using (bucket_id = 'store-banners' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Owners can delete their banner images" on storage.objects;
create policy "Owners can delete their banner images" on storage.objects for delete using (bucket_id = 'store-banners' and auth.uid()::text = (storage.foldername(name))[1]);