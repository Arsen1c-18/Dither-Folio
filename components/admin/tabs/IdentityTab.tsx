"use client";

import { useAdmin } from "@/components/admin/store";
import {
  Group,
  TextField,
  TextArea,
  Toggle,
  IconButton,
} from "@/components/admin/fields";

/** Identity tab — site fields, social links, nav items. */
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
          <TextField label="Timezone" value={site.timezone} onChange={(v) => update((d) => { d.site.timezone = v; })} />
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
        <div className="flex flex-col gap-4">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <TextField label="Label" value={s.label} onChange={(v) => update((d) => { d.socials[i].label = v; })} />
              <TextField label="URL" value={s.href} onChange={(v) => update((d) => { d.socials[i].href = v; })} />
              <TextField label="Handle" value={s.handle} onChange={(v) => update((d) => { d.socials[i].handle = v; })} />
              <IconButton onClick={() => update((d) => { d.socials.splice(i, 1); })} title="Remove">✕</IconButton>
            </div>
          ))}
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
