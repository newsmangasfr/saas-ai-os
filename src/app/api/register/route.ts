import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const mail = String(email || "").toLowerCase().trim();
  if (!mail || !password || String(password).length < 8) {
    return NextResponse.json(
      { error: "Email valide et mot de passe de 8+ caractères requis" },
      { status: 400 }
    );
  }
  const exists = db().prepare("SELECT id FROM users WHERE email = ?").get(mail);
  if (exists) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }
  db().prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(mail, hashPassword(String(password)), name || null);
  return NextResponse.json({ ok: true });
}
