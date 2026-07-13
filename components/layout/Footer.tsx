import { site, socials } from "@/constants/site";

/**
 * Footer with a still Dither strip behind the wordmark — a second, calmer
 * reuse of the same shader.
 */
export function Footer() {
  const year = "2026";

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)]">
      {/* Subtle radial gradient — replaces the Dither strip to avoid dual-Canvas R3F conflicts */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container-page relative flex flex-col gap-10 py-16">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <span className="font-display text-4xl font-medium tracking-tight sm:text-6xl">
              {site.handle}
            </span>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">{site.tagline}</p>
          </div>

          <ul className="flex flex-col gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  <span className="label-system w-16">{s.label}</span>
                  <span className="text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                    {s.handle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-subtle)] sm:flex-row">
          <span>
            © {year} {site.name}. All rights reserved.
          </span>
          <span className="label-system">{site.location} — {site.timezone}</span>
        </div>
      </div>
    </footer>
  );
}
