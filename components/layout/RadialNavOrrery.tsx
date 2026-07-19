"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { nav } from "@/constants/site";
import { data } from "@/lib/data";
import { getHubEntry } from "@/components/library/hubRegistry";
import { RadialNavBackdrop } from "@/components/layout/RadialNavBackdrop";
import { cn } from "@/lib/utils";

/**
 * RadialNavOrrery — the monochrome astrolabe iteration of the radial nav,
 * preserved in the library: segmented bezel arcs, orbiting moons, survey
 * sweep. The live version is RadialNav.tsx; earlier iterations are
 * RadialNavClassic and RadialNavGlow.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const listItem: Variants = {
  hidden: { opacity: 0, x: -16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

/** Four evenly spaced bezel arcs with gaps, like a segmented instrument ring. */
function SegmentedRing({ className, width = 1.2 }: { className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="49"
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        // 4 arcs of ~62° with ~28° gaps
        strokeDasharray="53 24"
        strokeDashoffset="26"
      />
    </svg>
  );
}

/** A hairline orbit path with a small moon sitting on it. */
function Orbit({
  inset,
  duration,
  moonSize,
  className,
}: {
  inset: string;
  duration: string;
  moonSize: string;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-orbit absolute rounded-full", className)}
      style={{ inset, animationDuration: duration }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full border border-[var(--color-border)]" />
      {/* moon riding the path's top edge */}
      <span
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-muted)]"
        style={{ width: moonSize, height: moonSize }}
      />
    </div>
  );
}

export function RadialNavOrrery({ className, preview = false }: { className?: string; preview?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  // hub element, chosen in the dashboard's Library tab
  const hub = getHubEntry(data.ui?.navbarBot ?? "radial-bot") ?? getHubEntry("radial-bot")!;

  return (
    <div className={cn("relative", className)}>
      <RadialNavBackdrop open={open} preview={preview} className="bg-[var(--color-bg)]/35" />

    <nav
      aria-label="Primary"
      className="absolute inset-0 z-40 select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
        {/* ── slow base layer: always turning, even while open ── */}

        {/* segmented outer bezel — the dial's signature shape */}
        <SegmentedRing
          className={cn(
            "animate-orbit absolute inset-0 text-[var(--color-border-strong)] [animation-duration:90s] transition-colors duration-500",
            reduce && "animation-paused",
            open && "text-[var(--color-subtle)]",
          )}
        />

        {/* counter-turning inner segment ring */}
        <SegmentedRing
          width={0.8}
          className={cn(
            "animate-orbit absolute inset-[5%] text-[var(--color-border)] [animation-direction:reverse] [animation-duration:140s]",
            reduce && "animation-paused",
          )}
        />

        {/* full-diameter crosshair, rotated 45° — static frame */}
        {[45, 135].map((a) => (
          <div key={a} className="absolute inset-[9%]" style={{ transform: `rotate(${a}deg)` }} aria-hidden>
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-border)] opacity-40" />
          </div>
        ))}

        {/* ── lively layer: fades back when the menu opens ── */}
        <div className={cn("transition-opacity duration-500", open ? "opacity-30" : "opacity-100")}>
          {/* survey sector — a faint wedge sweeping the field */}
          <div
            className={cn(
              "animate-orbit absolute inset-[9%] rounded-full [animation-duration:36s]",
              reduce && "animation-paused",
            )}
            style={{
              background:
                "conic-gradient(from 0deg, color-mix(in srgb, var(--color-foreground) 7%, transparent) 0deg, transparent 55deg)",
            }}
            aria-hidden
          />

          {/* orbit paths with moons, each on its own clock */}
          <Orbit inset="12%" duration="28s" moonSize="7px" />
          <Orbit inset="22%" duration="52s" moonSize="5px" className="[animation-direction:reverse]" />
          <Orbit inset="33%" duration="75s" moonSize="4px" />
        </div>

        <span
          className={cn(
            "absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-subtle)] transition-opacity duration-300",
            open && "opacity-0",
          )}
        />

        {/* ── library element, centered on the dial hub ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="hub"
              className={cn(
                "pointer-events-auto absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
                preview ? "left-1/2" : "left-[45%]",
              )}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              aria-hidden
            >
              {(hub.renderNavbar ?? hub.render)()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── visible-half content: game menu ── */}
        <div className="pointer-events-none absolute inset-y-0 left-[6%] z-10 flex w-[38%] flex-col justify-center gap-6">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col gap-6"
              >
                <motion.ul
                  className="pointer-events-auto flex flex-col gap-2"
                  variants={list}
                  initial="hidden"
                  animate="show"
                >
                  {nav.map((item, i) => (
                    <motion.li key={item.id} variants={listItem}>
                      <a
                        href={`#${item.id}`}
                        className="group flex origin-left items-center gap-3 py-0.5 transition-transform duration-200 ease-out hover:scale-[1.18]"
                      >
                        {/* game-cursor marker */}
                        <span
                          className="font-mono text-sm text-[var(--color-accent)] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                          aria-hidden
                        >
                          ▸
                        </span>
                        <span className="label-system text-[0.6rem] text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-2xl font-medium tracking-tight text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)] sm:text-3xl">
                          {item.label}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ) : (
              <motion.span
                key="hint"
                className="label-system text-[var(--color-faint)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                Hover to navigate
              </motion.span>
            )}
          </AnimatePresence>
        </div>
    </nav>
    </div>
  );
}
