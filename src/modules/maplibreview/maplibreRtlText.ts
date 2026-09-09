import { getRTLTextPluginStatus, setRTLTextPlugin } from "maplibre-gl";
import pluginUrl from "virtual:maplibre-rtl-text-url";

/** The standalone build replaces this module with the self-contained data-URL variant. */
export async function initializeRtlText(): Promise<void> {
  const status = getRTLTextPluginStatus();
  if (status !== "unavailable" && status !== "requested") return;

  await setRTLTextPlugin(pluginUrl, false);
}
