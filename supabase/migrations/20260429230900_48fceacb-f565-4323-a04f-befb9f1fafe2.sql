CREATE POLICY "Store owners can update their orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = store_id);

CREATE POLICY "Store owners can delete their orders"
ON public.orders
FOR DELETE
USING (auth.uid() = store_id);