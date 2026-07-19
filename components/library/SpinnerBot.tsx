"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SpinnerBot — a boxy robot head whose antenna dish spins and whose eyes scan
 * left → right like a tracking sensor. Techy sibling of the RadialBot.
 */

const EYES = ["[■    ]", "[ ■   ]", "[  ■  ]", "[   ■ ]", "[    ■]", "[   ■ ]", "[  ■  ]", "[ ■   ]"];

export function SpinnerBot({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [scan, setScan] = useState(2);

  useEffect(() => {
    if (reduce || hover) return;
    const id = setInterval(() => setScan((s) => (s + 1) % EYES.length), 240);
    return () => clearInterval(id);
  }, [reduce, hover]);

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("inline-flex cursor-default select-none flex-col items-center gap-0.5", className)}
      aria-hidden
    >
      {/* antenna dish — spins up when watched */}
      <motion.span
        className="font-mono text-base text-[var(--color-subtle)]"
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: hover ? 0.6 : 3, repeat: Infinity, ease: "linear" }}
      >
        ◠
      </motion.span>
      <span className="-mt-1 h-2 w-px bg-[var(--color-subtle)]" />
      {/* head — eye locks onto the cursor's presence */}
      <span className="rounded-md border border-[var(--color-accent)] px-3 py-1.5 font-mono text-lg text-[var(--color-accent)] sm:text-xl">
        {hover ? "[ ◉◉ ]" : EYES[reduce ? 2 : scan]}
      </span>
      {/* jaw */}
      <span className="font-mono text-[0.65rem] tracking-[0.3em] text-[var(--color-subtle)]">
        {hover ? "▪▪▪▪▪" : "▪▪▪"}
      </span>
    </span>
  );
}
