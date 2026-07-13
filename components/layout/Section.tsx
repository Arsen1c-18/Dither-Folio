import { cn } from "@/lib/utils";
import { Reveal } from "@/components/fx/Reveal";

interface SectionProps {
  id: string;
  /** Small mono index label, e.g. "01". */
  index?: string;
  /** Section heading. */
  title?: string;
  /** Optional one-line kicker under the title. */
  kicker?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Consistent section shell: anchor id, gutter padding, and an optional
 * indexed header (matches the "Digital OS" label styling).
 */
export function Section({ id, index, title, kicker, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("section-flow scroll-mt-20 py-24 sm:py-32", className)}>
      <div className="container-page">
        {(title || index) && (
          <Reveal>
          <header className="mb-12 flex flex-col gap-3">
            <span className="label-system flex items-center gap-2">
              {index && (
                <span className="text-[var(--color-accent)]">{index}</span>
              )}
              <span className="h-px w-8 bg-[var(--color-border-strong)]" />
              {id}
            </span>
            {title && (
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
                {title}
              </h2>
            )}
            {kicker && (
              <p className="max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
                {kicker}
              </p>
            )}
          </header>
          </Reveal>
        )}
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}
