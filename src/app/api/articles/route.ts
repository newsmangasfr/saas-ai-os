import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, wpRequest, generateArticle } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const rows = db()
    .prepare(`SELECT a.id, a.title, a.status, a.source, a.wp_post_id, a.wp_link, a.created_at, s.name as site_name
              FROM articles a LEFT JOIN sites s ON a.site_id = s.id
              WHERE a.user_id = ? ORDER BY a.id DESC LIMIT 50`)
    .all(userId);
  return NextResponse.json({ articles: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const body = await req.json();

  const topic = String(body.topic || "").trim();
  const keywords = String(body.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);
  const siteId = Number(body.site_id);
  const publish = body.publish === true;

  if (!topic || !siteId) return NextResponse.json({ error: "Sujet et site requis" }, { status: 400 });

  const site = db().prepare("SELECT * FROM sites WHERE id = ? AND user_id = ?").get(siteId, userId) as
    | { id: number; url: string; wp_user: string; wp_app_password: string }
    | undefined;
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  if (!site.wp_user || !site.wp_app_password) {
    return NextResponse.json({ error: "Ce site n'a pas d'identifiants WordPress configurés" }, { status: 400 });
  }

  // 1. Générer l'article
  const art = generateArticle(topic, keywords, body.brief || "");

  // 2. Publier sur WordPress (draft ou publish)
  const wp = await wpRequest(site, "POST", "posts", {
    title: topic,
    content: art.content,
    slug: art.slug,
    status: publish ? "publish" : "draft",
    meta: {
      _seopress_titles_title: art.seoTitle,
      _seopress_titles_desc: art.metaDescription,
    },
  });

  const wpPostId = wp.status === 201 ? (wp.data.id as number) : null;
  const wpLink = wp.status === 201 ? (wp.data.link as string) : null;

  // 3. Enregistrer localement
  const r = db()
    .prepare(`INSERT INTO articles (user_id, site_id, title, content, slug, meta_description, seo_title, status, source, wp_post_id, wp_link)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(userId, siteId, topic, art.content, art.slug, art.metaDescription, art.seoTitle,
      publish ? "publish" : "draft", body.source || "manual", wpPostId, wpLink);

  return NextResponse.json({
    ok: true,
    id: r.lastInsertRowid,
    wp_post_id: wpPostId,
    wp_link: wpLink,
    wp_status: wp.status,
    article: art,
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const { id } = await req.json();
  db().prepare("DELETE FROM articles WHERE id = ? AND user_id = ?").run(id, userId);
  return NextResponse.json({ ok: true });
}
