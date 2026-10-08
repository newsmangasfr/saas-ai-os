import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const rows = db().prepare("SELECT key_name FROM api_keys WHERE user_id = ?").all(userId);
  const keys: Record<string, boolean> = {};
  for (const r of rows as { key_name: string }[]) keys[r.key_name] = true;
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const body = await req.json();
  const name = String(body.key_name || "").trim();
  const value = String(body.key_value || "").trim();
  if (!name || !value) return NextResponse.json({ error: "key_name et key_value requis" }, { status: 400 });
  db().prepare(`INSERT INTO api_keys (user_id, key_name, key_value) VALUES (?, ?, ?)
                ON CONFLICT(user_id, key_name) DO UPDATE SET key_value = excluded.key_value`)
    .run(userId, name, value);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const { key_name } = await req.json();
  db().prepare("DELETE FROM api_keys WHERE user_id = ? AND key_name = ?").run(userId, key_name);
  return NextResponse.json({ ok: true });
}
