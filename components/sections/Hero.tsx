"use client";

import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/constants/site";
import { DitherBackground } from "@/components/fx/DitherBackground";

/**
 * Full-viewport hero. The Dither shader is used here at its largest —
 * a full-bleed, mouse-reactive backdrop behind the wordmark.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          // Add 2.6s to sync with the loading screen fade out
          transition: { duration: 0.8, delay: delay + 2.6, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Mask-image seamlessly fades the canvas into the background colour of the next section at the bottom */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
        }}
      >
        <div className="pointer-events-auto h-full w-full">
          <DitherBackground preset="hero" overlay={0} />
        </div>
      </div>

      <div className="container-page relative flex flex-col items-center gap-8 text-center">
        <motion.span {...reveal(0.1)} className="label-system flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-[var(--color-accent)]" />
          System_01 — Initialized
        </motion.span>

        <motion.h1 {...reveal(0.22)} className="font-display text-6xl font-medium tracking-tight sm:text-8xl">
          {site.handle}
        </motion.h1>

        <motion.p {...reveal(0.34)} className="max-w-md text-balance text-sm text-[var(--color-muted)] sm:text-base">
          {site.tagline}
        </motion.p>

        <motion.div {...reveal(0.46)} className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)]"
          >
            View work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-[var(--color-border-strong)] px-5 py-2.5 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-foreground)]"
          >
            Get in touch
          </a>
        </motion.div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <span className="label-system">Scroll ↓</span>
      </div>
    </section>
  );
}
