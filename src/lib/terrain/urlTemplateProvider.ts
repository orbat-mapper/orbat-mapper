import type { DemEncoding } from "./dem";
import type { DemTileProvider } from "./sampler";

export interface UrlTemplateProviderOptions {
  /** A tile address with `{z}`, `{x}` and `{y}` placeholders. */
  url: string;
  encoding: DemEncoding;
  tileSize: number;
  minZoom?: number;
  maxZoom: number;
}

/** Reads DEM tiles over HTTP. A missing tile (404, 204 or empty) is no data;
 *  any other failure is an error. */
export function urlTemplateProvider({
  url,
  ...rest
}: UrlTemplateProviderOptions): DemTileProvider {
  return {
    ...rest,
    async getTile(z, x, y) {
      const address = url
        .replace("{z}", String(z))
        .replace("{x}", String(x))
        .replace("{y}", String(y));
      const response = await fetch(address);
      if (response.status === 404 || response.status === 204) return null;
      if (!response.ok)
        throw new Error(`DEM tile ${z}/${x}/${y} failed: HTTP ${response.status}`);
      const data = await response.arrayBuffer();
      return data.byteLength ? data : null;
    },
  };
}
