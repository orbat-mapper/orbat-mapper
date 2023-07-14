import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { circle, union } from "@turf/turf";
import { featureCollection } from "@turf/helpers";
import { GeoJSON } from "ol/format";
import { NUnit } from "@/types/internalModels";
import { convertToMetric } from "@/utils/convert";

export function useRangeRingsLayer() {
  const scn = injectStrict(activeScenarioKey);
  const layer = createLayer();

  const gjf = new GeoJSON({
    featureProjection: "EPSG:3857",
    dataProjection: "EPSG:4326",
  });

  function drawRangeRings() {
    layer.getSource()?.clear();

    const rangeRings = featureCollection(
      scn.geo.everyVisibleUnit.value
        .filter((u) => u.rangeRings?.length)
        .map(createRangeRings)
        .flat(),
    );

    if (rangeRings.features.length === 0) return;

    const mergedRangeRings = gjf.readFeature(
      rangeRings.features.length > 1 ? union(rangeRings) : rangeRings.features[0],
    );

    // layer.getSource()?.addFeature(mergedRangeRings);
    layer.getSource()?.addFeatures(gjf.readFeatures(rangeRings));
  }

  return { rangeLayer: layer, drawRangeRings };
}

function createRangeRings(unit: NUnit) {
  return (
    unit.rangeRings
      ?.filter((r) => !(r.hidden ?? false))
      .map((r) =>
        circle(unit._state!.location!, convertToMetric(r.range, r.uom || "km") / 1000),
      ) || []
  );
}

function createLayer() {
  const layer = new VectorLayer({
    source: new VectorSource(),
    style: {
      "stroke-width": 2,
      "stroke-color": "red",
      // "fill-color": "rgba(255, 0, 0, 0.1)",
    },
  });
  layer.set("title", "Range rings");
  return layer;
}
