"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { nav } from "@/constants/site";
import { data } from "@/lib/data";
import { getHubEntry } from "@/components/library/hubRegistry";
import { RadialNavBackdrop } from "@/components/layout/RadialNavBackdrop";
import { cn } from "@/lib/utils";

/**
 * RadialNavGlow — the "glow" iteration of the radial nav, preserved in the
 * library: accent-glowing rings, conic energy sweep, backdrop-blur veil.
 * The live version is RadialNav.tsx; the quiet original is RadialNavClassic.
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

export function RadialNavGlow({ className, preview = false }: { className?: string; preview?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  // hub element, chosen in the dashboard's Library tab
  const hub = getHubEntry(data.ui?.navbarBot ?? "radial-bot") ?? getHubEntry("radial-bot")!;

  const paused = open || !!reduce;

  return (
    <div className={cn("relative", className)}>
      <RadialNavBackdrop
        open={open}
        preview={preview}
        style={{
          background:
            "radial-gradient(ellipse at 85% 50%, color-mix(in srgb, var(--color-accent) 6%, transparent) 0%, color-mix(in srgb, var(--color-bg) 55%, transparent) 70%)",
        }}
      />

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
        {/* ambient glow behind the whole dial — brightens when open */}
        <div
          className={cn(
            "absolute -inset-[6%] rounded-full transition-opacity duration-700",
            open ? "opacity-100" : "opacity-45",
          )}
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 14%, transparent) 0%, color-mix(in srgb, var(--color-accent) 5%, transparent) 45%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* ── ring stack, outside in ── */}

        {/* outer ring — accent-tinted with a soft glow shadow */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border transition-all duration-500",
            open
              ? "border-[var(--color-accent)]/60 shadow-[0_0_60px_-10px_var(--color-accent),inset_0_0_40px_-20px_var(--color-accent)]"
              : "border-[var(--color-border-strong)] shadow-[0_0_40px_-18px_var(--color-accent)]",
          )}
        />

        {/* conic energy sweep — a bright arc chasing around the bezel */}
        <div
          className={cn(
            "animate-orbit absolute inset-[1%] rounded-full [animation-duration:14s] transition-opacity duration-500",
            paused && "animation-paused",
            open ? "opacity-30" : "opacity-70",
          )}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, color-mix(in srgb, var(--color-accent) 45%, transparent) 345deg, transparent 360deg)",
            WebkitMask: "radial-gradient(circle, transparent 65%, black 66%)",
            mask: "radial-gradient(circle, transparent 65%, black 66%)",
          }}
          aria-hidden
        />

        {/* fine graduation ring (like a watch bezel), spins slowly */}
        <GraduationRing
          ticks={90}
          length={0.6}
          className={cn(
            "animate-orbit absolute inset-[2.5%] text-[var(--color-subtle)] [animation-duration:120s] transition-opacity duration-500",
            paused && "animation-paused",
            open && "opacity-40",
          )}
        />

        {/* coarse graduation ring, counter-spins */}
        <GraduationRing
          ticks={24}
          length={2.2}
          className={cn(
            "animate-orbit absolute inset-[8%] text-[var(--color-border-strong)] [animation-direction:reverse] [animation-duration:80s] transition-opacity duration-500",
            paused && "animation-paused",
            open && "opacity-40",
          )}
        />

        {/* accent arc — a red quarter-sweep with a glow, orbiting */}
        <div
          className={cn(
            "animate-orbit absolute inset-[8%] [animation-duration:40s] transition-opacity duration-500",
            paused && "animation-paused",
            open && "opacity-25",
          )}
          aria-hidden
        >
          <svg viewBox="0 0 100 100" className="size-full text-[var(--color-accent)] drop-shadow-[0_0_6px_var(--color-accent)]">
            <circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="77 231"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* dashed mid ring */}
        <div
          className={cn(
            "animate-orbit absolute inset-[15%] rounded-full border border-dashed border-[var(--color-border-strong)] [animation-direction:reverse] [animation-duration:70s] transition-opacity duration-500",
            paused && "animation-paused",
            open && "opacity-30",
          )}
        />

        {/* inner solid ring + hub — hub ring lights up when open */}
        <div className="absolute inset-[26%] rounded-full border border-[var(--color-border)] opacity-60" />
        {/* cardinal tick marks over everything */}
        {[0, 90, 180, 270].map((a) => (
          <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
            <span
              className={cn(
                "absolute left-1/2 top-[1%] h-4 w-px -translate-x-1/2 transition-colors duration-500",
                open ? "bg-[var(--color-accent)]" : "bg-[var(--color-subtle)]",
              )}
            />
          </div>
        ))}
        {[45, 135, 225, 315].map((a) => (
          <div key={a} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
            <span className="absolute left-1/2 top-[1%] h-2.5 w-px -translate-x-1/2 bg-[var(--color-faint)]" />
          </div>
        ))}

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
                        <span className={cn(
                          "font-display font-medium tracking-tight text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)] group-hover:drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_50%,transparent)]",
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
