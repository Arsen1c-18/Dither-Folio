"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * AsciiScope — an oscilloscope drawn entirely in text characters, scrolling a
 * live waveform across a bordered frame. Pure terminal-instrument energy.
 */

const H = 7; // character rows
const W = 44; // character cols
const CHARS = { dot: "·", trace: "█", mid: "─" };

function sample(t: number, x: number) {
  // layered sines so the trace looks organic
  return Math.sin(t * 0.09 + x * 0.35) * 0.7 + Math.sin(t * 0.052 + x * 0.13) * 0.3;
}

export function AsciiScope({ label = "CH1 — SIGNAL", className }: { label?: string; className?: string }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduce) return;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 90) {
        setT((v) => v + 1);
        last = now;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [reduce]);

  // build the character grid
  const rows: string[] = [];
  for (let y = 0; y < H; y++) {
    let row = "";
    for (let x = 0; x < W; x++) {
      const v = sample(t, x); // -1 … 1
      const traceY = Math.round(((v + 1) / 2) * (H - 1));
      if (y === traceY) row += CHARS.trace;
      else if (y === Math.floor(H / 2)) row += CHARS.mid;
      else if (x % 4 === 0) row += CHARS.dot;
      else row += " ";
    }
    rows.push(row);
  }

  return (
    <div
      className={`inline-block select-none rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-4 ${className ?? ""}`}
      role="img"
      aria-label="oscilloscope"
    >
      <div className="mb-2 flex items-center justify-between gap-6">
        <span className="label-system text-[0.55rem] text-[var(--color-accent)]">{label}</span>
        <span className="font-mono text-[0.55rem] text-[var(--color-subtle)]">
          {(2.4 + Math.abs(sample(t, 0)) * 1.4).toFixed(2)}v · 60hz
        </span>
      </div>
      <pre className="font-mono text-[0.6rem] leading-[0.9rem] text-[var(--color-accent)]">
        {rows.map((r, i) => (
          <span key={i} className={i === Math.floor(H / 2) ? "opacity-90" : "opacity-80"}>
            {r}
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}
