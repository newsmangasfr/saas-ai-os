"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/fx";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [error, setError] = useState("");

  // Charger le csrf token au montage (requis par NextAuth pour le POST form)
  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((j) => setCsrf(j.csrfToken));
  }, []);

  async function handleRegister() {
    const regForm = document.getElementById("registerFields") as unknown as HTMLFormElement;
    const fd = new FormData(regForm);
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          name: fd.get("name"),
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.error || "Erreur d'inscription");
        setLoading(false);
        return;
      }
      // inscription OK → soumettre le form de login natif
      const loginForm = document.getElementById("nativeLoginForm") as unknown as HTMLFormElement;
      loginForm.submit();
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-3 rounded-xl bg-black/30 border border-edge-light text-white text-sm outline-none focus:border-purple";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass w-full max-w-md p-9">
        <div className="mb-6"><Logo /></div>
        <h1 className="text-xl font-bold mb-1.5">
          {mode === "login" ? "🔒 Connexion" : "✨ Créer un compte"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {mode === "login"
            ? "Entrez vos identifiants"
            : "8+ caractères pour le mot de passe"}
        </p>

        {error && <p className="text-red-500 text-[13px] mb-4">{error}</p>}

        {/* Formulaire NATIF — POST navigateur vers NextAuth, zéro fetch, cookies gérés par le navigateur */}
        <form
          id="nativeLoginForm"
          method="post"
          action="/api/auth/callback/credentials"
        >
          <input type="hidden" name="csrfToken" value={csrf} />
          {mode === "register" && (
            <div id="registerFields" className="mb-4">
              <input name="name" placeholder="Votre nom" className={inputCls} />
            </div>
          )}
          <div className="mb-4">
            <input name="email" type="email" required placeholder="Email" className={inputCls} />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              required
              placeholder="Mot de passe"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !csrf}
            className="btn-primary-neon w-full justify-center py-3 rounded-xl font-semibold text-sm disabled:opacity-50 border-0 cursor-pointer"
          >
            {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p
          className="text-center text-[13px] mt-5 cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        >
          {mode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </p>
      </div>
    </div>
  );
}
