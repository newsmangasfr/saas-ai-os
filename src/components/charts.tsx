"use client";

import { useEffect, useRef } from "react";

/* Graphique en barres néon (données GSC simulées ou réelles) */
export function BarChart({ data, labels, color = "139,92,246", height = 160 }: {
  data: number[]; labels: string[]; color?: string; height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: `rgb(${color})` }}>{v}</span>
          <div
            className="w-full rounded-t-md transition-all duration-500 hover:brightness-125"
            style={{
              height: `${(v / max) * (height - 40)}px`,
              background: `linear-gradient(to top, rgba(${color},.15), rgba(${color},.75))`,
              boxShadow: `0 0 14px rgba(${color},.25)`,
              minHeight: 4,
            }}
          />
          <span className="text-[9px] truncate w-full text-center" style={{ color: "var(--text-muted)" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* Courbe d'évolution (SVG, style GSC) */
export function LineChart({ data, labels, color = "59,130,246", height = 160 }: {
  data: number[]; labels: string[]; color?: string; height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 400, h = height - 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * (w - 20) + 10;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return { x, y, v };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1]?.x || 0},${h} L${pts[0]?.x || 0},${h} Z`;

  return (
    <div>
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${color},.35)`} />
            <stop offset="100%" stopColor={`rgba(${color},0)`} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#grad-${color})`} />
        <path d={path} fill="none" stroke={`rgb(${color})`} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px rgba(${color},.5))` }} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={`rgb(${color})`} opacity="0.9">
            <title>{`${labels[i]}: ${p.v}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {labels.map((l, i) => (
          <span key={i} className="text-[9px]" style={{ color: "var(--text-muted)" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* Donut / anneau de progression */
export function Donut({ value, max, label, color = "16,185,129", size = 90 }: {
  value: number; max: number; label: string; color?: string; size?: number;
}) {
  const pct = Math.min(value / (max || 1), 1);
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`rgb(${color})`} strokeWidth="6"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px rgba(${color},.5))`, transition: "stroke-dasharray .8s ease" }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize={size / 4.5} fontWeight="700" style={{ transform: `rotate(90deg)`, transformOrigin: "center" }}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

/* Sparkline compacte pour les cartes stat */
export function Sparkline({ data, color = "139,92,246" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 80, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1 || 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline points={pts} fill="none" stroke={`rgb(${color})`} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
