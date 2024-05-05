import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { AnyVectorLayer } from "./types";
import { nanoid } from "@/utils";
import { LayerTypes } from "@/modules/scenarioeditor/scenarioLayers2";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import { Cluster } from "ol/source";
import { FeatureLike } from "ol/Feature";
import { createUnitStyle, unitStyleCache } from "@/geo/unitStyles";
import { TScenario } from "@/scenariostore";
import AnimatedCluster from "ol-ext/layer/AnimatedCluster";
import Chart from "ol-ext/style/Chart";
const styleCache: Record<string, any> = {};

export function createClusterLayer(
  source: VectorSource,
  activeScenario: TScenario,
): AnyVectorLayer {
  const {
    store: { state, onUndoRedo },
    geo,
    unitActions: { getCombinedSymbolOptions },
  } = activeScenario;

  const clusterSource = new Cluster({
    distance: 50,
    // minDistance: 40,
    source: source,
  });

  return new AnimatedCluster({
    source: clusterSource,
    animationDuration: 500,
    style: getClusterStyle,
    // style: function (feature, resolution) {
    //   const size = feature.get("features").length;
    //   if (size === 1) {
    //     return unitStyleFunction(feature.get("features")[0], resolution);
    //   }
    //   let style = styleCache[size];
    //   if (!style) {
    //     style = new Style({
    //       image: new CircleStyle({
    //         radius: 10,
    //         stroke: new Stroke({
    //           color: "#fff",
    //         }),
    //         fill: new Fill({
    //           color: "#3399CC",
    //         }),
    //       }),
    //       text: new Text({
    //         text: size.toString(),
    //         fill: new Fill({
    //           color: "#fff",
    //         }),
    //       }),
    //     });
    //     styleCache[size] = style;
    //   }
    //   return style;
    // },
    updateWhileInteracting: true,
    // updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Cluster layer",
      layerType: LayerTypes.cluster,
    },
  });

  function getClusterStyle(feature, resolution) {
    var features = feature.get("features");
    var size = features.length;
    // Feature style
    if (size === 1) return unitStyleFunction(feature.get("features")[0], resolution);
    // ClusterStyle
    else {
      var data = [20, 0, 0, 10];
      const sideCounter = new Map<string, number>();

      for (var i = 0, f; (f = features[i]); i++) {
        const unitId = f.getId();
        const unit = state.getUnitById(unitId);
        const symbolOptions = getCombinedSymbolOptions(unit);
        const color = symbolOptions.fillColor ?? "red";
        sideCounter.set(color, (sideCounter.get(color) ?? 0) + 1);
      }

      var style = styleCache[data.join(",")];
      style = null;
      if (!style) {
        var radius = Math.min(size + 15, 20);
        style = styleCache[data.join(",")] = new Style({
          image: new Chart({
            type: "pie",
            radius: radius,
            data: [...sideCounter.values()],
            colors: [...sideCounter.keys()],
            rotateWithView: true,
            stroke: new Stroke({
              color: "rgba(0,0,0,1)",
              width: 1,
            }),
          }),

          text: new Text({
            text: size.toString(),
            font: "14px InterVariable",
            fill: new Fill({
              color: "#fff",
            }),
            stroke: new Stroke({
              color: "#000",
              width: 3,
            }),
          }),
        });
      }
      return [style];
    }
  }

  function unitStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;
    let unitStyle = unitStyleCache.get(unitId);

    if (!unitStyle) {
      const unit = state.getUnitById(unitId);
      if (unit) {
        const symbolOptions = getCombinedSymbolOptions(unit);
        unitStyle = createUnitStyle(unit, symbolOptions);
        unitStyleCache.set(unitId, unitStyle);
      }
    }

    return unitStyle;
  }
}

// Style for the clusters
