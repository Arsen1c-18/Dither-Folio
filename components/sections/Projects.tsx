"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projects } from "@/constants/content";
import { useIsMobile } from "@/lib/useIsMobile";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Projects — a dossier index, built on the same shell as EXPERIENCE.LOG and
 * SKILLS.SYS: translucent document panel, FILE header strip, a sticky intro
 * with a live record index on the left, and the project records on the right.
 * Each record is a sharp-cornered card with a PROJ_NN strip, a full-width
 * screenshot, and a VIEW PROJECT footer. One layout at every width — the
 * index is simply dropped below lg.
 */

type Project = (typeof projects)[number];

const projId = (i: number) => `PROJ_${String(i + 1).padStart(2, "0")}`;

/** Categories are free text from the dashboard ("Web App", "ai-ml", "Web") —
 *  flatten them into one uniform mono label so the strip reads consistently. */
const formatCategory = (c: string) =>
  c.replace(/[-_]+/g, " / ").replace(/\s+/g, " ").trim().toUpperCase();

export function Projects() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const recordRefs = useRef<(HTMLLIElement | null)[]>([]);

  // A record becomes "active" while it crosses a thin band at the middle of
  // the viewport, which drives the index highlight on the left.
  useEffect(() => {
    const nodes = recordRefs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = nodes.indexOf(entry.target as HTMLLIElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      // overflow-x-clip, not hidden: `hidden` would make this section a
      // scroll container and kill the sticky index column
      className="section-flow relative scroll-mt-20 overflow-x-clip"
    >
      {/* Ghost section index — mirrors the other dossier sections */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-24 select-none font-display font-bold leading-none text-transparent"
        style={{
          fontSize: "clamp(14rem, 30vw, 26rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.04)",
        }}
      >
        03
      </span>

      <div className="container-page relative py-20 sm:py-24 lg:py-28">
        {/* Translucent container — sharp document edge, like Experience */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative border border-[var(--color-border)]/50 bg-[var(--color-bg)]/85 p-6 sm:p-10 lg:p-14 md:bg-[var(--color-bg)]/60 md:backdrop-blur-md"
        >
          {/* Dossier file header strip */}
          <div className="mb-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--color-border-strong)] py-2.5 font-mono text-[0.65rem] tracking-[0.15em] text-[var(--color-subtle)] md:mb-16">
            <span>
              FILE:{" "}
              <span className="text-[var(--color-foreground)]">PROJECTS.IDX</span>
            </span>
            <span className="hidden sm:inline">
              UNITS:{" "}
              <span className="text-[var(--color-foreground)]">
                {String(projects.length).padStart(2, "0")}
              </span>
            </span>
            <span>
              SECTION: <span className="text-[var(--color-accent)]">03</span>
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
            {/* ── Left: sticky intro + record index ─────────────── */}
            <div className="relative lg:sticky lg:top-24 lg:h-fit lg:self-start">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex flex-col gap-4"
              >
                <span className="label-system flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">03</span>
                  <span className="h-px w-8 bg-[var(--color-border-strong)]" />
                  work
                </span>
                <h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
                  Projects<span className="text-[var(--color-accent)]">.</span>
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
                  A collection of things I&apos;ve built, shipped, and keep
                  improving — each one an excuse to learn something new.
                </p>
              </motion.div>

              <RecordIndex active={active} />
            </div>

            {/* ── Right: the records ────────────────────────────── */}
            <ol className="flex flex-col gap-6">
              {projects.map((project, idx) => (
                <ProjectRecord
                  key={project.id}
                  ref={(el) => {
                    recordRefs.current[idx] = el;
                  }}
                  project={project}
                  idx={idx}
                  isActive={active === idx}
                />
              ))}
            </ol>
          </div>

          {/* Sign-off line, matching Experience */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-16 flex items-center justify-center gap-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-subtle)]"
          >
            <span className="h-px w-10 bg-[var(--color-border-strong)] sm:w-16" />
            More in the pipeline
            <span className="h-px w-10 bg-[var(--color-border-strong)] sm:w-16" />
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Record index — the sticky contents list, tracks the active record ───── */

function RecordIndex({ active }: { active: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.nav
      aria-label="Project index"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="group/idx relative z-10 mt-12 hidden max-w-sm lg:block"
    >
      {/* Crop-mark corners, same treatment as the commendation card */}
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute size-3 border-[var(--color-border-strong)] transition-colors duration-500 group-hover/idx:border-[var(--color-accent)]/60 ${pos}`}
        />
      ))}

      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-col">
          <span className="label-system text-[0.6rem] text-[var(--color-accent)]">
            INDEX
          </span>
          <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[var(--color-faint)]">
            {String(projects.length).padStart(2, "0")} ON RECORD
          </span>
        </div>

        <ul className="flex flex-col">
          {projects.map((project, idx) => {
            const isActive = active === idx;
            return (
              <li key={project.id}>
                <a
                  href={`#${project.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center gap-3 border-t border-dashed border-[var(--color-border)] py-2.5 font-mono text-sm transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {/* Diamond node, echoing the Experience timeline */}
                  <span
                    aria-hidden
                    className={`block size-[7px] shrink-0 rotate-45 transition-colors duration-300 ${
                      isActive
                        ? "bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]"
                        : "border border-[var(--color-border-strong)] bg-[var(--color-surface-2)]"
                    }`}
                  />
                  <span
                    className={`text-[0.6rem] transition-colors duration-300 ${
                      isActive
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-faint)]"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{project.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}

/* ─── One project record ──────────────────────────────────────────────────── */

function ProjectRecord({
  ref,
  project,
  idx,
  isActive,
}: {
  ref: React.Ref<HTMLLIElement>;
  project: Project;
  idx: number;
  isActive: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <motion.li
      ref={ref}
      id={project.id}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 32, ...(isMobile ? {} : { filter: "blur(6px)" }) }
      }
      // blur(0px) unconditional: useIsMobile is false on the first render, so
      // the blurred initial state can still land on phones
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: EASE, delay: 0.05 * idx }}
      className="group scroll-mt-24"
    >
      <div
        className={`relative flex flex-col border bg-[var(--color-surface)]/95 transition-colors duration-300 md:bg-[var(--color-surface)]/80 md:backdrop-blur-sm ${
          isActive
            ? "border-[var(--color-accent)]/40"
            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
        }`}
      >
        {/* Stretched link — one hit target over the whole record, so the
            card stays a single tab stop instead of nesting interactives */}
        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 z-20"
          >
            <span className="sr-only">
              View the {project.title} project (opens in a new tab)
            </span>
          </a>
        )}

        {/* Record strip */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-2.5 font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)] sm:px-6">
          <span className="flex min-w-0 items-center gap-3">
            <span className="text-[var(--color-accent)]">{projId(idx)}</span>
            <span className="uppercase">{project.year}</span>
          </span>
          <span className="truncate uppercase">
            {formatCategory(project.category)}
          </span>
        </div>

        {/* Screenshot */}
        <ProjectImage project={project} idx={idx} />

        {/* Body */}
        <div className="flex flex-col gap-3.5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <h3 className="font-display text-2xl font-medium tracking-tight text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-[1.7rem]">
            {project.title}
          </h3>

          <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            {project.description}
          </p>

          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.68rem] tracking-[0.05em] text-[var(--color-muted)]">
            {project.stack.map((tag) => (
              <li key={tag}>
                <span className="text-[var(--color-faint)]">[</span>
                {tag}
                <span className="text-[var(--color-faint)]">]</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer strip */}
        {project.href && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-subtle)] transition-colors duration-300 group-hover:text-[var(--color-foreground)] sm:px-6">
            View project
            <span className="text-[var(--color-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]">
              ↗︎
            </span>
          </div>
        )}
      </div>
    </motion.li>
  );
}

/* ─── Screenshot, with a blueprint-grid fallback ──────────────────────────── */

function ProjectImage({ project, idx }: { project: Project; idx: number }) {
  const [failed, setFailed] = useState(false);
  const src = project.image;

  // A path persisted in the CMS can outlive the file it points at
  useEffect(() => setFailed(false), [src]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[var(--color-border)] bg-black/40">
      {/* Blueprint grid, always present as the panel floor */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${project.title} screenshot`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex select-none items-center justify-center font-display text-8xl font-medium tracking-tight text-[var(--color-foreground)]/10"
        >
          {String(idx + 1).padStart(2, "0")}
        </span>
      )}

      {/* Caption strip, over a soft scrim so it reads on any screenshot */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--color-faint)]"
      >
        FIG. {String(idx + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
