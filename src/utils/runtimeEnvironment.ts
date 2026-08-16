/**
 * What the build the user runs can and cannot do.
 *
 * Level 3 offline use ("standalone file", see user-docs/guide/offline-use.md) is a different build
 * of the same source, not a different code path in it. Where the standalone build must behave
 * differently, `vite.singlefile.config.ts` replaces the module that holds the behaviour. This
 * module is one of them: it is the answer to "may the app offer a service on the internet?".
 *
 * The app does not test `location.protocol` for this. A standalone file is a `file://` page in
 * normal use, but it stays a standalone file when somebody puts it on a web server, and a served
 * build can be on a network with no route to the internet. The build knows; the address does not.
 */

/**
 * True when the Photon place search can be offered.
 *
 * The standalone build is made for an offline computer, thus it hides the geosearch UI instead of
 * showing a control that always fails.
 */
export const isGeoSearchAvailable = true;

/**
 * True when the build may keep a `FileSystemFileHandle` between visits.
 *
 * A standalone file has an opaque origin: IndexedDB is blocked and `showOpenFilePicker` throws a
 * SecurityError, thus there is nowhere to keep a handle and nothing to keep. The browser probe in
 * `isFileHandleSupported()` runs after this, because a served build must still ask whether the
 * browser has the API at all.
 */
export const canPersistFileHandles = true;

/**
 * True when this build has a web server that can provide files from `public/config/`.
 *
 * A standalone file uses its built-in basemap defaults. Trying the hosted path first would turn
 * `/config/maplibreConfig.json` into a file:// URL, which browsers must reject as a cross-origin
 * fetch from an opaque origin.
 */
export const canReadHostedConfig = true;
