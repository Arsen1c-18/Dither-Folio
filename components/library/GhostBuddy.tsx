"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * GhostBuddy — a little ghost that floats up and down, occasionally peeking
 * left and right. Sibling of the RadialBot, softer energy.
 */

const FACES = ["◉ ◉", "◉ ◉", "◉ ◉", "− −", "◉ ◉", "◉◉ ", " ◉◉"];

export function GhostBuddy({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [face, setFace] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFace((f) => (f + 1) % FACES.length), 700);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <motion.span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("relative inline-block cursor-default select-none", className)}
      animate={reduce ? {} : hover ? { y: -10, scale: 1.1 } : { y: [0, -6, 0] }}
      transition={
        hover
          ? { type: "spring", stiffness: 300, damping: 12 }
          : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
      aria-hidden
    >
      <svg viewBox="0 0 48 52" className="w-16 text-[var(--color-accent)] sm:w-20" fill="currentColor">
        {/* ghost shell */}
        <path d="M24 2C13 2 6 10.5 6 21v24l6-5 6 5 6-5 6 5 6-5 6 5V21C42 10.5 35 2 24 2z" opacity="0.9" />
      </svg>
      {/* face — startled wide eyes on hover */}
      <span className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 font-mono text-xs tracking-tighter text-[var(--color-bg)] sm:text-sm">
        {hover ? "⊙ ⊙" : FACES[reduce ? 0 : face]}
      </span>
      {hover && (
        <span className="absolute -right-5 -top-2 font-mono text-xs text-[var(--color-subtle)]">!</span>
      )}
    </motion.span>
  );
}
