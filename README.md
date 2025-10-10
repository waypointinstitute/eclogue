# Overdream

Overdream is a minimalist narrative exploration prototype that runs entirely in the browser. It renders on top of a lightweight PixiJS scene graph and loads all story and rule content from editable JSON files stored under `docs/data`.

## Getting started

```bash
npm install
npm run dev
```

The dev server opens automatically. Authoring data while the server is running will trigger hot reloads when files change.

## Building for GitHub Pages

The project is configured so `npm run build` emits the production bundle directly into the `docs/` directory, which works with the GitHub Pages "Deploy from /docs" option. Data files in `docs/data` are preserved during the build.

```bash
npm run build
```

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

1. Ensure the repository's GitHub Pages settings are configured to deploy from the `/docs` directory.
2. Commit the contents of `docs/` so that data files and the latest production build are available to Pages.
3. Re-run `npm run build` before publishing significant changes.

## Roadmap

The MVP implements the core systems listed in the project brief: waking/dream/meta layers, slipping tension, morality and interaction tracking, ecology-driven changes, codex seeding, and save slots. Future milestones (ritual slip control, expanded procedural meta-dream, manifestation mechanics, accessibility improvements) are stubbed in the codebase to guide follow-on work.

