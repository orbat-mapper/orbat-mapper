# ORBAT Mapper

ORBAT Mapper is a client side web application. With ORBAT Mapper you can build order of battles (ORBATs) and plot the
locations of units on a map. You can make historic battles and military scenarios again in your browser.

**This project is work in progress.** You can try the current version at https://orbat-mapper.app/. You can read the
documentation at https://docs.orbat-mapper.app/.

_Screenshot:_

![Work in progress sample screenshot](images/screenshot-2023-09-01.png "Work in progress sample screenshot")

ORBAT Mapper is an open-source project with an MIT license. Thus, you can freely use, change and give the source code
to other persons. You must obey the conditions of the license.

You can make a fork and adapt ORBAT Mapper for your applications. But be careful, because the project changes quickly.

## Get started

Obey these steps to run ORBAT Mapper on your computer, or to make your own version of ORBAT Mapper.

Clone the repository:

    $ git clone https://github.com/orbat-mapper/orbat-mapper.git

Go to the project root:

    $ cd orbat-mapper

Install the dependencies:

    $ pnpm install

Start a development server:

    $ pnpm run dev

ORBAT Mapper now runs on http://localhost:5173/. When you change the source code, Vite sends the changes immediately to
the browser.

Make an optimized and minified build:

    $ pnpm run build

This command writes the optimized build to the `dist` directory. Then you can supply this build on your computer:

    $ pnpm run preview

For the different deployment options, see https://vitejs.dev/guide/static-deploy.html.

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
