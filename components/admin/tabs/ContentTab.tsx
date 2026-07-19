"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/store";
import {
  Group,
  TextField,
  TextArea,
  Toggle,
  IconButton,
} from "@/components/admin/fields";
import type { Project } from "@/types";
import { SkillsEditor } from "@/components/admin/SkillsEditor";

// Seed for the About NOW block when the JSON doesn't have one yet — mirrors
// the built-in copy in components/sections/About.tsx.
const DEFAULT_NOW = [
  { label: "NOW", value: "Building scalable backend systems" },
  { label: "LEARNING", value: "LLM infra & retrieval systems" },
  { label: "OFF-HOURS", value: "PL theory papers & WebGL generative art" },
];

/**
 * Card-image control for one project: upload a file (stored under
 * public/projects/, dev-only), paste a path/URL, preview, and clear.
 * The card falls back to /projects/{id}.png then the numbered placeholder.
 */
function ProjectImageField({ project, index }: { project: Project; index: number }) {
  const { update } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = project.image || `/projects/${project.id}.png`;

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("projectId", project.id);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
      // Bust the browser cache so re-uploads show immediately
      update((d) => { d.projects[index].image = `${json.path}?v=${Date.now()}`; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        {/* Preview thumb — shows the effective image or the fallback state */}
        <span className="relative flex h-16 w-24 flex-none items-center justify-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]">
          <span className="absolute font-mono text-[0.55rem] text-[var(--color-faint)]">
            no image
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            src={src}
            alt=""
            className="relative h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </span>

        <div className="min-w-48 flex-1">
          <TextField
            label="Image (path or URL)"
            value={project.image ?? ""}
            placeholder={`/projects/${project.id}.png`}
            onChange={(v) => update((d) => { d.projects[index].image = v; })}
            hint="Empty falls back to the conventional path, then the numbered placeholder."
          />
        </div>

        <label className={`cursor-pointer rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-xs transition-colors ${busy ? "opacity-50" : "text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"}`}>
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        {project.image && (
          <IconButton onClick={() => update((d) => { d.projects[index].image = ""; })} title="Clear image">
            ✕
          </IconButton>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-accent)]">{error}</p>}
    </div>
  );
}

/** Content tab — Projects, Experience, Skills, and the About section. */
export function ContentTab() {
  const { data, update } = useAdmin();
  const { projects, experience, about } = data;

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
                <TextField label="Category" value={p.category} onChange={(v) => update((d) => { d.projects[i].category = v; })} />
                <IconButton onClick={() => update((d) => { d.projects.splice(i, 1); })} title="Remove">✕</IconButton>
              </div>
              <TextArea label="Description" value={p.description} onChange={(v) => update((d) => { d.projects[i].description = v; })} rows={2} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Stack (comma-separated)" value={p.stack.join(", ")} onChange={(v) => update((d) => { d.projects[i].stack = v.split(",").map((s) => s.trim()).filter(Boolean); })} />
                <TextField label="Link (href)" value={p.href ?? ""} onChange={(v) => update((d) => { d.projects[i].href = v; })} />
              </div>
              <ProjectImageField project={p} index={i} />
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
                <div className="flex items-center gap-1">
                  <IconButton
                    onClick={() => update((d) => { if (i > 0) { const [it] = d.experience.splice(i, 1); d.experience.splice(i - 1, 0, it); } })}
                    title="Move up"
                  >↑</IconButton>
                  <IconButton
                    onClick={() => update((d) => { if (i < d.experience.length - 1) { const [it] = d.experience.splice(i, 1); d.experience.splice(i + 1, 0, it); } })}
                    title="Move down"
                  >↓</IconButton>
                  <IconButton onClick={() => update((d) => { d.experience.splice(i, 1); })} title="Remove">✕</IconButton>
                </div>
              </div>
              <TextArea label="Summary" value={x.summary} onChange={(v) => update((d) => { d.experience[i].summary = v; })} rows={2} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Skills (comma-separated)"
                  value={(x.skills ?? []).join(", ")}
                  onChange={(v) => update((d) => { d.experience[i].skills = v.split(",").map((s) => s.trim()).filter(Boolean); })}
                />
                <TextField
                  label="Achievements (comma-separated)"
                  value={(x.achievements ?? []).join(", ")}
                  onChange={(v) => update((d) => { d.experience[i].achievements = v.split(",").map((s) => s.trim()).filter(Boolean); })}
                  hint='e.g. "1st — Build with AI Hackathon"'
                />
              </div>
              <Toggle label="Current role" value={x.current ?? false} onChange={(v) => update((d) => { d.experience[i].current = v; })} />
            </div>
          ))}
        </div>
      </Group>

      {/* Achievements — standalone commendation-card entries */}
      <Group
        title="Achievements"
        action={
          <IconButton onClick={() => update((d) => { d.achievements = [...(d.achievements ?? []), ""]; })}>
            + Add
          </IconButton>
        }
      >
        <div className="flex flex-col gap-3">
          {(data.achievements ?? []).map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <TextField label={`Achievement ${String(i + 1).padStart(2, "0")}`} value={a} onChange={(v) => update((d) => { d.achievements![i] = v; })} hint={i === 0 ? 'e.g. "1st — Build with AI Hackathon"' : undefined} />
              </div>
              <div className="pt-6">
                <IconButton onClick={() => update((d) => { d.achievements!.splice(i, 1); })} title="Remove">✕</IconButton>
              </div>
            </div>
          ))}
        </div>
      </Group>

      {/* Skills — sectioned editor with icon picker */}
      <SkillsEditor />

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
        <div className="mt-2 flex items-center justify-between">
          <span className="label-system text-[var(--color-subtle)]">Now block</span>
          <IconButton onClick={() => update((d) => { d.about.now = [...(d.about.now ?? DEFAULT_NOW), { label: "LABEL", value: "" }]; })}>+ Add</IconButton>
        </div>
        <div className="flex flex-col gap-3">
          {(about.now ?? DEFAULT_NOW).map((n, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <TextField label="Label" value={n.label} onChange={(v) => update((d) => { d.about.now = (d.about.now ?? DEFAULT_NOW).map((x, j) => j === i ? { ...x, label: v } : x); })} />
              <TextField label="Value" value={n.value} onChange={(v) => update((d) => { d.about.now = (d.about.now ?? DEFAULT_NOW).map((x, j) => j === i ? { ...x, value: v } : x); })} />
              <IconButton onClick={() => update((d) => { d.about.now = (d.about.now ?? DEFAULT_NOW).filter((_, j) => j !== i); })} title="Remove">✕</IconButton>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}
