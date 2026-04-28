import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogOut, Store, Package, Tag, Copy, ExternalLink, Upload, Plus, Trash2,
  Pencil, X, Image as ImageIcon, Users, Layout, MessageCircle, Star,
} from "lucide-react";
import logo from "@/assets/logo-catalogopet.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Catálogo Pet" },
      { name: "description", content: "Gerencie sua loja, produtos e pedidos no painel do Catálogo Pet." },
    ],
  }),
  component: Dashboard,
});

type Profile = {
  id: string;
  store_name: string;
  whatsapp: string | null;
  slug: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  address: string | null;
  bio: string | null;
};

type Category = { id: string; name: string; sort_order: number; icon: string | null; image_url: string | null };

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
  sort_order: number;
  type_pet: string | null;
  pet_stage: string | null;
  pet_size: string | null;
  is_featured: boolean;
};

const MAX_PRODUCT_IMAGES = 5;

type Banner = {
  id: string;
  image_url: string;
  position: string;
  sort_order: number;
};

type Customer = {
  id: string;
  full_name: string;
  whatsapp: string;
  address: string | null;
  tag: string | null;
  created_at: string;
};

type Order = {
  id: string;
  full_name: string;
  whatsapp: string;
  address: string | null;
  notes: string | null;
  items: any;
  total: number;
  created_at: string;
};

