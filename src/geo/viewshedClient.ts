import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { startViewshedWorker, type ViewshedClient } from "@/lib/terrain";
import { createDemTileProvider } from "@/geo/demTileProvider";

type Worker = ViewshedClient & { terminate(): void };

let current: { source: RasterDEMSourceSpecification; worker: Promise<Worker> } | null =
  null;

/**
 * The viewshed worker for an elevation source: started on first use, and replaced, with its tile
 * cache, when the source changes. One that fails to start is started again next time.
 */
export function viewshedClient(source: RasterDEMSourceSpecification): Promise<Worker> {
  if (current?.source !== source) {
    stopViewshedWorker();
    const entry = {
      source,
      worker: createDemTileProvider(source).then(startViewshedWorker),
    };
    entry.worker.catch(() => {
      if (current === entry) current = null;
    });
    current = entry;
  }
  return current.worker;
}

/** Ends the worker and frees its tile cache, once no viewshed needs it. */
export function stopViewshedWorker(): void {
  current?.worker.then(
    (worker) => worker.terminate(),
    () => {},
  );
  current = null;
}
