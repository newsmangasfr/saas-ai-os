import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, wpRequest, testWpSite } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const rows = db()
    .prepare("SELECT id, name, url, wp_user, gsc_property, bing_site, created_at FROM sites WHERE user_id = ? ORDER BY id DESC")
    .all(userId);
  return NextResponse.json({ sites: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const body = await req.json();

  const name = String(body.name || "").trim();
  let url = String(body.url || "").trim();
  const wpUser = String(body.wp_user || "").trim();
  const wpPass = String(body.wp_app_password || "").trim();

  if (!name || !url) return NextResponse.json({ error: "Nom et URL requis" }, { status: 400 });
  if (!url.startsWith("http")) url = `https://${url}`;
  url = url.replace(/\/$/, "");

  const site = { url, wp_user: wpUser || null, wp_app_password: wpPass || null };

  // tester si credentials fournis
  let test: { ok: boolean; user?: string; error?: string } | null = null;
  if (wpUser && wpPass) {
    test = await testWpSite(site);
    if (!test.ok) {
      return NextResponse.json({ error: `Connexion WordPress échouée : ${test.error}` }, { status: 400 });
    }
  }

  const r = db()
    .prepare("INSERT INTO sites (user_id, name, url, wp_user, wp_app_password, gsc_property, bing_site) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(userId, name, url, wpUser || null, wpPass || null, body.gsc_property || null, body.bing_site || null);

  return NextResponse.json({ ok: true, id: r.lastInsertRowid, test });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const { id } = await req.json();
  db().prepare("DELETE FROM sites WHERE id = ? AND user_id = ?").run(id, userId);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const body = await req.json();
  const row = db().prepare("SELECT * FROM sites WHERE id = ? AND user_id = ?").get(body.id, userId) as
    | { url: string; wp_user: string; wp_app_password: string }
    | undefined;
  if (!row) return NextResponse.json({ error: "site introuvable" }, { status: 404 });
  const test = await testWpSite(row);
  return NextResponse.json(test);
}
