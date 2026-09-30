# Replace OpenLayers with MapLibre as the scenario map engine

The scenario map is rendered by MapLibre GL. The legacy OpenLayers view and its dependencies have been removed. Old `/scenario/:id/legacy` links redirect to the default map view.

## Why

MapLibre's GPU-based rendering gives the globe projection, vector-tile styling, and smooth interaction at scenario sizes where the OpenLayers canvas renderer struggled. OpenLayers' richer built-in interaction/format toolkit (draw, select, KML) was the reason it was chosen originally; that gap has since been closed with our own code and `@turf`, which also replaces OL's geo math in shared modules.

## The MapAdapter seam is permanent

MapLibre implements the vendor-agnostic contract in `src/geo/contracts/scenarioMapEngine.ts` (`MapAdapter` / `ScenarioLayerController`), and shared state (e.g. `geoStore`) holds a `MapAdapter`, never a MapLibre map instance. This seam is **deliberately kept after removing OpenLayers**, even though it has a single implementation: it keeps scenario logic testable without a real map, and keeps a future engine swap from being another cross-cutting rewrite. Do not "simplify" it away.

## Removal completed

The legacy view, rendering adapters, interactions, styles, basemap configuration, deprecation notice, and tests were removed together with `ol`, `ol-ext`, and their exclusive transitive dependencies. Shared tools now use their MapLibre implementations. The migration-only ESLint inventory and reachability script have also been removed.

The `/scenario/:id/legacy` URL remains only as a redirect, matching the other retired mode URLs (`/maplibre`, `/globe`). There is no legacy mode entry in the UI.
