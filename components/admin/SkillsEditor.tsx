"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/store";
import { Group, TextField, Slider, Toggle, IconButton, Field } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import ICON_INDEX from "@/components/admin/iconIndex.json";

/**
 * Skills editor — organised as category sections. Create or destroy whole
 * sections (destroying one removes its skills), add/remove/move skills
 * within them, and assign any of the ~3.4k Simple Icons via a searchable
 * picker with live previews. Data model is unchanged: a flat skill list
 * where `category` strings define the sections.
 */

type IconEntry = { t: string; s: string };
const ICONS = ICON_INDEX as IconEntry[];

const iconUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}/ffffff`;

/** Monogram fallback preview, mirroring the site's LogoTile. */
function TilePreview({ name, icon }: { name: string; icon?: string }) {
  return (
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={icon}
          src={iconUrl(icon)}
          alt=""
          width={16}
          height={16}
          className="opacity-80"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <span className="font-mono text-[0.65rem] text-[var(--color-subtle)]">
          {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?"}
        </span>
      )}
    </span>
  );
}

/** Searchable icon picker backed by the bundled Simple Icons index. */
function IconPicker({
  value,
  onPick,
  onClose,
}: {
  value?: string;
  onPick: (slug: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS.slice(0, 60);
    return ICONS.filter(
      (i) => i.t.toLowerCase().includes(q) || i.s.includes(q),
    ).slice(0, 60);
  }, [query]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 3,450 icons… (e.g. figma, rust, blender)"
          className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-accent)]"
        />
        {value && (
          <IconButton onClick={() => { onPick(""); onClose(); }} title="Clear icon (use monogram)">
            ∅
          </IconButton>
        )}
        <IconButton onClick={onClose} title="Close">✕</IconButton>
      </div>

      <div className="grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-10">
        {results.map((i) => (
          <button
            key={i.s}
            type="button"
            title={i.t}
            onClick={() => { onPick(i.s); onClose(); }}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border transition-colors",
              i.s === value
                ? "border-[var(--color-accent)] bg-[var(--color-surface-2)]"
                : "border-transparent hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconUrl(i.s)} alt={i.t} width={16} height={16} loading="lazy" className="opacity-80" />
          </button>
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-4 text-center text-xs text-[var(--color-subtle)]">
            No icons match — leave empty for a monogram tile.
          </p>
        )}
      </div>
    </div>
  );
}

export function SkillsEditor() {
  const { data, update } = useAdmin();
  const { skills } = data;
  // Which skill's icon picker is open, as a global skill index
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [newSection, setNewSection] = useState("");

  // Preserve first-appearance order of categories
  const sections = useMemo(() => {
    const order: string[] = [];
    for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
    return order;
  }, [skills]);

  const createSection = () => {
    const name = newSection.trim();
    if (!name || sections.includes(name)) return;
    update((d) => {
      d.skills.push({ name: "New skill", level: 50, category: name, icon: "", hidden: false });
    });
    setNewSection("");
  };

  return (
    <Group title="Skills">
      <p className="text-xs text-[var(--color-subtle)]">
        Skills live in sections (categories). Destroying a section removes all
        its skills. Click a tile to pick an icon — empty shows a two-letter
        monogram. &ldquo;Shown&rdquo; off keeps a skill in the data without
        displaying it.
      </p>

      {/* Create section */}
      <div className="flex items-center gap-2">
        <input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createSection(); } }}
          placeholder="New section name… (e.g. Databases)"
          className="w-full max-w-xs rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-accent)]"
        />
        <IconButton onClick={createSection}>+ Create section</IconButton>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((category) => {
          const members = skills
            .map((s, gi) => ({ s, gi }))
            .filter(({ s }) => s.category === category);

          return (
            <div key={category} className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4">
              {/* Section header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TextField
                  label="Section"
                  value={category}
                  onChange={(v) => update((d) => {
                    for (const s of d.skills) if (s.category === category) s.category = v;
                  })}
                />
                <div className="flex items-center gap-2 self-end">
                  <span className="font-mono text-[0.6rem] text-[var(--color-subtle)]">
                    ×{members.length}
                  </span>
                  <IconButton
                    onClick={() => update((d) => {
                      d.skills.push({ name: "New skill", level: 50, category, icon: "", hidden: false });
                    })}
                  >
                    + Skill
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (confirm(`Destroy section "${category}" and its ${members.length} skill(s)?`)) {
                        update((d) => { d.skills = d.skills.filter((s) => s.category !== category); });
                      }
                    }}
                    title="Destroy section and all its skills"
                  >
                    ✕ Section
                  </IconButton>
                </div>
              </div>

              {/* Skills in this section */}
              {members.map(({ s, gi }) => (
                <div key={gi} className={cn("flex flex-col gap-2", s.hidden && "opacity-50")}>
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[auto_1.6fr_2fr_auto_auto] sm:items-end">
                    {/* Icon tile — click to open the picker */}
                    <Field label="Icon">
                      <button
                        type="button"
                        title="Pick icon"
                        onClick={() => setPickerFor(pickerFor === gi ? null : gi)}
                        className={cn(
                          "rounded-md transition-shadow",
                          pickerFor === gi && "ring-1 ring-[var(--color-accent)]",
                        )}
                      >
                        <TilePreview name={s.name} icon={s.icon} />
                      </button>
                    </Field>
                    <TextField label="Name" value={s.name} onChange={(v) => update((d) => { d.skills[gi].name = v; })} />
                    <Slider label="Level" value={s.level} min={0} max={100} step={1} onChange={(v) => update((d) => { d.skills[gi].level = v; })} />
                    <Toggle label="Shown" value={!s.hidden} onChange={(v) => update((d) => { d.skills[gi].hidden = !v; })} />
                    <IconButton onClick={() => update((d) => { d.skills.splice(gi, 1); })} title="Remove skill">✕</IconButton>
                  </div>

                  {pickerFor === gi && (
                    <IconPicker
                      value={s.icon}
                      onPick={(slug) => update((d) => { d.skills[gi].icon = slug; })}
                      onClose={() => setPickerFor(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Group>
  );
}
