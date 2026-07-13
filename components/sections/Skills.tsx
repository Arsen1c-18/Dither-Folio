"use client";

import { useMemo } from "react";
import { skills } from "@/constants/content";
import { Section } from "@/components/layout/Section";

/**
 * Skills — grouped by category with animated bar meters.
 * The bars are pure CSS so they animate on first paint without JS scroll
 * observers (simple, reliable, respects prefers-reduced-motion via globals).
 */
export function Skills() {
  const grouped = useMemo(() => {
    return skills.reduce<Record<string, typeof skills>>((acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    }, {});
  }, []);

  return (
    <Section
      id="skills"
      index="04"
      title="Skills"
      kicker="Languages, frameworks, and infrastructure I work with regularly."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div
            key={category}
            className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5"
          >
            {/* Category header */}
            <span className="label-system flex items-center gap-2 text-[var(--color-subtle)]">
              <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
              {category}
            </span>

            {/* Skill rows */}
            <ul className="flex flex-col gap-4">
              {items.map((skill) => (
                <li key={skill.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-muted)]">{skill.name}</span>
                    <span className="font-mono text-[0.6875rem] text-[var(--color-subtle)]">
                      {skill.level}
                    </span>
                  </div>
                  {/* Bar track */}
                  <div className="h-0.5 overflow-hidden rounded-full bg-[var(--color-border-strong)]">
                    <div
                      className="h-full origin-left rounded-full bg-[var(--color-accent)] transition-[width] duration-700 ease-out"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
