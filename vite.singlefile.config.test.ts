import { describe, expect, it } from "vitest";
import { inlineMaplibreWorkerInBundle } from "./scripts/inlineMaplibreWorker.ts";

describe("inlineMaplibreWorkerInBundle", () => {
  it("replaces the emitted worker path with a classic-worker data URL", () => {
    const bundle = {
      "index.js": {
        type: "chunk" as const,
        code: "const workerUrl=`./maplibre-gl-worker-abc.js`;setWorkerUrl(workerUrl);",
      },
      "maplibre-gl-worker-abc.js": {
        type: "asset" as const,
        source: 'self.postMessage("ready");',
      },
    };

    inlineMaplibreWorkerInBundle(bundle);

    expect(bundle["index.js"].code).toContain(
      '"data:text/javascript;charset=utf-8,"+encodeURIComponent("self.postMessage(\\"ready\\");")+"%0A//.cjs"',
    );
    expect(bundle).not.toHaveProperty("maplibre-gl-worker-abc.js");
  });
});
