import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/fx";
import SignOutButton from "./signout";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = Number(session.user.id);
  const d = db();
  const stats = {
    sites: (d.prepare("SELECT COUNT(*) c FROM sites WHERE user_id = ?").get(userId) as { c: number }).c,
    articles: (d.prepare("SELECT COUNT(*) c FROM articles WHERE user_id = ?").get(userId) as { c: number }).c,
    published: (d.prepare("SELECT COUNT(*) c FROM articles WHERE user_id = ? AND wp_post_id IS NOT NULL").get(userId) as { c: number }).c,
    jobs: (d.prepare("SELECT COUNT(*) c FROM jobs WHERE user_id = ? AND status = 'pending'").get(userId) as { c: number }).c,
  };
  const recent = d.prepare("SELECT id, title, status, source, wp_post_id, created_at FROM articles WHERE user_id = ? ORDER BY id DESC LIMIT 6").all(userId) as {
    id: number; title: string; status: string; source: string; wp_post_id: number | null; created_at: string;
  }[];

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-edge backdrop-blur-xl sticky top-0 z-50" style={{ background: "rgba(7,7,12,.55)" }}>
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>{session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Mission Control</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Bienvenue {session.user.name} — vos agents sont prêts.</p>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { n: stats.sites, l: "Sites connectés", c: "16,185,129" },
            { n: stats.articles, l: "Articles", c: "59,130,246" },
            { n: stats.published, l: "Publiés WP", c: "16,185,129" },
            { n: stats.jobs, l: "Jobs en file", c: "249,115,22" },
          ].map((s) => (
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

        <h2 className="text-xs font-bold uppercase tracking-[1.5px] mb-4" style={{ color: "var(--text-muted)" }}>Articles récents</h2>
        {recent.length === 0 ? (
          <div className="glass p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun article. Les agents arrivent bientôt : connectez un site et lancez votre premier job.
          </div>
        ) : (
          <div className="glass divide-y" style={{ borderColor: "var(--border)" }}>
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="truncate mr-4">{a.title}</span>
                <span className="flex items-center gap-3 shrink-0">
                  {a.wp_post_id && <span className="text-[11px] font-mono" style={{ color: "var(--accent-green)" }}>WP #{a.wp_post_id}</span>}
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={a.wp_post_id
                      ? { background: "rgba(16,185,129,.15)", color: "var(--accent-green)" }
                      : { background: "rgba(249,115,22,.15)", color: "var(--accent-orange)" }}>
                    {a.wp_post_id ? "Publié" : a.status === "draft" ? "Brouillon" : a.status}
                  </span>
                  <span className="text-xs font-mono hidden md:inline" style={{ color: "var(--text-muted)" }}>{a.source}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
