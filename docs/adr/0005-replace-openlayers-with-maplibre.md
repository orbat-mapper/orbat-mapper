# Replace OpenLayers with MapLibre as the scenario map engine

The scenario map is rendered by MapLibre GL. The original OpenLayers implementation lives on only as the "legacy map view" (`/scenario/:id/legacy`), which is marked obsolete in the UI and will be deleted once shared code is fully decoupled from `ol`. All functionality has been ported; remaining differences die with the legacy view.

## Why

MapLibre's GPU-based rendering gives the globe projection, vector-tile styling, and smooth interaction at scenario sizes where the OpenLayers canvas renderer struggled. OpenLayers' richer built-in interaction/format toolkit (draw, select, KML) was the reason it was chosen originally; that gap has since been closed with our own code and `@turf`, which also replaces OL's geo math in shared modules.

## The MapAdapter seam is permanent

Both engines implement the vendor-agnostic contract in `src/geo/contracts/scenarioMapEngine.ts` (`MapAdapter` / `ScenarioLayerController`), and shared state (e.g. `geoStore`) holds a `MapAdapter`, never a MapLibre (or OL) map instance. This seam is **deliberately kept after the OpenLayers code is deleted**, even though it will then have a single implementation: it keeps scenario logic testable without a real map, and keeps a future engine swap from being another cross-cutting rewrite. Do not "simplify" it away.

## Deletion day

The authoritative inventory of legacy-only code is `LEGACY_OPENLAYERS_FILES` in `eslint.config.ts`; an ESLint rule bans `ol`/`ol-ext` imports everywhere else (the `PENDING_OPENLAYERS_DECOUPLE` list must shrink to empty first). Removal means: delete the listed files, drop the `/scenario/:id/legacy` route **but keep it as a redirect** to the default map route (the established pattern for retired mode routes, e.g. `/maplibre`, `/globe`), remove the mode-switcher entry, remove `ol` and `ol-ext` from `package.json`, and delete the ESLint rule.
