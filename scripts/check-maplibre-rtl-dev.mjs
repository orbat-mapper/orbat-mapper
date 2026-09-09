// Run against a running Vite server: node scripts/check-maplibre-rtl-dev.mjs http://localhost:5174/
// Unit tests and production builds do not exercise Vite's dependency optimizer.
import assert from "node:assert/strict";

const baseUrl = new URL(process.argv[2] ?? "http://localhost:5173/");
async function read(path) {
  const response = await fetch(new URL(path, baseUrl));
  assert.ok(response.ok, `${response.url}: HTTP ${response.status}`);
  return response.text();
}

const loader = await read("/src/modules/maplibreview/maplibreRtlText.ts");
const pluginImport = loader.match(
  /from\s+["']([^"']*(?:maplibre-rtl-plugin|mapbox-gl-rtl-text)[^"']*)["']/,
);
assert.ok(pluginImport, "The RTL loader must import the bundled plugin");
const moduleSource = await read(pluginImport[1]);
const rawExport = moduleSource.match(/export default ("(?:[^"\\]|\\.)*")\s*;?/);
assert.ok(
  rawExport,
  "The dev server must serve the plugin as raw text, not an optimized module returning a Promise",
);
const pluginSource = JSON.parse(rawExport[1]);
assert.ok(pluginSource.includes("registerRTLTextPlugin"));
assert.ok(pluginSource.includes("data:application/octet-stream;base64,"));
console.log("PASS: Vite serves the RTL worker script and embedded WASM as raw text");
