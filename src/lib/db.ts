import Database from "better-sqlite3";
import { pbkdf2Sync, randomBytes } from "crypto";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "saas.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        plan TEXT DEFAULT 'starter',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        wp_user TEXT,
        wp_app_password TEXT,
        gsc_property TEXT,
        bing_site TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        site_id INTEGER REFERENCES sites(id),
        title TEXT NOT NULL,
        content TEXT,
        slug TEXT,
        meta_description TEXT,
        seo_title TEXT,
        status TEXT DEFAULT 'draft',
        source TEXT DEFAULT 'manual',
        wp_post_id INTEGER,
        wp_link TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        finished_at TEXT
      );
      CREATE TABLE IF NOT EXISTS api_keys (
        user_id INTEGER NOT NULL REFERENCES users(id),
        key_name TEXT NOT NULL,
        key_value TEXT NOT NULL,
        PRIMARY KEY (user_id, key_name)
      );
    `);
  }
  return _db;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return check === hash;
}

/* ---------- WordPress REST ---------- */
export function wpRequest(
  site: { url: string; wp_user: string | null; wp_app_password: string | null },
  method: string,
  path: string,
  data?: unknown
): Promise<{ status: number; data: Record<string, unknown> }> {
  const base = site.url.replace(/\/$/, "");
  const auth = Buffer.from(`${site.wp_user}:${site.wp_app_password}`).toString("base64");
  return fetch(`${base}/wp-json/wp/v2/${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (r) => ({ status: r.status, data: (await r.json().catch(() => ({}))) as Record<string, unknown> }));
}

export async function testWpSite(site: { url: string; wp_user: string | null; wp_app_password: string | null }) {
  // NOTE: /users/me est bloqué par le WAF LiteSpeed de certains hébergeurs (403 même avec auth valide).
  // Contournement : POST /posts avec title vide → 401 si identifiants invalides, 400 (données invalides) si identifiants valides.
  const { status, data } = await wpRequest(site, "POST", "posts", { title: "" });
  if (status === 400) {
    // 400 = authentifié mais données invalides → identifiants VALIDES
    return { ok: true, user: site.wp_user || "" };
  }
  if (status === 401 || status === 403) {
    return { ok: false, error: "Identifiants WordPress invalides (ou utilisateur sans droits de publication)" };
  }
  return { ok: false, error: (data.message as string) || `HTTP ${status}` };
}

/* ---------- Génération d'article (structure Rank Math FR) ---------- */
export function generateArticle(topic: string, keywords: string[], extra = "") {
  const kw = keywords[0] || topic;
  const kw2 = keywords[1] || keywords[0] || topic;
  const intro = `${topic} : vous cherchez des informations fiables et à jour ? Dans cet article, on fait le point sur ${kw}, avec tout ce qu'un lecteur francophone doit savoir — sans blabla.\n\n${extra}`;
  const sections = [
    { h2: `Qu'est-ce que ${kw} ?`, p: `Avant d'entrer dans les détails, posons les bases. ${kw} désigne... Cette section vous donne les essential pour comprendre le sujet en 2 minutes.` },
    { h2: `Les dates clés de ${kw}`, p: `Voici le calendrier à retenir pour ${kw2}, avec les dates France uniquement :` },
    { h2: `Où suivre ${kw} ?`, p: `Pour ne rien manquer de ${kw}, voici les sources officielles et les meilleures plateformes :` },
    { h2: `Notre analyse sur ${kw}`, p: `Ce qu'il faut retenir de ${kw} : les points forts, les points de vigilance, et notre verdict.` },
  ];
  const content = [
    intro,
    ...sections.flatMap((s) => [`## ${s.h2}`, "", s.p, ""]),
    `## Conclusion`,
    ``,
    `${topic} est un sujet à suivre de près. Cet article sera mis à jour dès que de nouvelles informations officielles seront disponibles.`,
  ].join("\n\n");
  const slug = topic.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  const seoTitle = topic.slice(0, 60);
  const metaDesc = `Découvrez ${kw} : dates, analyse et tout ce qu'il faut savoir. Guide complet et à jour pour la France.`.slice(0, 160);
  return { content, slug, seoTitle, metaDescription: metaDesc };
}
