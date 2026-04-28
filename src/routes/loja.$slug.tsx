import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShoppingCart, Plus, Minus, X, MessageCircle, Search,
  Image as ImageIcon, Trash2, MapPin, Star, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/loja/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Catálogo — ${params.slug}` },
      { name: "description", content: "Confira os produtos e faça seu pedido." },
    ],
  }),
  component: StorePage,
});

type Store = {
  id: string;
  store_name: string;
  whatsapp: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  address: string | null;
  bio: string | null;
  slug: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  old_price: number | null;
  image_url: string | null;
  images: string[] | null;
  available: boolean;
  category_id: string | null;
  type_pet: string | null;
  pet_stage: string | null;
  pet_size: string | null;
  is_featured: boolean;
};

type Category = { id: string; name: string; icon: string | null };
type Banner = { id: string; image_url: string; position: string; sort_order: number };
type CartItem = { product: Product; qty: number };

function getProductImages(p: Product): string[] {
  if (p.images && p.images.length > 0) return p.images;
  if (p.image_url) return [p.image_url];
  return [];
}

const CUSTOMER_STORAGE_KEY = "catalogopet_customer";

function StorePage() {
  const { slug } = Route.useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [filterPet, setFilterPet] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: s } = await supabase.from("profiles")
        .select("id, store_name, whatsapp, logo_url, primary_color, accent_color, address, bio, slug")
        .eq("slug", slug).maybeSingle();
      if (!s) { setNotFoundError(true); setLoading(false); return; }
      setStore(s as Store);
      const [{ data: prods }, { data: cats }, { data: bs }] = await Promise.all([
        supabase.from("products")
          .select("id, name, description, price, promo_price, old_price, image_url, images, available, category_id, type_pet, pet_stage, pet_size, is_featured")
          .eq("store_id", s.id).eq("available", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, icon").eq("store_id", s.id).order("sort_order"),
        supabase.from("banners").select("*").eq("store_id", s.id).order("sort_order"),
      ]);
      setProducts((prods ?? []) as Product[]);
      setCategories((cats ?? []) as Category[]);
      setBanners((bs ?? []) as Banner[]);
      setLoading(false);
    })();
  }, [slug]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCat !== "all" && p.category_id !== activeCat) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPet && p.type_pet !== filterPet) return false;
      if (filterStage && p.pet_stage !== filterStage) return false;
      if (filterSize && p.pet_size !== filterSize) return false;
      return true;
    });
  }, [products, activeCat, search, filterPet, filterStage, filterSize]);

  const featured = useMemo(() => products.filter((p) => p.is_featured).slice(0, 8), [products]);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex) return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };
  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));

  const total = cart.reduce((sum, i) => sum + (i.product.promo_price ?? i.product.price) * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Carregando catálogo...</p></div>;
  if (notFoundError || !store) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
      <div><h1 className="font-display text-3xl font-bold">Loja não encontrada</h1><p className="mt-2 text-muted-foreground">Verifique o link e tente novamente.</p></div>
    </div>
  );

  const primary = store.primary_color;
  const accent = store.accent_color;
  const bannersTopo = banners.filter((b) => b.position === "topo");
  const bannersMeio = banners.filter((b) => b.position === "meio");
  const bannersFinal = banners.filter((b) => b.position === "final");

  return (
    <div className="min-h-screen bg-secondary/40 pb-32">
      <header className="sticky top-0 z-30 shadow-md" style={{ backgroundColor: primary, color: "white" }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-14 w-14 rounded-full bg-white object-contain p-1 shrink-0" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/20 shrink-0 flex items-center justify-center font-bold text-xl">{store.store_name[0]}</div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold truncate">{store.store_name}</h1>
              {store.bio && <p className="text-xs opacity-90 line-clamp-1">{store.bio}</p>}
              {store.address && (
                <p className="text-[11px] opacity-80 line-clamp-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {store.address}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setCartOpen(true)}
            className="relative inline-flex h-11 items-center gap-2 rounded-full px-4 font-semibold text-sm shadow shrink-0"
            style={{ backgroundColor: accent, color: "white" }}>
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold" style={{ color: accent }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Banners topo (carousel) */}
      {bannersTopo.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <BannerCarousel banners={bannersTopo} />
        </div>
      )}

      {/* Search + Categories + Filtros */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..."
            className="w-full h-12 pl-12 pr-4 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": primary } as any} />
        </div>

        {/* Filtros pet */}
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterSelect value={filterPet} onChange={setFilterPet} placeholder="Pet"
            options={[{ v: "cachorro", l: "🐕 Cachorro" }, { v: "gato", l: "🐈 Gato" }]} />
          <FilterSelect value={filterStage} onChange={setFilterStage} placeholder="Fase"
            options={[{ v: "filhote", l: "Filhote" }, { v: "adulto", l: "Adulto" }, { v: "senior", l: "Sênior" }]} />
          <FilterSelect value={filterSize} onChange={setFilterSize} placeholder="Porte"
            options={[{ v: "pequeno", l: "Pequeno" }, { v: "medio", l: "Médio" }, { v: "grande", l: "Grande" }]} />
          {(filterPet || filterStage || filterSize) && (
            <button onClick={() => { setFilterPet(""); setFilterStage(""); setFilterSize(""); }}
              className="h-9 px-3 rounded-full text-xs font-semibold text-muted-foreground hover:bg-muted">
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")} color={primary}>Todos</CatChip>
          {categories.map((c) => (
            <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} color={primary}>
              {c.icon ? `${c.icon} ` : ""}{c.name}
            </CatChip>
          ))}
        </div>
      </div>

      {/* Mais vendidos */}
      {featured.length > 0 && activeCat === "all" && !search && !filterPet && !filterStage && !filterSize && (
        <section className="mx-auto max-w-5xl px-4 mt-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
            <Star className="h-5 w-5" style={{ color: accent }} fill={accent} /> Mais vendidos
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={`f-${p.id}`} p={p} primary={primary} accent={accent} cart={cart} onAdd={addToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Products grid */}
      <main className="mx-auto max-w-5xl px-4 mt-6">
        <h2 className="font-display text-lg font-bold mb-3">Todos os produtos</h2>
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-10 text-center border border-dashed border-border">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.slice(0, Math.ceil(filtered.length / 2)).map((p) => (
                <ProductCard key={p.id} p={p} primary={primary} accent={accent} cart={cart} onAdd={addToCart} />
              ))}
            </div>

            {/* Banners meio */}
            {bannersMeio.length > 0 && (
              <div className="my-6 grid gap-4 sm:grid-cols-2">
                {bannersMeio.map((b) => (
                  <img key={b.id} src={b.image_url} alt="" className="w-full h-40 object-cover rounded-2xl" />
                ))}
              </div>
            )}

            {filtered.length > 1 && (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-4">
                {filtered.slice(Math.ceil(filtered.length / 2)).map((p) => (
                  <ProductCard key={p.id} p={p} primary={primary} accent={accent} cart={cart} onAdd={addToCart} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Banners final */}
      {bannersFinal.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 mt-8 space-y-4">
          {bannersFinal.map((b) => (
            <img key={b.id} src={b.image_url} alt="" className="w-full h-44 object-cover rounded-2xl" />
          ))}
        </div>
      )}

      {/* Floating cart bar */}
      {cartCount > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-20 z-30 mx-auto max-w-md inline-flex h-14 items-center justify-between rounded-full px-5 text-white font-semibold shadow-2xl"
          style={{ backgroundColor: accent }}>
          <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />{cartCount} {cartCount === 1 ? "item" : "itens"}</span>
          <span>R$ {total.toFixed(2)}</span>
        </button>
      )}

      {/* Floating WhatsApp button */}
      {store.whatsapp && (
        <a href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá, vim pelo catálogo e gostaria de fazer um pedido")}`}
          target="_blank" rel="noreferrer" title="Falar no WhatsApp"
          className="fixed bottom-4 right-4 z-30 h-14 w-14 rounded-full inline-flex items-center justify-center shadow-2xl text-white hover:scale-105 transition"
          style={{ backgroundColor: "#25D366" }}>
          <MessageCircle className="h-7 w-7" fill="white" stroke="#25D366" />
        </a>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-md bg-card flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border" style={{ backgroundColor: primary, color: "white" }}>
              <h3 className="font-display font-bold text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Seu pedido</h3>
              <button onClick={() => setCartOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? <p className="text-center text-muted-foreground mt-10">Seu carrinho está vazio.</p>
                : <ul className="space-y-3">
                    {cart.map((i) => {
                      const price = i.product.promo_price ?? i.product.price;
                      return (
                        <li key={i.product.id} className="flex gap-3 rounded-xl border border-border p-3">
                          <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {i.product.image_url ? <img src={i.product.image_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-1">{i.product.name}</p>
                            <p className="text-xs text-muted-foreground">R$ {price.toFixed(2)} cada</p>
                            <div className="mt-2 flex items-center gap-2">
                              <button onClick={() => updateQty(i.product.id, -1)} className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted"><Minus className="h-3 w-3" /></button>
                              <span className="text-sm font-bold w-6 text-center">{i.qty}</span>
                              <button onClick={() => updateQty(i.product.id, 1)} className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border hover:bg-muted"><Plus className="h-3 w-3" /></button>
                              <button onClick={() => removeItem(i.product.id)} className="ml-auto h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                            </div>
                          </div>
                          <p className="font-bold text-sm" style={{ color: primary }}>R$ {(price * i.qty).toFixed(2)}</p>
                        </li>
                      );
                    })}
                  </ul>}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-border p-5 space-y-3">
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span style={{ color: primary }}>R$ {total.toFixed(2)}</span>
                </div>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full h-12 rounded-full font-semibold text-white inline-flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
                  style={{ backgroundColor: "#25D366" }}>
                  <MessageCircle className="h-5 w-5" /> Finalizar pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout form (modal) */}
      {checkoutOpen && (
        <CheckoutModal
          store={store} cart={cart} total={total}
          onClose={() => setCheckoutOpen(false)}
          onSent={() => { setCheckoutOpen(false); setCart([]); }}
        />
      )}
    </div>
  );
}

