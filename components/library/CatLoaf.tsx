"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CatLoaf — an ASCII cat loafing contentedly, tail flicking, ears twitching.
 * Blinks slowly. Purrs (˚ᶻ˚) when hovered.
 */

const IDLE = [
  "  /\\_/\\  \n ( o.o ) \n  > ^ <  ",
  "  /\\_/\\  \n ( o.o ) \n  > ^ <  ",
  "  /\\_/\\  \n ( -.- ) \n  > ^ <  ",
  "  /\\_/\\  \n ( o.o ) \n  > ^ <  ",
];

const PURR = [
  "  /\\_/\\  \n ( ^.^ ) \n  > ^ <  ",
  "  /\\_/\\  \n ( ^ᴗ^ ) \n  > ^ <  ",
];

export function CatLoaf({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFrame((f) => f + 1), hover ? 350 : 900);
    return () => clearInterval(id);
  }, [reduce, hover]);

  const frames = hover ? PURR : IDLE;

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("relative inline-block cursor-default select-none", className)}
      aria-label="cat"
    >
      <pre className="font-mono text-sm leading-5 text-[var(--color-accent)] sm:text-base sm:leading-6">
        {frames[frame % frames.length]}
      </pre>
      {hover && (
        <span className="absolute -right-8 -top-1 font-mono text-xs text-[var(--color-subtle)]">
          prrr
        </span>
      )}
    </span>
  );
}
