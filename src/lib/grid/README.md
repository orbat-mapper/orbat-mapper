# Grid module

Imported from TacTrace commit `c6eb796e97b8333a46397a0d80ab5be83cb45f40`.
ORBAT Mapper uses GeographicLib directly for CRS selection so this reusable
module does not pull TacTrace's map-sheet/export dependency chain into the app.

This folder is the reusable seam for military grid behavior. It owns grid
definitions, projection, portrayal, snapping, labels, vector-tile generation,
and MapLibre protocol registration. It has no Vue, Pinia, TacTrace store, or
TacTrace document dependencies.

Consumers normally import from `index.ts` and call `buildGridPortrayal`. The
call supplies a map adapter, active definitions, appearance, and only the
portrayal parts already retained by the host renderer. The result contains the
linework, labels, resolution, accuracy, and MGRS metadata for every grid mode.
This keeps the UTM/MGRS/latitude-longitude/local dispatch inside the module.

`createGridSnapProvider` exposes snapping through the same definitions.
`maplibre.ts` is the optional MapLibre adapter for retained vector-tile
linework. The remaining files are implementation details and should not be
imported by host application code.
