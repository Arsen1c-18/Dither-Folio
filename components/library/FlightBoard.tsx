"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * FlightBoard — split-flap departures board that flips character-by-character
 * to spell its rows, like an airport terminal. Rows re-shuffle on a timer.
 * Great for skills, projects, or status lines.
 */

export type BoardRow = { code: string; label: string; status: string };

const DEFAULT_ROWS: BoardRow[] = [
  { code: "TS", label: "TYPESCRIPT", status: "BOARDING" },
  { code: "RS", label: "RUST", status: "ON TIME" },
  { code: "GO", label: "GOLANG", status: "DELAYED" },
  { code: "PY", label: "PYTHON", status: "ARRIVED" },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

/** One split-flap cell that spins through glyphs before settling. */
function Flap({ target, delay, reduce }: { target: string; delay: number; reduce: boolean }) {
  const [ch, setCh] = useState(reduce ? target : " ");
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;
    if (reduce) {
      setCh(target);
      return;
    }
    let spins = 0;
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => {
        spins += 1;
        if (spins > 6) {
          setCh(target);
          settled.current = true;
          clearInterval(id);
        } else {
          setCh(GLYPHS[Math.floor((spins * 7 + delay) % GLYPHS.length)]);
        }
      }, 50);
    }, delay);
    return () => {
      clearTimeout(start);
      if (id!) clearInterval(id);
    };
  }, [target, delay, reduce]);

  return (
    <span className="relative inline-flex h-6 w-4 items-center justify-center overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-xs text-[var(--color-foreground)]">
      {ch}
      {/* split line */}
      <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-bg)] opacity-60" />
    </span>
  );
}

function FlapWord({ word, width, offset, reduce }: { word: string; width: number; offset: number; reduce: boolean }) {
  const padded = word.padEnd(width).slice(0, width);
  return (
    <span className="flex gap-0.5">
      {padded.split("").map((c, i) => (
        <Flap key={i} target={c} delay={offset + i * 60} reduce={reduce} />
      ))}
    </span>
  );
}

export function FlightBoard({ rows = DEFAULT_ROWS, className }: { rows?: BoardRow[]; className?: string }) {
  const reduce = useReducedMotion();
  // remount rows periodically so the board re-flips
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCycle((c) => c + 1), 9000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg)] ${className ?? ""}`}
      role="table"
      aria-label="departures board"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
        <span className="label-system text-[var(--color-accent)]">Departures</span>
        <span className="font-mono text-[0.6rem] text-[var(--color-subtle)]">TERMINAL 1</span>
      </div>
      <div key={cycle} className="flex flex-col gap-2 p-4">
        {rows.map((r, i) => (
          <div key={r.code} className="flex items-center gap-3" role="row">
            <FlapWord word={r.code} width={2} offset={i * 120} reduce={!!reduce} />
            <FlapWord word={r.label} width={10} offset={i * 120 + 100} reduce={!!reduce} />
            <span className="ml-auto">
              <FlapWord word={r.status} width={8} offset={i * 120 + 400} reduce={!!reduce} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
