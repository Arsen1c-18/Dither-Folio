"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { nav } from "@/constants/site";
import { data } from "@/lib/data";
import { getHubEntry } from "@/components/library/hubRegistry";
import { KineticRadial } from "@/components/library/KineticRadial";
import { RadialNavBackdrop } from "@/components/layout/RadialNavBackdrop";
import { cn } from "@/lib/utils";

/**
 * RadialNav — an interactive kinetic radial interface. The selected library
 * element and navigation surface over its open center.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const listItem: Variants = {
  hidden: { opacity: 0, x: -16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

export function RadialNav({ className, preview = false }: { className?: string; preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const hub = getHubEntry(data.ui?.navbarBot ?? "radial-bot") ?? getHubEntry("radial-bot")!;

  return (
    <div className={cn("relative", className)}>
      <RadialNavBackdrop open={open} preview={preview} className="bg-[var(--color-bg)]/35" />

    <nav
      aria-label="Primary"
      className="absolute inset-0 z-40 select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
        <div className={cn("absolute inset-0 transition-opacity duration-500", open ? "opacity-70" : "opacity-100")}>
          <KineticRadial active={open} size="100%" className="size-full" />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className={cn(
                "pointer-events-auto absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
                preview ? "left-1/2" : "left-[45%]",
              )}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              aria-hidden
            >
              {(hub.renderNavbar ?? hub.render)()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-y-0 left-[6%] z-10 flex w-[38%] flex-col justify-center gap-6">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.ul
                className="pointer-events-auto flex flex-col gap-2"
                variants={list}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                {nav.map((item, index) => (
                  <motion.li key={item.id} variants={listItem}>
                    <a
                      href={`#${item.id}`}
                      className="group flex origin-left items-center gap-3 py-0.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="font-mono text-[0.6rem] text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={cn(
                        "font-display font-medium tracking-tight text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)]",
                        preview ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl",
                      )}>
                        {item.label}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.span
                className="label-system text-[var(--color-faint)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                Hover to navigate
              </motion.span>
            )}
          </AnimatePresence>
        </div>
    </nav>
    </div>
  );
}
