# ORBAT Mapper - Copilot Instructions

## Project Overview

ORBAT Mapper is a client-side web application for building order of battles (ORBATs) and plotting unit locations on maps. It allows users to recreate historic battles and military scenarios in the browser.

## Technology Stack

- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Routing**: Vue Router
- **Testing**: Vitest
- **Package Manager**: pnpm (v10.25.0+)
- **Node Version**: 20.10.0+

## Development Setup

### Installing Dependencies
```bash
pnpm install
```

### Running Development Server
```bash
pnpm run dev
```
Development server runs on http://localhost:5173/

### Building the Project
```bash
pnpm run build
```
This runs type checking and builds the project.

### Type Checking
```bash
pnpm run type-check
```

### Running Tests
```bash
pnpm run test:unit
```
Tests use Vitest framework.

### Code Formatting
```bash
pnpm run format
```
Uses Prettier with Tailwind CSS plugin. Configuration in `.prettierrc`.

## Code Standards

### TypeScript
- Always use TypeScript for new files
- Prefer type inference where possible
- Use interfaces for object shapes
- Enable strict type checking
- Path alias `@/` maps to `./src/`

### Vue.js
- Use Composition API with `<script setup>` syntax
- Prefer `ref` and `reactive` for reactive state
- Use composables for reusable logic
- Place composables in `src/composables/`

### Code Style
- Prettier handles formatting automatically
- Print width: 90 characters
- Use Prettier plugin for Tailwind CSS class sorting
- Run `pnpm run format` before committing

### File Organization
- `src/components/` - Reusable Vue components
- `src/views/` - Page-level components
- `src/composables/` - Composition API composables
- `src/stores/` - Pinia stores
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/geo/` - Geographic/mapping functionality
- `src/symbology/` - Military symbology handling
- `src/modules/` - Feature modules

### Testing
- Write tests using Vitest
- Test files use `.test.ts` extension
- Place tests alongside the code they test
- Use `describe`, `it`, and `expect` from Vitest
- Mock external dependencies when necessary

### Imports
- Use `@/` alias for absolute imports from src directory
- Example: `import { Sidc } from "@/symbology/sidc"`
- Group imports: external libraries first, then internal modules

## Key Dependencies

### Mapping
- OpenLayers (`ol`) - Core mapping library
- Turf.js (`@turf/*`) - Geospatial analysis

### UI Components
- shadcn-vue - Component library built on Reka UI primitives
- Tailwind CSS - Utility-first CSS framework
- Lucide Vue - Icon library

### Data Handling
- Immer - Immutable state updates
- IDB - IndexedDB wrapper
- fflate - Compression

### Symbology
- milsymbol - Military symbol generation

## Important Conventions

1. **Immutability**: Use Immer for state updates in stores
2. **Accessibility**: Ensure UI components are keyboard navigable and screen reader friendly
3. **Performance**: Consider map performance when adding features (large datasets, rendering)
4. **Type Safety**: Avoid `any` types, use proper TypeScript types
5. **Composition**: Prefer composition over inheritance
6. **Single Responsibility**: Keep components and functions focused
7. **Documentation**: Add JSDoc comments for complex functions

## Working with Maps

- Map functionality is in `src/geo/`
- Uses OpenLayers for map rendering
- Map configuration in `public/config/mapConfig.json`
- Be cautious with map layer performance

## Building for Production

1. Run type checking: `pnpm run type-check`
2. Build the app: `pnpm run build`
3. Output goes to `dist/` directory
4. Preview production build: `pnpm run preview`

## Common Patterns

### Creating a New Component
- Use `<script setup lang="ts">`
- Define props using `defineProps<>()`
- Define emits using `defineEmits<>()`
- Keep components small and focused

### Creating a New Store
- Use Pinia with Composition API style
- Define store in `src/stores/`
- Export using `defineStore`
- Use Immer for complex state updates

### Adding Tests
- Create `.test.ts` file alongside code
- Import from Vitest: `import { describe, it, expect } from "vitest"`
- Test core logic and edge cases
- Mock external dependencies

## Documentation

- Documentation source is in `docs/` directory
- Uses VitePress
- Run docs dev server: `pnpm run docs:dev`
- Build docs: `pnpm run docs:build`

## Notes for AI Assistance

- This is an active project with frequent changes
- Prioritize type safety and code quality
- Consider map rendering performance in changes
- Test changes that affect core functionality
- Follow existing patterns in the codebase
- When in doubt, check similar existing code
