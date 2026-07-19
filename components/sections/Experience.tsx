"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { experience } from "@/constants/content";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Experience — a full-screen career signal display. Selecting a point on the
 * timeline tunes the central panel to that role instead of opening a standard
 * information tab.
 */
export function Experience() {
  const [active, setActive] = useState(experience[0].id);
  const reduceMotion = useReducedMotion();
  const activeIndex = Math.max(0, experience.findIndex((item) => item.id === active));
  const current = experience[activeIndex];
  const timelineProgress = experience.length > 1 ? (activeIndex / (experience.length - 1)) * 100 : 0;

  return (
    <section
      id="experience"
      className="section-flow relative min-h-[100svh] scroll-mt-20 overflow-hidden border-y border-[var(--color-border)]"
    >
      {/* Quiet instrument-grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
          maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <div className="container-page relative flex min-h-[100svh] flex-col py-20 sm:py-24 lg:py-28">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex max-w-2xl flex-col gap-3"
        >
          <span className="label-system flex items-center gap-2">
            <span className="text-[var(--color-accent)]">02</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" />
            career telemetry
          </span>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-6xl">
            Experience, in motion.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            Follow the signal through roles, systems, and the work that shaped each chapter.
          </p>
        </motion.header>

        <div className="mt-10 grid flex-1 gap-6 lg:mt-14 lg:min-h-[34rem] lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          {/* Active role: a large, changing signal display */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            className="relative isolate min-h-[28rem] overflow-hidden rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-6 sm:min-h-[32rem] sm:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 82% 20%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 32%), linear-gradient(135deg, transparent 0%, var(--color-surface) 100%)",
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-32 top-1/2 size-[28rem] -translate-y-1/2 rounded-full border border-[var(--color-border-strong)] sm:size-[34rem]"
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-[var(--color-accent)]" />
              <span className="absolute bottom-0 left-1/2 h-8 w-px -translate-x-1/2 bg-[var(--color-border-strong)]" />
            </motion.div>
            <div aria-hidden className="pointer-events-none absolute -right-12 top-1/2 size-56 -translate-y-1/2 rounded-full border border-dashed border-[var(--color-border)] sm:size-72" />

            <div className="relative flex h-full min-h-[23rem] flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_14px_var(--color-accent)]" />
                  <span className="label-system text-[var(--color-muted)]">selected transmission</span>
                </div>
                <span className="font-mono text-xs text-[var(--color-subtle)]">
                  REC_{String(activeIndex + 1).padStart(2, "0")}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduceMotion ? {} : { opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="max-w-2xl"
                >
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    {current.current && (
                      <span className="rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-accent)]">
                        Current signal
                      </span>
                    )}
                    <span className="label-system text-[var(--color-subtle)]">{current.period}</span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    {current.org}
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-medium leading-[0.98] tracking-tight text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                    {current.role}
                  </h3>
                  <p className="mt-7 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
                    {current.summary}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="label-system text-[var(--color-subtle)]">role archive / interactive</span>
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(experience.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </motion.article>

          {/* Timeline rail: each stop tunes the active transmission */}
          <motion.nav
            aria-label="Experience timeline"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="label-system text-[var(--color-subtle)]">timeline index</span>
              <span className="font-mono text-xs text-[var(--color-accent)]">{experience.length} records</span>
            </div>

            <ol className="relative flex min-h-[22rem] flex-col">
              <span
                aria-hidden
                className="absolute bottom-7 left-2 top-7 w-px bg-[var(--color-border-strong)]"
              >
                <motion.span
                  className="absolute inset-0 origin-top bg-[var(--color-accent)]"
                  animate={{ scaleY: timelineProgress / 100 }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              </span>
              {experience.map((item, index) => {
                const selected = item.id === active;
                return (
                  <li key={item.id} className="relative flex flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => setActive(item.id)}
                      className={cn(
                        "group flex w-full items-start gap-4 rounded-xl py-2 text-left transition-colors",
                        selected ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                      )}
                      aria-current={selected ? "true" : undefined}
                    >
                      <span
                        className={cn(
                          "relative z-10 mt-1.5 size-4 shrink-0 rounded-full border-2 border-[var(--color-surface)] transition-all",
                          selected
                            ? "bg-[var(--color-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_0_14px_var(--color-accent)]"
                            : "bg-[var(--color-border-strong)] group-hover:bg-[var(--color-muted)]",
                        )}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5 pb-6">
                        <span className="flex items-center justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-subtle)]">
                          {item.period}
                          <span className={cn("transition-transform", selected && "translate-x-1 text-[var(--color-accent)]")}>→</span>
                        </span>
                        <span className="font-display text-xl font-medium tracking-tight">{item.role}</span>
                        <span className="label-system text-[var(--color-subtle)]">{item.org}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.nav>
        </div>
      </div>
    </section>
  );
}
