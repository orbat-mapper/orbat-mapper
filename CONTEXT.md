# ORBAT Mapper

Client-side tool for building order of battles and plotting unit locations and
drawn geometry on a map. This glossary captures terms whose meaning is specific
to this project and not obvious from the code.

## Language

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

## Example dialogue

> **Dev:** The circle isn't rendering after reload.
> **Domain expert:** Check `geometryMeta.radius` — a Circle is a Point with a
> radius, so if the radius is missing there's nothing to draw the ring from.
> **Dev:** So `geometry.type` is `"Point"` but `geometryKind` is `"Circle"`?
> **Domain expert:** Right. And for a rectangle it's the opposite — the kind is
> just `"Polygon"`, with `shape: "rectangle"` marking that it stays axis-aligned.
