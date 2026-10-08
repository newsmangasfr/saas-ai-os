"use client";

import { useEffect, useRef } from "react";

/* Fond 3D : grille perspective + orbes flottants */
export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ perspective: "1200px" }}>
      {/* grille en perspective */}
      <div
        className="absolute inset-x-[-50%] bottom-[-10%] h-[70%] opacity-[.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transform: "rotateX(72deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, rgba(0,0,0,.9), transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,.9), transparent 80%)",
        }}
      />
      {/* orbes */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
      <div className="absolute top-1/3 -left-40 w-[380px] h-[380px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
    </div>
  );
}

/* Carte 3D avec tilt réactif + bordure néon */
export function Card3D({ children, className = "", glow = "139,92,246" }: {
  children: React.ReactNode; className?: string; glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`relative rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(24,24,38,.85), rgba(14,14,24,.75))",
        border: "1px solid var(--border-light)",
        backdropFilter: "blur(16px)",
        boxShadow: `0 12px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)`,
        transformStyle: "preserve-3d",
        transition: "transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s",
      }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current!.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px) scale(1.015)`;
        ref.current!.style.borderColor = `rgba(${glow},.45)`;
        ref.current!.style.boxShadow = `0 20px 60px rgba(0,0,0,.6), 0 0 45px rgba(${glow},.12), inset 0 1px 0 rgba(255,255,255,.08)`;
      }}
      onMouseLeave={() => {
        ref.current!.style.transform = "";
        ref.current!.style.borderColor = "var(--border-light)";
        ref.current!.style.boxShadow = `0 12px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)`;
      }}
    >
      {children}
    </div>
  );
}

/* Icône 3D flottante */
export function Icon3D({ children, glow = "139,92,246", size = 56 }: { children: React.ReactNode; glow?: string; size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, fontSize: size / 2.6,
        background: `linear-gradient(145deg, rgba(${glow},.22), rgba(${glow},.08))`,
        border: `1px solid rgba(${glow},.4)`,
        boxShadow: `0 8px 24px rgba(${glow},.2), inset 0 0 20px rgba(${glow},.1)`,
        textShadow: `0 0 16px rgba(${glow},.8)`,
        transform: "translateZ(30px)",
      }}
    >
      {children}
    </div>
  );
}

/* Chip de statut néon */
export function Chip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={ok
        ? { background: "rgba(16,185,129,.12)", color: "var(--accent-green)", border: "1px solid rgba(16,185,129,.3)", boxShadow: "0 0 12px rgba(16,185,129,.15)" }
        : { background: "rgba(249,115,22,.12)", color: "var(--accent-orange)", border: "1px solid rgba(249,115,22,.3)", boxShadow: "0 0 12px rgba(249,115,22,.12)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ok ? "var(--accent-green)" : "var(--accent-orange)" }} />
      {children}
    </span>
  );
}

/* Bouton néon 3D */
export function NeonButton({ children, onClick, disabled, danger, full, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; danger?: boolean; full?: boolean; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${full ? "w-full" : ""}`}
      style={danger
        ? { background: "rgba(239,68,68,.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,.35)" }
        : { background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", border: "none", boxShadow: "0 6px 24px rgba(139,92,246,.35)" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {children}
    </button>
  );
}

/* Field néon */
export function Field({ children }: { children: React.ReactNode }) {
  return <div className="mb-3.5">{children}</div>;
}
