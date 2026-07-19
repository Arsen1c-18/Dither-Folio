"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PixelInvader — a space-invader sprite built from a bitmap grid, toggling
 * between its two classic marching poses with a glitch shudder now and then.
 */

// 11×8 bitmaps; 1 = lit pixel
const POSE_A = [
  "00100000100",
  "00010001000",
  "00111111100",
  "01101110110",
  "11111111111",
  "10111111101",
  "10100000101",
  "00011011000",
];
const POSE_B = [
  "00100000100",
  "10010001001",
  "10111111101",
  "11101110111",
  "11111111111",
  "00111111100",
  "00100000100",
  "01000000010",
];

export function PixelInvader({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [pose, setPose] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (reduce) return;
    // marches faster when hovered, like it's been spotted
    const id = setInterval(() => setPose((p) => p ^ 1), hover ? 160 : 620);
    const gid = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 160);
    }, hover ? 900 : 4200);
    return () => {
      clearInterval(id);
      clearInterval(gid);
    };
  }, [reduce, hover]);

  const grid = pose === 0 ? POSE_A : POSE_B;
  const px = hover ? 7 : 6;

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "inline-block cursor-default select-none transition-transform",
        glitch && "translate-x-0.5 opacity-80",
        className,
      )}
      aria-hidden
    >
      <span
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(11, ${px}px)`, gridAutoRows: `${px}px` }}
      >
        {grid.flatMap((row, y) =>
          row.split("").map((c, x) => (
            <span
              key={`${y}-${x}`}
              className={c === "1" ? "bg-[var(--color-accent)]" : "bg-transparent"}
            />
          )),
        )}
      </span>
    </span>
  );
}
