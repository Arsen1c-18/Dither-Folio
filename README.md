# Portfolio

A single-page portfolio built with Next.js 15, React 19, Tailwind v4, and a custom
WebGL dither shader (Three.js / R3F). Content and visual settings are editable
through a hidden, dev-only dashboard and stored in a single JSON file.

## Getting started

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSCODE
npm run dev
```

- Site: <http://localhost:3000>
- Dashboard: <http://localhost:3000/admin>

## How content works

Everything editable lives in **`data/portfolio.json`** — identity, socials, nav,
theme (accent colors), dither/FX presets, about, experience, projects, skills.

- The public site reads it through `lib/data.ts`; the `constants/*` files re-export
  from there, so components import content the same way as before.
- The accent theme is injected as CSS variables in `app/layout.tsx`, overriding the
  static tokens in `app/globals.css`.

## The dashboard (`/admin`)

A dev-only "command centre" for editing the JSON without touching code:

- **Identity** — site fields, social links, nav items
- **Theme** — accent color pickers with live preview
- **Background / FX** — live sliders for each dither preset, with an inline preview
- **Content** — CRUD for projects, experience, skills, and the about section

Editing updates an in-memory store; **Save** writes back to `data/portfolio.json`.
Reload the site to see the changes.

### Why dev-only

Deploys target Vercel, whose filesystem is **read-only at runtime**, so saving only
works locally. The workflow is: edit in `npm run dev` → **Save** → `git commit` →
push → Vercel redeploys with the new JSON. The `/admin` route returns 404 in
production and the save API refuses writes there.

To later enable live editing on the deployed site, swap the file write in
`app/api/admin/save/route.ts` for a KV store (e.g. Upstash) — an isolated change.

## Auth

A single passcode (`ADMIN_PASSCODE` in `.env.local`) is exchanged for an httpOnly
session cookie. It gates the dashboard during local development only.

## To fill in

- `public/resume.pdf` — linked from the About section (`site.resumeUrl`)
- Real values for `site.email`, `site.metadataBase`, and the social URLs
  (all editable in the dashboard)

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
