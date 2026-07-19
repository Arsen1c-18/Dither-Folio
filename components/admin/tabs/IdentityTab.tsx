"use client";

import { useAdmin } from "@/components/admin/store";
import {
  Group,
  TextField,
  TextArea,
  Toggle,
  IconButton,
} from "@/components/admin/fields";

/** Quick-add presets — pick one instead of typing a platform from scratch.
 *  Swap X for Instagram (or anything else) by removing one row and adding
 *  another; the contact orbit and footer read this list live. */
const SOCIAL_PRESETS: { label: string; href: string; handle: string }[] = [
  { label: "Instagram", href: "https://instagram.com/", handle: "@handle" },
  { label: "GitHub", href: "https://github.com/", handle: "@handle" },
  { label: "LinkedIn", href: "https://linkedin.com/in/", handle: "in/handle" },
  { label: "X", href: "https://x.com/", handle: "@handle" },
  { label: "YouTube", href: "https://youtube.com/@", handle: "@handle" },
  { label: "Dribbble", href: "https://dribbble.com/", handle: "@handle" },
  { label: "Email", href: "mailto:you@example.com", handle: "you@example.com" },
];

/** Identity tab — site fields, social links, nav items, and site copy
 *  (contact quote + footer strip). */
export function IdentityTab() {
  const { data, update } = useAdmin();
  const { site, socials, nav } = data;

  return (
    <div className="flex flex-col gap-5">
      <Group title="Site">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name" value={site.name} onChange={(v) => update((d) => { d.site.name = v; })} />
          <TextField label="Handle" value={site.handle} onChange={(v) => update((d) => { d.site.handle = v; })} />
          <TextField label="Role" value={site.role} onChange={(v) => update((d) => { d.site.role = v; })} />
          <TextField label="Location" value={site.location} onChange={(v) => update((d) => { d.site.location = v; })} />
          <TextField label="Timezone" value={site.timezone} onChange={(v) => update((d) => { d.site.timezone = v; })} hint="IANA zone, e.g. Asia/Kolkata — drives the footer clock." />
          <TextField label="Email" value={site.email} onChange={(v) => update((d) => { d.site.email = v; })} />
          <TextField label="Resume URL" value={site.resumeUrl} onChange={(v) => update((d) => { d.site.resumeUrl = v; })} />
          <TextField label="Metadata base URL" value={site.metadataBase} onChange={(v) => update((d) => { d.site.metadataBase = v; })} hint="Absolute site URL for OG/metadata." />
        </div>
        <TextArea label="Tagline" value={site.tagline} onChange={(v) => update((d) => { d.site.tagline = v; })} rows={2} />
        <Toggle label="Available for work" value={site.available} onChange={(v) => update((d) => { d.site.available = v; })} />
      </Group>

      <Group
        title="Socials"
        action={
          <IconButton onClick={() => update((d) => { d.socials.push({ label: "New", href: "https://", handle: "" }); })}>
            + Add
          </IconButton>
        }
      >
        <p className="text-xs text-[var(--color-subtle)]">
          These power the contact orbit and the footer channels. Quick add:
        </p>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => update((d) => { d.socials.push({ ...p }); })}
              className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 font-mono text-[0.65rem] text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              + {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end">
              {/* Reorder — the orbit places links clockwise from the top in this order */}
              <div className="flex gap-1 sm:self-center">
                <IconButton onClick={() => update((d) => { if (i > 0) { const [x] = d.socials.splice(i, 1); d.socials.splice(i - 1, 0, x); } })} title="Move up">↑</IconButton>
                <IconButton onClick={() => update((d) => { if (i < d.socials.length - 1) { const [x] = d.socials.splice(i, 1); d.socials.splice(i + 1, 0, x); } })} title="Move down">↓</IconButton>
              </div>
              <TextField label="Label" value={s.label} onChange={(v) => update((d) => { d.socials[i].label = v; })} />
              <TextField label="URL" value={s.href} onChange={(v) => update((d) => { d.socials[i].href = v; })} />
              <TextField label="Handle" value={s.handle} onChange={(v) => update((d) => { d.socials[i].handle = v; })} />
              <IconButton onClick={() => update((d) => { d.socials.splice(i, 1); })} title="Remove">✕</IconButton>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Copy">
        <TextField
          label="Contact quote"
          value={data.contact?.quote ?? ""}
          placeholder="Somewhere on this sphere · probably shipping"
          onChange={(v) => update((d) => { (d.contact ??= {}).quote = v; })}
          hint="Line under the contact globe. Use · to split — separators render in the accent colour. Empty = default."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Footer credit"
            value={data.footer?.credit ?? ""}
            placeholder="BUILT BY HAND"
            onChange={(v) => update((d) => { (d.footer ??= {}).credit = v; })}
            hint="Right side of the closing strip. Empty = default."
          />
          <TextField
            label="Footer marker"
            value={data.footer?.eof ?? ""}
            placeholder="EOF"
            onChange={(v) => update((d) => { (d.footer ??= {}).eof = v; })}
            hint="Centre marker of the closing strip. Empty = default."
          />
        </div>
      </Group>

      <Group
        title="Navigation"
        action={
          <IconButton onClick={() => update((d) => { d.nav.push({ label: "New", id: "" }); })}>+ Add</IconButton>
        }
      >
        <div className="flex flex-col gap-4">
          {nav.map((item, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TextField label="Label" value={item.label} onChange={(v) => update((d) => { d.nav[i].label = v; })} />
              <TextField label="Section id" value={item.id} onChange={(v) => update((d) => { d.nav[i].id = v; })} />
              <IconButton onClick={() => update((d) => { d.nav.splice(i, 1); })} title="Remove">✕</IconButton>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}
