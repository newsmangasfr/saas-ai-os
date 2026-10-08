"use client";

import { useEffect, useState } from "react";
import { BarChart, LineChart, Donut, Sparkline } from "@/components/charts";
import { Scene3D, Card3D, Icon3D, Chip, NeonButton } from "@/components/ui3d";

type Site = { id: number; name: string; url: string; wp_user: string | null; gsc_property: string | null; bing_site: string | null };
type Article = { id: number; title: string; status: string; source: string; wp_post_id: number | null; wp_link: string | null; site_name: string | null; created_at: string };
type Stats = { sites: number; articles: number; published: number; jobs: number };

const inputCls = "w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-edge-light text-white text-sm outline-none focus:border-purple focus:shadow-[0_0_0_3px_rgba(139,92,246,.15)] transition-all";

export default function DashboardClient({ userName, stats }: { userName: string; stats: Stats }) {
  const [tab, setTab] = useState<"sites" | "articles" | "seo" | "analytics">("sites");
  const [sites, setSites] = useState<Site[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [siteName, setSiteName] = useState(""); const [siteUrl, setSiteUrl] = useState("");
  const [siteUser, setSiteUser] = useState(""); const [sitePass, setSitePass] = useState("");
  const [siteGsc, setSiteGsc] = useState("");

  const [artSite, setArtSite] = useState(""); const [artTopic, setArtTopic] = useState("");
  const [artKw, setArtKw] = useState(""); const [artBrief, setArtBrief] = useState("");
  const [artPublish, setArtPublish] = useState(false); const [genResult, setGenResult] = useState("");

  const [gscKey, setGscKey] = useState(""); const [bingKey, setBingKey] = useState("");

  const [gscData, setGscData] = useState<{
    configured?: boolean; property?: string; error?: string;
    daily?: { date: string; clicks: number; impressions: number; ctr: number; position: number }[];
    totals?: { clicks: number; impressions: number; ctr: number; position: number };
  } | null>(null);
  const [gscLoading, setGscLoading] = useState(false); const [gscSiteId, setGscSiteId] = useState("");

  const loadGsc = async (sid?: string) => {
    const id = sid || gscSiteId || String(sites[0]?.id || ""); if (!id) return;
    setGscLoading(true); setGscData(null);
    setGscData(await (await fetch(`/api/gsc?site_id=${id}`)).json());
    setGscLoading(false);
  };

  const loadAll = async () => {
    const [s, a, k] = await Promise.all([fetch("/api/sites").then(r => r.json()), fetch("/api/articles").then(r => r.json()), fetch("/api/keys").then(r => r.json())]);
    setSites(s.sites || []); setArticles(a.articles || []); setKeys(k.keys || {});
    if ((s.sites || []).length && !artSite) setArtSite(String(s.sites[0].id));
  };
  useEffect(() => { loadAll(); }, []);

  const addSite = async () => {
    setMsg(""); setLoading(true);
    const r = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: siteName, url: siteUrl, wp_user: siteUser, wp_app_password: sitePass, gsc_property: siteGsc }) });
    const j = await r.json();
    if (!r.ok) { setMsg("❌ " + (j.error || "Erreur")); setLoading(false); return; }
    setMsg(j.test?.ok ? `✅ ${siteName} connecté (WordPress : ${j.test.user})` : "✅ Site enregistré");
    setSiteName(""); setSiteUrl(""); setSiteUser(""); setSitePass(""); setSiteGsc("");
    setLoading(false);
    loadAll();
  };
  const testSite = async (id: number) => {
    setMsg("");
    const j = await (await fetch("/api/sites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })).json();
    setMsg(j.ok ? `✅ Connecté en tant que ${j.user}` : "❌ " + (j.error || "Échec"));
  };
  const delSite = async (id: number) => {
    if (!confirm("Supprimer ce site ?")) return;
    await fetch("/api/sites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadAll();
  };
  const generateArticle = async () => {
    setMsg(""); setGenResult("");
    const r = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: artTopic, keywords: artKw, site_id: Number(artSite), brief: artBrief, publish: artPublish, source: "ai" }) });
    const j = await r.json();
    if (!r.ok) { setMsg("❌ " + (j.error || "Erreur")); return; }
    setMsg(j.wp_post_id ? `✅ Article ${artPublish ? "publié" : "en brouillon"} ! WP #${j.wp_post_id}` : "⚠️ Généré mais publication échouée");
    setGenResult(j.article?.content?.slice(0, 400) + "…");
    loadAll();
  };
  const delArticle = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await fetch("/api/articles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadAll();
  };
  const saveKey = async (key_name: string, key_value: string) => {
    if (!key_value.trim()) { setMsg("❌ Collez d'abord la clé"); return; }
    await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key_name, key_value }) });
    setMsg(`✅ Clé ${key_name === "gsc_service_account" ? "GSC" : "Bing"} enregistrée`);
    setGscKey(""); setBingKey("");
    loadAll();
  };

  const statCards = [
    { n: stats.sites, l: "Sites", c: "139,92,246", ic: "🌐", spark: [3, 4, 4, 5, 6, 6, 7] },
    { n: stats.articles, l: "Articles", c: "59,130,246", ic: "✍️", spark: [2, 5, 4, 8, 7, 10, 12] },
    { n: stats.published, l: "Publiés", c: "16,185,129", ic: "🚀", spark: [1, 3, 3, 5, 6, 8, 9] },
    { n: stats.jobs, l: "Jobs en file", c: "249,115,22", ic: "⚡", spark: [4, 3, 5, 4, 6, 5, 4] },
  ];

  const tabs = [
    { k: "sites", label: "Sites", ic: "🌐" },
    { k: "articles", label: "Articles IA", ic: "✍️" },
    { k: "seo", label: "SEO Connect", ic: "🔌" },
    { k: "analytics", label: "Analytics", ic: "📈" },
  ] as const;

  return (
    <>
      <Scene3D />
      <main className="max-w-6xl mx-auto px-6 py-10 relative">
        {/* HEADER HERO */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Mission <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#8b5cf6,#3b82f6,#10b981)" }}>Control</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Bienvenue {userName} — vos agents sont opérationnels.</p>
        </div>

        {/* STAT CARDS 3D */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
          {statCards.map((s) => (
            <Card3D key={s.l} glow={s.c} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Icon3D glow={s.c} size={44}>{s.ic}</Icon3D>
                <Sparkline data={s.spark} color={s.c} />
              </div>
              <p className="text-3xl font-extrabold font-mono bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#fff,#b9b9d6)" }}>{s.n}</p>
              <p className="text-[11px] uppercase tracking-[1.5px] mt-1" style={{ color: "var(--text-muted)" }}>{s.l}</p>
            </Card3D>
          ))}
        </div>

        {/* TABS 3D */}
        <div className="flex gap-2.5 mb-9 flex-wrap">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => { setTab(t.k); if (t.k === "analytics" && sites.length) loadGsc(); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer border"
              style={tab === t.k
                ? { background: "linear-gradient(145deg, rgba(139,92,246,.25), rgba(59,130,246,.12))", color: "#fff", borderColor: "rgba(139,92,246,.5)", boxShadow: "0 8px 28px rgba(139,92,246,.25), inset 0 1px 0 rgba(255,255,255,.1)", transform: "translateY(-2px)" }
                : { background: "rgba(20,20,32,.5)", color: "var(--text-secondary)", borderColor: "var(--border)", backdropFilter: "blur(10px)" }}>
              <span style={{ filter: tab === t.k ? "drop-shadow(0 0 8px rgba(139,92,246,.8))" : "none" }}>{t.ic}</span>
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <Card3D className="p-4 mb-7 text-sm" glow={msg.startsWith("✅") ? "16,185,129" : "239,68,68"}>
            {msg}
          </Card3D>
        )}

        {/* ============ SITES ============ */}
        {tab === "sites" && (
          <div className="grid gap-7 lg:grid-cols-5">
            <Card3D className="p-7 lg:col-span-2">
              <Icon3D size={46}>🌐</Icon3D>
              <h3 className="font-bold text-lg mt-4 mb-1">Connecter un site</h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                WP-admin → Utilisateurs → Profil → <b>Mots de passe d'application</b> → créer (format xxxx xxxx xxxx xxxx)
              </p>
              <input className={inputCls + " mb-3"} placeholder="Nom (ex: NewsMangas)" value={siteName} onChange={e => setSiteName(e.target.value)} />
              <input className={inputCls + " mb-3"} placeholder="https://newsmangas.com" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
              <input className={inputCls + " mb-3"} placeholder="Utilisateur WordPress" value={siteUser} onChange={e => setSiteUser(e.target.value)} />
              <input className={inputCls + " mb-3"} type="password" placeholder="Mot de passe d'application" value={sitePass} onChange={e => setSitePass(e.target.value)} />
              <input className={inputCls + " mb-5"} placeholder="GSC property (sc-domain:newsmangas.com)" value={siteGsc} onChange={e => setSiteGsc(e.target.value)} />
              <NeonButton onClick={addSite} full disabled={!siteName.trim() || !siteUrl.trim() || loading}>
                {loading ? "⏳ Vérification WordPress…" : (!siteName.trim() || !siteUrl.trim()) ? "Remplissez nom + URL" : "🔗 Connecter & vérifier"}
              </NeonButton>
            </Card3D>
            <div className="lg:col-span-3 space-y-5">
              {sites.length === 0 && (
                <Card3D glow="249,115,22" className="p-10 text-center">
                  <div className="text-5xl mb-4">🛰️</div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun site en orbite. Lancez votre premier site depuis le panneau de gauche.</p>
                </Card3D>
              )}
              {sites.map((s) => (
                <Card3D key={s.id} glow="59,130,246" className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Icon3D glow="59,130,246">🌐</Icon3D>
                      <div>
                        <h4 className="font-bold text-lg">{s.name}</h4>
                        <a href={s.url} target="_blank" className="text-xs no-underline hover:underline" style={{ color: "var(--accent-blue)" }}>{s.url}</a>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <Chip ok={!!s.wp_user}>{s.wp_user ? "WP : " + s.wp_user : "WP non configuré"}</Chip>
                          {s.gsc_property && <Chip ok>{s.gsc_property}</Chip>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <NeonButton onClick={() => testSite(s.id)}>⚡ Tester</NeonButton>
                      <NeonButton danger onClick={() => delSite(s.id)}>Suppr.</NeonButton>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        )}

        {/* ============ ARTICLES ============ */}
        {tab === "articles" && (
          <div className="grid gap-7 lg:grid-cols-5">
            <Card3D className="p-7 lg:col-span-2">
              <Icon3D glow="16,185,129">✍️</Icon3D>
              <h3 className="font-bold text-lg mt-4 mb-1">Générer un article</h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Structure Rank Math : H1/H2/H3, dates France, meta 150-160 car., slug propre. Publication via l'API WP.
              </p>
              {sites.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--accent-orange)" }}>⚠️ Connectez un site d'abord (onglet Sites).</p>
              ) : (
                <>
                  <select className={inputCls + " mb-3"} value={artSite} onChange={e => setArtSite(e.target.value)}>
                    {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input className={inputCls + " mb-3"} placeholder="Sujet (ex: One Piece 1188 : date sortie)" value={artTopic} onChange={e => setArtTopic(e.target.value)} />
                  <input className={inputCls + " mb-3"} placeholder="Mots-clés, séparés par virgules" value={artKw} onChange={e => setArtKw(e.target.value)} />
                  <textarea className={inputCls + " mb-3"} rows={3} placeholder="Brief optionnel : points à couvrir…" value={artBrief} onChange={e => setArtBrief(e.target.value)} />
                  <label className="flex items-center gap-2.5 text-sm mb-5 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                    <input type="checkbox" checked={artPublish} onChange={e => setArtPublish(e.target.checked)} className="w-4 h-4 accent-purple" />
                    🚀 Publier directement (sinon brouillon WP)
                  </label>
                  <NeonButton onClick={generateArticle} full disabled={!artTopic || !artSite}>✨ Générer l&apos;article</NeonButton>
                </>
              )}
            </Card3D>
            <div className="lg:col-span-3 space-y-5">
              {genResult && (
                <Card3D glow="16,185,129" className="p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--accent-green)" }}>📝 Aperçu généré</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{genResult}</p>
                </Card3D>
              )}
              {articles.length === 0 && (
                <Card3D glow="249,115,22" className="p-10 text-center">
                  <div className="text-5xl mb-4">📰</div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun article. Votre premier chef-d'œuvre vous attend dans le panneau de gauche.</p>
                </Card3D>
              )}
              {articles.map((a) => (
                <Card3D key={a.id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.title}</p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{a.site_name || "—"} · {a.source} · {a.created_at?.slice(0, 10)}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {a.wp_post_id && <a href={a.wp_link || "#"} target="_blank" className="text-[11px] font-mono no-underline px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,.1)", color: "var(--accent-green)" }}>#{a.wp_post_id} ↗</a>}
                      <Chip ok={!!a.wp_post_id}>{a.wp_post_id ? "Publié" : "Brouillon"}</Chip>
                      <button onClick={() => delArticle(a.id)} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">🗑️</button>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        )}

        {/* ============ SEO CONNECT ============ */}
        {tab === "seo" && (
          <div className="grid gap-7 lg:grid-cols-2">
            <Card3D glow="59,130,246" className="p-7">
              <div className="flex items-center justify-between mb-5">
                <Icon3D glow="59,130,246">🔍</Icon3D>
                <Chip ok={!!keys.gsc_service_account}>{keys.gsc_service_account ? "Clé active" : "Non configurée"}</Chip>
              </div>
              <h3 className="font-bold text-lg mb-1">Google Search Console</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                1. Google Cloud Console → <b>Compte de service</b> → activer l&apos;API Search Console<br />
                2. Créer une clé JSON et la télécharger<br />
                3. Ajouter l&apos;email du service (…@…iam.gserviceaccount.com) dans GSC → Utilisateurs
              </p>
              <textarea className={inputCls + " font-mono text-[11px] mb-4"} rows={6} placeholder='{"type": "service_account", "private_key": "…"}' value={gscKey} onChange={e => setGscKey(e.target.value)} />
              <NeonButton onClick={() => saveKey("gsc_service_account", gscKey)} full>💾 Enregistrer la clé GSC</NeonButton>
            </Card3D>
            <Card3D glow="16,185,129" className="p-7">
              <div className="flex items-center justify-between mb-5">
                <Icon3D glow="16,185,129">🅱️</Icon3D>
                <Chip ok={!!keys.bing_api_key}>{keys.bing_api_key ? "Clé active" : "Non configurée"}</Chip>
              </div>
              <h3 className="font-bold text-lg mb-1">Bing Webmaster Tools</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Bing Webmaster → <b>Settings → API Access</b> → générer la clé (ipt_…). IndexNow pour l&apos;indexation rapide de tes nouveaux articles.
              </p>
              <input className={inputCls + " font-mono text-xs mb-4"} placeholder="ipt_..." value={bingKey} onChange={e => setBingKey(e.target.value)} />
              <NeonButton onClick={() => saveKey("bing_api_key", bingKey)} full>💾 Enregistrer la clé Bing</NeonButton>
              <div className="mt-7 p-4.5 rounded-xl p-4 text-xs leading-relaxed" style={{ background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.2)", color: "var(--text-secondary)" }}>
                💡 Avec ces clés, tes agents soumettront automatiquement les nouveaux articles à Bing IndexNow, liront tes positions GSC, et surveilleront l&apos;indexation — le tout sans outil risqué.
              </div>
            </Card3D>
          </div>
        )}

        {/* ============ ANALYTICS ============ */}
        {tab === "analytics" && (
          <div className="space-y-7">
            <div className="flex items-center gap-4 flex-wrap">
              <Icon3D glow="59,130,246" size={44}>📈</Icon3D>
              <div>
                <h2 className="text-xl font-bold">Search Analytics</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Google Search Console · 28 derniers jours</p>
              </div>
              {sites.length > 0 && (
                <select className={inputCls + " max-w-56 ml-auto"} value={gscSiteId || String(sites[0]?.id)} onChange={e => { setGscSiteId(e.target.value); loadGsc(e.target.value); }}>
                  {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>

            {sites.length === 0 && (
              <Card3D glow="249,115,22" className="p-10 text-center">
                <div className="text-5xl mb-4">📡</div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Connectez un site avec sa property GSC pour activer les données.</p>
              </Card3D>
            )}
            {gscLoading && <div className="glass p-10 text-center text-sm animate-pulse" style={{ color: "var(--text-muted)" }}>Réception des données Google…</div>}

            {gscData && !gscLoading && !gscData.configured && (
              <Card3D glow="249,115,22" className="p-8 text-sm" >
                <span style={{ color: "var(--accent-orange)" }}>⚠️ {gscData.error}</span>
              </Card3D>
            )}

            {gscData?.configured && gscData.daily && gscData.totals && (
              <>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {[
                    { n: gscData.totals.clicks, l: "Clics", c: "59,130,246", ic: "👆", spark: gscData.daily.map(d => d.clicks) },
                    { n: gscData.totals.impressions, l: "Impressions", c: "139,92,246", ic: "👁️", spark: gscData.daily.map(d => d.impressions) },
                    { n: gscData.totals.ctr + "%", l: "CTR moyen", c: "16,185,129", ic: "🎯", spark: gscData.daily.map(d => d.ctr) },
                    { n: gscData.totals.position, l: "Position moy.", c: "249,115,22", ic: "📍", spark: gscData.daily.map(d => d.position) },
                  ].map((s) => (
                    <Card3D key={s.l} glow={s.c} className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <Icon3D glow={s.c} size={40}>{s.ic}</Icon3D>
                        <Sparkline data={s.spark} color={s.c} />
                      </div>
                      <p className="text-2xl font-extrabold font-mono">{s.n}</p>
                      <p className="text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--text-muted)" }}>{s.l}</p>
                    </Card3D>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card3D className="p-6" glow="59,130,246">
                    <h3 className="text-sm font-bold mb-5">👆 Clics par jour</h3>
                    <BarChart data={gscData.daily.map(d => d.clicks)} labels={gscData.daily.map(d => d.date)} color="59,130,246" />
                  </Card3D>
                  <Card3D className="p-6" glow="139,92,246">
                    <h3 className="text-sm font-bold mb-5">👁️ Impressions</h3>
                    <LineChart data={gscData.daily.map(d => d.impressions)} labels={gscData.daily.filter((_, i) => i % 6 === 0).map(d => d.date)} color="139,92,246" />
                  </Card3D>
                  <Card3D className="p-6" glow="16,185,129">
                    <h3 className="text-sm font-bold mb-5">🎯 CTR quotidien (%)</h3>
                    <LineChart data={gscData.daily.map(d => d.ctr)} labels={gscData.daily.filter((_, i) => i % 6 === 0).map(d => d.date)} color="16,185,129" />
                  </Card3D>
                  <Card3D className="p-6" glow="249,115,22">
                    <h3 className="text-sm font-bold mb-6">🏆 Objectifs</h3>
                    <div className="flex items-center justify-around">
                      <Donut value={gscData.totals.ctr} max={15} label="CTR / 15%" color="16,185,129" />
                      <Donut value={Math.max(0, 21 - gscData.totals.position)} max={21} label="Pos. / top 3" color="59,130,246" />
                      <Donut value={gscData.totals.clicks} max={Math.max(gscData.totals.clicks * 1.5, 100)} label="Clics / obj." color="139,92,246" />
                    </div>
                  </Card3D>
                </div>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  Property <span className="font-mono">{gscData.property}</span> · GSC API v3 · délai Google ~48h
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
