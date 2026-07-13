"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { experience } from "@/constants/content";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

/**
 * Experience — horizontal timeline tabs: clicking a role expands its detail
 * panel. Designed to feel like a terminal / OS file-explorer pane split.
 */
export function Experience() {
  const [active, setActive] = useState(experience[0].id);
  const current = experience.find((e) => e.id === active)!;
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="experience"
      index="02"
      title="Experience"
      kicker="A brief timeline of where I've worked and what I've built."
    >
      <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--color-border-strong)] lg:flex-row">
        {/* Sidebar — role list */}
        <aside className="flex flex-row overflow-x-auto border-b border-[var(--color-border)] lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-x-visible lg:border-b-0 lg:border-r">
          {experience.map((e) => (
            <button
              key={e.id}
              onClick={() => setActive(e.id)}
              className={cn(
                "group flex flex-col gap-0.5 border-b border-[var(--color-border)] px-5 py-4 text-left transition-colors last:border-b-0",
                "min-w-[10rem] lg:min-w-0",
                active === e.id
                  ? "bg-[var(--color-elevated)] text-[var(--color-foreground)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]",
              )}
            >
              {/* Current badge */}
              {e.current && (
                <span className="label-system mb-1 inline-flex items-center gap-1.5 text-[var(--color-accent)]">
                  <span className="size-1 rounded-full bg-[var(--color-accent)]" />
                  Current
                </span>
              )}
              <span className="truncate text-sm font-medium">{e.role}</span>
              <span className="label-system text-[0.625rem] text-[var(--color-subtle)]">
                {e.org}
              </span>
            </button>
          ))}
        </aside>

        {/* Detail pane */}
        <div className="relative flex flex-col gap-6 bg-[var(--color-surface-2)] p-6 sm:p-8 lg:flex-1">
          {/* Decorative index */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-6 top-6 select-none font-display text-[8rem] font-medium leading-none text-[var(--color-border)] sm:right-10 sm:top-8 sm:text-[10rem]"
          >
            {String(experience.findIndex((e) => e.id === active) + 1).padStart(2, "0")}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  {current.role}
                </h3>
                <p className="label-system flex items-center gap-3 text-[var(--color-subtle)]">
                  <span className="text-[var(--color-muted)]">{current.org}</span>
                  <span className="h-px w-5 bg-[var(--color-border-strong)]" />
                  <span>{current.period}</span>
                </p>
              </div>

              <p className="max-w-2xl text-balance text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
                {current.summary}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
