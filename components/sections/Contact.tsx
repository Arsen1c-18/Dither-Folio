"use client";

import { useState, useRef } from "react";
import { site, socials } from "@/constants/site";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Contact — mailto-based form (no server action required) plus a sidebar
 * with direct social / email links. Submitting the form opens the native
 * mail client via a mailto: href so it works with zero back-end.
 */
export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const message = fd.get("message") as string;
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(message);

    setStatus("sending");
    // Simulate a tiny delay then open the mailto link
    setTimeout(() => {
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      setStatus("sent");
      formRef.current?.reset();
    }, 400);
  }

  return (
    <Section
      id="contact"
      index="05"
      title="Contact"
      kicker="Have a project in mind? Let's make something great together."
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Form — 3 / 5 */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 lg:col-span-3"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="name" label="Name" type="text" placeholder="Jane Doe" required />
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="jane@example.com"
              required
            />
          </div>
          <Field
            id="message"
            label="Message"
            placeholder="Tell me about your project…"
            required
            multiline
            rows={6}
          />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className={cn(
                "rounded-full px-6 py-3 text-sm font-medium transition-all",
                status === "sent"
                  ? "bg-[var(--color-online)] text-[#050505]"
                  : "bg-[var(--color-accent)] text-[#050505] hover:bg-[var(--color-accent-bright)] disabled:opacity-60",
              )}
            >
              {status === "sending"
                ? "Opening mail client…"
                : status === "sent"
                  ? "✓ Message ready"
                  : "Send message →"}
            </button>
            <span className="label-system text-[var(--color-subtle)]">
              No tracking. No spam.
            </span>
          </div>
        </form>

        {/* Sidebar — 2 / 5 */}
        <aside className="flex flex-col gap-8 lg:col-span-2">
          <div className="flex flex-col gap-3">
            <span className="label-system text-[var(--color-subtle)]">Direct</span>
            <a
              href={`mailto:${site.email}`}
              className="group text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
            >
              <span className="break-all">{site.email}</span>
              <span className="ml-1 text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                ↗
              </span>
            </a>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          <div className="flex flex-col gap-3">
            <span className="label-system text-[var(--color-subtle)]">Elsewhere</span>
            <ul className="flex flex-col gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                  >
                    <span className="label-system w-14 text-[var(--color-subtle)]">
                      {s.label}
                    </span>
                    <span className="text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
                      {s.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          {/* Availability blurb */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
            <span className="label-system flex items-center gap-1.5 text-[var(--color-online)]">
              <span className="size-1.5 rounded-full bg-[var(--color-online)]" />
              {site.available ? "Available for new projects" : "Currently booked"}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-subtle)]">
              {site.available
                ? "I'm open to freelance contracts and full-time opportunities starting Q3 2026."
                : "I'm currently at full capacity. Feel free to reach out for future collaborations."}
            </p>
          </div>
        </aside>
      </div>
    </Section>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required,
  multiline,
  rows,
}: FieldProps) {
  const shared =
    "w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] transition-colors focus:border-[var(--color-accent)] focus:outline-none";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label-system text-[var(--color-subtle)]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className={cn(shared, "resize-none")}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          required={required}
          className={shared}
        />
      )}
    </div>
  );
}
