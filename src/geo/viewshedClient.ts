import { startViewshedWorker } from "@/lib/terrain";
import { createDemTileProvider, perSource } from "@/geo/demTileProvider";

/**
 * The viewshed worker for an elevation source: started on first use, and replaced, with its tile
 * cache, when the source changes.
 */
export const viewshedClient = perSource(
  async (source) => startViewshedWorker(await createDemTileProvider(source)),
  (client) =>
    void client.then(
      (worker) => worker.terminate(),
      () => {},
    ),
);
