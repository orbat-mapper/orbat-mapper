# Strict discriminated `GeometryLayerMeta`

`GeometryLayerMeta` (the metadata on a drawn geometry layer item) is a discriminated union keyed on `geometryKind`: the `"Circle"` member carries a required `radius: number`, the `"Polygon"` member carries an optional `shape?: "rectangle"`, and a single `Exclude<ScenarioFeatureType, "Circle" | "Polygon">` catch-all member covers the remaining six kinds with no extra fields. A separate flat `LoadableGeometryLayerMeta` (all fields optional, non-discriminated) is used for the load/upgrade/patch paths, and the one runtime-kinded construction in `upgrade.ts` is asserted across that boundary with `as GeometryLayerMeta` rather than routed through a factory.

## Why

`radius` is only meaningful for a Circle (which is stored as a Point geometry plus a radius — see CONTEXT.md) and `shape` only for a Polygon, but the previous flat interface let any kind carry either field, so radius-less circles and rectangle-marked points were representable. Encoding the constraint in the type makes those states unrepresentable and lets reads narrow on `geometryKind` instead of defensively null-checking.

A strict union cannot describe data that is mid-load or partially patched, where the kind and its extra fields are not yet guaranteed to agree. `Partial<union>` does not solve this — `keyof` a union is the intersection of member keys, so it collapses to `{ geometryKind? }` and silently drops `radius`/`shape`. Hence a deliberate second, loose type for those boundaries.

The legacy upgrade path builds metadata from a kind only known at runtime. A factory that switches on the kind would centralise narrowing, but there is exactly one such call site, so a localised cast is proportionate; a factory is the documented upgrade if more runtime-kinded construction sites appear.

## Consequences

- Two parallel metadata types now exist (`GeometryLayerMeta` strict, `LoadableGeometryLayerMeta` loose). A reader must know which boundary they are at; the strict one is canonical, the loose one is only for loading/upgrading/patching.
- Reads of `radius`/`shape` must narrow first (`"radius" in meta`, or `geometryKind === "Circle"`). Code that already branched on `geometryKind` gets simpler — the redundant null-check on `radius` drops out.
- The `as GeometryLayerMeta` cast at the upgrade boundary is the one place the guarantee is asserted rather than proven. A pre-3.2.0 circle missing its radius would pass as a valid `CircleMeta`; this preserves the prior tolerance (radius was optional before) rather than introducing a regression, but it is the spot to revisit (with a factory and a fallback) if legacy data proves untrustworthy.
