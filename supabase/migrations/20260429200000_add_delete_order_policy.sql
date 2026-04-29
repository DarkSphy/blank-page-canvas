-- Allow store owners to delete their own orders
create policy "Store owners can delete their orders" on public.orders for delete using (auth.uid() = store_id);

-- Allow store owners to update their own orders (e.g., adding notes or changing status in the future)
create policy "Store owners can update their orders" on public.orders for update using (auth.uid() = store_id);
