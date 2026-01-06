import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import { klona } from "klona";
import type { LayerConfig, LayerConfigFile } from "@/geo/layerConfigTypes";

export function createBaseLayerInstances(layers: LayerConfigFile, view: View) {
  return layers.map((layerConfig) => {
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

    const layer = new TileLayer({
      source,
      properties,
      visible: false, // We will control visibility via store/watcher
      preload: Infinity,
      ...tileLayerOptions,
    });
    layer.set("name", name);
    layer.set("title", title);
    return layer;
  });
}
