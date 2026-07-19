# Portfolio

A single-page developer portfolio with a terminal/dossier aesthetic — built with
Next.js 15, React 19, Tailwind v4, Framer Motion, and a custom WebGL dither
shader (Three.js / R3F). All content and visual settings are editable through a
hidden, dev-only dashboard and stored in a single JSON file — no code changes
needed to update the site.

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com), CSS variables for theming |
| Animation | [Framer Motion](https://www.framer.com/motion/) (scroll reveals, 3D tilt, the project wheel), [Lenis](https://lenis.darkroom.engineering/) smooth scrolling |
| 3D / shaders | [Three.js](https://threejs.org) via `@react-three/fiber` — dither wave backgrounds, the contact globe |
| Validation | [Zod](https://zod.dev) — guards every dashboard save |
| State | [Zustand](https://zustand-demo.pmnd.rs) — the dashboard's in-memory store |
| Icons | [simple-icons](https://simpleicons.org) (build-time index for the skill icon picker) |

## Setup

Requires Node 20+.

```bash
git clone <this-repo> && cd Portfolio
npm install
cp .env.example .env.local   # then edit .env.local (see below)
npm run dev
```

- Site: <http://localhost:3000>
- Dashboard: <http://localhost:3000/admin>

### Environment variables (`.env.local`)

| Var | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSCODE` | yes (dev) | Passcode for the `/admin` dashboard. Dev-only — the dashboard 404s in production. |
| `GITHUB_TOKEN` | optional | Classic PAT with `read:user` scope; powers the live GitHub contribution graph in Skills. |
| `GITHUB_USERNAME` | optional | GitHub login whose contribution calendar to show. |

Without the GitHub vars the contribution graph falls back to generated
placeholder data, so the site still runs.

### Make it yours

1. Open <http://localhost:3000/admin>, enter your passcode.
2. **Identity tab** — your name, handle, role, tagline, location, email, social
   links, and nav items.
3. **Content tab** — projects, experience, achievements, skills, about bio,
   stats, and the NOW block.
4. Drop your resume at `public/resume.pdf` (or point `site.resumeUrl` elsewhere).
5. Set `site.metadataBase` to your deployed URL (used for Open Graph metadata).
6. Save, reload the site, commit.

## How content works

Everything editable lives in **`data/portfolio.json`** — one file, the single
source of truth:

- `site` — identity: name, handle, role, tagline, location, email, resume URL
- `socials`, `nav` — link lists
- `theme` — accent colors and optional full palette override
- `fx` — dither-shader presets (hero / panel / strip)
- `about` — bio paragraphs, stats, and the NOW / LEARNING / OFF-HOURS block
- `experience` — roles, with per-role skills and achievements
- `achievements` — standalone list shown in the commendation card
- `projects` — title, year, category (free text), description, stack, link, image
- `skills` — name, level, category, optional simple-icons slug

The public site imports it statically through `lib/data.ts` (re-exported via
`constants/*`), so content is bundled at build time and the deployed site is
fully static. The accent theme is injected as CSS variables in `app/layout.tsx`,
overriding the defaults in `app/globals.css`.

## The dashboard (`/admin`)

A dev-only command centre for editing the JSON without touching code:

- **Identity** — site fields, social links, nav items
- **Theme** — accent color pickers with live preview
- **Background / FX** — live sliders for each dither preset, inline preview
- **Content** — full CRUD:
  - *Projects* — add/remove, edit fields, upload a card image (stored in
    `public/projects/`)
  - *Experience* — add/remove, reorder with ↑/↓ (the site shows newest first,
    i.e. the bottom card in the list renders at the top of the log), per-role
    skills and achievements
  - *Achievements* — the standalone list for the commendation card
  - *Skills* — sectioned editor with an icon picker and hide toggle
  - *About* — bio paragraphs, stats, NOW block
- **Library** — pick which interactive widget (bots, radial navs) is live in
  the navbar and hero

Edits update an in-memory store; **Save** validates with Zod and writes back to
`data/portfolio.json`. Reload the site to see changes.

### Updating the deployed site

Deploys target Vercel, whose filesystem is **read-only at runtime**, so saving
only works locally. The workflow:

```
npm run dev  →  edit in /admin  →  Save  →  git commit  →  git push  →  redeploy
```

The `/admin` route returns 404 in production and the save/upload APIs refuse
writes there. To enable live editing on a deployed site, swap the file write in
`app/api/admin/save/route.ts` for a KV store (e.g. Upstash) — an isolated change.

## Auth

A single passcode (`ADMIN_PASSCODE`) is exchanged for an httpOnly session
cookie via `/api/admin/login`. It's a convenience gate for local development,
not a hardened auth system — which is fine, because the dashboard never ships.

## Project structure

```
app/                 # App Router: page, layout, favicon, /admin, /api
  api/admin/         # login, logout, save, upload (all dev-only)
  api/contributions/ # GitHub contribution calendar proxy (cached 1 day)
components/
  sections/          # Hero, About, Experience, Projects, Skills, Contact
  layout/            # Navbar, radial navs, footer, loading screen
  admin/             # the dashboard
  fx/                # dither backgrounds, globe, reveals, smooth scroll
  library/           # interactive widgets selectable from the Library tab
constants/           # typed re-exports of the JSON content
data/portfolio.json  # ← all content lives here
lib/                 # data loader, zod schema, auth, utils
types/               # shared domain types
public/projects/     # project card images (uploaded via the dashboard)
```

## Deployment

Any Node host works; Vercel is zero-config:

1. Push the repo to GitHub and import it in Vercel.
2. (Optional) add `GITHUB_TOKEN` + `GITHUB_USERNAME` env vars for the live
   contribution graph. `ADMIN_PASSCODE` is not needed in production.
3. Deploy. The site prerenders fully static; content updates go through the
   local-edit → commit → push cycle above.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
