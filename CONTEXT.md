# ORBAT Mapper

Client-side tool for building order of battles and plotting unit locations and
drawn geometry on a map. This glossary captures terms whose meaning is specific
to this project and not obvious from the code.

## Language

### Layers

**Active layer**:
The single overlay layer that receives newly authored items. Its specialization and
the editor's current authoring rules determine which kinds of items can be added;
activating a control-measure layer replaces the active feature layer, and vice versa.
When the user switches authoring families, the editor restores the most recently used
compatible layer, creating one only if none exists.

**Feature layer**:
An unspecialized overlay layer. The current editor authors geometry, annotations, and
measurements into it; future mixed-item authoring can broaden that behavior without a
stored-model migration.

**Layer specialization**:
An optional restriction expressing that an overlay layer is dedicated to one content
family. Existing layers remain unspecialized; specialization is not a required
category on every layer.

**Locked layer**:
A layer whose contents cannot be added, edited, duplicated, deleted, reordered, or
moved. The layer itself can still be shown or hidden, renamed, time-bounded,
reordered, unlocked, or deleted.

### Geometry

**Geometry layer item**:
A drawn feature on the map (point, line, circle, polygon, …) stored in an
overlay layer. Holds a GeoJSON `geometry`, presentation `style`, and
`geometryMeta`.

**geometryKind**:
The kind of shape a geometry layer item represents — _not_ the same as the
GeoJSON `geometry.type`. Most kinds match the GeoJSON type, but **Circle** is
the deliberate exception.
_Avoid_: "geometry type" when you mean the kind.

**Circle**:
A geometryKind stored as a **Point** geometry plus a required `radius` (metres).
There is no GeoJSON circle; the radius lives on `geometryMeta`, and the on-map
circle is reconstructed from the point and radius at render time.

**Rectangle**:
A **Polygon** that should stay axis-aligned while edited. The geometry remains a
plain Polygon; the intent is recorded as `geometryMeta.shape = "rectangle"`.
Only a Polygon can be a rectangle.
_Avoid_: treating "rectangle" as a separate geometryKind — it is a marker on a
Polygon.

**Canonical vs loadable metadata**:
`GeometryLayerMeta` is the **canonical** strict shape (each geometryKind carries
only its meaningful fields). `LoadableGeometryLayerMeta` is the **loose**
counterpart used for data still being loaded, upgraded, or partially patched,
where the kind and its extra fields cannot yet be guaranteed to line up.

### Control measures

**Control-measure layer**:
An overlay layer specialized for control measures. Its identity persists even while
empty; it is not inferred from the items it happens to contain. The current editor
does not author mixed content.

**Control-measure stack**:
The ordered collection of control-measure layers. Layers can be reordered within this
stack, but the whole stack renders above all feature layers; cross-family interleaving
is not currently supported.

**Control measure**:
A doctrinal tactical graphic — boundary, axis of advance, phase line, fire
support area, … — drawn and rendered by the `@orbat-mapper/control-measures`
registry rather than by our own shape pipeline (see [[adr-0006]]). Not a geometry
layer item, and deliberately not a `geometryKind`.

**Control-measure state**:
A control measure's time-indexed form. Its identity persists while its control points,
and therefore its geometry, can vary across scenario time.

**graphicKind**:
Which control measure it is — the library's `ControlMeasureKind`. Named
deliberately in parallel with **geometryKind**: same role, different family.
_Avoid_: "graphicCode" (an earlier name for this field, dropped before it shipped).

**The three names for one control measure**:
It is a **tacticalGraphic layer item** where it is stored (`graphicKind`,
`controlPoints`, opaque `options`, amplifiers, host-owned identity/status), a
**ControlMeasure** once projected for the library at the `toControlMeasure` seam,
and a **Graphic** by the time it reaches `render()`. Use the name that belongs to
the seam you are at; the stored item is the only one that is persisted.

**Colour mode** and **Status**:
`"identity" | "monochrome"`, and Present vs Planned (Planned renders dashed).
Neither exists in the control-measures library — both are **host projections**,
resolved at the `toControlMeasure` seam and never written into storage. Identity
colours come from milsymbol's saturated colour mode, the same source the unit
symbols use, so a control measure matches a unit of the same identity.
_Avoid_: storing a resolved colour. The stored `style.color` is an _authored_
override; absent it, colour is derived per render.

**Session** (draw session / edit session):
An open control-measure interaction owned by tactical-draw. Transient — nothing
reaches the scenario store while it is open.

**Commit on settle**:
At most one scenario-store update per settled session. A changed session is one undo
step; an unchanged edit or aborted draw leaves none.

**Settle-first**:
The rule that anything feeding `render()` settles an open session before
re-rendering — an edit closes and keeps its work, a draw aborts. The guard is on
the render feed, not the clock, because a mid-session `render()` that omits the
edited graphic aborts its session.

