# Overdream

Overdream is a minimalist narrative exploration prototype that runs entirely in the browser. It renders on top of a lightweight PixiJS scene graph and loads all story and rule content from editable JSON files stored under `docs/data`.

## Getting started

```bash
npm install
npm run dev
```

The dev server opens automatically. Authoring data while the server is running will trigger hot reloads when files change.

## Building for GitHub Pages

The project is configured so `npm run build` emits the production bundle directly into the `docs/` directory. A GitHub Actions workflow (`deploy.yml`) builds the site on every push to `main` and publishes the output to GitHub Pages, so the live site always reflects the latest commit without manually checking in build artifacts.

```bash
npm run build
```

> **Tip:** If you open the published site immediately after a commit and see a blank page, wait for the `Deploy` workflow to finish (or run `npm run build` locally and commit the `docs/` output for a one-off hotfix).

To preview the build locally:

```bash
npm run preview
```

## Data-first content pipeline

All tunable content lives in `docs/data` (the folder is symlinked into `public/data` for the dev server). Files are grouped by domain:

- `world/` – locations, portals, and dream rule matrices
- `lore/` – books and codex entries
- `npcs/` – dialogue data
- `quests/` – story fragments and seed queues
- `ui/` – localized UI strings

Each file maps to the TypeScript definitions in `src/content/schema.ts`. The runtime loader validates that the JSON files conform to those shapes and reports validation errors through an in-game console overlay.

### Editing workflow

1. Stop the dev server before performing large refactors of the data directory.
2. Update JSON files in `docs/data/*`.
3. Restart the dev server with `npm run dev` to confirm the data validates.

## Testing and linting

```bash
npm run test   # Vitest smoke suite
npm run lint   # ESLint static analysis
```

## Save data

Overdream writes save slots to IndexedDB using the `idb` helper. If IndexedDB is unavailable, it falls back to LocalStorage. Save data includes morality, interaction style, ecology seeds, and the player’s current location.

## Deployment notes

1. In the repository settings, set GitHub Pages to deploy via **GitHub Actions** so the `Deploy` workflow can publish the built site automatically.
2. Verify that the workflow succeeds after each push; the run summary links directly to the live URL.
3. If you need to hotfix the live site without waiting for CI, run `npm run build` locally and commit the generated files under `docs/`.

## Roadmap

The MVP implements the core systems listed in the project brief: waking/dream/meta layers, slipping tension, morality and interaction tracking, ecology-driven changes, codex seeding, and save slots. Future milestones (ritual slip control, expanded procedural meta-dream, manifestation mechanics, accessibility improvements) are stubbed in the codebase to guide follow-on work.

