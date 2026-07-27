# Use ORBAT Mapper without an internet connection

ORBAT Mapper is a client-side web application. All your data stays in your browser. Therefore, you can use ORBAT Mapper
without an internet connection. But you must first tell it where to find the basemap. By default, ORBAT Mapper reads the
basemap from the internet.

There are three ways to do this. Each way removes one more part of the infrastructure.

| Level                         | The application comes from   | The basemap comes from         |
| ----------------------------- | ---------------------------- | ------------------------------ |
| **Level 1** — Self-hosted     | A web server on your network | A tile server on your network  |
| **Level 2** — Local map file  | A web server                 | A basemap archive on your disk |
| **Level 3** — Standalone file | A file on your disk          | A basemap archive on your disk |

::: warning The numbers do not measure the internet connection that you need
The numbers show how much infrastructure each level removes. A Level 2 deployment on a public web site still needs the
internet to load the application. A Level 1 deployment on an isolated network needs no internet connection.

Select the level that is correct for your infrastructure.
:::

::: tip Place name search always needs the internet
The place name search sends requests to [Photon](https://photon.komoot.io/). This service is online. There is no
replacement that operates offline. The search does not operate without an internet connection at any level.
:::

## Level 1 — Self-hosted

At Level 1 you supply the application from your own web server, and the basemap from your own tile server. This is the
best option for an isolated network with more than one user.

The two servers do not need to be on the same machine. The web server can be on one machine, and the tile server on a
different machine on the same network. One tile server can supply the basemap to all the users on the network.

Make the build and put the `dist` directory on your web server:

    $ pnpm run build

### Host your own basemap

You can host a basemap in different ways. A simple web server that supplies a directory of map tiles is enough. A full
map server gives more functions. These are some options:

- [TileServer GL](https://tileserver.readthedocs.io/en/latest/) supplies vector tiles, styles, glyphs and sprites for
  MapLibre. See this [tutorial](https://openmaptiles.org/docs/host/tileserver-gl/).
- [MapProxy](https://mapproxy.org/) caches tiles from other servers and supplies them again.
- [GeoServer](https://geoserver.org/) supplies maps from your own geographic data.
- [MapTiler](https://www.maptiler.com/data/) supplies map data that you can host.

### Configure the basemap layers

MapLibre GL is the main map engine. It reads the basemap layers from `public/config/maplibreConfig.json`. The build
copies this file to `dist/config/maplibreConfig.json`. You can also change `dist/config/maplibreConfig.json` directly.
But the next build erases the `dist` directory and writes it again.

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
of the two. A style for offline use must also point to local glyphs (fonts) and to a local sprite. If it does not, you
cannot see the map labels or the icons.

A `raster` layer uses `tiles` with one or more tile URL templates. The optional `scheme` property selects `xyz` or
`tms`.

All layers accept these optional properties: `title`, `minZoom`, `maxZoom`, `opacity`, `attribution` and `bounds`.

For all configuration options, see the `MlLayerConfigFile` type in
[`maplibreLayerConfigTypes.ts`](https://github.com/orbat-mapper/orbat-mapper/blob/main/src/geo/maplibreLayerConfigTypes.ts).

### Use a tile server on a different machine

The examples above use `localhost`. This address is correct only when the tile server is on the same machine as the
browser. For a tile server on a different machine, use the name or the IP address of that machine:

```json
{
  "name": "networkBasemap",
  "title": "Network basemap",
  "sourceType": "style",
  "styleUrl": "http://mapserver.example.local:8080/styles/basic/style.json"
}
```

Two conditions apply to a tile server on a different machine:

- **The tile server must send the `Access-Control-Allow-Origin` header.** The application and the tile server have
  different addresses, therefore the browser makes a cross-origin request. Without the header, the browser does not
  accept the tiles, and you see an empty map. Some map servers send the header by default. For other map servers you
  must change the configuration.
- **The two servers must use the same protocol.** If you supply the application with `https`, the tile server must also
  use `https`. A browser does not read `http` addresses from an `https` page.

## Level 2 — Local map file

At Level 2 you get the application from a web server, but you read the basemap from a **basemap archive**. A basemap
archive is one file on your disk that holds a full basemap. You select the file, and ORBAT Mapper reads only the parts
of the archive that the map view needs. There is no tile server.

Use this level when you cannot install a tile server, or when you must take a basemap into the field on a laptop.

### Get a PMTiles archive

A [PMTiles](https://docs.protomaps.com/pmtiles/) archive has the extension `.pmtiles`. You can make one in these ways:

- Extract a smaller area from a large archive with the
  [`pmtiles` command line tool](https://docs.protomaps.com/guide/getting-started). Protomaps supplies a daily archive of
  the full planet:

      $ pmtiles extract https://build.protomaps.com/20260726.pmtiles denmark.pmtiles --bbox=8,54.5,15.2,57.8

  This archive is approximately 960 MB, because it contains all the zoom levels.

  You can also limit the zoom levels instead of the area. This example keeps all the world, but only to zoom level 6.
  The archive is approximately 60 MB, and it shows the countries and the large cities:

      $ pmtiles extract https://build.protomaps.com/20260726.pmtiles planet_z6.pmtiles --maxzoom=6

  Use the two options together to get one area with less detail:

      $ pmtiles extract https://build.protomaps.com/20260726.pmtiles denmark_z12.pmtiles --bbox=8,54.5,15.2,57.8 --maxzoom=12

  The address contains the date of the build. Use the date of a recent build.

- Make an archive from your own data with [Tippecanoe](https://github.com/felt/tippecanoe).
- Make an archive from OpenStreetMap data with [Planetiler](https://github.com/onthegomap/planetiler).

An archive holds vector tiles or raster tiles. ORBAT Mapper reads the type from the header of the archive. The name of
the file has no effect.

### Open a basemap archive

There are three ways to open an archive:

- Do a right click on the map. Select _Map base layer_, then _Open map file…_ at the bottom of the list.
- Open the _Layers_ panel. Use the button in the _Base layers_ section.
- Drag the file and drop it on the map.

You can drop basemap archives and scenario files together. ORBAT Mapper sends the basemap archives to the map, and the
other files to the [import](import-data) dialog.

After the archive loads, ORBAT Mapper shows a message and adds the archive to the list of base layers.

### Select a flavour

A vector archive holds tiles only. It does not hold a style. Therefore, ORBAT Mapper makes a style for it. The
**flavour** selects the colours of that style. There are five flavours: `light`, `dark`, `white`, `black` and
`grayscale`. The default is `light`.

There are two ways to change the flavour:

- Do a right click on the map. Select _Map flavour_.
- Open the _Layers_ panel. The flavour select is in the _Base layers_ section, near the opacity control.

The two controls show only when the active base layer is a vector archive. A raster archive does not need a flavour,
because it holds finished images.

The flavour is not the same as the dark mode of the application. Change one, and the other does not change.

::: warning A vector archive must use the Protomaps schema
The style that ORBAT Mapper makes needs the [Protomaps basemap schema](https://docs.protomaps.com/basemaps/layers). An
archive from the Protomaps builds, or from Tippecanoe with that schema, is correct. An archive with a different schema
(for example OpenMapTiles or the default Planetiler profile) loads, but you see only the background colour of the
flavour.

For raster archives there is no schema. All raster archives operate.
:::

### Limits of a local map file

- **You must select the archive again after each reload.** A web page cannot keep a reference to a file on your disk.
  After you reload the page, ORBAT Mapper shows a message with the name of the archive and asks you to select the file
  again. It does not copy the basemap into the browser storage.
- **The labels are different.** ORBAT Mapper does not use fonts from a server for a vector archive. The browser makes
  the labels from the fonts of your operating system. Therefore, the labels are not the same as the labels on an online
  map.
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
| `url`    | yes       | Address of the archive. ORBAT Mapper reads the header at start to find if the archive holds raster tiles or vector tiles.        |
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

::: warning The standalone file is large
The file is approximately 8 MB. There are three causes:

- The file contains the full application. The hosted build divides the application into many small files, and the
  browser reads only the files that it needs. One HTML file cannot do this.
- The build writes the images and the map icons into the file as base64 text. Base64 text is approximately 33 percent
  larger than the data.
- A web server compresses the files that it sends. A file on your disk has no compression.

The size does not make the application slow, because the browser reads the file from your disk. But do not send the file
by email without compression.
:::

### What operates and what does not

These functions operate:

- All operations that change a scenario.
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

A **mapbundle** is a different type of basemap archive. It holds the tiles, and also the style, the fonts and the icons
for those tiles. Therefore, it needs nothing from the application, and it does not have the schema limit of a vector
PMTiles archive.

ORBAT Mapper does not support mapbundles yet. If you select a mapbundle file, ORBAT Mapper shows a message that tells
you that this format is not yet supported.

## The legacy OpenLayers map (deprecated)

The OpenLayers map is deprecated. Do not use it for new work. It stays available at `/scenario/<scenarioId>/legacy`, and
it reads a different file: `public/config/mapConfig.json`. It does not support basemap archives.
