# Personal Portfolio CMS & Dashboard Architecture

Building a hidden "command centre" into your portfolio is a powerful way to manage content and tweak visual settings in real-time without touching code or relying on a bloated third-party CMS.

Here is the blueprint for implementing this system.

## 1. Storage Strategy (Where the data lives)

To make settings dynamic, they must be moved out of static React components and into a data layer.

### Option A: Local JSON File (Recommended starting point)
Store all content and settings in a `data.json` file within the repository. The dashboard uses Next.js API routes (Server Actions or standard API routes) to overwrite this file.
* **Pros:** Zero infrastructure setup, no database required, everything is version-controlled via Git.
* **Cons:** Read-only in production (Vercel/Netlify). You would use the dashboard locally (`npm run dev`) to tweak settings, then commit and push to update the live site.

### Option B: Lightweight Database
Use a simple cloud database like Supabase, Firebase, or Vercel KV/Postgres.
* **Pros:** Allows you to log in to the live production site from anywhere (e.g., your phone), make a change, and have it reflect instantly for all users.
* **Cons:** Requires creating a third-party account and managing environment variables.

## 2. Authentication (Protecting the dashboard)

Since this is a single-user system, we don't need complex OAuth or user tables.
* **The Lock:** Create a hidden route (e.g., `/admin` or `/os-command`).
* **The Key:** Set a single environment variable (`ADMIN_PASSCODE=your-secret-password`).
* **The Logic:** A simple login screen checks the entered password against the environment variable. If correct, a session cookie is set, granting access to the dashboard.

## 3. Dashboard UI & State Management

The dashboard will be a sleek, tabbed interface that previews changes in real-time.

### State Management
Use React Context or a lightweight store like Zustand to hold the global state. When a setting changes in the dashboard, the store updates, and the entire app reacts instantly.

### Key Tabs
1. **Theme Tab:** 
   * Color pickers for the global accent color.
   * Updating this sets a CSS variable (e.g., `--accent`), immediately re-theming the site.
2. **Background / FX Tab:** 
   * Sliders for the Dither component (`waveSpeed`, `waveAmplitude`, `waveColor`, etc.).
   * Real-time visual feedback as you drag the sliders to dial in the exact aesthetic.
3. **Content Tab:** 
   * Forms and lists to add/edit/remove Projects.
   * Text areas to update the About section bio.
   * Interfaces to manage the Experience timeline.

## Next Steps
Once a storage option is selected (Local JSON vs Database), we will:
1. Setup the data schema (what exactly are we storing).
2. Create the hidden route and simple authentication mechanism.
3. Build the dashboard UI and wire it up to update the global state and save to the chosen storage layer.
