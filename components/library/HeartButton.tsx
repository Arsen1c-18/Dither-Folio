"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * HeartButton — a cute like-button that bursts tiny hearts when toggled on.
 * Purely decorative fun; state is local.
 */

const BURST = [
  { x: -18, y: -26, r: -20 },
  { x: 0, y: -34, r: 0 },
  { x: 18, y: -26, r: 20 },
  { x: -26, y: -10, r: -35 },
  { x: 26, y: -10, r: 35 },
];

export function HeartButton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label="like"
      onClick={() => {
        setLiked((v) => !v);
        if (!liked) setBurst((b) => b + 1);
      }}
      className={`relative inline-grid size-11 place-items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)] ${className ?? ""}`}
    >
      <motion.span
        key={liked ? "on" : "off"}
        initial={reduce ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className={`text-lg ${liked ? "text-[var(--color-accent)]" : "text-[var(--color-subtle)]"}`}
      >
        {liked ? "♥" : "♡"}
      </motion.span>

      {/* heart burst */}
      {!reduce &&
        liked &&
        BURST.map((b, i) => (
          <motion.span
            key={`${burst}-${i}`}
            className="pointer-events-none absolute text-xs text-[var(--color-accent)]"
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.5 }}
            animate={{ opacity: 0, x: b.x, y: b.y, rotate: b.r, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            aria-hidden
          >
            ♥
          </motion.span>
        ))}
    </button>
  );
}
