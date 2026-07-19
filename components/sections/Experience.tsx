"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { experience } from "@/constants/content";
import { DitherBackground } from "@/components/fx/DitherBackground";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Experience — a literal system log. The section header already declares
 * FILE: EXPERIENCE.LOG, so the records execute on that promise: each role is
 * a sharp-cornered log entry with a REC_NN header strip, a terminal-style
 * [+]/[−] expand toggle, and square diamond nodes on the scroll rail.
 * The achievement is a stamped commendation document with crop-mark corners.
 */

// Same ordered-dither tile used on the About portrait — keeps the treatment consistent
const DITHER_TILE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='1' height='1' x='0' y='0' fill='black'/><rect width='1' height='1' x='2' y='2' fill='black'/><rect width='1' height='1' x='2' y='0' fill='black' opacity='0.5'/><rect width='1' height='1' x='0' y='2' fill='black' opacity='0.5'/></svg>")`;

// Soft radial mask so each role image dissolves into the card edges
const IMAGE_MASK =
  "radial-gradient(85% 85% at 50% 50%, black 55%, transparent 100%)";

type ExperienceItem = (typeof experience)[number];

// Newest first, like a log
const records = [...experience].reverse();

export function Experience() {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);

  // Timeline progress line follows scroll through the list
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section
      id="experience"
      className="section-flow relative scroll-mt-20 overflow-hidden"
    >
      {/* Faint dither effect across entire section background - blended.
          anchorTop keeps the wave field fixed to the top of the section so
          expanding/collapsing a record (which changes section height) doesn't
          recentre and visibly jump the whole pattern. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <DitherBackground preset="strip" overlay={0.02} anchorTop />
      </div>

      {/* Ghost section index, mirroring About's "01" */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 select-none font-display font-bold leading-none text-transparent"
        style={{
          fontSize: "clamp(14rem, 30vw, 26rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.04)",
        }}
      >
        02
      </span>

      <div className="container-page relative py-20 sm:py-24 lg:py-28">
        {/* Translucent container — sharp document edge, not a rounded panel */}
        <div className="relative border border-[var(--color-border)]/50 bg-[var(--color-bg)]/60 p-6 backdrop-blur-md sm:p-10 lg:p-14">

        {/* Dossier file header — same strip as About */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--color-border-strong)] py-2.5 font-mono text-[0.65rem] tracking-[0.15em] text-[var(--color-subtle)] md:mb-16">
          <span>
            FILE: <span className="text-[var(--color-foreground)]">EXPERIENCE.LOG</span>
          </span>
          <span className="hidden sm:inline">RECORDS: {String(records.length).padStart(2, "0")}</span>
          <span className="hidden md:inline">SORT: NEWEST_FIRST</span>
        </div>

        <div className="relative grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
          {/* ── Left: sticky intro ─────────────────────────────── */}
          <div className="relative lg:sticky lg:top-24 lg:h-fit lg:self-start">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex flex-col gap-4"
            >
              <span className="label-system flex items-center gap-2">
                <span className="text-[var(--color-accent)]">02</span>
                <span className="h-px w-8 bg-[var(--color-border-strong)]" />
                journey
              </span>
              <h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
                Experience
                <span className="text-[var(--color-accent)]">.</span>
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
                A timeline of my professional journey, learning, building and
                contributing.
              </p>
            </motion.div>

            <CommendationCard />
          </div>

          {/* ── Right: timeline of records ─────────────────────── */}
          <ol ref={listRef} className="relative flex flex-col gap-6">
            {/* Rail + scroll progress */}
            <span
              aria-hidden
              className="absolute bottom-4 left-[7px] top-4 w-px bg-[var(--color-border)] max-sm:hidden"
            >
              <motion.span
                className="absolute inset-0 origin-top bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-dim)]"
                style={{ scaleY: reduceMotion ? 1 : progress }}
              />
            </span>

            {records.map((item, index) => (
              <TimelineRecord
                key={item.id}
                item={item}
                index={index}
                total={records.length}
              />
            ))}
          </ol>

          {/* Dithered wave sliver with gradient shadow - positioned above tagline */}
          <motion.div
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            className="relative mt-16 h-56 w-full overflow-hidden lg:hidden"
            style={{
              maskImage:
                "radial-gradient(120% 100% at 0% 100%, black 40%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(120% 100% at 0% 100%, black 40%, transparent 78%)",
            }}
          >
            <DitherBackground preset="strip" overlay={0.1} />
            {/* Shadow gradient overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 60% at 30% 70%, rgba(255,59,59,0.08), transparent 70%)",
              }}
            />
          </motion.div>
        </div> {/* Close grid */}

        {/* Sign-off line */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-16 flex items-center justify-center gap-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-subtle)]"
        >
          <span className="h-px w-10 bg-[var(--color-border-strong)] sm:w-16" />
          Always learning. Always building.
          <span className="h-px w-10 bg-[var(--color-border-strong)] sm:w-16" />
        </motion.p>
        </div> {/* Close translucent container */}
      </div> {/* Close container-page */}
    </section>
  );
}

