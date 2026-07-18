"use client";

import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/constants/site";
import { DitherBackground } from "@/components/fx/DitherBackground";
import { RadialNav } from "@/components/layout/RadialNav";

/**
 * Full-viewport hero — text left over the dither shader backdrop,
 * spinning radial navigation dial on the right (morphs into the menu
 * on hover, replacing a traditional navbar).
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          // Add 2.6s to sync with the loading screen fade out
          transition: { duration: 0.8, delay: delay + 2.6, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Dither shader backdrop, faded into the next section at the bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        }}
      >
        <div className="pointer-events-auto h-full w-full">
          <DitherBackground preset="hero" overlay={0} />
        </div>
      </div>

      <div className="pointer-events-none relative grid min-h-screen grid-cols-1 items-center px-6 sm:px-10 md:grid-cols-[1.1fr_1fr] lg:px-20">
        {/* ── text, left-aligned ── */}
        <div className="pointer-events-auto relative z-10 max-w-2xl pt-28 md:pt-0">
          <motion.span {...reveal(0.1)} className="label-system flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-[var(--color-accent)]" />
            System_01 — Initialized
          </motion.span>

          <motion.h1
            {...reveal(0.22)}
            className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
          >
            {site.handle}
          </motion.h1>

          <motion.p
            {...reveal(0.34)}
            className="mt-6 max-w-md text-balance text-sm text-[var(--color-muted)] sm:text-base"
          >
            {site.tagline}
          </motion.p>

          <motion.div {...reveal(0.46)} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="group rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)]"
            >
              View work{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[var(--color-border-strong)] px-5 py-2.5 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-foreground)]"
            >
              Get in touch
            </a>
          </motion.div>
        </div>

        {/* ── right: half-visible radial nav dial, bleeding off-screen ── */}
        <motion.div
          className="relative hidden md:block"
          initial={reduceMotion ? false : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 3, ease: [0.22, 1, 0.36, 1] }}
        >
          <RadialNav className="pointer-events-auto absolute right-[max(-33vw,-38rem)] top-1/2 size-[min(66vw,76rem)] -translate-y-1/2" />
        </motion.div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <span className="label-system">Scroll ↓</span>
      </div>
    </section>
  );
}
