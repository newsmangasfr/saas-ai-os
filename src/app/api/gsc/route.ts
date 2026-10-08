import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/* Récupère les données GSC (Search Analytics) pour une property.
   Utilise la clé du compte de service stockée en base (JWT signé à la volée). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const url = new URL(req.url);
  const siteId = Number(url.searchParams.get("site_id"));

  const keyRow = db().prepare("SELECT key_value FROM api_keys WHERE user_id = ? AND key_name = 'gsc_service_account'").get(userId) as { key_value: string } | undefined;
  const siteRow = db().prepare("SELECT gsc_property FROM sites WHERE id = ? AND user_id = ?").get(siteId, userId) as { gsc_property: string | null } | undefined;

  if (!keyRow) return NextResponse.json({ configured: false, error: "Clé GSC non configurée (onglet SEO)" }, { status: 400 });
  if (!siteRow?.gsc_property) return NextResponse.json({ configured: false, error: "Aucune property GSC définie sur ce site" }, { status: 400 });

  // Signer un JWT avec la clé du compte de service
  let jwt: string;
  try {
    const serviceAccount = JSON.parse(keyRow.key_value);
    const { SignJWT, importPKCS8 } = await import("jose");
    const pk = await importPKCS8(serviceAccount.private_key, "RS256");
    const now = Math.floor(Date.now() / 1000);
    jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/webmasters.readonly", iss: serviceAccount.client_email })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setAudience("https://oauth2.googleapis.com/token")
      .sign(pk);
  } catch {
    return NextResponse.json({ error: "Clé JSON invalide" }, { status: 400 });
  }

  // Échanger le JWT contre un access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error_description?: string };
  if (!tokenData.access_token) {
    return NextResponse.json({ error: tokenData.error_description || "Échec authentification Google" }, { status: 400 });
  }

  // Appeler Search Analytics (28 derniers jours, groupé par date)
  const end = new Date();
  const start = new Date(Date.now() - 28 * 86400000);
  const property = siteRow.gsc_property.startsWith("http") ? siteRow.gsc_property : `sc-domain:${siteRow.gsc_property.replace("sc-domain:", "")}`;

  const gscRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenData.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ["date"],
        rowLimit: 30,
      }),
    }
  );
  const gscData = (await gscRes.json()) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
  const rows = gscData.rows || [];

  const daily = rows.map((r) => ({
    date: r.keys[0].slice(5), // MM-DD
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }));

  const totals = daily.reduce(
    (acc, d) => ({ clicks: acc.clicks + d.clicks, impressions: acc.impressions + d.impressions }),
    { clicks: 0, impressions: 0 }
  );

  return NextResponse.json({
    configured: true,
    property,
    daily,
    totals: {
      ...totals,
      ctr: totals.impressions ? Math.round((totals.clicks / totals.impressions) * 1000) / 10 : 0,
      position: daily.length ? Math.round((daily.reduce((a, d) => a + d.position, 0) / daily.length) * 10) / 10 : 0,
    },
  });
}
