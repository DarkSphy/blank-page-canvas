import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle,
  Tag,
  Store,
  Share2,
  ShoppingBag,
  Check,
  ArrowRight,
  Users,
  LogIn,
  X,
  Settings,
  Link2,
  ChevronDown,
  Sparkles,
  Image as ImageIcon,
  ListChecks,
  Gift,
  Brain,
  Star,
} from "lucide-react";
import logo from "@/assets/logo-catalogopet.png";
import flyer from "@/assets/catalog-flyer.png";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Catálogo Pet — Catálogo digital com pedidos no WhatsApp" },
      {
        name: "description",
        content:
          "O catálogo digital da sua casa de ração. Organize produtos, divulgue promoções e receba pedidos direto no WhatsApp.",
      },
      { property: "og:title", content: "Catálogo Pet — Catálogo digital com pedidos no WhatsApp" },
      { property: "og:description", content: "Organize seus produtos, mostre promoções e receba pedidos prontos no WhatsApp." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeatureStrip />
        <ProblemSolution />
        <HowItWorks />
        <WhatYouGet />
        <Differentiator />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Catálogo Pet" className="h-12 sm:h-14 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Como funciona</a>
          <a href="#oferta" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">O que você recebe</a>
          <a href="#preco" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Preço</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              Meu painel
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
              <Link
                to="/auth"
                className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
              >
                Criar catálogo
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[var(--gradient-soft)]" />
      <div className="absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -bottom-32 -right-32 -z-10 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ background: "var(--gradient-accent)" }} />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Comece a vender online
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-primary md:text-6xl">
            Seu catálogo digital com pedidos direto no{" "}
            <span className="text-accent">WhatsApp</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Pare de mandar foto e preço o dia inteiro. Organize tudo num só lugar e receba pedidos prontos pra entregar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition hover:brightness-105"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-base font-semibold text-primary transition hover:bg-muted"
            >
              Como funciona
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Rápido e fácil", "Opção com ou sem setup", "Cancela quando quiser"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center">
          <PhoneMockup3D />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup3D() {
  return (
    <div className="relative" style={{ perspective: "1600px" }}>
      <div
        className="absolute -inset-10 -z-10 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div
        className="relative transition-transform duration-700"
        style={{
          transform: "rotateY(-12deg) rotateX(5deg) rotateZ(-2deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Phone frame - flat screen, no curves */}
        <div
          className="relative w-[280px] sm:w-[340px] rounded-[2.4rem] p-[10px]"
          style={{
            background: "linear-gradient(145deg, #2a2a30 0%, #0a0a0c 50%, #1a1a1f 100%)",
            boxShadow:
              "0 60px 80px -30px rgba(30,78,140,0.45), 0 30px 50px -20px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Side edges */}
          <div className="pointer-events-none absolute inset-y-8 -left-[2px] w-[3px] rounded-l-full bg-black/40" />
          <div className="pointer-events-none absolute inset-y-8 -right-[2px] w-[3px] rounded-r-full bg-black/40" />

          {/* Flat clean screen — no notch, no curves, full flyer visible */}
          <div className="relative overflow-hidden rounded-[1.8rem] bg-white">
            <img
              src={flyer}
              alt="Demonstração do Catálogo Pet"
              className="block w-full select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Floating WhatsApp badge */}
        <div
          className="absolute -bottom-4 -left-6 hidden items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-[var(--shadow-soft)] sm:flex"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">Novo pedido</p>
            <p className="text-xs font-bold text-foreground leading-tight">Ração Premier 15kg</p>
          </div>
        </div>

        <div
          className="absolute -top-3 -right-4 hidden rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-[var(--shadow-glow)] sm:block"
          style={{ transform: "translateZ(60px)" }}
        >
          + 38% pedidos
        </div>
      </div>
    </div>
  );
}

function FeatureStrip() {
  const items = [
    { icon: ShoppingBag, label: "Organize seus produtos" },
    { icon: MessageCircle, label: "Pedidos no WhatsApp" },
    { icon: Tag, label: "Divulgue promoções" },
    { icon: Store, label: "Catálogo com sua marca" },
  ];
  return (
    <section className="bg-primary py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {items.map(({ icon: Icon, label }, i) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${i % 2 === 0 ? "bg-primary-foreground text-primary" : "bg-accent text-accent-foreground"}`}>
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-primary-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSolution() {
  const problems = [
    "Ficar mandando foto dos produtos no WhatsApp",
    "Responder preço toda hora pra cada cliente",
    "Organizar tudo manualmente, sem controle",
  ];
  const solutions = [
    "Seus produtos ficam organizados em um só lugar",
    "O cliente escolhe sozinho, no tempo dele",
    "Você recebe pedidos prontos no WhatsApp",
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
            Cansou da bagunça do WhatsApp?
          </h2>
          <p className="mt-4 text-muted-foreground">A gente entende o seu dia a dia — e resolveu isso.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Problema */}
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold uppercase text-destructive">
              <X className="h-3.5 w-3.5" /> Problema
            </div>
            <h3 className="font-display text-xl font-bold text-primary">Hoje você precisa:</h3>
            <ul className="mt-5 space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                    <X className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {/* Solução */}
          <div className="rounded-3xl border border-success/20 bg-success/5 p-7 shadow-[var(--shadow-card)]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-bold uppercase text-success">
              <Check className="h-3.5 w-3.5" /> Solução
            </div>
            <h3 className="font-display text-xl font-bold text-primary">Com o Catálogo Pet:</h3>
            <ul className="mt-5 space-y-3">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Settings,
      title: "Montamos pra você",
      desc: "Você envia seus produtos e a gente deixa tudo pronto.",
    },
    {
      icon: Share2,
      title: "Compartilhe o link",
      desc: "Envie o seu catálogo para os clientes no WhatsApp.",
    },
    {
      icon: MessageCircle,
      title: "Receba pedidos",
      desc: "Os clientes escolhem e pedem direto no WhatsApp.",
    },
  ];
  return (
    <section id="como-funciona" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Como funciona</h2>
          <p className="mt-4 text-muted-foreground">Em 3 passos sua loja está vendendo online.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
              <div className="absolute -top-4 left-7 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gradient-accent)] font-display text-sm font-bold text-accent-foreground shadow-[var(--shadow-glow)]">
                {i + 1}
              </div>
              <s.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    { icon: Store, text: "Catálogo digital com a sua marca" },
    { icon: Link2, text: "Link próprio para enviar aos clientes" },
    { icon: ListChecks, text: "Organização de produtos (ração, petiscos, etc.)" },
    { icon: ImageIcon, text: "Banners de promoção" },
    { icon: MessageCircle, text: "Botão direto para pedido no WhatsApp" },
    { icon: Users, text: "Lista de clientes interessados" },
  ];
  return (
    <section id="oferta" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            <Gift className="h-3.5 w-3.5" /> O que você recebe
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            Tudo pronto para sua loja vender mais
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiator() {
  const items = [
    "Lista de clientes que pediram",
    "Controle de quem comprou e quando",
    "Mais organização no seu dia a dia",
  ];
  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
            <Brain className="h-3.5 w-3.5" /> Diferencial
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
            Não é só um catálogo.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Você ganha mais que uma vitrine bonita — ganha controle do seu negócio.
          </p>
        </div>
        <ul className="space-y-4">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-4 rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Pricing() {
  const featuresBase = [
    "Acesso completo ao sistema",
    "Catálogo com a sua marca",
    "Atualização ilimitada de produtos",
    "Suporte via WhatsApp",
  ];

  const featuresSetup = [
    "Criação do seu catálogo com sua marca",
    "Organização dos seus produtos (ração, petiscos, etc.)",
    "Configuração de banners e promoções",
    "Ajuste visual (cores, logo e identidade da loja)",
    "Catálogo pronto para você começar a vender",
  ];

  return (
    <section id="preco" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Planos simples e justos</h2>
          <p className="mt-4 text-muted-foreground">Escolha se quer fazer você mesmo ou quer tudo pronto para vender.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          
          {/* Plano Básico */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-muted-foreground" />
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Plano Básico</p>
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-extrabold text-primary">R$ 39,90</span>
              <span className="text-base font-medium text-muted-foreground">/mês</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Você mesmo configura sua loja e cadastra seus produtos.
            </p>
            <ul className="mt-6 mb-8 flex-1 space-y-3">
              {featuresBase.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-accent text-base font-semibold text-accent transition hover:bg-accent/5"
            >
              Assinar Plano Básico
            </Link>
          </div>

          {/* Plano Completo (Setup) */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-accent/40 bg-card p-8 shadow-[var(--shadow-glow)]">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-accent px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
              Mais escolhido
            </div>
            <div
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--gradient-accent)" }}
            />
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-success" />
              <p className="text-sm font-bold uppercase tracking-wide text-success">Plano Completo (+ Setup)</p>
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-extrabold text-primary">R$ 150</span>
              <span className="text-base font-medium text-muted-foreground">no 1º mês</span>
            </div>
            <p className="mt-3 text-sm font-bold text-primary">
              Depois apenas R$ 39,90/mês.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nós montamos tudo pra você. Sua loja entregue pronta para vender.
            </p>
            
            <div className="mt-6 mb-8 flex-1">
              <p className="text-sm font-bold mb-3">O que está incluso no setup:</p>
              <ul className="space-y-3">
                {featuresSetup.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/auth"
              className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition hover:brightness-105"
            >
              Quero tudo pronto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Como funcionam os planos?",
      a: "Temos o Plano Básico por R$ 39,90/mês onde você mesmo cadastra seus produtos, e o Plano Completo, onde você paga R$ 150 no primeiro mês e nós entregamos a loja toda montada para você. Nos meses seguintes, o valor passa a ser os mesmos R$ 39,90.",
    },
    {
      q: "Eu preciso saber mexer em computador?",
      a: "Não. O sistema é simples e pensado para uso no celular. E se escolher o Plano Completo, nós fazemos toda a configuração inicial pra você — é só começar a vender.",
    },
    {
      q: "Como o cliente faz o pedido?",
      a: "Ele entra no link do seu catálogo, monta um carrinho com vários produtos e finaliza o pedido. O pedido chega pronto no seu WhatsApp, com todos os itens e quantidades.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Sem multa, sem fidelidade. Cancela a hora que quiser direto pelo WhatsApp do suporte.",
    },
    {
      q: "Tem taxa por pedido?",
      a: "Não cobramos comissão! Você paga apenas a mensalidade do sistema e recebe pedidos ilimitados direto no seu WhatsApp.",
    },
    {
      q: "Funciona no celular?",
      a: "Sim! Tanto seu painel de administração quanto o catálogo do cliente são 100% feitos para celular.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Perguntas frequentes</h2>
          <p className="mt-4 text-muted-foreground">Tudo que você precisa saber antes de começar.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-base font-bold text-primary">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-accent transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      name: "João Silva",
      store: "Agro Pet Central",
      text: "Excelente! Resolveu a bagunça que era meu WhatsApp, agora mando um link e recebo o pedido prontinho.",
      stars: 5,
    },
    {
      name: "Mariana Costa",
      store: "Ração & Cia",
      text: "Peguei o plano com setup e foi a melhor escolha. Entregaram minha loja linda, com a minha logo e cores. No mesmo dia já fiz a primeira venda pelo catálogo!",
      stars: 5,
    },
    {
      name: "Carlos Ferreira",
      store: "Cantinho do Pet",
      text: "Meus clientes amaram a facilidade de escolher os produtos direto pelo link. Sem contar que não pago taxa por pedido, compensa demais.",
      stars: 5,
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            <Star className="h-3.5 w-3.5" fill="currentColor" /> Quem usa, recomenda
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
            O que os lojistas dizem
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-1 text-accent mb-4">
                {[...Array(r.stars)].map((_, j) => (
                  <Star key={j} className="h-4 w-4" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 italic mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-primary font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.store}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Catálogo Pet" className="h-8 w-auto" />
        </div>
        <p>© {new Date().getFullYear()} Catálogo Pet. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
