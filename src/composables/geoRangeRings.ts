import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { clusterEach } from "@turf/clusters";
import circle from "@turf/circle";
import union from "@turf/union";
import { featureCollection } from "@turf/helpers";
import { GeoJSON } from "ol/format";
import type { NUnit } from "@/types/internalModels";
import { convertToMetric } from "@/utils/convert";
import { Stroke, Style } from "ol/style";
import Feature, { type FeatureLike } from "ol/Feature";
import { type FeatureId } from "@/types/scenarioGeoModels";
import { createSimpleStyle } from "@/geo/simplestyle";
import { type TScenario } from "@/scenariostore";

export function useRangeRingsLayer() {
  const scn = injectStrict(activeScenarioKey);
  const { rangeRingStyle, clearCache } = useRangeRingStyles(scn);
  const layer = createLayer();
  layer.setStyle(rangeRingStyle);

  const gjf = new GeoJSON({
    featureProjection: "EPSG:3857",
    dataProjection: "EPSG:4326",
  });

  function drawRangeRings() {
    layer.getSource()?.clear();
    clearCache();

    const rangeRings = featureCollection(
      scn.geo.everyVisibleUnit.value
        .filter((u) => u.rangeRings?.length)
        .map(createRangeRings)
        .flat(),
    );

    const unGrouped = featureCollection(
      rangeRings.features.filter((r) => !r.properties.isGroup),
    );
    const grouped = featureCollection(
      rangeRings.features.filter((r) => r.properties.isGroup),
    );

    clusterEach(grouped, "id", (cluster) => {
      const merged =
        cluster.features.length > 1
          ? union(cluster, {
              properties: { id: cluster.features[0].properties.id, isGroup: true },
            })
          : cluster.features[0];
      layer.getSource()?.addFeature(gjf.readFeature(merged) as Feature);
    });

    layer.getSource()?.addFeatures(gjf.readFeatures(unGrouped) as Feature[]);
  }

  return { rangeLayer: layer, drawRangeRings };
}

function createRangeRings(unit: NUnit) {
  return (
    unit.rangeRings
      ?.map((r, i) =>
        !r.hidden
          ? circle(
              unit._state!.location!,
              convertToMetric(r.range, r.uom || "km") / 1000,
              {
                properties: {
                  id: r.group ? r.group : `${unit.id}-${i}`,
                  isGroup: !!r.group,
                },
              },
            )
          : null,
      )
      .filter((e) => e !== null) || []
  );
}

const defaultStyle = new Style({
  stroke: new Stroke({ width: 2, color: "red" }),
});

function createLayer() {
  const layer = new VectorLayer({
    source: new VectorSource(),
    style: defaultStyle,
  });
  layer.set("title", "Range rings");
  return layer;
}

function useRangeRingStyles(scn: TScenario) {
  const styleCache = new Map<any, Style>();

  function clearCache() {
    styleCache.clear();
  }

  function rangeRingStyle(feature: FeatureLike, resolution: number) {
    const id = feature.get("id");
    let style = styleCache.get(id);
    if (!style) {
      const isGroup = feature.get("isGroup");
      if (isGroup) {
        const groupStyle = scn.store.state.rangeRingGroupMap[id]?.style;
        style = groupStyle
          ? createSimpleStyle({ fill: null, stroke: "red", ...groupStyle })
          : defaultStyle;
      } else {
        const parts = id.split("-");
        const index = parts.pop();
        const unitId = parts.join("-");
        const unit = scn.helpers.getUnitById(unitId);
        const ring = unit.rangeRings?.[index];
        style = ring?.style
          ? createSimpleStyle({ fill: null, stroke: "red", ...ring.style })
          : defaultStyle;
      }
      styleCache.set(id, style);
    }
    return style;
  }

  function invalidateStyle(featureId: FeatureId) {
    styleCache.delete(featureId);
  }

  return {
    clearCache,
    rangeRingStyle,
    invalidateStyle,
  };
}
