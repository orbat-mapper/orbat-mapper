# Hellfire

A Hellfire missile strike on a MapLibre map, just for fun. A missile flies in from beside the
camera, trailing smoke, and hits a point on the map: a flash, a fireball, a shockwave, debris, a
smoke cloud and a shake of the map. Point features near the impact go up in secondary
explosions. It looks 3D on a tilted map and on the globe, and it keeps the frame rate with
terrain on.

## Use

```ts
import { launchHellfire } from "@/lib/hellfire";

launchHellfire(
  map,
  { lng: 10.75, lat: 59.91 },
  {
    // Optional: what the blast can hit. Point features in these layers go up with it.
    targets: {
      layers: (layerId) => layerId.startsWith("units"),
      // Optional: the id reported for a hit feature. Defaults to the `id` property, then feature.id.
      id: (feature) => feature.properties?.unitId,
    },
    // Optional: called once with the hit ids, after their fireballs have hidden them.
    onHit: (ids) => console.log("hit", ids),
    // Optional: on by default.
    shake: true,
  },
);
```

That is all of it. The function returns at once, and the strike plays out over about four
seconds. Several can fly at once.

- **What it draws on**: a 2D canvas it adds to the map's canvas container and removes when done.
  It adds nothing to the map's style, needs no CSS, and stops by itself if the map is removed.
- **What it does to the features**: nothing. It only draws. What a hit means (hide, delete,
  mark as destroyed) is up to `onHit`.
- **What it needs**: `maplibre-gl` (only its types are imported) and a browser.

The animation code is about 11 kB minified, so load it on first use:

```ts
const { launchHellfire } = await import("@/lib/hellfire");
```

## Reuse in another app

The folder imports nothing outside itself except types from `maplibre-gl` and `geojson`, and
`launchHellfire.test.ts` keeps it that way. Copy the whole folder. In ORBAT Mapper,
`src/modules/maplibreview/useHellfire.ts` is the app's own glue: when to fire, which layers hold
units, and what a hit does to them.
