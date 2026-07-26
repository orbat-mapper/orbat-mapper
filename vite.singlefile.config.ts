import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import baseConfig from "./vite.config";

// Vite has already rewritten the href against `base` when this hook runs, thus the
// pattern matches the element and not one literal path.
const FAVICON_LINK = /<link rel="icon"[^>]*href="[^"]*favicon\.svg"[^>]*\/?>/;

// The hosted build keeps the icon as a cacheable file at the site root. A file://
// page cannot read that path, thus the standalone build gets a copy of the icon in
// the HTML instead.
function inlineFavicon(): Plugin {
  return {
    name: "singlefile-inline-favicon",
    transformIndexHtml(html) {
      if (!FAVICON_LINK.test(html)) {
        throw new Error(
          `index.html has no favicon link matching ${FAVICON_LINK}.\n` +
            "Update vite.singlefile.config.ts, else the standalone build has no icon.",
        );
      }
      const svg = readFileSync(
        fileURLToPath(new URL("./public/favicon.svg", import.meta.url)),
      );
      return html.replace(
        FAVICON_LINK,
        `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${svg.toString("base64")}" />`,
      );
    },
  };
}

// Level 3 (standalone file) packaging: the normal build, inlined into one HTML
// file that runs from file://. It bundles no tiles, fonts or scenarios.
// Workers are inlined at their import sites (`?worker&inline`), thus both builds
// bundle them the same way.
export default mergeConfig(
  baseConfig,
  defineConfig({
    base: "./",
    plugins: [inlineFavicon(), viteSingleFile()],
    build: {
      outDir: "dist-singlefile",
      // The deliverable is the HTML file alone. Nothing in public/ can be read from
      // a file:// origin anyway, thus copying it only makes a directory to carry.
      copyPublicDir: false,
    },
  }),
);
