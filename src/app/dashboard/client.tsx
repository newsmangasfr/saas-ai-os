"use client";

import { useEffect, useState } from "react";

type Site = { id: number; name: string; url: string; wp_user: string | null; gsc_property: string | null; bing_site: string | null };
type Article = { id: number; title: string; status: string; source: string; wp_post_id: number | null; wp_link: string | null; site_name: string | null; created_at: string };
type Stats = { sites: number; articles: number; published: number; jobs: number };

const inputCls = "w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-edge-light text-white text-sm outline-none focus:border-purple";

export default function DashboardClient({ userName, stats }: { userName: string; stats: Stats }) {
  const [tab, setTab] = useState<"sites" | "articles" | "seo">("sites");
  const [sites, setSites] = useState<Site[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");

  // --- Sites form
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteUser, setSiteUser] = useState("");
  const [sitePass, setSitePass] = useState("");

  // --- Article form
  const [artSite, setArtSite] = useState("");
  const [artTopic, setArtTopic] = useState("");
  const [artKw, setArtKw] = useState("");
  const [artBrief, setArtBrief] = useState("");
  const [artPublish, setArtPublish] = useState(false);
  const [genResult, setGenResult] = useState<string>("");

  // --- SEO keys
  const [gscKey, setGscKey] = useState("");
  const [bingKey, setBingKey] = useState("");

  const loadAll = async () => {
    const [s, a, k] = await Promise.all([
      fetch("/api/sites").then((r) => r.json()),
      fetch("/api/articles").then((r) => r.json()),
      fetch("/api/keys").then((r) => r.json()),
    ]);
    setSites(s.sites || []);
    setArticles(a.articles || []);
    setKeys(k.keys || {});
    if ((s.sites || []).length > 0 && !artSite) setArtSite(String(s.sites[0].id));
  };

  useEffect(() => { loadAll(); }, []);

  const addSite = async () => {
    setMsg("");
    const r = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: siteName, url: siteUrl, wp_user: siteUser, wp_app_password: sitePass }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg("❌ " + (j.error || "Erreur")); return; }
    setMsg(j.test?.ok ? "✅ Site connecté et vérifié (WordPress : " + j.test.user + ")" : "✅ Site enregistré (sans test — identifiants manquants)");
    setSiteName(""); setSiteUrl(""); setSiteUser(""); setSitePass("");
    loadAll();
  };

  const testSite = async (id: number) => {
    setMsg("");
    const r = await fetch("/api/sites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = await r.json();
    setMsg(j.ok ? "✅ WordPress connecté en tant que " + j.user : "❌ " + (j.error || "Échec"));
  };

  const delSite = async (id: number) => {
    if (!confirm("Supprimer ce site ?")) return;
    await fetch("/api/sites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadAll();
  };

  const generateArticle = async () => {
    setMsg(""); setGenResult("");
    const r = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: artTopic, keywords: artKw, site_id: Number(artSite), brief: artBrief, publish: artPublish, source: "ai",
      }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg("❌ " + (j.error || "Erreur")); return; }
    setMsg(j.wp_post_id ? "✅ Article " + (artPublish ? "publié" : "en brouillon") + " sur WordPress ! ID #" + j.wp_post_id : "⚠️ Article généré mais publication WP échouée (code " + j.wp_status + ")");
    setGenResult(j.article?.content?.slice(0, 500) + "…");
    loadAll();
  };

  const delArticle = async (id: number) => {
    if (!confirm("Supprimer cet article (localement) ?")) return;
    await fetch("/api/articles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadAll();
  };

  const saveKey = async (key_name: string, key_value: string) => {
    if (!key_value.trim()) { alert("Collez d'abord la clé"); return; }
    await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key_name, key_value }) });
    setMsg("✅ Clé " + key_name + " enregistrée");
    loadAll();
  };

  const statCards = [
    { n: stats.sites, l: "Sites connectés", c: "139,92,246" },
    { n: stats.articles, l: "Articles", c: "59,130,246" },
    { n: stats.published, l: "Publiés WP", c: "16,185,129" },
    { n: stats.jobs, l: "Jobs en file", c: "249,115,22" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Mission Control</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Bienvenue {userName} — pilotez vos sites et vos agents.</p>

      {/* STATS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
        {statCards.map((s) => (
          <div key={s.l} className="glass p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-mono text-xl"
              style={{ background: `rgba(${s.c},.1)`, color: `rgb(${s.c})`, boxShadow: `inset 0 0 0 1px rgba(${s.c},.25)` }}>●</div>
            <div>
              <p className="text-2xl font-bold font-mono">{s.n}</p>
              <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8">
        {([["sites", "🌐 Sites WordPress"], ["articles", "✍️ Articles IA"], ["seo", "🔌 SEO (GSC & Bing)"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all border cursor-pointer"
            style={tab === k
              ? { background: "rgba(139,92,246,.18)", color: "#fff", borderColor: "rgba(139,92,246,.4)" }
              : { background: "transparent", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            {label}
          </button>
        ))}
      </div>

      {msg && <div className="glass p-4 mb-6 text-sm" style={{ borderColor: "rgba(139,92,246,.3)" }}>{msg}</div>}

      {/* ============ SITES ============ */}
      {tab === "sites" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass p-6">
            <h3 className="font-semibold mb-1">Ajouter un site WordPress</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
              WP-admin → Utilisateurs → Profil → <b>Mots de passe d'application</b> → créer un mot de passe (format xxxx xxxx xxxx xxxx)
            </p>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Nom du site (ex: NewsMangas)" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              <input className={inputCls} placeholder="https://newsmangas.com" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
              <input className={inputCls} placeholder="Utilisateur WordPress" value={siteUser} onChange={(e) => setSiteUser(e.target.value)} />
              <input className={inputCls} type="password" placeholder="Mot de passe d'application" value={sitePass} onChange={(e) => setSitePass(e.target.value)} />
              <button onClick={addSite} className="btn-primary-neon w-full justify-center py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer">
                🔗 Connecter le site
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {sites.length === 0 && <div className="glass p-6 text-sm" style={{ color: "var(--text-muted)" }}>Aucun site. Ajoutez votre premier site à gauche.</div>}
            {sites.map((s) => (
              <div key={s.id} className="glass p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{s.name}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.url}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>WP user : {s.wp_user || "—"} · GSC : {s.gsc_property || "—"} · Bing : {s.bing_site || "—"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => testSite(s.id)} className="btn-ghost px-3 py-1.5 rounded-lg text-xs border cursor-pointer">Tester</button>
                    <button onClick={() => delSite(s.id)} className="px-3 py-1.5 rounded-lg text-xs border cursor-pointer" style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }}>Suppr.</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ ARTICLES ============ */}
      {tab === "articles" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass p-6">
            <h3 className="font-semibold mb-1">Générer un article IA</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
              Structure Rank Math : H1/H2/H3, dates France, meta 150-160 car., slug propre. Publié via l'API WordPress.
            </p>
            {sites.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--accent-orange)" }}>⚠️ Connectez d'abord un site (onglet Sites).</p>
            ) : (
              <div className="space-y-3">
                <select className={inputCls} value={artSite} onChange={(e) => setArtSite(e.target.value)}>
                  {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className={inputCls} placeholder="Sujet de l'article (ex: One Piece 1188 : date de sortie)" value={artTopic} onChange={(e) => setArtTopic(e.target.value)} />
                <input className={inputCls} placeholder="Mots-clés séparés par des virgules (ex: one piece, date sortie)" value={artKw} onChange={(e) => setArtKw(e.target.value)} />
                <textarea className={inputCls} rows={3} placeholder="Brief optionnel : points à couvrir, sources…" value={artBrief} onChange={(e) => setArtBrief(e.target.value)} />
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={artPublish} onChange={(e) => setArtPublish(e.target.checked)} />
                  Publier directement (sinon brouillon WordPress)
                </label>
                <button onClick={generateArticle} disabled={!artTopic || !artSite}
                  className="btn-primary-neon w-full justify-center py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer disabled:opacity-40">
                  🚀 Générer & {artPublish ? "publier" : "mettre en brouillon"}
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {genResult && (
              <div className="glass p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Aperçu généré</h4>
                <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{genResult}</p>
              </div>
            )}
            <div className="glass divide-y" style={{ borderColor: "var(--border)" }}>
              {articles.length === 0 && <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>Aucun article encore.</div>}
              {articles.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div className="truncate mr-3">
                    <p className="truncate">{a.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{a.site_name || "—"} · {a.source} · {a.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.wp_post_id ? (
                      <a href={a.wp_link || "#"} target="_blank" className="text-[11px] font-mono no-underline" style={{ color: "var(--accent-green)" }}>#{a.wp_post_id}</a>
                    ) : null}
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={a.wp_post_id ? { background: "rgba(16,185,129,.15)", color: "var(--accent-green)" } : { background: "rgba(249,115,22,.15)", color: "var(--accent-orange)" }}>
                      {a.wp_post_id ? "Publié" : a.status}
                    </span>
                    <button onClick={() => delArticle(a.id)} className="btn-icon cursor-pointer">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ SEO ============ */}
      {tab === "seo" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: "rgba(59,130,246,.12)", color: "#60a5fa" }}>G</div>
              <div>
                <h3 className="font-semibold">Google Search Console</h3>
                <p className="text-xs" style={{ color: keys.gsc_service_account ? "var(--accent-green)" : "var(--text-muted)" }}>
                  {keys.gsc_service_account ? "● Clé enregistrée" : "● Non configurée"}
                </p>
              </div>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              1. Google Cloud Console → créer un <b>compte de service</b> → activer l'API Search Console<br />
              2. Télécharger la clé JSON<br />
              3. Ajouter l'email du compte de service (…@…iam.gserviceaccount.com) comme utilisateur dans GSC
            </p>
            <textarea className={inputCls + " font-mono text-xs"} rows={5} placeholder="Collez le contenu JSON de la clé de compte de service…" value={gscKey} onChange={(e) => setGscKey(e.target.value)} />
            <button onClick={() => saveKey("gsc_service_account", gscKey)} className="btn-primary-neon w-full justify-center py-2.5 rounded-xl text-sm font-semibold mt-3 border-0 cursor-pointer">
              💾 Enregistrer la clé GSC
            </button>
          </div>
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: "rgba(16,185,129,.12)", color: "#34d399" }}>b</div>
              <div>
                <h3 className="font-semibold">Bing Webmaster Tools</h3>
                <p className="text-xs" style={{ color: keys.bing_api_key ? "var(--accent-green)" : "var(--text-muted)" }}>
                  {keys.bing_api_key ? "● Clé enregistrée" : "● Non configurée"}
                </p>
              </div>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Bing Webmaster Tools → <b>Settings → API Access</b> → générer une clé API (format ipt_...)
            </p>
            <input className={inputCls + " font-mono text-xs"} placeholder="ipt_..." value={bingKey} onChange={(e) => setBingKey(e.target.value)} />
            <button onClick={() => saveKey("bing_api_key", bingKey)} className="btn-primary-neon w-full justify-center py-2.5 rounded-xl text-sm font-semibold mt-3 border-0 cursor-pointer">
              💾 Enregistrer la clé Bing
            </button>
            <div className="mt-6 p-4 rounded-xl text-xs leading-relaxed" style={{ background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.2)", color: "var(--text-secondary)" }}>
              💡 Une fois les clés enregistrées, les agents pourront : soumettre tes articles à Bing via IndexNow, lire tes positions GSC par page, et surveiller l'indexation automatiquement.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
