# Point symbols as their own layer item

Symbol set 25 point control measures that the control-measures library does not
generate — checkpoints, contact points, air control points, … — are a new scenario
layer item, `pointSymbol`: a SIDC, a position, a rotation, a size and text
amplifiers, drawn by milsymbol through tactical-draw's point-symbol capability
(`@orbat-mapper/point-symbols`). They live in control-measure layers beside
`tacticalGraphic` items and share their render feed, sessions and panels.

## Why

The control-measures registry covers line and area graphics plus a handful of
points; MIL-STD-2525E has some 250 more point graphics that are plain milsymbol
symbols with a single anchor. Users expect to find them in the same catalogue and
to handle them like any other control measure. Three other homes were considered:

- **A unit with a symbol set 25 SIDC.** Units are the only things that render a
  SIDC on the map today, but they belong to the ORBAT: a checkpoint would appear in
  the unit tree, take part in unit time-state, and be exported as a unit.
- **A geometry Point with a SIDC in its style.** Smaller, but it bends the plain
  shape model ([ADR-0002](0002-strict-geometry-layer-meta.md)) and the renderer
  that stage two of [ADR-0006](0006-control-measures-on-tactical-draw.md) retires.
- **A `tacticalGraphic` with a pseudo `graphicKind`.** `graphicKind` is the
  library's `ControlMeasureKind`; an invented value would be filtered out as
  unsupported, and its `controlPoints`/`options` fields do not describe a symbol.

A separate kind keeps each model honest, and tactical-draw already renders, picks
and edits `PointSymbol` graphics, so nothing about drawing has to be hand-rolled.

## Decisions

- **Model.** `PointSymbolLayerItem` flattens tactical-draw's `PointSymbol` the way
  `TacticalGraphicLayerItem` flattens a `ControlMeasure`, and the item id is the
  graphic id. Identity and status are read from the SIDC rather than stored beside
  it. Rotation is stored in radians as the library holds it; size defaults to 30
  screen pixels, like a unit symbol. A symbol can instead be sized on the ground in
  meters, as in tactrace: it then carries the on-screen floor and cap its projection
  is clamped to, and switching unit converts at the current zoom so the symbol keeps
  its apparent size.
- **Layers.** `pointSymbol` and `tacticalGraphic` are the two control-measure layer
  item kinds (`isControlMeasureLayerItemKind`); the specialization rule from
  ADR-0006 applies to both, on add, move and load.
- **Rendering.** The render plan emits `toPointSymbol(item)`, memoised by item
  identity like `toControlMeasure`, in the same bottom-to-top batch. One shared
  `milsymbolPointSymbols` capability survives façade rebuilds.
- **Authoring.** `psDraw` joins the armed-tool union: one click places a symbol.
  A drop from the catalogue writes the item directly. A placed symbol opens in a
  `cmEdit` session (move, rotate, resize) — the edit session branches on kind, and
  a changed session is still one store write.
- **Picking.** `ownsInteractionAt` only tests a point symbol's anchor, so the host
  also tests the rendered footprint (`TacticalDrawSurface.pointSymbolAt`), as
  tactrace does through `onGraphicPick`.
- **Amplifiers.** The applicable fields per SIDC and their milsymbol options are
  ported from tactrace (`pointTextAmplifiers.ts`) and wired as the capability's
  `resolveOptions`.
- **Versions.** `@orbat-mapper/point-symbols` is pinned to 0.2.10, the last release
  built against tactical-draw 0.13; moving to 0.2.11+ means moving tactical-draw to
  0.14.

## Consequences

- Point symbols are not yet included in GeoJSON, KML or MilX export, and their
  position is not recorded into timed state; both follow the `tacticalGraphic`
  paths when added.
- Stage two of ADR-0006 inherits a second graphic kind on the same engine, which is
  the direction it was already heading.
