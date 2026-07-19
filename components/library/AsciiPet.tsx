"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AsciiPet — a tiny ASCII critter that idles, blinks, and perks up on hover.
 * Cute counterpart to the RadialNav bot; drop it anywhere inline.
 */

const IDLE = ["(•ᴗ•)", "(•ᴗ•)", "(•ᴗ•)", "(-ᴗ-)"];
const HAPPY = ["(≧ᴗ≦)", "(≧▽≦)"];

export function AsciiPet({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFrame((f) => f + 1), hover ? 300 : 700);
    return () => clearInterval(id);
  }, [reduce, hover]);

  const frames = hover ? HAPPY : IDLE;

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "inline-flex cursor-default select-none items-center gap-2 font-mono text-lg text-[var(--color-accent)] sm:text-2xl",
        className,
      )}
      aria-label="mascot"
    >
      {frames[frame % frames.length]}
      {hover && <span className="text-xs text-[var(--color-subtle)]">hi!</span>}
    </span>
  );
}
