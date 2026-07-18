"use client";

import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/constants/site";
import { HeroGlobe } from "@/components/fx/HeroGlobe";

/**
 * Closing strip above the footer — the interactive star-globe, centred,
 * with location/availability captions.
 */
export function GlobeStrip() {
  const reduce = useReducedMotion();

  return (
    <section id="globe" className="relative overflow-hidden">
      <motion.div
        className="relative flex flex-col items-center px-6 pb-6 pt-10 sm:px-10 lg:px-20"
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroGlobe className="size-[min(85vw,32rem)]" />
        <div className="pointer-events-none absolute inset-x-6 bottom-10 flex items-end justify-between sm:inset-x-10 lg:inset-x-20">
          <span className="label-system text-[var(--color-subtle)]">
            {site.location}
          </span>
          <span className="label-system flex items-center gap-2 text-[var(--color-subtle)]">
            <span className="inline-block size-1.5 rounded-full bg-[var(--color-online)]" />
            {site.available ? "Available worldwide" : "Currently booked"}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
