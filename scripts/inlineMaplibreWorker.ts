type GeneratedBundle = Record<
  string,
  { type: "chunk"; code: string } | { type: "asset"; source: string | Uint8Array }
>;

export function inlineMaplibreWorkerInBundle(bundle: GeneratedBundle): void {
  const workers = Object.entries(bundle).filter(([fileName]) =>
    fileName.includes("maplibre-gl-worker"),
  );
  if (workers.length !== 1) {
    throw new Error(
      `Expected one MapLibre worker chunk, found ${workers.length}: ${Object.entries(
        bundle,
      )
        .map(([fileName, output]) => `${fileName} (${output.type})`)
        .join(", ")}.`,
    );
  }

  const [workerFileName, workerOutput] = workers[0];
  const workerCode =
    workerOutput.type === "chunk" ? workerOutput.code : String(workerOutput.source);
  // Vite emits this worker as a self-contained IIFE, so it is a classic worker. MapLibre v6 uses
  // a `.cjs` suffix to distinguish classic workers from module workers. That distinction matters
  // for a file:// page: Chromium rejects a module worker whose top-level Blob URL inherits an
  // opaque origin. A URL fragment preserves the Blob resource while giving MapLibre the suffix it
  // needs to select the classic Worker constructor.
  const blobUrlExpression =
    `URL.createObjectURL(new Blob([${JSON.stringify(workerCode)}],{type:"text/javascript"}))` +
    `+"#maplibre-worker.cjs"`;
  const urlValues = [workerFileName, `./${workerFileName}`, `/${workerFileName}`];
  let replacements = 0;

  for (const output of Object.values(bundle)) {
    if (output.type !== "chunk" || output === workerOutput) continue;
    for (const url of urlValues) {
      for (const quote of ['"', "'", "`"]) {
        const literal = `${quote}${url}${quote}`;
        if (!output.code.includes(literal)) continue;
        output.code = output.code.replaceAll(literal, blobUrlExpression);
        replacements++;
      }
    }
  }

  if (replacements !== 1) {
    throw new Error(
      `Expected one MapLibre worker URL reference, replaced ${replacements}.`,
    );
  }
  delete bundle[workerFileName];
}
