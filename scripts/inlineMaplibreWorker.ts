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
  // Vite emits this worker as a self-contained IIFE, so it is a classic worker, and it must run as
  // one: Chromium rejects a module worker whose Blob URL inherits the opaque origin of a file://
  // page. MapLibre starts a classic worker only when the path of the worker URL, before any `?` or
  // `#`, ends in `.cjs`. A Blob URL's path is a UUID, thus the worker goes in a data: URL whose body
  // ends in a `//.cjs` comment. MapLibre sees a cross-origin `.cjs` URL, fetches it and starts a
  // classic worker from a Blob URL of its own.
  const dataUrlExpression =
    `"data:text/javascript;charset=utf-8,"+encodeURIComponent(${JSON.stringify(workerCode)})` +
    `+"%0A//.cjs"`;
  const urlValues = [workerFileName, `./${workerFileName}`, `/${workerFileName}`];
  let replacements = 0;

  for (const output of Object.values(bundle)) {
    if (output.type !== "chunk" || output === workerOutput) continue;
    for (const url of urlValues) {
      for (const quote of ['"', "'", "`"]) {
        const literal = `${quote}${url}${quote}`;
        if (!output.code.includes(literal)) continue;
        output.code = output.code.replaceAll(literal, dataUrlExpression);
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
