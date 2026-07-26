# ORBAT Mapper

ORBAT Mapper is a client side web application that lets you build order of battles (ORBATs) and plot unit locations on a
map. With
ORBAT Mapper you can recreate historic battles and military scenarios in your browser.

**Please note that this project is a work in progress.** You can try the work in progress version
at https://orbat-mapper.app/ and browse the documentation
at https://docs.orbat-mapper.app/.

_Screenshot:_

![Work in progress sample screenshot](images/screenshot-2023-09-01.png "Work in progress sample screenshot")

ORBAT Mapper is an open-source project licensed under MIT, which means the source
code is freely available for use, modification, and redistribution under the terms of the license.

You're welcome to create a fork and adapt ORBAT Mapper to suit your needs, but please note that the project is currently
in a rapidly evolving phase with frequent changes to the codebase.

## Getting started

If you want to run ORBAT Mapper locally or developing your own version of ORBAT Mapper, you can do so by following these
steps:

Clone repo:

    $ git clone https://github.com/orbat-mapper/orbat-mapper.git

Navigate to project root:

    $ cd orbat-mapper

Install dependencies:

    $ pnpm install

To start a development server run:

    $ pnpm run dev

ORBAT mapper is now running on http://localhost:5173/. Any changes made to the source code will be instantly
available in the browser thanks to Vite's lightning fast hot module replacement.

For an optimized and minified build run:

    $ pnpm run build

The above command will output the optimized build to the `dist` directory. You can then serve the optimized build
locally by running:

    $ pnpm run preview

See https://vitejs.dev/guide/static-deploy.html for various deploy options.

## Use ORBAT Mapper without an internet connection

ORBAT Mapper is a static client side web application. You can use it without an internet connection, but you must
first change the configuration. ORBAT Mapper uses maps from the internet by default. It also uses an online service
for place name search.

Thus, you must do these steps:

1. Host your own map data on the local network.
2. Point the basemap configuration to your local map data.

There is no simple offline replacement for the place name search. The search sends requests
to [Photon](https://photon.komoot.io/). This function does not operate without an internet connection.

### Configure the basemap layers

MapLibre GL is the primary map engine. It reads the basemap layers from
[`public/config/maplibreConfig.json`](public/config/maplibreConfig.json). The build copies this file to
`dist/config/maplibreConfig.json`. You can also change `dist/config/maplibreConfig.json` directly. But remember that
the build writes over the `dist` directory again.

If the application cannot read the file, it uses a small set of built-in online basemaps.

The `maplibreConfig.json` file contains a JSON array of basemap layers. Each layer has a `sourceType` of `style` or
`raster`. Example:

```json
[
  {
    "name": "localBasemap",
    "title": "Local basemap",
    "sourceType": "style",
    "styleUrl": "http://localhost:8080/styles/basic/style.json"
  },
  {
    "name": "localTopo",
    "title": "Local topographic map",
    "sourceType": "raster",
    "tiles": ["http://localhost:8080/tiles/topo/{z}/{x}/{y}.png"],
    "tileSize": 256,
    "bounds": [2, 57, 33, 72],
    "maxZoom": 16,
    "attribution": "<a href=\"http://www.kartverket.no/\">Kartverket</a>"
  }
]
```

A `style` layer uses `styleUrl` for a remote MapLibre style, or `style` for an inline style specification. Use only one
of the two. A style for offline use must also point to local glyphs (fonts) and to a local sprite. If it does not, the
map labels and the icons do not show.

A `raster` layer uses `tiles` with one or more tile URL templates. The optional `scheme` property selects `xyz` or
`tms`.

All layers accept these optional properties: `title`, `minZoom`, `maxZoom`, `opacity`, `attribution` and `bounds`.

For all configuration options, see the `MlLayerConfigFile` type in
[`maplibreLayerConfigTypes.ts`](src/geo/maplibreLayerConfigTypes.ts).

### The legacy OpenLayers map (deprecated)

The OpenLayers map is deprecated. Do not use it for new work. It stays available at `/scenario/<scenarioId>/legacy`,
and it reads a different file: [`public/config/mapConfig.json`](public/config/mapConfig.json). The layer types for that
file are in [`layerConfigTypes.ts`](src/geo/layerConfigTypes.ts).

### Host your own maps

You can host maps in different ways. A simple web server that supplies a directory of map tiles is sufficient. A full
map server gives more functions. These are some options:

- [TileServer GL](https://tileserver.readthedocs.io/en/latest/) supplies vector tiles, styles, glyphs and sprites for
  MapLibre. See this [tutorial](https://openmaptiles.org/docs/host/tileserver-gl/).
- [MapProxy](https://mapproxy.org/) caches tiles from other servers and supplies them again.
- [GeoServer](https://geoserver.org/) supplies maps from your own geographic data.
- [MapTiler](https://www.maptiler.com/data/) supplies map data that you can host.
