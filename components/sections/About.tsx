import { site, socials } from "@/constants/site";
import { about } from "@/constants/content";
import { Section } from "@/components/layout/Section";
import { DitherBackground } from "@/components/fx/DitherBackground";

/**
 * About — two-column layout: narrative left, identity card right.
 * The identity card re-uses the DitherBackground `panel` preset as a
 * glass-morphic backdrop so it visually echoes the hero.
 */
export function About() {
  const stats = about.stats;

  return (
    <Section id="about" index="01" title="About">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Narrative ─ 3 / 5 */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {about.bio.map((paragraph, i) => (
            <p
              key={i}
              className="text-balance text-base leading-relaxed text-[var(--color-muted)] sm:text-lg"
            >
              {renderBio(paragraph, site.name)}
            </p>
          ))}

          <div className="mt-2 flex flex-wrap gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-xs text-[var(--color-muted)] transition-all hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]"
              >
                <span className="label-system w-12">{s.label}</span>
                <span className="text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                  {s.handle}
                </span>
              </a>
            ))}
            <a
              href={site.resumeUrl}
              className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)]"
            >
              Resume ↗
            </a>
          </div>
        </div>

        {/* Identity card ─ 2 / 5 */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-strong)] lg:col-span-2">
          <DitherBackground preset="panel" overlay={0.72} />

          <div className="relative flex flex-col gap-8 p-6 sm:p-8">
            {/* Location / availability */}
            <div className="flex flex-col gap-3">
              <span className="label-system text-[var(--color-subtle)]">Identity</span>
              <div className="flex flex-col gap-1.5">
                <Row label="Name" value={site.name} />
                <Row label="Location" value={site.location} />
                <Row label="Role" value={site.role} />
                <Row
                  label="Status"
                  value={
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block size-1.5 rounded-full bg-[var(--color-online)]" />
                      {site.available ? "Available for work" : "Currently booked"}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-medium text-[var(--color-foreground)]">
                    {s.value}
                  </span>
                  <span className="label-system text-[0.625rem] leading-tight text-[var(--color-subtle)]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/**
 * Render a bio paragraph, replacing the `{name}` token with the owner's name
 * styled as bold foreground text (matching the original hand-written markup).
 */
function renderBio(paragraph: string, name: string): React.ReactNode {
  const parts = paragraph.split("{name}");
  if (parts.length === 1) return paragraph;

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <strong className="font-medium text-[var(--color-foreground)]">
          {name}
        </strong>
      )}
    </span>
  ));
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] py-2 last:border-0">
      <span className="label-system shrink-0 text-[var(--color-subtle)]">{label}</span>
      <span className="text-right text-sm text-[var(--color-muted)]">{value}</span>
    </div>
  );
}
