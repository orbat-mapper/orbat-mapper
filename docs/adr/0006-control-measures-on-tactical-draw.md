# Control measures on `@orbat-mapper/tactical-draw`

Doctrinal control measures (boundaries, axes of advance, phase lines, …) are a new
kind of scenario layer item — `tacticalGraphic` — drawn, edited and rendered by the
published `@orbat-mapper/tactical-draw` + `@orbat-mapper/control-measures` packages
in the MapLibre scenario view. They are **not** modelled as geometry layer items and
do not go through `maplibreScenarioFeatures.ts`.

This is stage one of a staged replacement. Stage two migrates the existing plain
point/line/circle/polygon draw stack onto the same library and retires
`maplibreScenarioFeatures.ts`; every decision here is made with that endgame in
view, and the places where stage one accepts a cost that stage two removes are
named below.

## Why

Control measures are a large, doctrinally-specified body of symbology (78 kinds in
the current registry, each with its own control-point rules, amplifiers and
rendering). Hand-rolling them against our own draw stack is not a feature, it is a
standard. The library already implements the geometry, the rendering and the
draw/edit interaction, and is maintained alongside this project.

The alternative — extending `geometryKind` with 78 members and teaching
`maplibreScenarioFeatures.ts` to render each — was never seriously in the running:
it duplicates the library and couples doctrinal symbology to the shape pipeline we
intend to retire.

## Two seams, one engine

There are now **two** unrelated things called `MapAdapter`, and they stay distinct.

- orbat-mapper's `MapAdapter` (`src/geo/contracts/`) is the permanent
  scenario-logic-to-map seam from [ADR-0005](0005-replace-openlayers-with-maplibre.md).
- tactical-draw's `MapAdapter` is the library's own ABI for driving a map. It is
  imported here aliased as `TacticalDrawMapAdapter`.

The MapLibre engine constructs both over the **same** `maplibre-gl` map instance.
`ScenarioMapEngine` grows a third member, `draw`, alongside `map` and `layers`,
holding the tactical-draw surface; it is **optional**, and an engine that has no
tactical-draw adapter simply leaves it undefined. Capability-gated UI derives from
its presence rather than from an engine name.

ADR-0005's seam is untouched — not widened, not reimplemented, not merged with the
library's. They answer different questions: ours keeps scenario logic testable
without a real map, theirs lets one drawing engine target several map vendors.
Collapsing them would mean either adopting the library's ABI as our scenario seam
(coupling every scenario module to an alpha package) or teaching the library to
speak ours (a fork).

The surface owns one hazard that the rest of the app must not have to know about:
tactical-draw's `@ready` fires on `load`, and a basemap swap never re-fires it. The
surface therefore **re-attaches on `style.load` itself** and replays the last
`render()`. The façade identity changes underneath any long-lived host code, so no
caller may capture a `Pick<TacticalDraw, …>` and hold it.

## `tacticalGraphic` as the data model

`TacticalGraphicLayerItem` was declared in `src/types/scenarioLayerItems.ts` but
never implemented. Stage one fills that slot rather than inventing a parallel store.

