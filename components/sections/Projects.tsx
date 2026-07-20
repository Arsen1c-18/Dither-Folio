"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { projects } from "@/constants/content";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Projects — a rigid 3D drum wheel, dossier-styled, rendered with a
 * CYLINDRICAL projection: perspective applies to the horizontal axis only.
 *
 * Every card sits at a fixed slot on the drum (vertical axis, 360°/N
 * apart) and scroll rotates the drum — one angle drives everything, so
 * card-to-card relationships are rigid by construction. But instead of the
 * browser's 3D camera (whose keystone warps a turned card's vertical
 * edges), the wheel geometry is projected in code:
 *
 *   θ = rel·STEP   c = cosθ, s = sinθ
 *   depth  d = R·(1−c)            — how far behind the focus plane
 *   persp  f = P/(P+d)            — horizontal perspective divide
 *   x      = R·s·f                — slides sideways, converging with depth
 *   scaleX = c·f                  — facet turn × depth foreshortening
 *   scaleY = 1, always            — height NEVER changes
 *
 * So cards recede, narrow, and bunch toward the sides exactly as a 3D
 * wheel's rim does, but their top and bottom edges stay perfectly
 * horizontal and their height constant — no keystone, no vertical drift,
 * by construction. scaleX goes NEGATIVE past 90°: the card is facing away
 * and shows its (pre-mirrored) back face, so a full revolution reads
 * correctly — the wheel is CLOSED, and past the last card the first one
 * comes round again from behind, back face first. Driven directly by
 * scroll progress (Lenis provides the smoothing) — no detent, no spring.
 */

type Project = (typeof projects)[number];

// Slots on the closed wheel — one per project, 360°/N apart
const SLOTS = projects.length;
const STEP_DEG = 360 / SLOTS;
// Wheel radius and camera distance, both in vw (units must match for the
// perspective divide). P close to R = strong depth; larger P = longer lens.
const RADIUS_VW = 60;
const CAMERA_VW = 110;

// Signed slot distance, wrapped to the nearest way round the wheel
const wrap = (r: number) => {
  const m = ((r % SLOTS) + SLOTS) % SLOTS;
  return m > SLOTS / 2 ? m - SLOTS : m;
};
// Wheel geometry for a wrapped slot distance
const geom = (r: number) => {
  const t = (r * STEP_DEG * Math.PI) / 180;
  const c = Math.cos(t);
  const f = CAMERA_VW / (CAMERA_VW + RADIUS_VW * (1 - c));
  return { c, s: Math.sin(t), f };
};

/* ─── Single card on the strip ────────────────────────────────────────────── */

