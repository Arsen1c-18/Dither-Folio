"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** The animated ASCII bot — cycles frames with a gentle bounce. */

const FRAMES = ["└[ ■ _ ■ ]┐", "┌[ ■ _ ■ ]┘", "└[ ■ _ ■ ]┘", "┌[ ■ _ ■ ]┐"];

export function RadialBot({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 380);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <motion.span
      className={cn("font-mono text-lg text-[var(--color-accent)] sm:text-2xl", className)}
      animate={reduce ? {} : { y: frame % 2 === 0 ? -3 : 3 }}
      transition={{ duration: 0.3 }}
      aria-hidden
    >
      {FRAMES[reduce ? 0 : frame]}
    </motion.span>
  );
}
