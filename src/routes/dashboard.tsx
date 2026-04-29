import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogOut, Store, Package, Tag, Copy, ExternalLink, Upload, Plus, Trash2,
  Pencil, X, Image as ImageIcon, Users, Layout, MessageCircle, Star,
  BarChart3, Calendar, TrendingUp, PieChart as PieChartIcon,
  ShoppingCart, Search,
} from "lucide-react";
import logo from "@/assets/logo-catalogopet.png";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

type TabKey = "visao_geral" | "loja" | "categorias" | "produtos" | "banners" | "clientes" | "pedidos";

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("visao_geral");
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
          <TabBtn active={tab === "visao_geral"} onClick={() => setTab("visao_geral")} icon={BarChart3} label="Visão Geral" />
          <TabBtn active={tab === "loja"} onClick={() => setTab("loja")} icon={Store} label="Loja" />
          <TabBtn active={tab === "categorias"} onClick={() => setTab("categorias")} icon={Tag} label="Categorias" />
          <TabBtn active={tab === "produtos"} onClick={() => setTab("produtos")} icon={Package} label="Produtos" />
          <TabBtn active={tab === "banners"} onClick={() => setTab("banners")} icon={Layout} label="Banners" />
          <TabBtn active={tab === "clientes"} onClick={() => setTab("clientes")} icon={Users} label="Clientes" />
          <TabBtn active={tab === "pedidos"} onClick={() => setTab("pedidos")} icon={ShoppingCart} label="Pedidos" />
        </div>

        {tab === "visao_geral" && profile && <OverviewTab userId={user.id} profile={profile} />}
        {tab === "loja" && profile && <StoreTab profile={profile} onUpdate={setProfile} />}
        {tab === "categorias" && <CategoriesTab userId={user.id} />}
        {tab === "produtos" && <ProductsTab userId={user.id} />}
        {tab === "banners" && <BannersTab userId={user.id} />}
        {tab === "clientes" && <CustomersTab userId={user.id} />}
        {tab === "pedidos" && <OrdersTab userId={user.id} />}
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

