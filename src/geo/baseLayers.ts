import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import type { Options as TileLayerOptions } from "ol/layer/BaseTile";
import type { Options as OSMOptions } from "ol/source/OSM";
import OSM from "ol/source/OSM";
import type { Options as XYZOptions } from "ol/source/XYZ";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import { klona } from "klona";

interface BaseLayerConfig {
  title: string;
  name: string;
  layerSourceType?: "osm" | "xyz";
  layerType?: "baselayer";
  tileLayerOptions?: Exclude<TileLayerOptions<any>, "source" | "map" | "properties">;
}

interface XYZLayerConfig extends BaseLayerConfig {
  layerSourceType: "xyz";
  sourceOptions: XYZOptions;
}

interface OSMLayerConfig extends BaseLayerConfig {
  layerSourceType: "osm";
  sourceOptions: OSMOptions;
}

type LayerConfig = XYZLayerConfig | OSMLayerConfig;

function createFallbackLayers() {
  return [
    new TileLayer({
      source: new OSM({ crossOrigin: "anonymous" }),
      visible: true,
      preload: Infinity,
      properties: {
        title: "OSM",
        name: "osm",
        layerType: "baselayer",
      },
    }),
  ];
}

export async function createBaseLayers(view: View, currentBaseLayerName = "osm") {
  let layers;
  try {
    const res = await fetch("/mapConfig.json");
    layers = (await res.json()) as LayerConfig[];
  } catch (e) {
    console.error("Failed to fetch mapConfig.json", e);
    return createFallbackLayers();
  }

  if (!layers || !layers.length) {
    console.warn("No layers found in mapConfig.json");
    return createFallbackLayers();
  }

  const baseLayers = layers.map((layerConfig) => {
    const {
      layerSourceType,
      layerType = "baselayer",
      title,
      name,
      tileLayerOptions,
    } = klona(layerConfig);

    if (tileLayerOptions?.extent) {
      tileLayerOptions.extent = transformExtent(
        tileLayerOptions.extent,
        "EPSG:4326",
        view.getProjection(),
      );
    }

    const properties = { title, name, layerType };

    let source;
    if (layerSourceType === "osm") {
      source = new OSM(layerConfig.sourceOptions);
    } else if (layerSourceType === "xyz") {
      source = new XYZ(layerConfig.sourceOptions);
    }

    return new TileLayer({
      source,
      properties,
      visible: currentBaseLayerName === layerConfig.name,
      preload: Infinity,
      ...tileLayerOptions,
    });
  });

  // ensure that at least one is visible
  if (!baseLayers.some((l) => l.getVisible())) {
    baseLayers[0]?.setVisible(true);
  }
  return baseLayers;
}
