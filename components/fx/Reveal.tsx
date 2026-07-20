"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/useIsMobile";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** A quiet in-view lift used to join the sections into one scrolling narrative. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  // Animating filter mid-scroll is disproportionately expensive on phones —
  // they get the same lift without the blur
  const isMobile = useIsMobile();

  return (
    <motion.div
      className={cn(className)}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 32, ...(isMobile ? {} : { filter: "blur(8px)" }) }
      }
      whileInView={
        // blur(0px) is unconditional: useIsMobile starts false for SSR, so
        // the first mobile render still applies the blurred initial state —
        // the target must clear it or the element stays blurred forever
        reduceMotion ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