/* ==================== OVERVIEW TAB ==================== */
function OverviewTab({ userId, profile }: { userId: string, profile: Profile }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - days);
      const minDateStr = minDate.toISOString();

      const [{ data: os }, { data: cs }, { data: cats }, { data: prods }] = await Promise.all([
        supabase.from("orders").select("*").eq("store_id", userId).gte("created_at", minDateStr).order("created_at", { ascending: true }),
        supabase.from("customers").select("*").eq("store_id", userId).gte("created_at", minDateStr),
        supabase.from("categories").select("*").eq("store_id", userId),
        supabase.from("products").select("id, category_id").eq("store_id", userId),
      ]);
      setOrders((os ?? []) as Order[]);
      setCustomers((cs ?? []) as Customer[]);
      setCategories((cats ?? []) as Category[]);
      setProducts((prods ?? []) as Product[]);
      setLoading(false);
    })();
  }, [userId, days]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let newCustomers = customers.length;
    
    // Group orders by date
    const ordersByDate: Record<string, number> = {};
    const revenueByDate: Record<string, number> = {};
    
    // Maps
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const prodToCat = Object.fromEntries(products.map(p => [p.id, p.category_id]));

    // Group by Category
    const qtyByCategory: Record<string, number> = {};
    const revenueByCategory: Record<string, number> = {};

    orders.forEach(o => {
      totalRevenue += Number(o.total);
      
      const dateStr = new Date(o.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
      ordersByDate[dateStr] = (ordersByDate[dateStr] || 0) + 1;
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + Number(o.total);

      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const catId = prodToCat[item.id];
          const catName = catId && catMap[catId] ? catMap[catId] : "Diversos";
          
          qtyByCategory[catName] = (qtyByCategory[catName] || 0) + (item.qty || 1);
          revenueByCategory[catName] = (revenueByCategory[catName] || 0) + ((item.price || 0) * (item.qty || 1));
        });
      }
    });

    const timelineData = Object.keys(ordersByDate).map(date => ({
      date,
      pedidos: ordersByDate[date],
      faturamento: revenueByDate[date],
    }));

    const pieQtyData = Object.keys(qtyByCategory).map(name => ({
      name,
      value: qtyByCategory[name]
    })).sort((a,b) => b.value - a.value);

    const pieRevData = Object.keys(revenueByCategory).map(name => ({
      name,
      value: revenueByCategory[name]
    })).sort((a,b) => b.value - a.value);

    return { totalRevenue, totalOrders, newCustomers, timelineData, pieQtyData, pieRevData };
  }, [orders, customers, categories, products]);

  const COLORS = [profile.primary_color, profile.accent_color, '#FFBB28', '#FF8042', '#00C49F', '#0088FE', '#8884d8'];

  if (loading && orders.length === 0) {
    return <div className="text-sm text-muted-foreground py-10 text-center">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" /> Visão Geral
        </h2>
        <div className="flex items-center gap-1 bg-card rounded-xl p-1 border border-border shadow-sm">
          {[7, 15, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${days === d ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}>
              {d} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-muted-foreground mb-1">Faturamento Bruto</p>
          <h3 className="text-3xl font-extrabold text-primary flex items-end gap-2">
            <span className="text-xl text-muted-foreground font-semibold">R$</span>
            {stats.totalRevenue.toFixed(2)}
          </h3>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total de Pedidos</p>
          <h3 className="text-3xl font-extrabold text-primary">{stats.totalOrders}</h3>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-muted-foreground mb-1">Novos Clientes</p>
          <h3 className="text-3xl font-extrabold text-primary">{stats.newCustomers}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-display font-bold text-base mb-6">Pedidos por dia</h3>
          {stats.timelineData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Sem dados no período.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="pedidos" name="Pedidos" stroke={profile.accent_color} strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-display font-bold text-base mb-6">Faturamento por Categoria (R$)</h3>
          {stats.pieRevData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Sem dados no período.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.pieRevData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="opacity-10" />
                  <XAxis type="number" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" name="Faturamento" radius={[0, 4, 4, 0]}>
                    {stats.pieRevData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <h3 className="font-display font-bold text-base mb-6">Itens Vendidos por Categoria</h3>
          {stats.pieQtyData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">Sem dados no período.</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieQtyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {stats.pieQtyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="max-w-3xl">
      <div className="space-y-6">
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
    </div>
  );
}

/* ==================== CATEGORIAS TAB ==================== */
function CategoriesTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState<string>("");
  const [editingImage, setEditingImage] = useState<string>("");
  const [editingUploading, setEditingUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("id, name, sort_order, icon, image_url")
      .eq("store_id", userId).order("sort_order").order("name");
    setItems((data ?? []) as Category[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const uploadImage = async (file: File, setUrl: (u: string) => void, setBusy: (b: boolean) => void) => {
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    if (file.size > 2 * 1024 * 1024) return toast.error("Imagem deve ter até 2MB");
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/categories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setUrl(data.publicUrl);
    setBusy(false);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      icon: icon.trim() || null,
      image_url: imageUrl || null,
      store_id: userId,
      sort_order: items.length,
    });
    if (error) return toast.error(error.message);
    setName(""); setIcon(""); setImageUrl("");
    toast.success("Categoria adicionada"); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida"); load();
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("categories").update({
      name: editingName.trim(),
      icon: editingIcon.trim() || null,
      image_url: editingImage || null,
    }).eq("id", id);
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
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Emoji (opcional)</label>
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4}
              placeholder="Ex.: 🐶  🥣  🦴"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-lg" />
            <p className="mt-1 text-[11px] text-muted-foreground">Use o teclado de emojis do seu sistema (no celular toque no emoji 😀 do teclado).</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Imagem pequena (opcional)</label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-border bg-white" />
                  <button type="button" onClick={() => setImageUrl("")}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className={`h-12 w-12 rounded-xl border-2 border-dashed border-border bg-background flex items-center justify-center cursor-pointer hover:border-accent ${uploading ? "opacity-60" : ""}`}>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, setImageUrl, setUploading); }} />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground flex-1">Recomendado quadrado, até 2MB. Será exibido em tamanho pequeno.</p>
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
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {editingImage ? (
                          <div className="relative shrink-0">
                            <img src={editingImage} alt="" className="h-10 w-10 rounded-lg object-cover border border-border bg-white" />
                            <button type="button" onClick={() => setEditingImage("")}
                              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <label className={`h-10 w-10 shrink-0 rounded-lg border-2 border-dashed border-border bg-background flex items-center justify-center cursor-pointer hover:border-accent ${editingUploading ? "opacity-60" : ""}`}>
                            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                            <input type="file" accept="image/*" className="hidden" disabled={editingUploading}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, setEditingImage, setEditingUploading); }} />
                          </label>
                        )}
                        <input value={editingIcon} onChange={(e) => setEditingIcon(e.target.value)} maxLength={4}
                          placeholder="emoji" className="w-20 h-9 rounded-lg border border-input bg-background px-2 text-lg" />
                        <input autoFocus value={editingName} onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm" />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => saveEdit(c.id)} className="text-sm font-semibold text-accent hover:underline">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:underline">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium flex items-center gap-2">
                        {c.image_url ? (
                          <img src={c.image_url} alt="" className="h-8 w-8 rounded-lg object-cover border border-border bg-white" />
                        ) : c.icon ? (
                          <span className="text-lg">{c.icon}</span>
                        ) : null}
                        {c.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(c.id); setEditingName(c.name); setEditingIcon(c.icon || ""); setEditingImage(c.image_url || ""); }}
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
      supabase.from("categories").select("id, name, sort_order, icon, image_url").eq("store_id", userId).order("name"),
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
  const [search, setSearch] = useState("");

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

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) || 
    c.whatsapp.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Seus clientes
            <span className="text-sm font-normal text-muted-foreground ml-2">({customers.length})</span>
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou WhatsApp..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
          : filteredCustomers.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
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
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
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
    </div>
  );
}