type TabKey = "loja" | "categorias" | "produtos" | "banners" | "clientes";

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("loja");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, store_name, whatsapp, slug, logo_url, primary_color, accent_color, address, bio")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-soft)]">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Catálogo Pet" className="h-12 w-auto" />
          </Link>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Olá, {profile?.store_name || "lojista"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Gerencie sua loja, produtos e clientes.</p>
        </div>

        <div className="mb-6 flex gap-2 rounded-2xl bg-secondary p-1 overflow-x-auto">
          <TabBtn active={tab === "loja"} onClick={() => setTab("loja")} icon={Store} label="Loja" />
          <TabBtn active={tab === "categorias"} onClick={() => setTab("categorias")} icon={Tag} label="Categorias" />
          <TabBtn active={tab === "produtos"} onClick={() => setTab("produtos")} icon={Package} label="Produtos" />
          <TabBtn active={tab === "banners"} onClick={() => setTab("banners")} icon={Layout} label="Banners" />
          <TabBtn active={tab === "clientes"} onClick={() => setTab("clientes")} icon={Users} label="Clientes" />
        </div>

        {tab === "loja" && profile && <StoreTab profile={profile} onUpdate={setProfile} />}
        {tab === "categorias" && <CategoriesTab userId={user.id} />}
        {tab === "produtos" && <ProductsTab userId={user.id} />}
        {tab === "banners" && <BannersTab userId={user.id} />}
        {tab === "clientes" && <CustomersTab userId={user.id} />}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

/* ==================== LOJA TAB ==================== */
function StoreTab({ profile, onUpdate }: { profile: Profile; onUpdate: (p: Profile) => void }) {
  const [storeName, setStoreName] = useState(profile.store_name);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [primary, setPrimary] = useState(profile.primary_color);
  const [accent, setAccent] = useState(profile.accent_color);
  const [logoUrl, setLogoUrl] = useState(profile.logo_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const catalogUrl = useMemo(() => {
    if (typeof window === "undefined" || !profile.slug) return "";
    return `${window.location.origin}/loja/${profile.slug}`;
  }, [profile.slug]);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      toast.success("Logo carregada!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        store_name: storeName, whatsapp, address: address || null, bio: bio || null,
        primary_color: primary, accent_color: accent, logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select("id, store_name, whatsapp, slug, logo_url, primary_color, accent_color, address, bio")
      .maybeSingle();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Loja atualizada!");
    if (data) onUpdate(data as Profile);
  };

  const copyLink = async () => {
    if (!catalogUrl) return;
    await navigator.clipboard.writeText(catalogUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold">Link do seu catálogo</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input readOnly value={catalogUrl} className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            <button onClick={copyLink} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground hover:brightness-105">
              <Copy className="h-4 w-4" /> Copiar
            </button>
            {profile.slug && (
              <a href={`/loja/${profile.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
                <ExternalLink className="h-4 w-4" /> Abrir
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Dados da loja</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome da loja</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} maxLength={80}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Descrição curta (bio)</label>
              <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200}
                placeholder="Ex.: Tudo para o seu pet com entrega no mesmo dia."
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Endereço</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200}
                placeholder="Rua, número, bairro - Cidade/UF"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">WhatsApp (com DDD, só números)</label>
              <input type="tel" placeholder="11999999999" value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} maxLength={15}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Logo da loja</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-secondary flex items-center justify-center overflow-hidden">
                  {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" /> : <ImageIcon className="h-7 w-7 text-muted-foreground" />}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">
                    <Upload className="h-4 w-4" /> {uploading ? "Enviando..." : "Enviar logo"}
                  </button>
                  {logoUrl && <button type="button" onClick={() => setLogoUrl(null)} className="text-xs text-destructive hover:underline text-left">Remover</button>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cor primária</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-11 w-14 rounded-xl border border-input cursor-pointer" />
                  <input type="text" value={primary} onChange={(e) => setPrimary(e.target.value)} className="flex-1 h-11 rounded-xl border border-input bg-background px-3 text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cor de destaque</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-11 w-14 rounded-xl border border-input cursor-pointer" />
                  <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="flex-1 h-11 rounded-xl border border-input bg-background px-3 text-sm font-mono" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)] hover:brightness-105 disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] h-fit">
        <h3 className="font-display text-base font-bold mb-3">Pré-visualização</h3>
        <div className="rounded-2xl overflow-hidden border border-border">
          <div className="p-4 flex items-center gap-3" style={{ backgroundColor: primary, color: "white" }}>
            {logoUrl ? <img src={logoUrl} alt="" className="h-12 w-12 rounded-full bg-white object-contain p-1" /> : <div className="h-12 w-12 rounded-full bg-white/20" />}
            <div className="min-w-0">
              <p className="font-display font-bold truncate">{storeName || "Sua loja"}</p>
              {bio && <p className="text-xs opacity-90 line-clamp-1">{bio}</p>}
              {address && <p className="text-[10px] opacity-80 line-clamp-1">{address}</p>}
            </div>
          </div>
          <div className="p-4 bg-background">
            <button className="w-full h-10 rounded-full font-semibold text-sm text-white" style={{ backgroundColor: accent }} type="button">
              Botão de destaque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== CATEGORIAS TAB ==================== */
const CATEGORY_ICONS = ["🥣", "🦴", "🎾", "💊", "🛁", "🐕", "🐈", "🪥"];

function CategoriesTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("🥣");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState<string>("🥣");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("id, name, sort_order, icon")
      .eq("store_id", userId).order("sort_order").order("name");
    setItems((data ?? []) as Category[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: name.trim(), icon, store_id: userId, sort_order: items.length });
    if (error) return toast.error(error.message);
    setName(""); toast.success("Categoria adicionada"); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida"); load();
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("categories").update({ name: editingName.trim(), icon: editingIcon }).eq("id", id);
    if (error) return toast.error(error.message);
    setEditingId(null); load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] h-fit">
        <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-accent" /> Nova categoria
        </h3>
        <form onSubmit={add} className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
            placeholder="Ex.: Ração, Petisco, Acessório"
            className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          <div>
            <label className="block text-xs font-medium mb-2 text-muted-foreground">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((em) => (
                <button key={em} type="button" onClick={() => setIcon(em)}
                  className={`h-10 w-10 rounded-xl border text-lg ${icon === em ? "border-accent bg-accent/10" : "border-border bg-background"}`}>{em}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full h-11 rounded-full bg-accent text-sm font-semibold text-accent-foreground hover:brightness-105">Adicionar</button>
        </form>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-bold mb-4">Suas categorias</h3>
        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
          : items.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma categoria ainda.</p>
          : <ul className="divide-y divide-border">
              {items.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3 gap-3">
                  {editingId === c.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <select value={editingIcon} onChange={(e) => setEditingIcon(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-lg">
                          {CATEGORY_ICONS.map((em) => <option key={em} value={em}>{em}</option>)}
                        </select>
                        <input autoFocus value={editingName} onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm" />
                      </div>
                      <button onClick={() => saveEdit(c.id)} className="text-sm font-semibold text-accent hover:underline">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:underline">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">{c.icon || "🐾"}</span>{c.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(c.id); setEditingName(c.name); setEditingIcon(c.icon || "🥣"); }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => remove(c.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}

/* ==================== PRODUTOS TAB ==================== */
function ProductsTab({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("store_id", userId).order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, sort_order, icon").eq("store_id", userId).order("name"),
    ]);
    setProducts((prods ?? []) as Product[]);
    setCategories((cats ?? []) as Category[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const remove = async (p: Product) => {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Produto removido"); load();
  };

  const toggleFeatured = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_featured: !p.is_featured }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold">Seus produtos</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)]">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
        : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-card/50">
            <Package className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 font-display font-bold">Nenhum produto ainda</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
                <div className="aspect-square bg-secondary overflow-hidden relative">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-muted-foreground" /></div>}
                  <button onClick={() => toggleFeatured(p)} title={p.is_featured ? "Remover dos mais vendidos" : "Marcar como mais vendido"}
                    className={`absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-full ${p.is_featured ? "bg-accent text-white" : "bg-white/90 text-muted-foreground"}`}>
                    <Star className="h-4 w-4" fill={p.is_featured ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    {p.promo_price ? (
                      <>
                        <span className="font-bold text-accent">R$ {p.promo_price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through">R$ {p.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-foreground">R$ {p.price.toFixed(2)}</span>
                        {p.old_price && <span className="text-xs text-muted-foreground line-through">R$ {p.old_price.toFixed(2)}</span>}
                      </>
                    )}
                  </div>
                  {!p.available && <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Indisponível</span>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { setEditing(p); setShowForm(true); }}
                      className="flex-1 h-9 rounded-full border border-border text-sm font-semibold hover:bg-muted inline-flex items-center justify-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button onClick={() => remove(p)} className="h-9 w-9 rounded-full hover:bg-destructive/10 inline-flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {showForm && (
        <ProductForm userId={userId} categories={categories} product={editing}
          onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function ProductForm({
  userId, categories, product, onClose, onSaved,
}: { userId: string; categories: Category[]; product: Product | null; onClose: () => void; onSaved: () => void; }) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [promoPrice, setPromoPrice] = useState(product?.promo_price?.toString() ?? "");
  const [oldPrice, setOldPrice] = useState(product?.old_price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [typePet, setTypePet] = useState(product?.type_pet ?? "");
  const [petStage, setPetStage] = useState(product?.pet_stage ?? "");
  const [petSize, setPetSize] = useState(product?.pet_size ?? "");
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : product?.image_url ? [product.image_url] : []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    const remaining = MAX_PRODUCT_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Limite de ${MAX_PRODUCT_IMAGES} imagens atingido`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600" });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
      if (toUpload.length < files.length) {
        toast.warning(`Apenas ${toUpload.length} imagem(ns) adicionada(s). Limite de ${MAX_PRODUCT_IMAGES}.`);
      }
    } catch (e: any) {
      toast.error(e.message || "Erro no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const setAsMain = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      return [picked, ...next];
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(), description: description || null,
      price: parseFloat(price) || 0,
      promo_price: promoPrice ? parseFloat(promoPrice) : null,
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      category_id: categoryId || null,
      available, is_featured: isFeatured,
      type_pet: typePet || null, pet_stage: petStage || null, pet_size: petSize || null,
      image_url: images[0] ?? null,
      images,
      store_id: userId,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(product ? "Produto atualizado" : "Produto criado");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-lg font-bold">{product ? "Editar produto" : "Novo produto"}</h3>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Fotos do produto</label>
              <span className="text-xs text-muted-foreground">{images.length}/{MAX_PRODUCT_IMAGES}</span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {images.map((url, idx) => (
                  <div key={url + idx} className="relative group">
                    <div className={`aspect-square rounded-xl overflow-hidden bg-white border-2 ${idx === 0 ? "border-accent" : "border-border"}`}>
                      <img src={url} alt="" className="w-full h-full object-contain" />
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                        Principal
                      </span>
                    )}
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-destructive text-white inline-flex items-center justify-center shadow hover:scale-110 transition">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                        className="h-6 w-6 inline-flex items-center justify-center rounded-md border border-border bg-background text-xs disabled:opacity-30 hover:bg-muted" title="Mover para esquerda">
                        ←
                      </button>
                      {idx !== 0 ? (
                        <button type="button" onClick={() => setAsMain(idx)}
                          className="text-[10px] font-semibold text-accent hover:underline truncate" title="Definir como principal">
                          Principal
                        </button>
                      ) : <span className="text-[10px] text-muted-foreground">★</span>}
                      <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                        className="h-6 w-6 inline-flex items-center justify-center rounded-md border border-border bg-background text-xs disabled:opacity-30 hover:bg-muted" title="Mover para direita">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => e.target.files && e.target.files.length > 0 && handleUpload(e.target.files)} />
            <button type="button" onClick={() => fileRef.current?.click()}
              disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-border bg-card px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : images.length === 0 ? "Adicionar fotos" : `Adicionar mais (${MAX_PRODUCT_IMAGES - images.length} restantes)`}
            </button>
            <p className="mt-1 text-[11px] text-muted-foreground">A primeira imagem será exibida como principal. Use as setas para reordenar.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Nome</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição</label>
            <textarea rows={3} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} maxLength={500}
              className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Preço (R$)</label>
              <input required type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Promoção</label>
              <input type="number" step="0.01" min="0" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="Opcional"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preço antigo</label>
              <input type="number" step="0.01" min="0" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="Opcional"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Categoria</label>
            <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm">
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tipo de pet</label>
              <select value={typePet} onChange={(e) => setTypePet(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Todos</option>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Fase</label>
              <select value={petStage} onChange={(e) => setPetStage(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Todas</option>
                <option value="filhote">Filhote</option>
                <option value="adulto">Adulto</option>
                <option value="senior">Sênior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Porte</label>
              <select value={petSize} onChange={(e) => setPetSize(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Todos</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4" />
              Disponível
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
              Mais vendido
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-border font-semibold text-sm hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 h-11 rounded-full bg-accent text-sm font-semibold text-accent-foreground hover:brightness-105 disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== BANNERS TAB ==================== */
function BannersTab({ userId }: { userId: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<"topo" | "meio" | "final">("topo");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").eq("store_id", userId).order("sort_order");
    setBanners((data ?? []) as Banner[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const upload = async (file: File) => {
    if (banners.length >= 3) {
      toast.error("Limite de 3 banners atingido");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/banner-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-banners").upload(path, file, { cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("store-banners").getPublicUrl(path);
      const { error } = await supabase.from("banners").insert({
        store_id: userId, image_url: data.publicUrl, position, sort_order: banners.length,
      });
      if (error) throw error;
      toast.success("Banner adicionado!");
      load();
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar banner");
    } finally { setUploading(false); }
  };

  const remove = async (b: Banner) => {
    if (!confirm("Excluir este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Removido"); load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <Layout className="h-5 w-5 text-accent" /> Adicionar banner
          <span className="ml-auto text-xs font-normal text-muted-foreground">{banners.length}/3</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Posição</label>
            <div className="flex gap-2">
              {(["topo", "meio", "final"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPosition(p)}
                  className={`flex-1 h-10 rounded-xl border text-sm font-semibold capitalize ${position === p ? "border-accent bg-accent/10 text-accent" : "border-border bg-background"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || banners.length >= 3}
            className="w-full h-11 rounded-full bg-accent text-sm font-semibold text-accent-foreground hover:brightness-105 disabled:opacity-60 inline-flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" /> {uploading ? "Enviando..." : "Enviar banner"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold mb-3">Seus banners</h3>
        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
          : banners.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum banner ainda.</p>
          : <div className="grid gap-4 sm:grid-cols-2">
              {banners.map((b) => (
                <div key={b.id} className="rounded-2xl overflow-hidden border border-border bg-card">
                  <img src={b.image_url} alt="" className="w-full h-40 object-cover" />
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Posição: {b.position}</span>
                    <button onClick={() => remove(b)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}

/* ==================== CLIENTES TAB ==================== */
function CustomersTab({ userId }: { userId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: cs }, { data: os }] = await Promise.all([
      supabase.from("customers").select("*").eq("store_id", userId).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("store_id", userId).order("created_at", { ascending: false }),
    ]);
    setCustomers((cs ?? []) as Customer[]);
    setOrders((os ?? []) as Order[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const lastOrderProduct = (whatsapp: string): string | null => {
    const o = orders.find((o) => o.whatsapp === whatsapp);
    if (!o || !Array.isArray(o.items) || o.items.length === 0) return null;
    return o.items[0]?.name ?? null;
  };

  const copyReactivation = async (c: Customer) => {
    const product = lastOrderProduct(c.whatsapp) ?? "nossos produtos";
    const msg = `Oi ${c.full_name.split(" ")[0]}, vi que você se interessou por ${product}, quer pedir novamente?`;
    await navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada!");
  };

  const openWhatsApp = (c: Customer) => {
    const product = lastOrderProduct(c.whatsapp) ?? "nossos produtos";
    const msg = encodeURIComponent(`Oi ${c.full_name.split(" ")[0]}, vi que você se interessou por ${product}, quer pedir novamente?`);
    const phone = c.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const saveTag = async (id: string) => {
    const { error } = await supabase.from("customers").update({ tag: editingTag || null }).eq("id", id);
    if (error) return toast.error(error.message);
    setEditingTagId(null); load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Seus clientes
          <span className="ml-auto text-sm font-normal text-muted-foreground">{customers.length} total</span>
        </h3>

        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
          : customers.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente ainda. Pedidos feitos no catálogo aparecem aqui.</p>
          : <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="py-2 px-2">Nome</th>
                    <th className="py-2 px-2">WhatsApp</th>
                    <th className="py-2 px-2 hidden md:table-cell">Endereço</th>
                    <th className="py-2 px-2">Etiqueta</th>
                    <th className="py-2 px-2 hidden md:table-cell">Último produto</th>
                    <th className="py-2 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-medium">{c.full_name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{c.whatsapp}</td>
                      <td className="py-3 px-2 hidden md:table-cell text-muted-foreground line-clamp-1 max-w-xs">{c.address || "-"}</td>
                      <td className="py-3 px-2">
                        {editingTagId === c.id ? (
                          <div className="flex items-center gap-1">
                            <input value={editingTag} onChange={(e) => setEditingTag(e.target.value)} maxLength={30}
                              className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs" />
                            <button onClick={() => saveTag(c.id)} className="text-xs font-semibold text-accent">OK</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingTagId(c.id); setEditingTag(c.tag ?? ""); }}
                            className={`text-xs px-2 py-1 rounded-full border ${c.tag ? "bg-accent/10 border-accent text-accent" : "border-dashed border-border text-muted-foreground"}`}>
                            {c.tag || "+ tag"}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-muted-foreground line-clamp-1 max-w-xs">{lastOrderProduct(c.whatsapp) || "-"}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => copyReactivation(c)} title="Copiar mensagem"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-muted">
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button onClick={() => openWhatsApp(c)} title="Abrir WhatsApp"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-[#25D366]/10">
                            <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-lg font-bold mb-4">Histórico de pedidos</h3>
        {orders.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          : <ul className="divide-y divide-border">
              {orders.slice(0, 20).map((o) => (
                <li key={o.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{o.full_name} <span className="text-xs font-normal text-muted-foreground">— {o.whatsapp}</span></p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {Array.isArray(o.items) ? o.items.map((i: any) => `${i.qty}x ${i.name}`).join(", ") : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <span className="font-bold text-sm shrink-0">R$ {Number(o.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}
