import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/fx";
import SignOutButton from "./signout";
import DashboardClient from "./client";

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

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-edge backdrop-blur-xl sticky top-0 z-50" style={{ background: "rgba(7,7,12,.55)" }}>
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>{session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <DashboardClient userName={session.user.name || session.user.email || ""} stats={stats} />
    </div>
  );
}