The item **flattens** the library's `ControlMeasure` rather than embedding one:
`graphicKind` (the library's `ControlMeasureKind`), `controlPoints`, `options`,
`textAmplifiers`, `amplifierPlacements`, and `style?: ControlMeasureStyle`
**verbatim**. Three fields are host-owned and have no library counterpart:
`standardIdentity`, `colorMode` and `status`.

Field-by-field reasoning:

- **`options` is stored opaquely, not typed.** Per-kind option typing lives at the
  round-trip seam (`toControlMeasure`), not in the persisted model. A discriminated
  union over 78 kinds in the stored type would make every scenario-store write
  narrow on `graphicKind`, and would break on any kind the pinned library adds.
- **`style` is the library's `ControlMeasureStyle`, not our `ScenarioLayerItemStyle`.**
  Ours cannot express four of its eight fields, including the central `color`.
  Mapping between them would be lossy in the direction that matters.
- **`standard` is deleted.** The library is 2525E-only, so the field selects between
  nothing.
- **No id reconciliation.** The host injects `nanoid` as tactical-draw's
  `generateId`, so `ControlMeasure.id === item.id` from birth.
- **No `schemaVersion` on the item.** The library reads it nowhere; the scenario
  file version governs, and the package pin is exact, so the scenario version is
  already a faithful proxy for the library version.

`standardIdentity`, `colorMode` and `status` exist because the library models
**neither identity colouring nor status**. Both are host projections, resolved at
the `toControlMeasure` seam and **never written into storage**:

```
color      = style.color      ?? (monochrome ? "#000000" : identityColor(sid))
strokeDash = style.strokeDash ?? (planned    ? [8, 6]    : [])
```

`identityColor` derives from milsymbol's saturated colour mode — the same source the
unit symbols use — so a control measure and a unit of the same identity match on the
same map, and this project's Custom1/Custom2 identities resolve for free. That
requires `milsymbwrapper.ts`'s sidc-rewrite/colour-mode-swap to be refactored into an
extractable function. Monochrome is fixed `#000000` rather than a surface-tone model:
this app's dark mode tracks UI chrome, and the basemap never inverts.

`standardIdentity` is the item's **own field**, not a `sideId` reference. Nothing in
this data model has ever pointed a layer or layer item at a side, and a control
measure is not owned by one.

### The base passes this forces

Three code paths were written as if `geometry` were the only layer item kind, and all
three become **kind-agnostic base passes** with geometry layering its own handling on
top:

- `convertStateToInternalFormat`'s `if (item.kind !== "geometry")` escape hatch, which
  stored non-geometry items verbatim and so left `t`/`visibleFromT`/`visibleUntilT` as
  ISO strings on read-back.
- `updateFeatureState` and `updateGeometryItemHidden`, which never computed
  `_state`/`_hidden` for anything but geometry. Those two fields move to
  `ScenarioLayerItemBase`.

This is not incidental cleanup: it repairs the existing annotation and measurement
kinds, whose declared timed state has never actually projected.

## Commit on settle

A tactical-draw **session** — an open draw or edit interaction — is transient and
**never touches the scenario store**. Exactly one scenario-store update happens per
settled session, so a whole drawn control measure is one undo step and an aborted
session leaves zero undo steps by construction.

While a session is open, Ctrl+Z drives tactical-draw's own `SessionHistory`; with no
session open it drives scenario undo. During a **draw** session Ctrl+Z is swallowed
outright: `DrawSession` has no history and no remove-last-point, so letting the key
through would settle a half-drawn graphic into the scenario store. During draw there
is only abort.

Two obligations follow from the library's contract and are not optional:

- **The host must call `render()` after folding a commit.** The library hands the
  override back and expects the host's next render to be authoritative.
- **Mid-session writes are forbidden.** A `render()` whose batch omits the graphic
  being edited aborts that session.

The second collides with everything that re-renders on its own schedule —
time-scrubbing, layer-visibility toggles, tool switching. It is resolved by
**settle-first**: anything that feeds `render()` settles any open session before
re-rendering (an edit closes and keeps its work; a draw aborts). The guard is placed
on **the render feed, not the clock**, so a visibility toggle settles too, and arming
a different tool is a second settle trigger with the same disposition.

## A separate render layer, with interleaving deferred

Control measures render through tactical-draw, stacked **above** the flat scenario
feature source that `maplibreScenarioFeatures.ts` maintains. They are not merged into
it.

The accepted cost is stated plainly: **a control measure always draws above every
plain shape, regardless of layer order in the layers panel.** A user can reorder
layers and the control measure will not move below a polygon. This is a real
limitation, not a subtlety, and it is **temporary**: stage two unifies the renderer,
`maplibreScenarioFeatures.ts` dies, and z-order becomes one ordering over one stack.

The same split produces a second visible consequence: **topmost wins on selection**,
with tactical-draw's `onPick` short-circuiting the plain-feature query when nothing is
armed, so a plain shape lying under a control-measure fill is unclickable until stage
two. (When a tool *is* armed, clicks are swallowed entirely by the existing
selection-disable watcher, generalised from `isDrawing` to "anything armed".)

Outbound rendering is reached through a pure `buildTacticalGraphicRenderPlan`,
mirroring the existing `buildScenarioFeatureRenderPlan`, so the store-to-`Graphic[]`
direction is testable without a map. `toControlMeasure` is memoised by item identity
via a `WeakMap` in the render path; nothing derived is stored and no projection cache
enters the scenario store.

### Rendering facts that are load-bearing

The adapter is constructed in **`viewChangeMode: "settle"`**. Treat this as
load-bearing, not a tuning knob. MapLibre emits `zoom` on every frame of a *pure pan*,
so the default `"continuous"` mode re-renders the entire stack per frame — measured at
**1400 `updateData` calls in one 2 s pan over 50 graphics**, collapsing pan to 15 fps.
In `"settle"` mode the same scene holds 59 fps, and the interactive ceiling moves from
~25 graphics to **~150–200**. The documented cost is that pixel-fit chrome refits at
`moveend` instead of scaling mid-animation. A future edit reverting to the default
silently costs 4× frame rate. (#643)

Vue reactivity must not reach anything the engine holds: **`markRaw`/`shallowRef`
around the surface, the façade and the graphics**, because deep reactivity breaks
tactical-draw's object-identity render cache. Since `render()` is the only door, this
is enforced by a dev-only shallow runtime guard inside it that warns once, rather than
by convention. (#632, #642)

Fill-pattern textures are **never released** by the library — one 16 kB image per
distinct (colour, pattern) pair, not reclaimed even when the graphic is deleted. A
colour-picker drag emits hundreds of intermediate colours, so the host commits colour
on **picker settle**. Commit-on-settle already wanted this; one rule serves both. (#643)

## Published alphas, pinned exactly

`@orbat-mapper/tactical-draw`, `@orbat-mapper/control-measures` and their adapter
package are consumed as **published alpha releases, pinned to exact versions**. No
`link:`/`file:` references to a local checkout, in any branch that is meant to merge.

A gap in the library is closed by an explicit publish, not by a local edit. This is
deliberately inconvenient: a local link makes the repo unbuildable for anyone else and
makes "which library behaviour are we actually depending on?" unanswerable from the
lockfile. The exact pin is also what lets the scenario file version stand in for the
library version, since a range would break that correspondence.

The library is treated as **trusted code**, not as a subject under test. Its
`/testing` conformance suites are adapter-*author* suites and we consume a published
adapter, so they are of no use here. Where a fake is needed, it impersonates a
**host-owned** seam (`TacticalDrawSurface`, which absorbs the session methods) rather
than a `Pick<TacticalDraw, …>` that goes stale on every façade re-attach and every
alpha bump.

## Consequences

- **Bundle cost: +79.4 kB gzip (+289 kB raw)**, entirely inside the lazy MapLibre
  route chunk. No cost to any other route. (#634)
- **First population of the tactical-draw stack is ~O(n²)** — 464 ms at 100 graphics,
  ~1.5 s at 200, 5.4 s at 400 — because each new bundle's `addSource`/`addLayer`/
  `moveLayer` walks the whole style. It is paid on scenario load **and on every
  basemap swap**, since the surface re-attaches on `style.load` and replays
  `lastRendered`. **Accepted for stage one**: no progressive population, no busy
  affordance, no batching. It is the first thing to revisit if the interactive ceiling
  is ever raised. (#643)
- Steady state is otherwise free: at 400 graphics, 6 ms to rebuild every object, 5 ms
  to reverse z-order, 1 ms for a single edit. Time-scrubbing and layer reordering are
  not a performance concern. (#643)
- Layer count is **not** a risk and nothing is capped: 1.74 style layers per graphic on
  average, max 3 across all 78 kinds, plus one GeoJSON source each. (#643)
- **CI cannot tell whether the map actually drew.** Outbound testing stops at the
  `Graphic[]`. The compensating artifact is `tacticalDrawProbe.ts`, promoted from
  throwaway to a permanent dev-only smoke surface over representative kinds — the
  named thing a library bump is checked against. (#642)
- **Two things are called `MapAdapter`.** An unqualified "the adapter" is now ambiguous
  in this codebase; see `CONTEXT.md`.
- **`snap` in the draw toolbar means two things** — OpenLayers-style snapping for plain
  shapes, tactical-draw's `setSnappingOptions` for control measures — behind one
  button. `freehand` is hidden for control measures (meaningless — no library concept)
  and `translate` is disabled (the API exists but is stage-two work).
- **Escape now takes two presses** to also clear selection, because the armed tool
  consumes the first. In exchange, three separate non-propagation-stopping Escape
  listeners collapse to one owner.
- **`useScenarioDraw` is hoisted** out of `MapEditorDrawToolbar` (which is `v-if`'d and
  therefore unmounts) to the map view, and provided. Side effect, and an improvement:
  `snap`/`translate`/`freehand` stop silently resetting every time the toolbar is
  reopened.
- **Exports emit the rendered graphic, not its parameters.** GeoJSON emits
  `renderControlMeasure`'s output — one graphic becomes N features, each carrying the
  full item-level bag plus a structural `cmId`. This breaks with this project's own
  derived-render precedent (a circle exports its stored Point + `radius`, never the
  ring), which is legible for a circle and meaningless for an axis of advance. The
  exported parameter bag is **write-only** until import reconstruction is built. (#638)
- **KML is unstyled** for control measures — the tokml fork's `StyleSettings` models
  only unit `IconStyle`, so identity colours and Planned dashes are invisible. Accepted
  because the library will own KML output. (#638)
- **Image export captures control measures but renders them hairline-thin**, since
  `scaleUnitSymbolLayers` gates on `isUnitLayerId`. Accepted and deferred to #645. (#638)
- **`SCENARIO_FILE_VERSION` moves to `3.4.0` as a signal, not a migration**, so an older
  build warns rather than silently mishandling a scenario containing control measures.
- **An unknown `graphicKind` is stored verbatim**, filtered out of the `render()` batch,
  reported as one aggregated warning at load, and listed in the layer tree flagged as
  unsupported. Necessary rather than tidy: `render()` is a batch call and
  `DEFINITIONS[kind]` on an unknown kind throws a raw `TypeError` that would blank the
  entire layer. No placeholder graphic is substituted — a generic stand-in would carry
  the real id, so editing it would commit the wrong kind over the unknown one. (#637)
- **Mobile is not designed.** The whole keyboard layer decided here (Escape/Enter/
  Ctrl+Z) does not exist on a phone; this ADR assumes a keyboard. Touch behaviour is
  handled when stage two unifies the draw stack. (#647)

## What stage two owns

Named here so nothing above reads as permanent by omission: migrating plain
point/line/circle/polygon onto tactical-draw, retiring `maplibreScenarioFeatures.ts`,
unifying z-order so control measures and plain shapes interleave, `translate` /
`syncTransformGraphics`, the `external` snapping provider, and mobile interaction. The
~150–200 interactive ceiling is a budget over *all* rendered graphics, so migrated
plain shapes draw against the same allowance rather than a fresh one.
