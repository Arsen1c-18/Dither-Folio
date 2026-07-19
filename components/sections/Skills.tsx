"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { skills } from "@/constants/content";
import { ContributionGraph } from "@/components/fx/ContributionGraph";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Skills — a dossier calibration sheet. The section header declares
 * FILE: SKILLS.SYS; each category is a sharp-cornered system block with a
 * SYS_NN record strip, and every skill reads as a technical gauge: a
 * segmented tick meter with a zero-padded readout, filling tick by tick
 * on scroll-in. The contribution graph sits below as a centred telemetry
 * panel.
 */

type Skill = (typeof skills)[number];

// Ticks per meter — level maps onto how many light up
const SEGMENTS = 24;

/**
 * Tech logo tile — monochrome SVG from the Simple Icons CDN, requested in
 * white to sit on the dark dossier surface. Falls back to a two-letter
 * monogram tile when no slug is set or the icon fails to load.
 */
function LogoTile({ skill }: { skill: Skill }) {
  const [failed, setFailed] = useState(false);
  const slug = skill.icon?.trim();
  const showIcon = !!slug && !failed;
  const src = `https://cdn.simpleicons.org/${slug}/ffffff`;

  return (
    <span
      aria-hidden
      className="flex h-9 w-9 flex-none items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-2)] transition-colors duration-300 group-hover/skill:border-[var(--color-accent)]/50"
    >
      {showIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          className="opacity-75 transition-opacity duration-300 group-hover/skill:opacity-100"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-mono text-[0.7rem] font-medium text-[var(--color-subtle)]">
          {skill.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function Meter({ level, delay }: { level: number; delay: number }) {
  const reduce = useReducedMotion();
  const filled = Math.round((level / 100) * SEGMENTS);

  return (
    <div className="flex h-3 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const on = i < filled;
        return (
          <motion.span
            key={i}
            className="w-[3px] flex-none"
            style={{
              height: i % 6 === 0 ? "100%" : "70%",
              background: on ? "var(--color-accent)" : "var(--color-border-strong)",
              opacity: on ? 1 : 0.5,
            }}
            initial={reduce || !on ? false : { opacity: 0 }}
            whileInView={on ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.18, delay: delay + i * 0.025, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

function SkillRow({ skill, delay }: { skill: Skill; delay: number }) {
  return (
    <li className="group/skill flex items-center gap-3.5">
      <LogoTile skill={skill} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-[var(--color-muted)] transition-colors duration-300 group-hover/skill:text-[var(--color-foreground)]">
            {skill.name}
          </span>
          <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--color-subtle)]">
            <span className="text-[var(--color-accent)]">
              {String(skill.level).padStart(3, "0")}
            </span>
            /100
          </span>
        </div>
        <Meter level={skill.level} delay={delay} />
      </div>
    </li>
  );
}

export function Skills() {
  const reduceMotion = useReducedMotion();

  // Only skills toggled visible in the dashboard make it onto the sheet
  const visible = useMemo(() => skills.filter((s) => !s.hidden), []);

  const grouped = useMemo(() => {
    const acc: Record<string, Skill[]> = {};
    for (const s of visible) (acc[s.category] ??= []).push(s);
    return Object.entries(acc);
  }, [visible]);

  return (
    <section
      id="skills"
      className="section-flow relative scroll-mt-20 overflow-hidden"
    >
      {/* Ghost section index, mirroring the other dossier sections */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 select-none font-display font-bold leading-none text-transparent"
        style={{
          fontSize: "clamp(14rem, 30vw, 26rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.04)",
        }}
      >
        04
      </span>

      {/* ── Ambient sheet furniture — registration marks, edge rulers, and
          a vertical annotation, all faint and behind the content ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Sparse plus-mark grid, like registration marks on a drawing */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><path d='M48 42v12M42 48h12' stroke='white' stroke-width='1' opacity='0.55'/></svg>")`,
            maskImage:
              "radial-gradient(85% 80% at 50% 45%, black 25%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(85% 80% at 50% 45%, black 25%, transparent 100%)",
          }}
        />
        {/* Edge rulers — fine tick strips down both sides */}
        <div
          className="absolute bottom-28 left-5 top-28 hidden w-1.5 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)",
          }}
        />
        <div
          className="absolute bottom-28 right-5 top-28 hidden w-1.5 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)",
          }}
        />
        {/* Vertical annotation along the right edge */}
        <span
          className="absolute right-9 top-1/2 hidden -translate-y-1/2 select-none font-mono text-[0.55rem] tracking-[0.45em] text-[var(--color-faint)] lg:block"
          style={{ writingMode: "vertical-rl" }}
        >
          CALIBRATION SHEET · REV 2026.07
        </span>
      </div>

      <div className="container-page relative py-20 sm:py-24 lg:py-28">
        {/* Translucent container — sharp document edge, like Experience */}
        <div className="relative border border-[var(--color-border)]/50 bg-[var(--color-bg)]/60 p-6 backdrop-blur-md sm:p-10 lg:p-14">
          {/* Dossier file header strip */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--color-border-strong)] py-2.5 font-mono text-[0.65rem] tracking-[0.15em] text-[var(--color-subtle)] md:mb-14">
            <span>
              FILE: <span className="text-[var(--color-foreground)]">SKILLS.SYS</span>
            </span>
            <span className="hidden sm:inline">
              UNITS: <span className="text-[var(--color-foreground)]">{visible.length}</span>
            </span>
            <span>
              SECTION: <span className="text-[var(--color-accent)]">04</span>
            </span>
          </div>

          {/* Section title */}
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-12 flex flex-col gap-3"
          >
            <span className="label-system flex items-center gap-2">
              <span className="text-[var(--color-accent)]">04</span>
              <span className="h-px w-8 bg-[var(--color-border-strong)]" />
              skills
            </span>
            <h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
              Skills<span className="text-[var(--color-accent)]">.</span>
            </h2>
            <p className="max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
              Languages, frameworks, and infrastructure I work with regularly —
              calibrated to honest, current levels.
            </p>
          </motion.header>

          {/* System blocks */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map(([category, items], ci) => {
              const mean = Math.round(
                items.reduce((s, i) => s + i.level, 0) / items.length,
              );
              return (
                <motion.div
                  key={category}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: EASE, delay: ci * 0.08 }}
                  className="flex flex-col border border-[var(--color-border-strong)] bg-[var(--color-surface)]/95 backdrop-blur-xl transition-colors duration-300 hover:border-[var(--color-accent)]/40"
                >
                  {/* Record strip */}
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-2.5 font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)]">
                    <span>
                      <span className="text-[var(--color-accent)]">
                        SYS_{String(ci + 1).padStart(2, "0")}
                      </span>{" "}
                      <span className="uppercase">{"// "}{category}</span>
                    </span>
                    <span>×{items.length}</span>
                  </div>

                  {/* Gauges */}
                  <ul className="flex flex-1 flex-col gap-5 p-5">
                    {items.map((skill, si) => (
                      <SkillRow
                        key={`${skill.name}-${si}`}
                        skill={skill}
                        delay={ci * 0.08 + si * 0.1}
                      />
                    ))}
                  </ul>

                  {/* Footer readout */}
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-2 font-mono text-[0.58rem] tracking-[0.16em] text-[var(--color-faint)]">
                    <span>MEAN_LVL</span>
                    <span className="text-[var(--color-subtle)]">
                      {String(mean).padStart(3, "0")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Telemetry — contribution graph, centred */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto mt-12 w-full max-w-4xl"
          >
            <div className="mb-3 flex items-center justify-between font-mono text-[0.62rem] tracking-[0.16em] text-[var(--color-subtle)]">
              <span>
                <span className="text-[var(--color-accent)]">TELEMETRY</span>{" "}
                {"// COMMIT ACTIVITY"}
              </span>
              <span className="hidden sm:inline">WINDOW: 52W</span>
            </div>
            <ContributionGraph />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
