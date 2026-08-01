import {
  IconImage as ImageIcon,
  IconVectorSquare as VectorIcon,
  IconWebBox,
} from "@iconify-prerendered/vue-mdi";
import { nanoid } from "@/utils";
import type { ScenarioMapLayer, ScenarioMapLayerType } from "@/types/scenarioGeoModels";
import type { TGeo } from "@/scenariostore";

export function getMapLayerIcon(mapLayer: ScenarioMapLayer) {
  if (mapLayer.type === "ImageLayer") return ImageIcon;
  if (mapLayer.type === "KMLLayer") return VectorIcon;
  if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer")
    return IconWebBox;
  return ImageIcon;
}

export function addMapLayer(
  layerType: ScenarioMapLayerType,
  geo: TGeo,
): ScenarioMapLayer {
  let newLayer: ScenarioMapLayer;
  if (layerType === "TileJSONLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "TileJSONLayer",
      name: "New TileJSON map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "XYZLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "XYZLayer",
      name: "New XYZ map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "ImageLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "ImageLayer",
      name: "New image layer",
      url: "",
      attributions: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else {
    throw new Error(`Unknown layer type ${layerType}`);
  }

  return newLayer;
}
