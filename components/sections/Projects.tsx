"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { projects } from "@/constants/content";
import { Section } from "@/components/layout/Section";
import type { ProjectCategory } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { label: string; value: ProjectCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "AI / ML", value: "ai-ml" },
  { label: "Web Apps", value: "web-apps" },
  { label: "Tools", value: "tools" },
];

/**
 * Projects — filterable card grid. A monospace category filter bar sits above
 * the grid; active filter is highlighted in accent-red. Cards use a subtle
 * gradient border that brightens on hover.
 */
export function Projects() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const reduceMotion = useReducedMotion();

  const visible =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <Section
      id="projects"
      index="03"
      title="Projects"
      kicker="Selected work — click any card to explore the source or demo."
    >
      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-all",
              filter === c.value
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#050505]"
                : "border-[var(--color-border-strong)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <motion.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <AnimatePresence mode="popLayout">
        {visible.map((project, i) => (
          <motion.li
            layout
            key={project.id}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? {} : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href={project.href ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                "border-[var(--color-border)] bg-[var(--color-surface-2)]",
                "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-elevated)]",
              )}
            >
              {/* Hover glow */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px at 50% 0%, rgba(255,59,59,0.06), transparent 70%)",
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="label-system text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, "0")} — {project.year}
                  </span>
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {project.title}
                  </h3>
                </div>
                <span className="mt-1 shrink-0 text-[var(--color-subtle)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]">
                  ↗
                </span>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                {project.description}
              </p>

              {/* Stack tags */}
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 font-mono text-[0.6875rem] text-[var(--color-subtle)]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </a>
          </motion.li>
        ))}
        </AnimatePresence>
      </motion.ul>
    </Section>
  );
}
