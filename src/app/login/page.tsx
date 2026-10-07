"use client";

import { useState } from "react";
import { Logo } from "@/components/fx";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        const r = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Erreur d'inscription");
      }
      // connexion via NextAuth (form post natif → cookie posé)
      const form = new URLSearchParams({ email, password, callbackUrl: "/dashboard" });
      const r2 = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        redirect: "manual",
      });
      if (r2.status === 302 || r2.status === 0 || r2.status === 307) {
        location.href = "/dashboard";
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass w-full max-w-md p-9">
        <div className="mb-6"><Logo /></div>
        <h1 className="text-xl font-bold mb-1.5">{mode === "login" ? "🔒 Connexion" : "✨ Créer un compte"}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {mode === "login" ? "Entrez vos identifiants" : "8+ caractères pour le mot de passe"}
        </p>
        <div className="space-y-4">
          {mode === "register" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom"
              className="w-full px-3.5 py-3 rounded-xl bg-black/30 border border-edge-light text-white text-sm outline-none focus:border-purple" />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-3.5 py-3 rounded-xl bg-black/30 border border-edge-light text-white text-sm outline-none focus:border-purple" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full px-3.5 py-3 rounded-xl bg-black/30 border border-edge-light text-white text-sm outline-none focus:border-purple" />
        </div>
        {error && <p className="text-red-500 text-[13px] mt-3">{error}</p>}
        <button onClick={submit} disabled={loading}
          className="btn-primary-neon w-full justify-center mt-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 border-0 cursor-pointer">
          {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
        <p className="text-center text-[13px] mt-5 cursor-pointer" style={{ color: "var(--text-secondary)" }}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </p>
      </div>
    </div>
  );
}
