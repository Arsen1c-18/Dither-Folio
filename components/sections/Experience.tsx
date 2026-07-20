"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { experience, achievements as standaloneAchievements } from "@/constants/content";
import { DitherBackground } from "@/components/fx/DitherBackground";
import { useIsMobile } from "@/lib/useIsMobile";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Experience — a literal system log. The section header already declares
 * FILE: EXPERIENCE.LOG, so the records execute on that promise: each role is
 * a sharp-cornered log entry with a REC_NN header strip, a terminal-style
 * [+]/[−] expand toggle, and square diamond nodes on the scroll rail.
 * The achievement is a stamped commendation document with crop-mark corners.
 */

type ExperienceItem = (typeof experience)[number];

// Newest first, like a log
const records = [...experience].reverse();

export function Experience() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
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
          recentre and visibly jump the whole pattern. Desktop-only: on
          phones the static fallback texture reads flat and dead, so the
          section sits directly on the page background instead. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 max-md:hidden"
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
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative border border-[var(--color-border)]/50 bg-[var(--color-bg)]/85 p-6 sm:p-10 lg:p-14 md:bg-[var(--color-bg)]/60 md:backdrop-blur-md"
        >

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
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 24, ...(isMobile ? {} : { filter: "blur(8px)" }) }
              }
              // blur(0px) unconditional: useIsMobile is false on the first
              // render (SSR default), so the blurred initial state can land
              // on phones — the in-view target must always clear it
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

          {/* Dithered wave sliver with gradient shadow - positioned above
              tagline. Tablet-band only: hidden on phones along with the
              rest of the section's dither, hidden at lg+ where the
              full-section backdrop takes over. */}
          <motion.div
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            className="relative mt-16 h-56 w-full overflow-hidden max-md:hidden lg:hidden"
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
        </motion.div> {/* Close translucent container */}
      </div> {/* Close container-page */}
    </section>
  );
}

/* ─── Achievements — a stamped commendation document, crop-mark corners ────── */

function CommendationCard() {
  const reduceMotion = useReducedMotion();
  // Standalone achievements from the CMS — independent of experience records
  const achievements = standaloneAchievements;

  if (achievements.length === 0) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="group/comm relative z-10 mt-12 hidden max-w-sm lg:block"
    >
      {/* Crop-mark corners */}
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute size-3 border-[var(--color-border-strong)] transition-colors duration-500 group-hover/comm:border-[var(--color-accent)]/60 ${pos}`}
        />
      ))}

      <div className="flex flex-col gap-4 p-5">
        {/* Header — medal emblem + label */}
        <div className="flex items-center gap-3">
          {/* Laurel medal — accent, like the org emblems */}
          <svg
            viewBox="0 0 24 24"
            className="size-7 shrink-0 text-[var(--color-accent)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="9" r="5" />
            <path d="M9.5 9l1.8 1.8L14.8 7.4" />
            <path d="M9 13.5L7 21l5-2.6L17 21l-2-7.5" />
          </svg>
          <div className="flex flex-col">
            <span className="label-system text-[0.6rem] text-[var(--color-accent)]">
              {achievements.length === 1 ? "ACHIEVEMENT" : "ACHIEVEMENTS"}
            </span>
            <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[var(--color-faint)]">
              {String(achievements.length).padStart(2, "0")} ON RECORD
            </span>
          </div>
        </div>

        {/* Entries */}
        <ul className="flex flex-col">
          {achievements.map((a, i) => (
            <li
              key={a}
              className="flex items-baseline gap-3 border-t border-dashed border-[var(--color-border)] py-2.5 font-mono text-sm text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)]"
            >
              <span className="text-[0.6rem] text-[var(--color-faint)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              {a}
            </li>
          ))}
        </ul>
      </div>
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
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Log entries count down: newest record carries the highest index
  const recId = `REC_${String(total - index).padStart(2, "0")}`;

  return (
    <motion.li
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 32, ...(isMobile ? {} : { filter: "blur(6px)" }) }
      }
      // Unconditional blur(0px) — see the header motion.div above
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
        className={`relative z-10 flex-1 border bg-[var(--color-surface)]/95 transition-colors duration-300 md:bg-[var(--color-surface)]/80 md:backdrop-blur-sm ${
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

        {/* Record body — emblem sits right-aligned beside the text */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          tabIndex={-1}
          className="flex w-full items-start justify-between gap-5 px-5 pb-5 pt-4 text-left sm:px-6 sm:pb-6"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl font-medium tracking-tight text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-[1.7rem]">
              {item.role}
            </h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {item.org}
            </p>

            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
              {item.summary}
            </p>
          </div>

          {/* Org emblem — right-aligned, one symbol per organisation */}
          <OrgEmblem id={item.id} org={item.org} />
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
              <div className="flex flex-col gap-5 border-t border-dashed border-[var(--color-border)] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {/* Skills developed during this role */}
                {item.skills && item.skills.length > 0 && (
                  <div>
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

                {/* Achievements — notable wins during this role */}
                {item.achievements && item.achievements.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                      Achievements
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {item.achievements.map((a) => (
                        <li
                          key={a}
                          className="flex items-baseline gap-2.5 font-mono text-[0.72rem] tracking-[0.04em] text-[var(--color-muted)]"
                        >
                          <span className="text-[var(--color-accent)]">✦</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

/* ─── Org emblems — one symbol per organisation, right-aligned ────────────── */

/**
 * Keyed by record id: exp-01 Inoticx (graphic design — pen-tool nib),
 * exp-02 GDG (capsule-bracket mark), exp-03 E-Cell (business — growth bars
 * with trend arrow), exp-04 Shaibya (code — angular brackets). All emblems
 * render in the accent red, brightening slightly on hover.
 */
function OrgEmblem({ id, org }: { id: string; org: string }) {
  return (
    <span
      aria-label={org}
      role="img"
      className="mt-1 hidden size-16 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)] transition-colors duration-500 group-hover:border-[var(--color-accent)]/40 group-hover:text-[var(--color-accent-bright)] sm:flex lg:size-20"
    >
      {id === "exp-01" && (
        /* Pen tool — graphic design */
        <svg viewBox="0 0 24 24" className="size-8 lg:size-9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
          <path d="M12 3l6 8-6 10L6 11z" />
          <circle cx="12" cy="11" r="1.8" />
          <path d="M12 3v6.2" strokeLinecap="round" />
        </svg>
      )}
      {id === "exp-02" && (
        /* GDG capsule-bracket mark (from Reference images/gdg.png) — two
           chevrons of round-capped capsules, offset at the elbow so the
           signature notch seam shows. */
        <svg
          viewBox="0 0 96 52"
          className="h-7 w-12 lg:h-8 lg:w-14"
          fill="none"
          stroke="currentColor"
          strokeWidth="13"
          strokeLinecap="round"
        >
          <path d="M37 11L16 25" />
          <path d="M14 28l21 14" />
          <path d="M59 11l21 14" />
          <path d="M82 28L61 42" />
        </svg>
      )}
      {id === "exp-03" && (
        /* Growth chart — business / entrepreneurship */
        <svg viewBox="0 0 24 24" className="size-8 lg:size-9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V14M9.5 20v-9M15 20v-6M20 20V8" />
          <path d="M4 9l6-4 4 3 5-5" />
          <path d="M19 3h2v2" />
        </svg>
      )}
      {id === "exp-04" && (
        /* Angular brackets — engineering */
        <span className="font-mono text-xl font-medium tracking-tight lg:text-2xl">
          {"</>"}
        </span>
      )}
    </span>
  );
}
