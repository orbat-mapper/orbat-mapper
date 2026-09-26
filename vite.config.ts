import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

/**
 * Serves the RTL worker script as an asset URL (hosted) or a string (standalone).
 *
 * MapLibre needs the `dist/` build, but `@mapbox/mapbox-gl-rtl-text` declares a bare `exports`
 * string, so no subpath of the package resolves. Reading it through the root export keeps node
 * resolution in charge of finding the package, and a virtual module keeps the file out of the
 * dependency optimizer, which would otherwise turn the UMD script into a Promise-returning module
 * even behind `?raw`.
 */
function maplibreRtlTextSource(): Plugin {
  const virtualId = "virtual:maplibre-rtl-text-source";
  const resolvedId = `\0${virtualId}`;
  const urlId = "virtual:maplibre-rtl-text-url";
  const entry = createRequire(import.meta.url).resolve("@mapbox/mapbox-gl-rtl-text");
  const script = fileURLToPath(
    new URL("../dist/mapbox-gl-rtl-text.js", `file://${entry}`),
  );

  return {
    name: "maplibre-rtl-text-source",
    resolveId(source) {
      // Let Vite handle base paths, dev serving and hashed asset emission. Never inline it.
      if (source === urlId) return `${script}?url&no-inline`;
      return source === virtualId ? resolvedId : null;
    },
    load(id) {
      if (id !== resolvedId) return null;
      return `export default ${JSON.stringify(readFileSync(script, "utf8"))};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), maplibreRtlTextSource()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
