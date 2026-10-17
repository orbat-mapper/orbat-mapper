import type { DemTileProvider } from "./sampler";
import { connectViewshedService, type ViewshedClient } from "./viewshedService";

/** Starts a viewshed worker that reads tiles from `provider` on this thread.
 *  Terminate it when the provider is replaced. The worker's source is loaded
 *  on the first start, so it costs nothing until a viewshed is asked for. */
export async function startViewshedWorker(
  provider: DemTileProvider,
): Promise<ViewshedClient & { terminate(): void }> {
  const { default: ViewshedWorker } = await import("./viewshedWorker?worker&inline");
  const worker = new ViewshedWorker();
  return {
    ...connectViewshedService(worker, provider),
    terminate: () => worker.terminate(),
  };
}