**Armed tool**:
The one thing the map is currently armed to do — `none`, `plainDraw`,
`plainModify`, `cmDraw`, `cmEdit` — as a single union across both draw families,
so "at most one thing armed" holds by construction.
_Avoid_: reading `currentDrawType` / `isModifying` as state; they are derived from
the armed tool.

### Unit resources

**Unit resource**:
A counted thing a unit holds, drawn from a catalog: **equipment**, **personnel**,
or **supplies**. These three are the **resource kinds**. Internally every per-unit
entry shares one shape — a catalog `id`, a `count`, and an optional `onHand` — so
the apply and name↔id round-trip logic is written once (`unitResources.ts`) rather
than per kind.
_Avoid_: treating equipment/personnel/supplies as three unrelated features at the
entry level. They diverge only at the **catalog** layer (supplies adds a supply
class and a unit of measure; equipment and personnel are flat).

**update vs diff** (on a timed unit state):
An **update** replaces fields on matching resource entries (matched by `id`) — used
for reorganization. A **diff** accumulates an `onHand` delta on matching entries
(`onHand = (onHand ?? count) + delta`) — used for attrition and resupply. `diff`
only ever touches `onHand`.

### Map engines

**Map engine**:
A concrete map rendering stack (MapLibre; formerly also OpenLayers) plugged in
behind the vendor-agnostic **MapAdapter** contract. Scenario logic talks to the
adapter, never to a vendor map object.

**MapAdapter**:
The permanent seam between scenario logic and the map engine (see
[[adr-0005]]). It is not migration scaffolding: it stays even with only one
engine implemented.
_Avoid_: an unqualified "the adapter". `@orbat-mapper/tactical-draw` ships its
own, unrelated `MapAdapter` ABI, imported here as **TacticalDrawMapAdapter**;
both are constructed over the same `maplibre-gl` map and they stay distinct (see
[[adr-0006]]).

**Tactical-draw surface**:
The object owning the `TacticalDrawMapAdapter` and the tactical-draw façade,
hanging off `ScenarioMapEngine.draw`. Optional — an engine without one leaves it
undefined, and control-measure UI is capability-gated on its presence. It also
owns the re-attach: tactical-draw's ready signal never re-fires after a basemap
swap, so the surface re-attaches on `style.load` and replays the last render.
_Avoid_: capturing the façade (`Pick<TacticalDraw, …>`) anywhere long-lived — its
identity changes underneath you on every re-attach.

**Legacy map view**:
Specifically the removed OpenLayers-based scenario editor view — a historical
term kept so old commits and docs stay intelligible.
_Avoid_: using "legacy" for other retired routes (`/maplibre`, `/globe` are old
_URLs_ that redirect, not the legacy view).

### Offline use

**Offline level**:
How much infrastructure a deployment still depends on, on two independent axes —
where the **application** is delivered from, and where the **map data** comes
from. Three named rungs: **Level 1 — Self-hosted** (own web server, own tile
server), **Level 2 — Local map file** (served application, basemap read from the
user's disk), **Level 3 — Standalone file** (application _and_ basemap read from
the user's disk). The numbering is a ladder of removed infrastructure, not a
ranking of "how offline" — a Level 2 deployment on a public host still needs the
network to load the application.

**Basemap archive**:
A single file on the user's disk that a basemap is read from — a **PMTiles**
archive or a **mapbundle**. Read with `Blob.slice`, never fetched, so it works on
any origin including `file://` and only the needed bytes are touched.
_Avoid_: "offline basemap" (a self-hosted tile server is also offline), "embedded
basemap" (nothing is embedded — the archive stays a file the user picks).

**PMTiles archive**:
A basemap archive holding _tiles only_. Raster archives are self-describing;
vector archives carry no style, glyphs or sprites, so the application supplies
those (see [[adr-0003]]).

**Mapbundle**:
A basemap archive (a ZIP) holding tiles _and_ the styles, glyphs and sprites that
go with them, so it needs nothing from the application to render.

**Flavour**:
One of the Protomaps basemap presets (`light`, `dark`, `white`, `black`,
`grayscale`) used to generate style layers for a vector PMTiles archive. Chosen
per archive (default `light`), and deliberately not coupled to the application's
dark mode. A mapbundle has **styles** instead, not flavours.

## Example dialogue

> **Dev:** The circle isn't rendering after reload.
> **Domain expert:** Check `geometryMeta.radius` — a Circle is a Point with a
> radius, so if the radius is missing there's nothing to draw the ring from.
> **Dev:** So `geometry.type` is `"Point"` but `geometryKind` is `"Circle"`?
> **Domain expert:** Right. And for a rectangle it's the opposite — the kind is
> just `"Polygon"`, with `shape: "rectangle"` marking that it stays axis-aligned.
