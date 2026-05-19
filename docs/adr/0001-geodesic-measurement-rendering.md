# Geodesic measurement rendering in MapLibre

The MapLibre measurement tool renders each line/polygon segment as a densified great-circle arc (via `@turf/great-circle`) instead of a straight lng/lat chord — unconditionally, in both globe and Mercator projections. Densification is skipped for segments under ~100 km and capped at ~1° angular resolution (8–128 points) to avoid visual noise. Segment labels and midpoint edit handles are placed at the great-circle midpoint so they sit on the rendered arc.

## Why

Measurement is fundamentally about distance, and a straight lng/lat chord misrepresents what `turfLength` reports: on the globe the chord visibly leaves the surface, and even on Mercator a long chord is not the path the distance number describes. Other line tools (draw interaction, KML, OL) deliberately stay chord-based because they represent drawn shapes, not measurements — so this divergence is intentional and scoped to the measurement tool only.

## Consequences

- On flat Mercator maps, long measurement lines visibly bow (the classic "flight path" arc). This is the geodesically honest rendering and matches the reported length, but contributors familiar with chord-based line tools may initially read it as a bug.
- Stored vertices remain un-densified; densification is a render-time transform only. Length math, undo/redo, and serialization are unaffected.
- Antimeridian crossings are densified in the unwrapped vertex frame (turf's split is suppressed via `offset: 200`) so a single `LineString` survives through the layer.
