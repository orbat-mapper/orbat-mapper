# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ORBAT Mapper is a client-side Vue 3 web application for building order of battles (ORBATs) and plotting unit locations on maps. No backend — state persists locally via IndexedDB.

## Commands

```bash
pnpm run dev          # Dev server at http://localhost:5173/
pnpm run build        # Type-check + production build
pnpm run type-check   # TypeScript compiler check only
pnpm run test:unit    # Run Vitest test suite
pnpm run lint         # ESLint with auto-fix
pnpm run format       # Prettier formatting for src/
pnpm run docs:dev     # VitePress docs dev server
```

To run a single test file: `npx vitest run src/path/to/file.test.ts`

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** (strict)
- **Vite** build tool, **pnpm** package manager
- **Tailwind CSS v4** (configured in `src/styles.css` with `@theme` syntax, no `tailwind.config.ts`)
- **Pinia** for UI stores, **custom Immer-based store** for scenario data
- **OpenLayers** for mapping, **Turf.js** for geospatial analysis
- **milsymbol** for military symbology, SIDC codes
- **shadcn-vue** (Reka UI primitives) for UI components in `src/components/ui/`
- **Vitest** + jsdom for testing

## Architecture

### State Management (two patterns)

1. **Pinia stores** (`src/stores/`) — lightweight UI state (selections, panels, recording flags, playback)
2. **Immer store** (`src/composables/immerStore.ts`) — used by the scenario store for immutable updates with undo/redo via RFC 6902 patches

The **scenario store** (`src/scenariostore/newScenarioStore.ts`) is the central data store. It uses normalized state with Maps (`unitMap`, `sideMap`, etc.) for O(1) lookups and manages sides, units, events, features, map layers, and supplies.

### Data Model

- **External format** (`src/types/scenarioModels.ts`) — user-facing/serialization format
- **Internal format** (`src/types/internalModels.ts`) — normalized for performance
- Conversion via `convertStateToInternalFormat()`
- Scenarios are time-aware: units have `state[]` arrays of timed events, and `syncTimedHierarchyProjection()` computes unit visibility/parentage at any time T

### Module Structure

Feature modules in `src/modules/` are self-contained:
- `scenarioeditor` — main map editing interface
- `charteditor` — ORBAT chart visualization
- `grid` — table/grid editing (TanStack Vue Table)
- `storymode` — timeline/story presentation

### Routing

Routes in `src/router/index.ts` use dynamic imports for code splitting. Main editor route is `/scenario/:scenarioId` with child routes for map, grid, and chart editing modes.

### Geographic/Map Code

Map functionality lives in `src/geo/` (styles, utilities, history) with composables in `src/composables/geo*.ts` for map interactions, layers, editing, and measurements.

## Conventions

- Path alias: `@/` → `./src/`
- Components: PascalCase files, `<script setup lang="ts">`
- Stores: `use` prefix (e.g., `useRecordingStore`)
- Tests: `.test.ts` co-located with source
- Prettier: 90 char width, double quotes, semicolons
- Imports: external libraries first, then `@/` internal imports
- Use Immer for complex state updates in the scenario store
- Do not add Co-Authored-By lines to commit messages
