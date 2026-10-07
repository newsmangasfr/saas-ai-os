"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ===== Fond de particules (flow network) ===== */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    const COLORS = ["139,92,246", "59,130,246", "16,185,129"];
    const resize = () => {
      W = canvas.width = innerWidth;
      H = canvas.height = innerHeight;
    };
    resize();
    addEventListener("resize", resize);
    const P = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      c: COLORS[i % 3],
      a: Math.random() * 0.35 + 0.12,
      ph: Math.random() * 6.28,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.ph += 0.02;
        for (let j = i + 1; j < P.length; j++) {
          const q = P[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 140) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / 140) * 0.07})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + Math.sin(p.ph) * 0.4, 0, 6.283);
        ctx.fillStyle = `rgba(${p.c},${p.a + Math.sin(p.ph) * 0.08})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" />;
}

/* ===== Carte 3D tilt ===== */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`glass tilt ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current!.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px) scale(1.02)`;
      }}
      onMouseLeave={() => { ref.current!.style.transform = ""; }}
    >
      {children}
    </div>
  );
}

/* ===== Cube 3D holographique ===== */
export function HoloCube() {
  const faces = ["📈", "🤖", "🔍", "✍️", "🌐", "⚡"];
  const transforms = [
    "translateZ(60px)", "rotateY(90deg) translateZ(60px)", "rotateY(180deg) translateZ(60px)",
    "rotateY(-90deg) translateZ(60px)", "rotateX(90deg) translateZ(60px)", "rotateX(-90deg) translateZ(60px)",
  ];
  return (
    <div className="mx-auto mt-16 w-[120px] h-[120px]" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d", animation: "cubeSpin 14s linear infinite" }}
      >
        {faces.map((f, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center text-[34px] rounded-2xl"
            style={{
              transform: transforms[i],
              background: "rgba(139,92,246,.08)",
              border: "1px solid rgba(139,92,246,.35)",
              boxShadow: "inset 0 0 40px rgba(139,92,246,.1)",
              backdropFilter: "blur(4px)",
            }}
          >{f}</div>
        ))}
      </div>
      <style>{`@keyframes cubeSpin { from { transform: rotateX(-20deg) rotateY(0);} to { transform: rotateX(-20deg) rotateY(360deg);} }`}</style>
    </div>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 font-bold text-[15px]">
      <span
        className="w-[26px] h-[26px] rounded-full"
        style={{
          background: "conic-gradient(from 180deg, #8b5cf6, #3b82f6, #10b981, #8b5cf6)",
          boxShadow: "0 0 18px rgba(139,92,246,.6)",
          animation: "spin 6s linear infinite",
        }}
      />
      {!compact && <>AI Agents <b>OS</b></>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

export { Link };
