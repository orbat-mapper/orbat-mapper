import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import baseConfig from "./vite.config";

const repoPath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// A component that renders nothing. It accepts any props and any slots, thus it can stand in for
// any component in the table below.
const NOTHING = `import { defineComponent } from "vue";
export default defineComponent({ name: "OmittedInStandalone", render: () => null });`;

/**
 * What the standalone build puts in place of a module of the app.
 *
 * This is the whole of the Level 3 adaptation. The app itself has no knowledge of which build it
 * is in and does not test `location.protocol` anywhere: each difference is one module here, whose
 * doc comment in `src/` says what the standalone build does instead.
 *
 * A module named here that no longer exists fails the build, thus a rename cannot quietly bring a
 * section back.
 */
const STANDALONE_MODULES: Record<string, string> = {
  // The demo scenarios are JSON files and photographs on the server. Neither the cards nor the
  // text above them can work without it.
  "src/views/DemoScenarioCards.vue": NOTHING,
  "src/views/DemoScenarioNotice.vue": NOTHING,
  // The section holds one illustration from `public/images/`, which a file:// page cannot read.
  "src/views/LandingPageLinks.vue": NOTHING,
  // No server resolves /scenario/<id>, thus navigation lives in the hash.
  "src/router/history.ts": `import { createWebHashHistory } from "vue-router";
export function createAppHistory() {
  return createWebHashHistory();
}`,
  // No place search (it is a service on the internet), and no persisted file handles (an opaque
  // origin has no IndexedDB and no working file picker).
  "src/utils/runtimeEnvironment.ts": `export const isGeoSearchAvailable = false;
export const canPersistFileHandles = false;`,
  // MapLibre v6 requires an explicit worker URL under Vite. The hosted build emits a cacheable
  // worker asset; the standalone build turns the same bundled worker into an in-document URL.
  "src/modules/maplibreview/maplibreWorkerUrl.ts": `import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&inline&url";
export default workerUrl;`,
};

function replaceStandaloneModules(): Plugin {
  const virtualPrefix = "\0standalone:";
  const byAbsolutePath = new Map(
    Object.entries(STANDALONE_MODULES).map(([path, code]) => [
      repoPath(`./${path}`),
      code,
    ]),
  );

  return {
    name: "singlefile-standalone-modules",
    enforce: "pre",
    buildStart() {
      for (const path of Object.keys(STANDALONE_MODULES)) {
        if (existsSync(repoPath(`./${path}`))) continue;
        this.error(
          `${path} is listed in STANDALONE_MODULES but does not exist.\n` +
            "Update vite.singlefile.config.ts — a module the standalone build replaces was moved or removed.",
        );
      }
    },
    async resolveId(source, importer, options) {
      if (source.startsWith(virtualPrefix)) return source;
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved || !byAbsolutePath.has(resolved.id)) return null;
      // Keep the extension: `.vue` files are resolved as components by the rest of the pipeline.
      return `${virtualPrefix}${resolved.id}`;
    },
    load(id) {
      if (!id.startsWith(virtualPrefix)) return null;
      return byAbsolutePath.get(id.slice(virtualPrefix.length)) ?? null;
    },
  };
}

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

/**
 * Puts every file of `public/` that `index.html` refers to into the HTML as a data URL.
 *
 * The hosted build keeps such files at the site root, where they are cacheable. A file:// page has
 * no site root, thus the standalone build carries them. Today this is the favicon alone, but the
 * rule holds for whatever `index.html` adds later.
 */
function inlinePublicAssets(): Plugin {
  const ROOT_URL = /(\s(?:src|href))="(\/[^"]*)"/g;

  return {
    name: "singlefile-inline-public-assets",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(ROOT_URL, (match, attribute: string, url: string) => {
          const path = repoPath(`./public${url}`);
          const mimeType = MIME_TYPES[extname(url).toLowerCase()];
          if (!existsSync(path) || !mimeType) return match;
          const base64 = readFileSync(path).toString("base64");
          return `${attribute}="data:${mimeType};base64,${base64}"`;
        });
      },
    },
  };
}

/**
 * Fails the build unless the output is one file that needs nothing else.
 *
 * This is the promise of Level 3, stated once and checked against the artifact, rather than
 * inferred from the plugins that are meant to produce it. Anything the bundler emits beside the
 * HTML, and any address in the HTML that is not data:, a fragment or a remote page, breaks it.
 */
function assertSelfContained(): Plugin {
  const SUBRESOURCE = /\s(?:src|href)="([^"]*)"/g;
  const ALLOWED = /^(data:|#|https?:\/\/|mailto:)/;

  return {
    name: "singlefile-assert-self-contained",
    enforce: "post",
    generateBundle(_options, bundle) {
      const emitted = Object.keys(bundle);
      if (emitted.length !== 1 || emitted[0] !== "index.html") {
        this.error(
          `The standalone build emitted ${emitted.length} files: ${emitted.join(", ")}.\n` +
            "The deliverable is index.html alone.",
        );
      }
      const html = bundle["index.html"];
      if (html?.type !== "asset") return;
      const source = String(html.source);
      const external = [...source.matchAll(SUBRESOURCE)]
        .map((match) => match[1])
        .filter((url) => !ALLOWED.test(url))
        // Attributes written by the app at runtime hold a template, not an address.
        .filter((url) => !url.includes("${") && !url.includes("`"));
      if (external.length > 0) {
        this.error(
          `The standalone build refers to files it does not contain: ${[...new Set(external)].join(", ")}.\n` +
            "A file:// page cannot read them.",
        );
      }
    },
  };
}

// Level 3 (standalone file) packaging: the normal build, inlined into one HTML file that runs from
// file://. It bundles no tiles, fonts or scenarios. Workers are inlined at their import sites
// (`?worker&inline`), thus both builds bundle them the same way.
export default mergeConfig(
  baseConfig,
  defineConfig({
    base: "./",
    plugins: [
      replaceStandaloneModules(),
      inlinePublicAssets(),
      viteSingleFile(),
      assertSelfContained(),
    ],
    build: {
      outDir: "dist-singlefile",
      // The deliverable is the HTML file alone. Nothing in public/ can be read from a file://
      // origin anyway, thus copying it only makes a directory to carry.
      copyPublicDir: false,
    },
  }),
);
