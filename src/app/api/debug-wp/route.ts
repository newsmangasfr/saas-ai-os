import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url).searchParams.get("url") || "https://newsmangas.com";
  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const r = await fetch(`${url}/wp-json/wp/v2/posts?per_page=1`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-Agents-OS/1.0)" },
    });
    clearTimeout(timer);
    const body = await r.text();
    return NextResponse.json({ ok: true, status: r.status, ms: Date.now() - t0, bodyStart: body.slice(0, 200) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, name: (e as Error).name, ms: Date.now() - t0 });
  }
}
