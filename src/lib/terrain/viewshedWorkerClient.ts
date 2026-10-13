import type { DemTileProvider } from "./sampler";
import { connectViewshedService, type ViewshedClient } from "./viewshedService";
import ViewshedWorker from "./viewshedWorker?worker&inline";

/** Starts a viewshed worker that reads tiles from `provider` on this thread.
 *  Terminate it when the provider is replaced. */
export function startViewshedWorker(
  provider: DemTileProvider,
): ViewshedClient & { terminate(): void } {
  const worker = new ViewshedWorker();
  return {
    ...connectViewshedService(worker, provider),
    terminate: () => worker.terminate(),
  };
}
