import Link from "next/link";
import { ParticleField, TiltCard, HoloCube, Logo } from "@/components/fx";

const features = [
  { ic: "🌐", t: "Gestion multi-sites WordPress", d: "Connectez tous vos sites (newsmangas.com, newsseries.fr...) via l'API REST. Statut en direct, publication, catégories, images à la une." },
  { ic: "✍️", t: "Génération d'articles IA", d: "Articles structurés H1/H2/H3, dates France uniquement, maillage interne depuis votre sitemap, pack Rank Math complet : titre 50-60 car., meta 150-160, slug propre." },
  { ic: "🔍", t: "Analyse & audit SEO", d: "Analyse de votre contenu existant : positions, pages en perte de trafic, opportunités, corrections de bugs et recommandations appliquées article par article." },
  { ic: "📊", t: "Monitoring xCloud", d: "Vos serveurs, sites, backups, SSL et déploiements surveillés via l'API xCloud. Alerte immédiate si un site tombe ou un déploiement échoue." },
  { ic: "🎵", t: "TikTok / YouTube → articles", d: "Transcription automatique (Whisper), extraction des points clés, rédaction d'un article optimisé et publication — le contenu vidéo devient du SEO." },
  { ic: "🛡️", t: "Safe pour vos money sites", d: "Aucune tool d'indexation risquée, aucun backlink toxique : uniquement des pratiques naturelles conformes aux guidelines Google." },
];

export default function Home() {
  return (
    <>
      <ParticleField />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-edge backdrop-blur-xl" style={{ background: "rgba(7,7,12,.55)" }}>
        <Logo />
        <div className="hidden md:flex gap-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
          <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
        </div>
        <Link href="/dashboard" className="btn-ghost px-4 py-2 rounded-xl text-sm no-underline">Ouvrir le cockpit →</Link>
      </nav>

      {/* HERO */}
      <header className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-7"
          style={{ color: "var(--accent-green)", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent-green)", boxShadow: "0 0 10px var(--accent-green)" }} />
          Agents IA autonomes — connectés à vos sites en temps réel
        </div>
        <h1 className="mx-auto max-w-5xl font-extrabold tracking-tight leading-[1.08] text-4xl md:text-6xl lg:text-7xl" style={{ letterSpacing: "-1.5px" }}>
          Le <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 20%, #3b82f6 55%, #10b981 90%)" }}>mission control IA</span>{" "}
          de votre empire de contenu
        </h1>
        <p className="mx-auto max-w-2xl mt-6 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Des agents IA qui analysent vos sites WordPress, génèrent des articles optimisés en français,
          surveillent vos serveurs xCloud et transforment vos vidéos TikTok en articles SEO — pendant que vous vous concentrez sur l'essentiel.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <Link href="/dashboard" className="btn-hero btn-primary-neon no-underline">🚀 Accéder au cockpit</Link>
          <a href="#features" className="btn-hero btn-ghost no-underline">Découvrir les agents</a>
        </div>
        <HoloCube />
      </header>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: "var(--accent-purple)" }}>Fonctionnalités</p>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">Six agents. Un seul cockpit.</h2>
        <p className="max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Chaque agent est spécialisé, chaque action est traçable, chaque article est optimisé pour Google et adapté à votre audience manga &amp; séries.
        </p>
        <div className="grid gap-5 mt-11 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <TiltCard key={f.t} className="p-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(139,92,246,.1)", boxShadow: "inset 0 0 0 1px rgba(139,92,246,.25)" }}>{f.ic}</div>
              <h3 className="text-lg font-semibold mb-2.5">{f.t}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.d}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: "var(--accent-purple)" }}>Pipeline</p>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">De l'idée à l'article publié, en autonomie</h2>
        <div className="grid gap-4 mt-11 md:grid-cols-4">
          {[
            { ic: "🔍", t: "Recherche", d: "Sources, sitemap, mots-clés, concurrence" },
            { ic: "📋", t: "Planification", d: "Outline H1/H2/H3 + maillage interne" },
            { ic: "✍️", t: "Rédaction", d: "Article FR, dates France, ton naturel" },
            { ic: "🚀", t: "Publication", d: "WP REST + Rank Math + vérification" },
          ].map((s, i) => (
            <TiltCard key={s.t} className="p-6 text-center relative overflow-hidden">
              <span className="absolute top-3 right-4 text-xs font-mono" style={{ color: "var(--text-muted)" }}>0{i + 1}</span>
              <div className="text-3xl mb-3">{s.ic}</div>
              <h3 className="font-semibold mb-1.5">{s.t}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.d}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: "var(--accent-purple)" }}>Tarifs</p>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-11">Simple, sans surprise</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "Starter", p: "29€", d: ["1 site WordPress", "10 articles / mois", "Analyse SEO mensuelle", "Support email"] },
            { n: "Pro", p: "79€", d: ["5 sites WordPress", "50 articles / mois", "TikTok → articles illimité", "Monitoring xCloud", "Support prioritaire"], hot: true },
            { n: "Empire", p: "199€", d: ["Sites illimités", "Articles illimités", "Agents personnalisés", "API accès complet", "Support dédié"] },
          ].map((t) => (
            <TiltCard key={t.n} className="p-8 flex flex-col relative">
              {t.hot && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff" }}>POPULAIRE</span>
              )}
              <h3 className="text-lg font-semibold">{t.n}</h3>
              <p className="text-4xl font-extrabold mt-3 font-mono bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg,#fff,#b9b9d6)" }}>{t.p}<span className="text-sm" style={{ color: "var(--text-muted)" }}>/mois</span></p>
              <ul className="mt-6 space-y-2.5 text-sm flex-1" style={{ color: "var(--text-secondary)" }}>
                {t.d.map((x) => <li key={x} className="flex gap-2"><span style={{ color: "var(--accent-green)" }}>✓</span>{x}</li>)}
              </ul>
              <Link href="/dashboard" className="btn-hero btn-primary-neon no-underline justify-center mt-7 text-sm">Commencer</Link>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-28 px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Prêt à déléguer votre SEO aux agents ?</h2>
        <p className="mx-auto max-w-xl mb-9 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Connectez votre premier site en 30 secondes. Vos agents travaillent pendant que vous dormez.
        </p>
        <Link href="/dashboard" className="btn-hero btn-primary-neon no-underline">🔐 Entrer dans le cockpit</Link>
      </section>

      <footer className="py-9 px-6 border-t border-edge text-center text-xs" style={{ color: "var(--text-muted)" }}>
        AI Agents OS — propulsé par Hermes Agent (Nous Research) · hébergé sur votre infrastructure xCloud
      </footer>
    </>
  );
}
