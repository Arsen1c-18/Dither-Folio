"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { nav } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * RadialNav — a large, layered spinning dial meant to sit half off-screen
 * at the hero's right edge. Idle it reads as a decorative instrument;
 * hovering freezes it and brings up a game-style menu in the visible half.
 */

const FRAMES = ["└[ ■ _ ■ ]┐", "┌[ ■ _ ■ ]┘", "└[ ■ _ ■ ]┘", "┌[ ■ _ ■ ]┐"];

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
function GraduationRing({ className, ticks, length }: { className?: string; ticks: number; length: number }) {
  const r = 49;
  const circumference = 2 * Math.PI * r;
  const tick = length;
  const gap = circumference / ticks - tick;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
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

export function RadialNav({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce || !open) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 380);
    return () => clearInterval(id);
  }, [reduce, open]);

  const paused = open || !!reduce;

  return (
    <nav
      aria-label="Primary"
      className={cn("relative select-none", className)}
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
          open ? "border-[var(--color-border)] opacity-60" : "border-[var(--color-border-strong)]",
        )}
      />

      {/* fine graduation ring (like a watch bezel), spins slowly */}
      <GraduationRing
        ticks={90}
        length={0.6}
        className={cn(
          "animate-orbit absolute inset-[2.5%] text-[var(--color-border-strong)] [animation-duration:120s] transition-opacity duration-500",
          paused && "animation-paused",
          open && "opacity-40",
        )}
      />

      {/* coarse graduation ring, counter-spins */}
      <GraduationRing
        ticks={24}
        length={2.2}
        className={cn(
          "animate-orbit absolute inset-[8%] text-[var(--color-faint)] [animation-direction:reverse] [animation-duration:80s] transition-opacity duration-500",
          paused && "animation-paused",
          open && "opacity-40",
        )}
      />

      {/* accent arc — a single red quarter-sweep that orbits */}
      <div
        className={cn(
          "animate-orbit absolute inset-[8%] [animation-duration:40s] transition-opacity duration-500",
          paused && "animation-paused",
          open && "opacity-25",
        )}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="size-full text-[var(--color-accent)]">
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="77 231"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* dashed mid ring */}
      <div
        className={cn(
          "animate-orbit absolute inset-[15%] rounded-full border border-dashed border-[var(--color-border)] [animation-direction:reverse] [animation-duration:70s] transition-opacity duration-500",
          paused && "animation-paused",
          open && "opacity-30",
        )}
      />

      {/* inner solid ring + hub */}
      <div className="absolute inset-[26%] rounded-full border border-[var(--color-border)] opacity-50" />
      <div className="absolute inset-[42%] rounded-full border border-[var(--color-border)] opacity-30" />

      {/* cardinal tick marks over everything */}
      {[0, 90, 180, 270].map((a) => (
        <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
          <span className="absolute left-1/2 top-[1%] h-4 w-px -translate-x-1/2 bg-[var(--color-subtle)]" />
        </div>
      ))}
      {[45, 135, 225, 315].map((a) => (
        <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
          <span className="absolute left-1/2 top-[1%] h-2.5 w-px -translate-x-1/2 bg-[var(--color-faint)]" />
        </div>
      ))}

      {/* ── visible-half content: bot (hover only) + game menu ── */}
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
              <motion.span
                className="font-mono text-lg text-[var(--color-accent)] sm:text-2xl"
                animate={reduce ? {} : { y: frame % 2 === 0 ? -3 : 3 }}
                transition={{ duration: 0.3 }}
                aria-hidden
              >
                {FRAMES[reduce ? 0 : frame]}
              </motion.span>

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
  );
}
