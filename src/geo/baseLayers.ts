import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import { klona } from "klona";
import { LayerConfig, LayerConfigFile } from "@/geo/layerConfigTypes";

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
    layers = (await res.json()) as LayerConfigFile;
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
