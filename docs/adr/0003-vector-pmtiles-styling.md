# Vector PMTiles are styled with Protomaps flavours and local TinySDF glyphs

A PMTiles archive holds tiles only, so a vector archive the user opens from disk has no style,
no glyphs and no sprites. We generate the style layers with `@protomaps/basemaps`, ship the
sprite sheets (~143 KB in total) as committed assets, and **leave `glyphs` unset on the
generated style**, which makes MapLibre rasterise every label locally with TinySDF. A `glyphs`
URL can be set opt-in per layer in `maplibreConfig.json` for deployments that run their own
glyph server.

## Why

MapLibre's `GlyphManager` takes the local TinySDF path when the style has no `glyphs` URL
(`!this.url`), and also falls back to it when a glyph range request fails. Omitting the URL is
therefore the general, byte-free way to get labels in any script the operating system has fonts
for — as opposed to committing SDF glyph ranges (~76 KB per font stack for Latin `0-255` alone,
and Latin only), or pointing at a public CDN, which would make an air-gapped tool reach out to
the network by default.

The rejected shape was the one prototyped in `experiment/offline-pmtiles`: committed glyph
ranges plus an asset-staging script plus a custom protocol to serve them. It bought crisper
Latin labels at the price of three moving parts and worse non-Latin coverage.

Assuming the Protomaps schema is a real constraint, not an oversight: a vector archive built to
a different schema (OpenMapTiles/Planetiler) registers but renders nothing recognisable. A
mapbundle is the supported route for any other schema, because it carries its own style.

## Consequences

- Labels are browser-rasterised, so they are flatter than server SDF glyphs and their metrics
  come from whatever font the system resolves for the style's font-stack name.
- RTL scripts are mis-shaped, because `setRTLTextPlugin` is not registered anywhere in the
  application. This predates the decision and is not made worse by it.
- The sprite is five flavours × (`1x`, `@2x`) × (`.png`, `.json`) — 20 files, ~143 KB committed,
  ~51 KB for one flavour. Both densities are required: MapLibre fails the whole sprite, not just
  the missing sheet, when a high-DPI display asks for `@2x` and it is absent. The hosted build
  emits them as separate assets and fetches only the flavour in use; the standalone build inlines
  all twenty as base64 (~181 KB of the single file).
- `@protomaps/basemaps` and `pmtiles` become runtime dependencies (~14 KB gzipped together). They
  load with the map chunk, not the app entry — see the comment on `registerBasemapProtocols()` in
  `maplibreBasemaps.ts`.
- Raster PMTiles archives are unaffected — they are generic and need none of this.
