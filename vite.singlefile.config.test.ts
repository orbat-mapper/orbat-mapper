import { describe, expect, it } from "vitest";
import { inlineMaplibreWorkerInBundle } from "./scripts/inlineMaplibreWorker.ts";

describe("inlineMaplibreWorkerInBundle", () => {
  it("replaces the emitted worker path with a classic-worker Blob URL", () => {
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
      'URL.createObjectURL(new Blob(["self.postMessage(\\"ready\\");"],{type:"text/javascript"}))+"#maplibre-worker.cjs"',
    );
    expect(bundle).not.toHaveProperty("maplibre-gl-worker-abc.js");
  });
});
