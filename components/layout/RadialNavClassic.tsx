"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { nav } from "@/constants/site";
import { data } from "@/lib/data";
import { getHubEntry } from "@/components/library/hubRegistry";
import { RadialNavBackdrop } from "@/components/layout/RadialNavBackdrop";
import { cn } from "@/lib/utils";

/**
 * RadialNavClassic — the original quiet-instrument version of the radial nav,
 * preserved in the library. Hairline rings, subtle graduations, no glow.
 * The live version is RadialNav.tsx.
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

/** Minute-style graduation ring rendered as an SVG dash pattern. */
function GraduationRing({ className, ticks, length, style }: {
  className?: string;
  ticks: number;
  length: number;
  style?: CSSProperties;
}) {
  const r = 49;
  const circumference = 2 * Math.PI * r;
  const tick = length;
  const gap = circumference / ticks - tick;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray={`${tick} ${gap}`}
      />
    </svg>
  );
}

export function RadialNavClassic({ className, preview = false }: { className?: string; preview?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // hub element, chosen in the dashboard's Library tab
  const hub = getHubEntry(data.ui?.navbarBot ?? "radial-bot") ?? getHubEntry("radial-bot")!;

  const paused = !!reduce;

  useEffect(() => {
    const animations = Array.from(navRef.current?.querySelectorAll(".classic-orbit") ?? [])
      .flatMap((element) => element.getAnimations());
    if (animations.length === 0) return;

    const targetRate = reduce ? 0 : open ? 0.3 : 1;
    const startingRates = animations.map((animation) => animation.playbackRate);
    const startedAt = performance.now();
    const duration = 1000;
    let frameId = 0;

    const updateRate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      animations.forEach((animation, index) => {
        animation.playbackRate = startingRates[index] + (targetRate - startingRates[index]) * easedProgress;
      });
      if (progress < 1) frameId = requestAnimationFrame(updateRate);
    };

    frameId = requestAnimationFrame(updateRate);
    return () => cancelAnimationFrame(frameId);
  }, [open, reduce]);

  return (
    <div className={cn("relative", className)}>
      <RadialNavBackdrop open={open} preview={preview} className="bg-[var(--color-bg)]/35" />

    <nav
      ref={navRef}
      aria-label="Primary"
      className="absolute inset-0 z-40 select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      {/* ── ring stack, outside in ── */}

      {/* outer hairline */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border transition-all duration-500",
          open ? "border-[var(--color-foreground)] opacity-90" : "border-[var(--color-muted)] opacity-80",
        )}
      />

      {/* fine graduation ring (like a watch bezel), spins slowly */}
      <GraduationRing
        ticks={90}
        length={0.6}
        className={cn(
          "classic-orbit absolute inset-[2.5%] text-[var(--color-muted)] transition-all duration-500",
          paused && "animation-paused",
          open && "text-[var(--color-foreground)] opacity-95",
        )}
        style={{ animationDuration: "72s" }}
      />

      {/* coarse graduation ring, counter-spins */}
      <GraduationRing
        ticks={24}
        length={2.2}
        className={cn(
          "classic-orbit absolute inset-[8%] text-[var(--color-subtle)] [animation-direction:reverse] transition-all duration-500",
          paused && "animation-paused",
          open && "text-[var(--color-muted)] opacity-85",
        )}
        style={{ animationDuration: "54s" }}
      />

      {/* dashed mid ring */}
      <div
        className={cn(
          "classic-orbit absolute inset-[15%] rounded-full border border-dashed border-[var(--color-subtle)] [animation-direction:reverse] transition-all duration-500",
          paused && "animation-paused",
          open && "border-[var(--color-muted)] opacity-80",
        )}
        style={{ animationDuration: "45s" }}
      />

      {/* inner solid ring + hub */}
      <div className="absolute inset-[26%] rounded-full border border-[var(--color-muted)] opacity-70" />

      {/* cardinal tick marks over everything */}
      {[0, 90, 180, 270].map((a) => (
        <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
          <span className="absolute left-1/2 top-[1%] h-4 w-px -translate-x-1/2 bg-[var(--color-muted)]" />
        </div>
      ))}
      {[45, 135, 225, 315].map((a) => (
        <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
          <span className="absolute left-1/2 top-[1%] h-2.5 w-px -translate-x-1/2 bg-[var(--color-subtle)]" />
        </div>
      ))}

      {/* ── library element, centered on the dial hub ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="hub"
              className={cn(
                "pointer-events-auto absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                preview ? "left-1/2" : "left-[45%]",
              )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3 }}
            aria-hidden
          >
            {(hub.renderNavbar ?? hub.render)()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── visible-half content: game menu ── */}
      <div className="pointer-events-none absolute inset-y-0 left-[6%] flex w-[38%] flex-col justify-center gap-6">
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
                      <span className={cn(
                        "font-display font-medium tracking-tight text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)]",
                        preview ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl",
                      )}>
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