/* ==================== PEDIDOS TAB ==================== */
function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").eq("store_id", userId).order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const removeOrder = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido permanentemente?")) return;
    const { data, error } = await supabase.from("orders").delete().eq("id", id).select();
    if (error) return toast.error(error.message);
    if (!data || data.length === 0) {
      return toast.error("Não foi possível excluir. Parece que a permissão de deletar (RLS) não foi aplicada no Supabase.");
    }
    toast.success("Pedido excluído com sucesso");
    load();
  };

  const filteredOrders = orders.filter(o => 
    o.full_name.toLowerCase().includes(search.toLowerCase()) || 
    o.whatsapp.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Histórico de Pedidos
            <span className="text-sm font-normal text-muted-foreground ml-2">({orders.length})</span>
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou WhatsApp..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p>
          : filteredOrders.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
          : <ul className="divide-y divide-border -mx-2 px-2">
              {filteredOrders.map((o) => (
                <li key={o.id} className="py-4 flex items-start justify-between gap-4 hover:bg-muted/30 rounded-xl px-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{o.full_name} <span className="text-xs font-normal text-muted-foreground">— {o.whatsapp}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Array.isArray(o.items) ? o.items.map((i: any) => `${i.qty}x ${i.name}`).join(", ") : ""}
                    </p>
                    {o.notes && <p className="text-xs text-muted-foreground mt-1 italic whitespace-pre-line">{o.notes}</p>}
                    <p className="text-[11px] text-muted-foreground mt-2">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="font-bold text-sm bg-accent/10 text-accent px-2.5 py-1 rounded-full">R$ {Number(o.total).toFixed(2)}</span>
                    <button onClick={() => removeOrder(o.id)} title="Excluir pedido"
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}
