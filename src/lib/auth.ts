import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db, verifyPassword } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: (creds) => {
        const email = String(creds?.email || "").toLowerCase().trim();
        const password = String(creds?.password || "");
        if (!email || !password) return null;
        const user = db().prepare("SELECT * FROM users WHERE email = ?").get(email) as
          | { id: number; email: string; name: string | null; password_hash: string }
          | undefined;
        if (!user || !verifyPassword(password, user.password_hash)) return null;
        return { id: String(user.id), email: user.email, name: user.name || user.email };
      },
    }),
  ],
});
