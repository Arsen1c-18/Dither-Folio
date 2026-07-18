"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay before the entrance fires (seconds) */
  delay?: number;
  /** Which axis the clip-path wipes from */
  direction?: "up" | "left";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * SectionReveal — wraps section content with a two-phase entrance:
 *
 * Phase 1 (scanline): a bright 1-px horizontal rule sweeps across the element,
 *   signalling "this panel is being initialised".
 * Phase 2 (wipe): the children rise through a clip-path reveal with a
 *   simultaneous blur-dissolve so they appear to materialise out of the scan.
 *
 * Built on Framer Motion `whileInView` so it only plays once, is
 * `prefers-reduced-motion`-safe, and has no layout side-effects.
 */
export function SectionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: SectionRevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  /* ── Scanline variants ───────────────────────────────────────── */
  const scanlineVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 0.65,
        delay,
        ease: EASE,
        opacity: { times: [0, 0.1, 0.8, 1], duration: 0.65, delay },
      },
    },
  };

  /* ── Content wipe variants ───────────────────────────────────── */
  const contentVariants: Variants =
    direction === "up"
      ? {
          hidden: {
            clipPath: "inset(100% 0% 0% 0%)",
            opacity: 0,
            filter: "blur(12px)",
            y: 20,
          },
          visible: {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
              duration: 0.9,
              delay: delay + 0.35,
              ease: EASE,
            },
          },
        }
      : {
          hidden: {
            clipPath: "inset(0% 100% 0% 0%)",
            opacity: 0,
            filter: "blur(12px)",
          },
          visible: {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              duration: 0.9,
              delay: delay + 0.35,
              ease: EASE,
            },
          },
        };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Phase 1 — scanline */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--color-accent) 20%, #fff 50%, var(--color-accent) 80%, transparent 100%)",
          boxShadow: "0 0 12px 2px rgba(255,59,59,0.7), 0 0 40px 6px rgba(255,59,59,0.25)",
        }}
        variants={scanlineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      />

      {/* Phase 2 — content wipe */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ willChange: "clip-path, opacity, filter, transform" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
