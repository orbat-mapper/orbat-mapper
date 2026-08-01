# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ORBAT Mapper is a client-side Vue 3 web application for building order of battles (ORBATs) and plotting unit locations on maps. No backend — state persists locally via IndexedDB.

## Gotchas

- **Tailwind CSS v4** is configured in `src/styles.css` with `@theme` syntax — there is no `tailwind.config.ts`.

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

## Conventions

- Path alias: `@/` → `./src/`
- Components: PascalCase files, `<script setup lang="ts">`
- Stores: `use` prefix (e.g., `useRecordingStore`)
- Tests: `.test.ts` co-located with source
- Imports: external libraries first, then `@/` internal imports
- Use Immer for complex state updates in the scenario store
- Do not add Co-Authored-By lines to commit messages

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`orbat-mapper/orbat-mapper`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
