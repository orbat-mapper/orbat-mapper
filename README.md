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

Make a standalone build, that is one HTML file that runs from your disk without a web server:

    $ pnpm run build:singlefile

For the different deployment options, see https://vitejs.dev/guide/static-deploy.html.

## Shared traffic with ITDX-2026

ORBAT Mapper and the [Watchtower MLCOA demo](https://github.com/Panoptica-Technologies/ITDX-2026)
(ITDX-2026) share one synthetic intelligence traffic file:

`public/traffic_reports_payload.json`

It contains 100 map features (HUMINT, UAS, CONTACT, and related formats) for
OPERATION BULLDOG. Each feature stores report text in `description` and structured
fields (`timestamp_utc`, `report_type`, `equipment`, `mgrs`, and so on) in
`userData`.

### Import into a scenario

After `pnpm run dev`, either:

- Open `/scenario/<scenarioId>?importTrafficReports=1` to load the bundled payload, or
- Use the scenario editor traffic-reports layer to import a JSONL file (converted to
  the same payload shape in-app).

Reports appear on the map as point features on the traffic reports layer.

### Match the Streamlit demo

Clone ITDX-2026 next to this repository:

```text
Repo/
├── ITDX-2026/
└── martin-orbat-mapper/
```

ITDX Streamlit reads the same payload via `scenario/script.yaml`:

```yaml
traffic:
  enabled: true
  path: ../martin-orbat-mapper/public/traffic_reports_payload.json
```

Run the operator UI from the ITDX repo:

```console
cd ../ITDX-2026
uv sync --extra dev
make ui
```

Both applications then parse identical report text and timestamps through their
respective loaders (`scenario/traffic_loader.py` in ITDX, `importTrafficReports.ts`
here).

### COA generation

With the ITDX API running (`uv run uvicorn engine.api:app --port 8765` in the
ITDX repo), open **COA generation** in the scenario editor. On Reset, ORBAT syncs
traffic from the map layer into ITDX SQLite (`data/traffic.db`) and starts an
hourly MLCOA run. Vite proxies `/api/coa` to port 8765 during development.

## Use ORBAT Mapper without an internet connection

ORBAT Mapper is a static client side web application. It can operate without an internet connection, but you must first
tell it where to find the map data. There are three ways to do this:

1. **Self-hosted** — supply the application from your own web server, and the map data from your own tile server.
2. **Local map file** — supply the application from a web server, and read the basemap from a PMTiles archive on your
   disk.
3. **Standalone file** — run the application as one HTML file from your disk, with a PMTiles archive on your disk.

The place name search sends requests to [Photon](https://photon.komoot.io/). This function needs an internet connection
in all three cases. There is no offline replacement.

You do not have to make a build. Each release supplies `orbat-mapper-<version>.zip` for a web server, and
`orbat-mapper-standalone-<version>.html` for the standalone file. See the
[releases page](https://github.com/orbat-mapper/orbat-mapper/releases).

For the full instructions, the configuration of the basemap layers and the limits of each option, see
[Offline use](https://docs.orbat-mapper.app/guide/offline-use) in the documentation.

## The legacy OpenLayers map (deprecated)

The OpenLayers map is deprecated. Do not use it for new work. It stays available at `/scenario/<scenarioId>/legacy`, and
it reads a different file: [`public/config/mapConfig.json`](public/config/mapConfig.json). The layer types for that file
are in [`layerConfigTypes.ts`](src/geo/layerConfigTypes.ts).