/* ===== Componentes auxiliares ===== */

function ProductCard({ p, primary, accent, cart, onAdd }: {
  p: Product; primary: string; accent: string; cart: CartItem[]; onAdd: (p: Product) => void;
}) {
  const finalPrice = p.promo_price ?? p.price;
  const oldPrice = p.promo_price ? p.price : p.old_price;
  const inCart = cart.find((i) => i.product.id === p.id);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm flex flex-col">
      <div className="aspect-square bg-secondary overflow-hidden relative">
        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-muted-foreground" /></div>}
        {p.promo_price && <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>OFERTA</span>}
        {p.is_featured && <span className="absolute top-2 right-2 rounded-full p-1 text-white" style={{ backgroundColor: accent }}><Star className="h-3 w-3" fill="white" /></span>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-semibold text-sm line-clamp-2 text-foreground">{p.name}</p>
        {p.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-display font-bold text-base" style={{ color: primary }}>R$ {finalPrice.toFixed(2)}</span>
          {oldPrice && <span className="text-xs line-through text-muted-foreground">R$ {oldPrice.toFixed(2)}</span>}
        </div>
        <button onClick={() => onAdd(p)}
          className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-full font-semibold text-xs text-white shadow-sm hover:brightness-110 transition"
          style={{ backgroundColor: accent }}>
          <Plus className="h-3.5 w-3.5" />{inCart ? `No carrinho (${inCart.qty})` : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

function CatChip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color: string; children: React.ReactNode; }) {
  return (
    <button onClick={onClick}
      className="shrink-0 inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold border transition"
      style={active
        ? { backgroundColor: color, color: "white", borderColor: color }
        : { backgroundColor: "white", color: "var(--foreground)", borderColor: "var(--border)" }}>
      {children}
    </button>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: { v: string; l: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-full border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">{placeholder}: Todos</option>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);
  if (banners.length === 0) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <img src={banners[idx].image_url} alt="" className="w-full h-44 sm:h-56 object-cover transition-opacity" />
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 inline-flex items-center justify-center shadow">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 inline-flex items-center justify-center shadow">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== Checkout modal ===== */
function CheckoutModal({ store, cart, total, onClose, onSent }: {
  store: Store; cart: CartItem[]; total: number;
  onClose: () => void; onSent: () => void;
}) {
  const stored = useRef<{ full_name?: string; whatsapp?: string; address?: string }>({});
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_STORAGE_KEY) : null;
      if (raw) stored.current = JSON.parse(raw);
    } catch {}
  }, []);

  const [fullName, setFullName] = useState(stored.current.full_name ?? "");
  const [whatsapp, setWhatsapp] = useState(stored.current.whatsapp ?? "");
  const [address, setAddress] = useState(stored.current.address ?? "");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [delivery, setDelivery] = useState<"retirar" | "entrega">("entrega");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsapp.trim() || !address.trim()) {
      toast.error("Preencha nome, WhatsApp e endereço.");
      return;
    }
    setSending(true);
    const items = cart.map((i) => ({
      id: i.product.id, name: i.product.name, qty: i.qty,
      price: i.product.promo_price ?? i.product.price,
    }));

    // Persistir cliente (upsert por whatsapp+store)
    try {
      const { data: existing } = await supabase.from("customers")
        .select("id").eq("store_id", store.id).eq("whatsapp", whatsapp).maybeSingle();
      if (existing) {
        await supabase.from("customers").update({ full_name: fullName, address }).eq("id", existing.id);
      } else {
        await supabase.from("customers").insert({
          store_id: store.id, full_name: fullName, whatsapp, address,
        });
      }
    } catch {}

    // Salvar pedido
    try {
      await supabase.from("orders").insert({
        store_id: store.id, full_name: fullName, whatsapp, address,
        notes: notes || null, coupon: coupon || null, delivery_method: delivery,
        items, total,
      });
    } catch {}

    // Salvar localmente para próxima compra
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({ full_name: fullName, whatsapp, address }));
    } catch {}

    // Enviar WhatsApp
    if (store.whatsapp) {
      const lines = [
        `*Novo pedido — ${store.store_name}*`, "",
        `*Cliente:* ${fullName}`,
        `*WhatsApp:* ${whatsapp}`,
        `*Endereço:* ${address}`,
        `*Recebimento:* ${delivery === "retirar" ? "Retirar na loja" : "Entrega"}`,
        coupon ? `*Cupom:* ${coupon}` : "",
        notes ? `*Observações:* ${notes}` : "",
        "", "*Itens:*",
        ...items.map((i) => `• ${i.qty}x ${i.name} — R$ ${(i.price * i.qty).toFixed(2)}`),
        "", `*Total: R$ ${total.toFixed(2)}*`,
      ].filter(Boolean);
      const msg = encodeURIComponent(lines.join("\n"));
      const phone = store.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
    } else {
      toast.message("Pedido registrado. A loja entrará em contato.");
    }
    setSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-lg font-bold">Finalizar pedido</h3>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome completo *</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">WhatsApp (com DDD) *</label>
            <input required type="tel" placeholder="11999999999" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} maxLength={15}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Endereço *</label>
            <input required value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200}
              placeholder="Rua, número, bairro - Cidade/UF"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Forma de recebimento</label>
            <div className="flex gap-2">
              {(["entrega", "retirar"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setDelivery(d)}
                  className={`flex-1 h-11 rounded-xl border text-sm font-semibold capitalize ${delivery === d ? "border-accent bg-accent/10 text-accent" : "border-border bg-background"}`}>
                  {d === "entrega" ? "Entrega" : "Retirar na loja"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Cupom (opcional)</label>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} maxLength={30}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Observações (opcional)</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300}
              className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm" />
          </div>

          <div className="rounded-xl bg-secondary p-3 text-sm flex justify-between font-semibold">
            <span>Total</span><span>R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-border font-semibold text-sm hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={sending}
              className="flex-1 h-11 rounded-full font-semibold text-sm text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="h-4 w-4" />{sending ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