/* ─── Achievement — minimal label/value, same language as About's NOW block ── */

function CommendationCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="relative z-10 mt-12 hidden max-w-sm flex-col gap-1.5 border-t border-[var(--color-border)] pt-6 lg:flex"
    >
      <span className="label-system text-[0.6rem] text-[var(--color-accent)]">
        ACHIEVEMENT
      </span>
      <span className="font-mono text-sm text-[var(--color-muted)]">
        1st — Build with AI Hackathon
      </span>
    </motion.div>
  );
}

/* ─── Single timeline record — a sharp log entry ──────────────────────────── */

function TimelineRecord({
  item,
  index,
  total,
}: {
  item: ExperienceItem;
  index: number;
  total: number;
}) {
  const reduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  // Log entries count down: newest record carries the highest index
  const recId = `REC_${String(total - index).padStart(2, "0")}`;

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: EASE, delay: 0.05 * index }}
      className="group relative z-10 flex gap-5 sm:gap-7"
    >
      {/* Timeline node — square diamond, sharper than a dot */}
      <span aria-hidden className="relative mt-4 hidden shrink-0 sm:block">
        <span
          className={
            item.current
              ? "block size-[11px] rotate-45 border-2 border-[var(--color-bg)] bg-[var(--color-accent)] shadow-[0_0_14px_var(--color-accent)]"
              : "block size-[11px] rotate-45 border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] transition-colors duration-300 group-hover:border-[var(--color-accent)]"
          }
          style={{ marginLeft: 2 }}
        />
      </span>

      <div
        className={`relative z-10 flex-1 border bg-[var(--color-surface)]/80 backdrop-blur-sm transition-colors duration-300 ${
          item.current
            ? "border-[var(--color-accent)]/40"
            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
        }`}
      >
        {/* Accent edge on the current record */}
        {item.current && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-dim)]"
          />
        )}

        {/* Record header strip — id, period, expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="flex w-full items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-2.5 text-left font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)] transition-colors duration-300 hover:bg-[var(--color-surface-2)]/50 sm:px-6"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="text-[var(--color-accent)]">{recId}</span>
            <span className="truncate uppercase">{item.period}</span>
            {item.current && (
              <span className="flex shrink-0 items-center gap-1.5 text-[var(--color-accent)]">
                <span className="size-1 animate-pulse bg-[var(--color-accent)]" />
                ACTIVE
              </span>
            )}
          </span>
          {/* Terminal toggle instead of a chevron */}
          <span className="shrink-0 text-[var(--color-subtle)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
            [{isExpanded ? "−" : "+"}]
          </span>
        </button>

        {/* Record body */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          tabIndex={-1}
          className="w-full px-5 pb-5 pt-4 text-left sm:px-6 sm:pb-6"
        >
          <h3 className="font-display text-2xl font-medium tracking-tight text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-[1.7rem]">
            {item.role}
          </h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-accent)]">
            {item.org}
          </p>

          <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            {item.summary}
          </p>
        </button>

        {/* Expandable details section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="border-t border-dashed border-[var(--color-border)] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {/* Skills developed during this role */}
                {item.skills && item.skills.length > 0 && (
                  <div className="mb-5">
                    <h4 className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                      Skills
                    </h4>
                    <ul className="flex flex-wrap gap-x-3 gap-y-2">
                      {item.skills.map((skill) => (
                        <li
                          key={skill}
                          className="font-mono text-[0.68rem] tracking-[0.05em] text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)]"
                        >
                          <span className="text-[var(--color-faint)]">[</span>
                          {skill}
                          <span className="text-[var(--color-faint)]">]</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Per-role dithered image */}
                <div className="mt-5">
                  <h4 className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    Snapshot
                  </h4>
                  <RecordImage id={item.id} alt={item.org} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

/* ─── Dithered role image ─────────────────────────────────────────────────── */

function RecordImage({ id, alt }: { id: string; alt: string }) {
  return (
    <div
      aria-label={alt}
      role="img"
      className="relative hidden size-28 shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-[1.04] sm:block lg:size-36"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(/experience/${id}.png)`,
          maskImage: IMAGE_MASK,
          WebkitMaskImage: IMAGE_MASK,
          mixBlendMode: "lighten",
          opacity: 0.9,
        }}
      />
      {/* Live-dither shimmer on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-60 dither-flicker"
        style={{
          backgroundImage: DITHER_TILE,
          backgroundSize: "4px 4px",
          maskImage: IMAGE_MASK,
          WebkitMaskImage: IMAGE_MASK,
        }}
      />
    </div>
  );
}
