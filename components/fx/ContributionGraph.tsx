"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";

/* ─── Seeded PRNG ────────────────────────────────────────────────────────── */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateData(seed = 42): number[][] {
  const rand = mulberry32(seed);
  const weeks: number[][] = [];
  for (let w = 0; w < 53; w++) {
    const week: number[] = [];
    const activePct = 0.45 + rand() * 0.35;
    const weekIntensity = rand();
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

/* ─── Color scale ────────────────────────────────────────────────────────── */
const LEVELS = [
  { min: 0,  max: 0,  bg: "transparent",              border: "rgba(255,255,255,0.07)", glow: 0 },
  { min: 1,  max: 2,  bg: "rgba(180, 20, 20, 0.30)",  border: "rgba(200,40,40,0.45)",   glow: 0 },
  { min: 3,  max: 5,  bg: "rgba(220, 35, 35, 0.55)",  border: "rgba(220,55,55,0.65)",   glow: 0.3 },
  { min: 6,  max: 9,  bg: "rgba(255, 50, 50, 0.78)",  border: "rgba(255,70,70,0.88)",   glow: 0.7 },
  { min: 10, max: Infinity, bg: "rgba(255, 80, 80, 0.96)",  border: "rgba(255,110,80,1.00)",  glow: 1 },
];

function getLevel(c: number) {
  return LEVELS.find(l => c >= l.min && c <= l.max) ?? LEVELS[0];
}

const CELL = 11;
const GAP  = 2;
const STEP = CELL + GAP;

/* ─── Cell ──────────────────────────────────────────────────────────────── */
function Cell({ count, weekIdx, dayIdx, flicker, size }: { count: number; weekIdx: number; dayIdx: number; flicker: boolean; size: number }) {
  const reduce = useReducedMotion();
  const level  = getLevel(count);

  /*
   * Wavy diagonal delay — slow sweep so the wave is clearly visible.
   * sin term creates undulating vertical ripple across columns.
   */
  const delay = reduce ? 0 : (
    weekIdx * 0.028                               /* slow L→R sweep   */
    + Math.sin(weekIdx * 0.55 + dayIdx * 0.9) * 0.022  /* wavy ripple */
    + dayIdx * 0.006                              /* slight top→bottom */
  );

  /* Spring easing with visible overshoot — elastic, alive */
  const springEase = [0.34, 1.6, 0.64, 1] as const;

  const hasGlow = level.glow > 0.25;

  /* Deterministic flicker period per cell — SSR-safe */
  const flickerDuration = hasGlow
    ? 1.1 + ((weekIdx * 7 + dayIdx * 3) % 19) * 0.1
    : 0;

  const glowBright = `0 0 ${6 + level.glow * 14}px rgba(255,60,60,${level.glow * 0.88})`;

  return (
    <motion.div
      title={count === 0 ? "No contributions" : `${count} contribution${count !== 1 ? "s" : ""}`}
      className="relative rounded-sm cursor-default select-none"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: level.bg,
        border: `1px solid ${level.border}`,
      }}
      /* Start very small + blurred so the zoom-in is obvious */
      initial={{ opacity: 0, scale: 0.15, y: 8, filter: "blur(3px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        opacity: { duration: 0.7,  delay, ease: springEase },
        scale:   { duration: 0.7,  delay, ease: springEase },
        y:       { duration: 0.65, delay, ease: springEase },
        filter:  { duration: 0.6,  delay, ease: "easeOut"  },
      }}
    >
      {/* Glow flicker — the shadow itself is painted once (static) and only
          its OPACITY animates, which composites on the GPU instead of
          repainting the shadow every frame. Unmounted entirely while the
          graph is off-screen so nothing keeps ticking. */}
      {hasGlow && flicker && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{ boxShadow: glowBright }}
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            delay:    delay + 0.75,
            duration: flickerDuration * 2,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

/* ─── Month labels ───────────────────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthLabels(weeks: number[][]): { label: string; col: number }[] {
  const now = new Date();
  const labels: { label: string; col: number }[] = [];
  let last = -1;
  for (let w = 0; w < weeks.length; w++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (weeks.length - 1 - w) * 7);
    const m = d.getMonth();
    if (m !== last) { labels.push({ label: MONTHS[m], col: w }); last = m; }
  }
  return labels;
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function ContributionGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  // ~50 concurrently animating glow layers is too much for phone GPUs —
  // cells keep the entry reveal there but skip the infinite flicker
  const isMobile = useIsMobile();

  /* useInView on the outer container; fires once when visible */
  const inView = useInView(containerRef, { once: false, amount: 0.15 });

  /* playKey drives the grid's key — incrementing it remounts all cells */
  const [playKey, setPlayKey] = useState(0);
  const hasPlayed = useRef(false);

  /* First play: trigger when container enters viewport */
  useEffect(() => {
    if (inView && !hasPlayed.current) {
      hasPlayed.current = true;
      setPlayKey(k => k + 1);
    }
  }, [inView]);

  /* Real calendar from /api/contributions; seeded data until it arrives
     (and permanently if the API is unconfigured or errors). Replayed via
     playKey so cells re-animate when live data lands. */
  const [live, setLive] = useState<{ weeks: number[][]; total: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/contributions")
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !data?.weeks?.length) return;
        setLive({ weeks: data.weeks, total: data.total });
        setPlayKey(k => k + 1);
      })
      .catch(() => {}); /* keep fallback */
    return () => { cancelled = true; };
  }, []);

  const fallback = useMemo(() => generateData(8472), []);
  const weeks  = live?.weeks ?? fallback;
  const total  = live?.total ?? weeks.flat().reduce((s, v) => s + v, 0);
  const labels = useMemo(() => monthLabels(weeks), [weeks]);

  /* Cells shrink to fit the available width on narrow viewports (so month
     labels can't escape the card) but never grow past the design size, so
     desktop renders exactly as before. */
  const [cellSize, setCellSize] = useState(CELL);
  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const fit = () => {
      const avail = el.clientWidth - 28; /* day-label column + gap */
      const fitted = Math.floor((avail - (weeks.length - 1) * GAP) / weeks.length);
      setCellSize(Math.max(3, Math.min(CELL, fitted)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length]);

  const step = cellSize + GAP;

  /* Labels are ~20px of mono text but columns can shrink to a few px, so a
     label can spill past its month — or past the card. Skip any label that
     would overlap the previous one or hang off the right edge of the grid. */
  const gridWidth = weeks.length * step - GAP;
  const visibleLabels = useMemo(() => {
    const LABEL_W = 20;
    const out: { label: string; col: number }[] = [];
    let lastRight = -Infinity;
    for (const { label, col } of labels) {
      const left = col * step;
      if (left + LABEL_W > gridWidth) continue;
      if (left - lastRight < 6) continue;
      out.push({ label, col });
      lastRight = left + LABEL_W;
    }
    return out;
  }, [labels, step, gridWidth]);

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-5 sm:p-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="label-system text-[var(--color-subtle)]">Contributions</span>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--color-accent)]">
            {total.toLocaleString()} this year
          </span>

          {/* Replay button */}
          <button
            onClick={() => setPlayKey(k => k + 1)}
            title="Replay animation"
            className="flex items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-transparent p-1 text-[var(--color-subtle)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            aria-label="Replay animation"
          >
            {/* Simple refresh SVG icon */}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 2.5A7 7 0 1 0 14.5 9" />
              <polyline points="14.5 2 13.5 2.5 14 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Graph */}
      <div ref={gridWrapRef} className="relative">
        {/* Month labels */}
        <div className="relative mb-1 h-4 overflow-hidden" style={{ marginLeft: 28 }}>
          {visibleLabels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              className="absolute whitespace-nowrap font-mono text-[0.55rem] text-[var(--color-subtle)]"
              style={{ left: col * step }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5" style={{ width: 24 }}>
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="flex items-center font-mono text-[0.55rem] leading-none text-[var(--color-subtle)]"
                style={{ height: step }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cell grid — key change remounts everything → replays animation */}
          <div key={playKey} className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((count, di) => (
                  <Cell key={di} count={count} weekIdx={wi} dayIdx={di} flicker={inView && !isMobile} size={cellSize} />
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
                width: CELL, height: CELL,
                background: l.bg,
                border: `1px solid ${l.border}`,
                boxShadow: l.glow > 0 ? `0 0 ${4 + l.glow * 6}px rgba(255,60,60,${l.glow * 0.5})` : undefined,
              }}
            />
          ))}
          <span className="font-mono text-[0.55rem] text-[var(--color-subtle)]">More</span>
        </div>
      </div>
    </div>
  );
}
