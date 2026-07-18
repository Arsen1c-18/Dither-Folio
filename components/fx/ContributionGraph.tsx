"use client";

import { useRef, useMemo } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";


/* ─── Seeded PRNG — deterministic "realistic" data ─────────────────────────
   Mulberry32 gives the same sequence on every render so SSR + hydration
   produce identical output. Seed is based on the site handle so it always
   looks like a real developer's contribution history. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Generate 52 × 7 contribution counts (0-12).
   Real GitHub data is bursty: many zeros, occasional spikes. */
function generateData(seed = 42): number[][] {
  const rand = mulberry32(seed);
  const weeks: number[][] = [];
  for (let w = 0; w < 53; w++) {
    const week: number[] = [];
    const activePct = 0.45 + rand() * 0.35;   // each week 45-80% days active
    const weekIntensity = rand();               // "busy" weeks have higher counts
    for (let d = 0; d < 7; d++) {
      if (rand() > activePct) { week.push(0); continue; }
      const base = weekIntensity * 8;
      const spike = rand() > 0.88 ? rand() * 8 : 0;
      week.push(Math.round(Math.min(12, base + spike + rand() * 2)));
    }
    weeks.push(week);
  }
  return weeks;
}

/* ─── Color scale — 5 stops from near-black → accent red → bright red ─── */
const LEVELS = [
  { min: 0,  max: 0,  bg: "transparent",              border: "rgba(255,255,255,0.07)", glow: 0 },
  { min: 1,  max: 2,  bg: "rgba(180,  20, 20, 0.30)", border: "rgba(200, 40,40,0.45)",  glow: 0 },
  { min: 3,  max: 5,  bg: "rgba(220,  35, 35, 0.55)", border: "rgba(220, 55,55,0.65)",  glow: 0.3 },
  { min: 6,  max: 9,  bg: "rgba(255,  50, 50, 0.78)", border: "rgba(255, 70,70,0.88)",  glow: 0.7 },
  { min: 10, max: 99, bg: "rgba(255,  80, 80, 0.96)", border: "rgba(255,110,80,1.00)",  glow: 1 },
];

function getLevel(count: number) {
  return LEVELS.find(l => count >= l.min && count <= l.max) ?? LEVELS[0];
}

/* ─── Single isometric cell ────────────────────────────────────────────── */
interface CellProps {
  count: number;
  weekIdx: number;
  dayIdx: number;
  inView: boolean;
}

const CELL = 11;       // cell footprint px
const GAP  =  2;       // gap between cells
const STEP = CELL + GAP;

function Cell({ count, weekIdx, dayIdx, inView }: CellProps) {
  const reduce = useReducedMotion();
  const level = getLevel(count);

  // Height: 0 → 2px (zero) → 18px (max 12)
  const barH = count === 0 ? 0 : 2 + (count / 12) * 16;

  // Stagger delay: ripple outward from top-left
  const delay = reduce ? 0 : (weekIdx * 0.012 + dayIdx * 0.018);

  const glowStyle = level.glow > 0
    ? { boxShadow: `0 0 ${4 + level.glow * 8}px ${level.glow * 3}px rgba(255,60,60,${level.glow * 0.55})` }
    : {};

  return (
    <motion.div
      title={count === 0 ? "No contributions" : `${count} contribution${count > 1 ? "s" : ""}`}
      className="relative rounded-sm cursor-default select-none"
      style={{
        width: CELL,
        height: CELL,
        background: level.bg,
        border: `1px solid ${level.border}`,
        ...glowStyle,
        flexShrink: 0,
      }}
      initial={reduce ? false : { opacity: 0, scaleY: 0, y: 6 }}
      animate={inView ? { opacity: 1, scaleY: 1, y: 0 } : { opacity: 0, scaleY: 0, y: 6 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/* ─── Month labels ──────────────────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthLabels(weeks: number[][]): { label: string; col: number }[] {
  const now = new Date();
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (weeks.length - 1 - w) * 7);
    const m = date.getMonth();
    if (m !== lastMonth) { labels.push({ label: MONTHS[m], col: w }); lastMonth = m; }
  }
  return labels;
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function ContributionGraph() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.2 });

  const weeks = useMemo(() => generateData(8472), []);
  const total = useMemo(() => weeks.flat().reduce((s, v) => s + v, 0), [weeks]);
  const labels = useMemo(() => monthLabels(weeks), [weeks]);

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="label-system text-[var(--color-subtle)]">Contributions</span>
        <span className="font-mono text-xs text-[var(--color-accent)]">
          {total.toLocaleString()} this year
        </span>
      </div>

      {/* Graph */}
      <div className="relative">
        {/* Month labels */}
        <div
          className="relative mb-1 h-4"
          style={{ marginLeft: 28 }}  /* align with grid (day labels width) */
        >
          {labels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              className="absolute font-mono text-[0.55rem] text-[var(--color-subtle)]"
              style={{ left: col * STEP }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5" style={{ width: 24 }}>
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="font-mono text-[0.55rem] text-[var(--color-subtle)] leading-none flex items-center"
                style={{ height: STEP }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cell grid */}
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((count, di) => (
                  <Cell
                    key={di}
                    count={count}
                    weekIdx={wi}
                    dayIdx={di}
                    inView={inView}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1.5">
          <span className="font-mono text-[0.55rem] text-[var(--color-subtle)]">Less</span>
          {LEVELS.map((l, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: CELL,
                height: CELL,
                background: l.bg,
                border: `1px solid ${l.border}`,
                boxShadow: l.glow > 0
                  ? `0 0 ${4 + l.glow * 6}px rgba(255,60,60,${l.glow * 0.5})`
                  : undefined,
              }}
            />
          ))}
          <span className="font-mono text-[0.55rem] text-[var(--color-subtle)]">More</span>
        </div>
      </div>
    </div>
  );
}
