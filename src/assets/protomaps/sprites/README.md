# Protomaps sprite sheets

Copied from [protomaps/basemaps-assets](https://github.com/protomaps/basemaps-assets),
`sprites/v4`, which matches `@protomaps/basemaps` v5. BSD-3-Clause, © Protomaps.

A vector PMTiles archive holds tiles only, so the application has to supply the sprite the
generated style refers to. One sheet per flavour, at 1x and 2x — MapLibre asks for the `@2x`
sheet on a high-density display and fails the whole sprite if it is missing.

These files are imported through Vite (`src/geo/protomapsSprite.ts`) so the single-file build
inlines them and the sprite still resolves on a `file://` origin.

Update by re-downloading the same file names from `sprites/v4` when `@protomaps/basemaps` gets
a major version bump.
