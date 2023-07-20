import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { circle, union } from "@turf/turf";
import { featureCollection } from "@turf/helpers";
import { GeoJSON } from "ol/format";
import { NUnit } from "@/types/internalModels";
import { convertToMetric } from "@/utils/convert";
import { Style } from "ol/style";
import { FeatureLike } from "ol/Feature";
import { FeatureId } from "@/types/scenarioGeoModels";
import { createSimpleStyle } from "@/geo/simplestyle";
import { toStyle } from "ol/style/flat";
import { TScenario } from "@/scenariostore";

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

    if (rangeRings.features.length === 0) return;

    /*
    const mergedRangeRings = gjf.readFeature(
      rangeRings.features.length > 1 ? union(rangeRings) : rangeRings.features[0],
    );

    layer.getSource()?.addFeature(mergedRangeRings);
    */

    layer.getSource()?.addFeatures(gjf.readFeatures(rangeRings));
  }

  return { rangeLayer: layer, drawRangeRings };
}

function createRangeRings(unit: NUnit) {
  return (
    unit.rangeRings
      ?.filter((r) => !(r.hidden ?? false))
      .map((r, i) =>
        circle(unit._state!.location!, convertToMetric(r.range, r.uom || "km") / 1000, {
          properties: { id: `${unit.id}-${i}` },
        }),
      ) || []
  );
}

const defaultStyle = toStyle({
  "stroke-width": 2,
  "stroke-color": "red",
  // "fill-color": "rgba(255, 0, 0, 0.1)",
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
      const parts = id.split("-");
      const index = parts.pop();
      const unitId = parts.join("-");
      const unit = scn.store.state.getUnitById(unitId);
      const ring = unit.rangeRings?.[index];
      style = ring?.style
        ? createSimpleStyle({ fill: null, stroke: "red", ...ring.style })
        : defaultStyle;
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
