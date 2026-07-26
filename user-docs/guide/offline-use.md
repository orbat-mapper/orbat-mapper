# Use ORBAT Mapper without an internet connection

ORBAT Mapper is a client side web application. All your data stays in your browser. Thus, you can use ORBAT Mapper
without an internet connection. But you must first tell it where to find the map data. By default, ORBAT Mapper reads
the maps from the internet.

There are three ways to do this. Each way removes one more piece of infrastructure.

| Level                         | The application comes from | The map data comes from |
| ----------------------------- | -------------------------- | ----------------------- |
| **Level 1** — Self-hosted     | Your own web server        | Your own tile server    |
| **Level 2** — Local map file  | A web server               | A file on your disk     |
| **Level 3** — Standalone file | A file on your disk        | A file on your disk     |

::: warning The numbers are not a measure of "how offline"
The numbers are a ladder of removed infrastructure. They do not tell you how offline a deployment is. A Level 2
deployment on a public web site still needs the network to load the application. A Level 1 deployment on an isolated
network needs no internet connection at all.

Select the level that agrees with the infrastructure you have.
:::

::: tip Place name search always needs the internet
The place name search sends requests to [Photon](https://photon.komoot.io/). This service is online. There is no offline
replacement. The search does not operate without an internet connection at any level.
:::

## Level 1 — Self-hosted

At Level 1 you supply the application from your own web server, and the map data from your own tile server. This is the
best option for an isolated network with more than one user.

Make an optimized build and put the `dist` directory on your web server:

    $ pnpm run build

### Host your own maps

You can host maps in different ways. A simple web server that supplies a directory of map tiles is sufficient. A full
map server gives more functions. These are some options:

- [TileServer GL](https://tileserver.readthedocs.io/en/latest/) supplies vector tiles, styles, glyphs and sprites for
  MapLibre. See this [tutorial](https://openmaptiles.org/docs/host/tileserver-gl/).
- [MapProxy](https://mapproxy.org/) caches tiles from other servers and supplies them again.
- [GeoServer](https://geoserver.org/) supplies maps from your own geographic data.
- [MapTiler](https://www.maptiler.com/data/) supplies map data that you can host.

### Configure the basemap layers

MapLibre GL is the primary map engine. It reads the basemap layers from `public/config/maplibreConfig.json`. The build
copies this file to `dist/config/maplibreConfig.json`. You can also change `dist/config/maplibreConfig.json` directly.
But remember that the next build writes over the `dist` directory.

If the application cannot read the file, it uses a small set of built-in online basemaps.

The file contains a JSON array of basemap layers. Each layer has a `sourceType`. For a tile server, use `style` or
`raster`:

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
[`maplibreLayerConfigTypes.ts`](https://github.com/orbat-mapper/orbat-mapper/blob/main/src/geo/maplibreLayerConfigTypes.ts).

## Level 2 — Local map file

At Level 2 you get the application from a web server, but you read the basemap from a **basemap archive**. A basemap
archive is one file on your disk that holds the map. You select the file, and ORBAT Mapper reads only the parts of it
that the map view needs. There is no tile server.

Use this level when you cannot install a tile server, or when you must take a map into the field on a laptop.

### Get a PMTiles archive

A [PMTiles](https://docs.protomaps.com/pmtiles/) archive has the extension `.pmtiles`. You can make one in these ways:

- Cut a smaller area out of a large archive with the
  [`pmtiles` command line tool](https://docs.protomaps.com/guide/getting-started). Protomaps supplies a daily archive of
  the full planet:

      $ pmtiles extract https://build.protomaps.com/20240101.pmtiles norway.pmtiles --bbox=4,57,32,72

- Make an archive from your own data with [Tippecanoe](https://github.com/felt/tippecanoe).
- Make an archive from OpenStreetMap data with [Planetiler](https://github.com/onthegomap/planetiler).

An archive holds vector tiles or raster tiles. ORBAT Mapper reads which type it is from the archive itself. The name of
the file does not change this.

### Open a basemap archive

There are three ways to open an archive:

- Do a right click on the map. Select _Map base layer_, then _Open map file…_ at the bottom of the list.
- Open the _Layers_ panel. Use the button in the _Base layers_ section.
- Drag the file and drop it on the map.

You can drop map files and scenario files together. ORBAT Mapper sends the map files to the basemap, and the other files
to the [import](import-data) dialog.

After the archive loads, ORBAT Mapper shows a message and adds the archive to the list of base layers.

### Select a flavour

A vector archive holds tiles only. It does not hold a style. Thus, ORBAT Mapper makes a style for it. The **flavour**
selects the colours of that style. There are five flavours: `light`, `dark`, `white`, `black` and `grayscale`. The
default is `light`.

The flavour select is in the _Base layers_ section of the _Layers_ panel, near the opacity control. It shows only when
the active base layer is a vector archive. A raster archive does not need a flavour, because it holds finished images.

The flavour is not the same as the dark mode of the application. Change one, and the other does not change.

::: warning A vector archive must use the Protomaps schema
The style that ORBAT Mapper makes assumes the [Protomaps basemap schema](https://docs.protomaps.com/basemaps/layers). An
archive from the Protomaps builds, or from Tippecanoe with that schema, is correct. An archive with a different schema
(for example OpenMapTiles or the default Planetiler profile) loads, but the map shows almost nothing.

For raster archives there is no schema. All raster archives operate.
:::

### Limits of a local map file

- **The selection does not survive a reload.** A web page cannot keep a reference to a file on your disk. After you
  reload the page, ORBAT Mapper shows a message with the name of the archive and asks you to select the file again. It
  does not copy the map into the browser storage.
- **The labels look different.** ORBAT Mapper does not use fonts from a server for a vector archive. The browser makes
  the labels from the fonts of your operating system. Thus, the labels look flatter than the labels on an online map.
- **Right-to-left text is not correct.** ORBAT Mapper does not install the MapLibre RTL text plugin. Arabic and Hebrew
  labels have the incorrect shape.

### Add an archive to the configuration

You can also put an archive in `maplibreConfig.json`. Then ORBAT Mapper shows it in the list of base layers at every
start. Use `sourceType` `pmtiles`, and give the address of the archive in `url`. This is a Level 1 configuration: the
archive is on a server, and the browser reads parts of it with range requests.

```json
[
  {
    "name": "localArchive",
    "title": "Local map file",
    "sourceType": "pmtiles",
    "url": "/maps/basemap.pmtiles",
    "flavor": "light",
    "lang": "en",
    "glyphs": "/fonts/{fontstack}/{range}.pbf"
  }
]
```

The fields are:

| Field    | Necessary | Function                                                                                                                         |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `url`    | yes       | Address of the archive. ORBAT Mapper reads the header at start to find if the archive is raster or vector.                       |
| `flavor` | no        | First flavour of a vector archive: `light`, `dark`, `white`, `black` or `grayscale`. The default is `light`.                     |
| `lang`   | no        | Language of the labels of a vector archive, for example `en` or `fr`. The default is `en`.                                       |
| `glyphs` | no        | Address of a font server for a vector archive. Without it, the browser makes the labels. Give it only if you have a font server. |

::: warning `url` is necessary
An entry without `url` is not correct. ORBAT Mapper cannot ask you for a file on your disk from the configuration,
because it must read the archive at start. To use an archive from your disk, select the file as above.
:::

## Level 3 — Standalone file

At Level 3 there is no web server. The application is one HTML file on your disk. You open it with your browser, and you
select a basemap archive as at Level 2.

Make the standalone build:

    $ pnpm run build:singlefile

The build writes one file, `dist-singlefile/index.html`. It contains the full application. Copy that file to the other
computer, and do a double click on it. The browser opens it with a `file://` address.

### What operates and what does not

These functions operate:

- All scenario editing.
- The browser storage. Your scenarios stay in the browser, but only for that HTML file at that location. If you move the
  file, the browser gives you a different storage.
- Load and save of scenario files.
- Import and export.
- Basemap archives, as at Level 2.

These functions do not operate:

- **The demo scenarios.** ORBAT Mapper hides them, because it cannot read them from a `file://` address.
- **The place name search.** ORBAT Mapper hides it, because it needs an online service.
- **Online basemaps**, if you have no internet connection.

## Mapbundle (planned)

A **mapbundle** is a different kind of basemap archive. It holds the tiles and also the style, the fonts and the icons
that go with them. Thus, it needs nothing from the application, and it does not have the schema limit of a vector
PMTiles archive.

Mapbundle support is planned, but it does not operate yet. If you select a mapbundle file, ORBAT Mapper shows a message
that tells you that this format is not yet supported.

## The legacy OpenLayers map (deprecated)

The OpenLayers map is deprecated. Do not use it for new work. It stays available at `/scenario/<scenarioId>/legacy`, and
it reads a different file: `public/config/mapConfig.json`. It does not support basemap archives.
