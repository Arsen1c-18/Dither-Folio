"use client";

import { useReducedMotion } from "framer-motion";

/**
 * RadarScope — a sweeping radar display with labeled contacts that blip as
 * the beam passes them. Extends the site's instrument-dial language.
 * Contacts take an angle (deg from 12 o'clock, clockwise) and dist (0–1).
 */

export type RadarContact = { label: string; angle: number; dist: number };

const DEFAULT_CONTACTS: RadarContact[] = [
  { label: "react", angle: 30, dist: 0.55 },
  { label: "node", angle: 105, dist: 0.75 },
  { label: "rust", angle: 170, dist: 0.4 },
  { label: "three.js", angle: 250, dist: 0.65 },
  { label: "postgres", angle: 320, dist: 0.82 },
];

const SWEEP_S = 6;

export function RadarScope({
  contacts = DEFAULT_CONTACTS,
  size = 280,
  className,
}: {
  contacts?: RadarContact[];
  size?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative select-none overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg)] ${className ?? ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="radar scope"
    >
      <style>{`
        @keyframes radar-sweep { to { transform: rotate(360deg); } }
        @keyframes radar-blip {
          0%, 4% { opacity: 1; }
          10%, 100% { opacity: 0.2; }
        }
      `}</style>

      {/* range rings + crosshairs */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full text-[var(--color-border)]" aria-hidden>
        {[30, 60, 90].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.75" />
        ))}
        <line x1="100" y1="4" x2="100" y2="196" stroke="currentColor" strokeWidth="0.5" />
        <line x1="4" y1="100" x2="196" y2="100" stroke="currentColor" strokeWidth="0.5" />
        {/* bezel graduations */}
        {Array.from({ length: 36 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="2"
            x2="100"
            y2={i % 9 === 0 ? 8 : 5}
            stroke="currentColor"
            strokeWidth="0.75"
            transform={`rotate(${i * 10} 100 100)`}
          />
        ))}
      </svg>

      {/* sweep beam */}
      {!reduce && (
        <div
          className="absolute inset-0"
          style={{ animation: `radar-sweep ${SWEEP_S}s linear infinite` }}
          aria-hidden
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, color-mix(in srgb, var(--color-accent) 28%, transparent) 0deg, transparent 70deg)",
            }}
          />
          {/* leading edge */}
          <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-[var(--color-accent)] opacity-70" />
        </div>
      )}

      {/* contacts — each blips as the beam passes its bearing */}
      {contacts.map((c) => {
        const rad = ((c.angle - 90) * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * c.dist * 46;
        const y = 50 + Math.sin(rad) * c.dist * 46;
        return (
          <div
            key={c.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className="size-1.5 rounded-full bg-[var(--color-accent)]"
              style={
                reduce
                  ? undefined
                  : { animation: `radar-blip ${SWEEP_S}s linear infinite`, animationDelay: `${(c.angle / 360) * SWEEP_S}s`, opacity: 0.2 }
              }
            />
            <span className="font-mono text-[0.55rem] uppercase tracking-widest text-[var(--color-subtle)]">
              {c.label}
            </span>
          </div>
        );
      })}

      {/* hub */}
      <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-foreground)]" />
    </div>
  );
}
