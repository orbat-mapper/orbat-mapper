/**
 * What the runtime the app is loaded in can and cannot do.
 *
 * Level 3 offline use ("standalone file", see user-docs/guide/offline-use.md) means the user opens
 * a single HTML file straight from disk, so the origin is `file://` and there is no server behind
 * the app: `fetch` of app-relative URLs fails, the History API cannot push path-based URLs, and
 * anything hosted — the demo scenarios, the Photon geosearch service — is out of reach.
 *
 * Every one of those adjustments asks the same question, so it is answered here once, in named
 * terms of the capability the caller needs, instead of scattering `location.protocol` checks
 * through the app.
 */

/** True when the app was loaded from disk (`file://`) rather than served over http(s). */
export function isFileProtocol(): boolean {
  return globalThis.location?.protocol === "file:";
}

/**
 * True when files shipped next to the app (`/config/maplibreConfig.json`, `/scenarios/*.json`)
 * can be fetched. There is no origin to fetch them from under `file://`.
 */
export function canFetchAppAssets(): boolean {
  return !isFileProtocol();
}

/** True when the bundled demo scenarios can be loaded, and so may be offered in the UI. */
export function areDemoScenariosAvailable(): boolean {
  return canFetchAppAssets();
}

/**
 * True when the Photon place search can be used. It is a remote service, and a standalone file is
 * the one setup where we know up front that it is unreachable, so its UI is hidden there.
 */
export function isGeoSearchAvailable(): boolean {
  return !isFileProtocol();
}
