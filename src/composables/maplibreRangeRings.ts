import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import circle from "@turf/circle";
import union from "@turf/union";
import { featureCollection } from "@turf/helpers";
import { clusterEach } from "@turf/clusters";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { fromString as parseColor } from "ol/color";
import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import { convertToMetric } from "@/utils/convert";

const RANGE_RING_SOURCE_ID = "rangeRingSource";
const RANGE_RING_FILL_LAYER_ID = "rangeRingFillLayer";
const RANGE_RING_LINE_LAYER_ID = "rangeRingLineLayer";

const DEFAULT_STROKE = "#f43f5e";

type RingFeatureProperties = {
  id: string;
  isGroup: boolean;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
};

function toRgbaColor(
  color: string | null | undefined,
  opacity: number,
  fallback: string,
) {
  const parsed = parseColor(color || fallback);
  const [r, g, b, a = 1] = Array.isArray(parsed) ? parsed : parseColor(fallback);
  const nextOpacity = Math.max(0, Math.min(1, a * opacity));
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${nextOpacity})`;
}

type RingIdProperties = { id: string; isGroup: boolean };

function createRangeRings(unit: NUnit): Feature<Polygon, RingIdProperties>[] {
  if (!unit.rangeRings?.length || !unit._state?.location) return [];
  const out: Feature<Polygon, RingIdProperties>[] = [];
  unit.rangeRings.forEach((r, i) => {
    if (r.hidden) return;
    const ring = circle(
      unit._state!.location!,
      convertToMetric(r.range, r.uom || "km") / 1000,
      {
        properties: {
          id: r.group ? r.group : `${unit.id}-${i}`,
          isGroup: !!r.group,
        },
      },
    ) as Feature<Polygon, RingIdProperties>;
    out.push(ring);
  });
  return out;
}

export function useMaplibreRangeRings(mlMap: MlMap, activeScenario: TScenario) {
  function setupRangeRingLayers(beforeLayerId?: string) {
    if (!mlMap.getSource(RANGE_RING_SOURCE_ID)) {
      mlMap.addSource(RANGE_RING_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!mlMap.getLayer(RANGE_RING_FILL_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: RANGE_RING_FILL_LAYER_ID,
          type: "fill",
          source: RANGE_RING_SOURCE_ID,
          paint: {
            "fill-color": ["get", "fillColor"],
          },
        },
        beforeLayerId,
      );
    }
    if (!mlMap.getLayer(RANGE_RING_LINE_LAYER_ID)) {
      mlMap.addLayer(
        {
          id: RANGE_RING_LINE_LAYER_ID,
          type: "line",
          source: RANGE_RING_SOURCE_ID,
          paint: {
            "line-color": ["get", "strokeColor"],
            "line-width": ["get", "strokeWidth"],
          },
        },
        beforeLayerId,
      );
    }
  }

  function resolveRingStyle(id: string, isGroup: boolean): RingFeatureProperties {
    let style: Record<string, any> = {};
    if (isGroup) {
      style = activeScenario.store.state.rangeRingGroupMap[id]?.style ?? {};
    } else {
      const sep = id.lastIndexOf("-");
      const unitId = id.slice(0, sep);
      const index = Number(id.slice(sep + 1));
      const unit = activeScenario.helpers.getUnitById(unitId);
      style = unit?.rangeRings?.[index]?.style ?? {};
    }
    const strokeOpacity = style["stroke-opacity"] ?? 1;
    const strokeWidth = style["stroke-width"] ?? 2;
    const strokeColor = toRgbaColor(style.stroke, strokeOpacity, DEFAULT_STROKE);
    const hasFill = style.fill != null && style.fill !== "";
    const fillOpacity = hasFill ? (style["fill-opacity"] ?? 0.5) : 0;
    const fillColor = hasFill
      ? toRgbaColor(style.fill, fillOpacity, DEFAULT_STROKE)
      : "rgba(0, 0, 0, 0)";
    return { id, isGroup, strokeColor, strokeWidth, fillColor };
  }

  function drawRangeRings() {
    const source = mlMap.getSource(RANGE_RING_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    const rings = activeScenario.geo.everyVisibleUnit.value
      .filter((u) => u.rangeRings?.length)
      .flatMap(createRangeRings);

    const fc = featureCollection(rings);
    const ungrouped = featureCollection(
      fc.features.filter((r) => !r.properties!.isGroup),
    );
    const grouped = featureCollection(fc.features.filter((r) => r.properties!.isGroup));

    const merged: Feature<Polygon | MultiPolygon>[] = [];
    clusterEach(grouped, "id", (cluster) => {
      const m =
        cluster.features.length > 1
          ? union(cluster as any, {
              properties: {
                id: cluster.features[0].properties!.id,
                isGroup: true,
              },
            })
          : cluster.features[0];
      if (m) merged.push(m as Feature<Polygon | MultiPolygon>);
    });

    const features: Feature<Polygon | MultiPolygon, RingFeatureProperties>[] = [
      ...merged,
      ...ungrouped.features,
    ].map((f) => ({
      ...f,
      properties: resolveRingStyle(f.properties!.id, f.properties!.isGroup),
    }));

    source.setData({ type: "FeatureCollection", features });
  }

  return { setupRangeRingLayers, drawRangeRings };
}
