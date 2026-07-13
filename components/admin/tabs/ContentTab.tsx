"use client";

import { useAdmin } from "@/components/admin/store";
import {
  Group,
  TextField,
  TextArea,
  Toggle,
  Slider,
  Field,
  IconButton,
} from "@/components/admin/fields";
import type { ProjectCategory } from "@/types";

const CATEGORIES: ProjectCategory[] = ["ai-ml", "web-apps", "tools"];

/** Content tab — Projects, Experience, Skills, and the About section. */
export function ContentTab() {
  const { data, update } = useAdmin();
  const { projects, experience, skills, about } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* Projects */}
      <Group
        title="Projects"
        action={
          <IconButton onClick={() => update((d) => { d.projects.push({ id: `proj-${Date.now()}`, title: "New project", description: "", year: "2025", category: "web-apps", stack: [], href: "#" }); })}>
            + Add
          </IconButton>
        }
      >
        <div className="flex flex-col gap-4">
          {projects.map((p, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                <TextField label="Title" value={p.title} onChange={(v) => update((d) => { d.projects[i].title = v; })} />
                <TextField label="Year" value={p.year} onChange={(v) => update((d) => { d.projects[i].year = v; })} />
                <Field label="Category">
                  <select
                    className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
                    value={p.category}
                    onChange={(e) => update((d) => { d.projects[i].category = e.target.value as ProjectCategory; })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <IconButton onClick={() => update((d) => { d.projects.splice(i, 1); })} title="Remove">✕</IconButton>
              </div>
              <TextArea label="Description" value={p.description} onChange={(v) => update((d) => { d.projects[i].description = v; })} rows={2} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Stack (comma-separated)" value={p.stack.join(", ")} onChange={(v) => update((d) => { d.projects[i].stack = v.split(",").map((s) => s.trim()).filter(Boolean); })} />
                <TextField label="Link (href)" value={p.href ?? ""} onChange={(v) => update((d) => { d.projects[i].href = v; })} />
              </div>
            </div>
          ))}
        </div>
      </Group>

      {/* Experience */}
      <Group
        title="Experience"
        action={
          <IconButton onClick={() => update((d) => { d.experience.push({ id: `exp-${Date.now()}`, role: "Role", org: "Org", period: "", summary: "" }); })}>
            + Add
          </IconButton>
        }
      >
        <div className="flex flex-col gap-4">
          {experience.map((x, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <TextField label="Role" value={x.role} onChange={(v) => update((d) => { d.experience[i].role = v; })} />
                <TextField label="Org" value={x.org} onChange={(v) => update((d) => { d.experience[i].org = v; })} />
                <TextField label="Period" value={x.period} onChange={(v) => update((d) => { d.experience[i].period = v; })} />
                <IconButton onClick={() => update((d) => { d.experience.splice(i, 1); })} title="Remove">✕</IconButton>
              </div>
              <TextArea label="Summary" value={x.summary} onChange={(v) => update((d) => { d.experience[i].summary = v; })} rows={2} />
              <Toggle label="Current role" value={x.current ?? false} onChange={(v) => update((d) => { d.experience[i].current = v; })} />
            </div>
          ))}
        </div>
      </Group>

      {/* Skills */}
      <Group
        title="Skills"
        action={
          <IconButton onClick={() => update((d) => { d.skills.push({ name: "New skill", level: 50, category: "Languages" }); })}>
            + Add
          </IconButton>
        }
      >
        <div className="flex flex-col gap-4">
          {skills.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[1.5fr_1fr_2fr_auto] sm:items-end">
              <TextField label="Name" value={s.name} onChange={(v) => update((d) => { d.skills[i].name = v; })} />
              <TextField label="Category" value={s.category} onChange={(v) => update((d) => { d.skills[i].category = v; })} />
              <Slider label="Level" value={s.level} min={0} max={100} step={1} onChange={(v) => update((d) => { d.skills[i].level = v; })} />
              <IconButton onClick={() => update((d) => { d.skills.splice(i, 1); })} title="Remove">✕</IconButton>
            </div>
          ))}
        </div>
      </Group>

      {/* About */}
      <Group
        title="About"
        action={
          <IconButton onClick={() => update((d) => { d.about.bio.push(""); })}>+ Paragraph</IconButton>
        }
      >
        <div className="flex flex-col gap-3">
          {about.bio.map((para, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <TextArea label={`Paragraph ${i + 1}`} value={para} onChange={(v) => update((d) => { d.about.bio[i] = v; })} rows={3} hint={i === 0 ? "Use {name} to insert your name in bold." : undefined} />
              </div>
              <div className="pt-6">
                <IconButton onClick={() => update((d) => { d.about.bio.splice(i, 1); })} title="Remove">✕</IconButton>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="label-system text-[var(--color-subtle)]">Stats</span>
          <IconButton onClick={() => update((d) => { d.about.stats.push({ label: "Label", value: "0" }); })}>+ Add</IconButton>
        </div>
        <div className="flex flex-col gap-3">
          {about.stats.map((st, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
              <TextField label="Label" value={st.label} onChange={(v) => update((d) => { d.about.stats[i].label = v; })} />
              <TextField label="Value" value={st.value} onChange={(v) => update((d) => { d.about.stats[i].value = v; })} />
              <IconButton onClick={() => update((d) => { d.about.stats.splice(i, 1); })} title="Remove">✕</IconButton>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}