function StripCard({
  project,
  idx,
  stripIndex,
}: {
  project: Project;
  idx: number;
  stripIndex: MotionValue<number>;
}) {
  // Slots away from the focused card, wrapped round the closed wheel
  // (0 = centred). Everything below derives from this one value through
  // the wheel geometry — nothing else animates.
  const rel = useTransform(stripIndex, (i: number) => wrap(idx - i));

  // Cylindrical projection (see header): horizontal position with the
  // perspective divide applied to x only.
  const x = useTransform(rel, (r: number) => {
    const g = geom(r);
    return `${RADIUS_VW * g.s * g.f}vw`;
  });
  // Facet turn × depth foreshortening. Negative past 90° — the card faces
  // away and renders mirrored, i.e. seen from behind.
  const scaleX = useTransform(rel, (r: number) => {
    const g = geom(r);
    const v = g.c * g.f;
    // Never exactly 0 — keep the element renderable edge-on
    return Math.abs(v) < 0.001 ? 0.001 : v;
  });

  // Nearer cards layer above farther ones — f decreases with depth
  const zIndex = useTransform(rel, (r: number) => Math.round(geom(r).f * 100));

  // Which side of the card faces the viewer
  const frontVisibility = useTransform(rel, (r: number) =>
    geom(r).c >= 0 ? "visible" : "hidden",
  );
  const backVisibility = useTransform(rel, (r: number) =>
    geom(r).c < 0 ? "visible" : "hidden",
  );

  // Side and rear cards dim so the focused record reads first
  const opacity = useTransform(rel, [-1, 0, 1], [0.55, 1, 0.55]);
  const pointerEvents = useTransform(rel, (r: number) =>
    Math.abs(r) < 0.4 ? "auto" : "none",
  );

  return (
    <motion.div
      style={{
        x,
        scaleX,
        // scaleY is deliberately untouched: height is constant, edges stay
        // horizontal — the wheel's depth lives entirely in x and scaleX
        opacity,
        zIndex,
        pointerEvents,
      }}
      className="absolute h-[62vh] max-h-[36rem] w-[74vw] max-w-4xl"
    >
      {/* ── Back face — what shows while the card rides the far side of
          the drum (scaleX < 0 mirrors the element; the inner scaleX(-1)
          un-mirrors the stamp so it reads correctly). ── */}
      <motion.div
        aria-hidden
        style={{ visibility: backVisibility }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-surface)]/95"
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <span
          style={{ transform: "scaleX(-1)" }}
          className="select-none font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[var(--color-faint)]"
        >
          PROJ_{String(idx + 1).padStart(2, "0")} {"// reverse"}
        </span>
      </motion.div>

      {/* ── Front face ── */}
      <motion.div
        style={{ visibility: frontVisibility }}
        className="group relative flex h-full w-full overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors duration-300 hover:border-[var(--color-accent)]/40"
      >
        {/* Ghost year, bottom-left of the text side */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-7 left-4 select-none font-display text-[8rem] font-bold leading-none text-transparent"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.045)" }}
        >
          {project.year}
        </span>

        {/* ── Left: record details ── */}
        <div className="relative z-10 flex w-[52%] flex-col p-7 sm:p-8">
          {/* Record strip */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5 font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)]">
            <span className="flex items-center gap-3">
              <span className="text-[var(--color-accent)]">
                PROJ_{String(idx + 1).padStart(2, "0")}
              </span>
              <span className="uppercase">{project.year}</span>
            </span>
            <span className="uppercase">
              {project.category}
            </span>
          </div>

          <h3 className="mt-5 font-display text-3xl font-medium tracking-tight text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-4xl">
            {project.title}
            <span className="text-[var(--color-accent)]">.</span>
          </h3>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
            {project.description}
          </p>

          {/* Stack */}
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.65rem] tracking-[0.05em] text-[var(--color-muted)]">
            {project.stack.map((tag) => (
              <li key={tag}>
                <span className="text-[var(--color-faint)]">[</span>
                {tag}
                <span className="text-[var(--color-faint)]">]</span>
              </li>
            ))}
          </ul>

          {/* Link */}
          <a
            href={project.href ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group/link mt-auto inline-flex w-fit items-center gap-3 border border-[var(--color-border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-accent)]/60 hover:text-[var(--color-foreground)]"
          >
            View project
            <span className="text-[var(--color-subtle)] transition-all duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-[var(--color-accent)]">
              ↗
            </span>
          </a>
        </div>

        {/* ── Right: image panel, folded back about its (vertical) left edge
            so the card reads as wrapping around the wheel ── */}
        <div
          style={{
            transform: "rotateY(-14deg)",
            transformOrigin: "left center",
          }}
          className="absolute inset-y-0 right-0 z-0 w-[48%] transform-gpu overflow-hidden border-l border-[var(--color-border)] bg-black/40"
        >
          <ProjectImage project={project} idx={idx} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Image with blueprint-grid fallback ──────────────────────────────────── */

function ProjectImage({ project, idx }: { project: Project; idx: number }) {
  const [imageOk, setImageOk] = useState(false);
  // CMS-assigned image wins; fall back to the conventional per-id path
  const src = project.image || `/projects/${project.id}.png`;

  // Probe once so a missing file never flashes a broken image
  useEffect(() => {
    setImageOk(false);
    const img = new Image();
    img.onload = () => setImageOk(true);
    img.src = src;
  }, [src]);

  return (
    <div className="relative h-full w-full">
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

      {imageOk ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="select-none font-display text-8xl font-medium tracking-tight text-[var(--color-foreground)]/10"
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Caption strip */}
      <span
        aria-hidden
        className="absolute bottom-3 left-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--color-faint)]"
      >
        FIG. {String(idx + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

export function Projects() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Direct drive: scroll progress maps linearly onto the wheel — no detent,
  // no spring. Lenis already smooths the scroll itself, so the wheel turns
  // exactly with the scrollbar and stops the moment you stop. The range
  // ends ON the last card (SLOTS−1 steps): the moment it is focused the
  // sticky stage releases and the page scrolls on. The wheel is still
  // closed — while it turns, off-focus cards ride round the back of the
  // drum (back face showing) to reach their slot.
  const stripIndex = useTransform(
    scrollYProgress,
    (p: number) => p * (SLOTS - 1),
  );

  // Counter + progress rail track the nearest record, wrapped to the wheel
  const [active, setActive] = useState(0);
  useMotionValueEvent(stripIndex, "change", (i) =>
    setActive(((Math.round(i) % SLOTS) + SLOTS) % SLOTS),
  );
  const railScale = useTransform(
    stripIndex,
    [0, SLOTS - 1],
    [1 / SLOTS, 1],
    { clamp: true },
  );

  return (
    <section
      ref={containerRef}
      id="projects"
      // One viewport of scroll per transition between cards, plus the
      // sticky viewport itself — the section ends when the last card is
      // focused, then the page scrolls on. overflow-x-clip (not hidden —
      // hidden would break the sticky stage) stops the ghost numeral from
      // widening the page on mobile, where the stage is overflow-visible.
      className="relative z-20 h-auto scroll-mt-20 overflow-x-clip md:h-[var(--strip-h)]"
      style={{ "--strip-h": `${SLOTS * 100}vh` } as React.CSSProperties}
    >
      {/* Sticky full-screen stage (desktop) / normal flow (mobile) */}
      <div className="relative flex h-auto w-full flex-col overflow-visible py-16 md:sticky md:top-0 md:h-screen md:overflow-hidden md:py-0">
        {/* Ghost section index */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 top-16 select-none font-display font-bold leading-none text-transparent"
          style={{
            fontSize: "clamp(14rem, 30vw, 26rem)",
            WebkitTextStroke: "1px rgba(255,255,255,0.04)",
          }}
        >
          03
        </span>

        {/* Header */}
        <div className="container-page relative z-30 mb-8 flex w-full items-end justify-between md:pt-14 lg:pt-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col gap-3"
          >
            <span className="label-system flex items-center gap-2">
              <span className="text-[var(--color-accent)]">03</span>
              <span className="h-px w-8 bg-[var(--color-border-strong)]" />
              work
            </span>
            <h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
              Projects<span className="text-[var(--color-accent)]">.</span>
            </h2>
          </motion.div>

          {/* Counter + rail, desktop only */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="hidden flex-col items-end gap-2 md:flex"
          >
            <span className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.18em] text-[var(--color-subtle)]">
              <span className="text-[var(--color-accent)]">
                {String(active + 1).padStart(2, "0")}
              </span>
              / {String(projects.length).padStart(2, "0")}
            </span>
            <span className="relative block h-px w-24 bg-[var(--color-border)]">
              <motion.span
                className="absolute inset-0 origin-left bg-[var(--color-accent)]"
                style={{ scaleX: railScale }}
              />
            </span>
          </motion.div>
        </div>

        {/* The wheel stage (desktop) — flat compositing; the cylindrical
            projection is computed per card (x + scaleX only), so no CSS
            camera exists to introduce vertical keystone. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="relative hidden min-h-0 w-full flex-1 items-center justify-center overflow-hidden md:flex"
        >
          {/* Dashed horizontal track behind the cards */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-dashed border-[var(--color-border)] opacity-40"
          />

          {projects.map((project, idx) => (
            <StripCard
              key={project.id}
              project={project}
              idx={idx}
              stripIndex={stripIndex}
            />
          ))}
        </motion.div>

        {/* Mobile: vertical stack */}
        <div className="container-page relative z-20 flex flex-col gap-6 md:hidden">
          {projects.map((project, idx) => (
            <motion.a
              key={project.id}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease: EASE }}
              href={project.href ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col gap-4 overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-surface)]/95 p-6"
            >
              <div className="flex items-center justify-between font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)]">
                <span className="flex items-center gap-3">
                  <span className="text-[var(--color-accent)]">
                    PROJ_{String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="uppercase">{project.year}</span>
                </span>
                <span className="text-[var(--color-subtle)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                  ↗
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl font-medium tracking-tight text-[var(--color-foreground)]">
                  {project.title}
                </h3>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-accent)]">
                  {project.category}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {project.description}
                </p>
              </div>

              <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.65rem] tracking-[0.05em] text-[var(--color-muted)]">
                {project.stack.map((tag) => (
                  <li key={tag}>
                    <span className="text-[var(--color-faint)]">[</span>
                    {tag}
                    <span className="text-[var(--color-faint)]">]</span>
                  </li>
                ))}
              </ul>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
