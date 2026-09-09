import { getRTLTextPluginStatus, setRTLTextPlugin } from "maplibre-gl";
import pluginSource from "virtual:maplibre-rtl-text-source";

export async function initializeRtlText(): Promise<void> {
  const status = getRTLTextPluginStatus();
  if (status !== "unavailable" && status !== "requested") return;

  // Workers cannot fetch a page's Blob URL under file:// (an opaque origin).
  // A data URL carries the script and embedded WASM across that boundary, and
  // can also be reused by replacement workers without a Blob lifetime to manage.
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(pluginSource)}`;
  await setRTLTextPlugin(url, false);
}
