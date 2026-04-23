<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import type { Geometry, Position } from "geojson";
import turfLength from "@turf/length";
import turfArea from "@turf/area";
import turfBbox from "@turf/bbox";
import { feature as turfFeature, lineString, multiLineString } from "@turf/helpers";
import type { NGeometryLayerItem } from "@/types/internalModels";
import type { ScenarioFeatureType } from "@/types/scenarioGeoModels";
import { formatArea, formatLength, formatPosition } from "@/geo/utils";
import { useMeasurementsStore } from "@/stores/geoStore";
import PanelDataGrid from "@/components/PanelDataGrid.vue";

const props = defineProps<{ features: NGeometryLayerItem[] }>();

const { measurementUnit } = storeToRefs(useMeasurementsStore());

function countVertices(g: Geometry): number {
  switch (g.type) {
    case "Point":
      return 1;
    case "MultiPoint":
    case "LineString":
      return g.coordinates.length;
    case "MultiLineString":
      return g.coordinates.reduce((sum, line) => sum + line.length, 0);
    case "Polygon":
      return g.coordinates.reduce((sum, ring) => sum + Math.max(ring.length - 1, 0), 0);
    case "MultiPolygon":
      return g.coordinates.reduce(
        (sum, poly) =>
          sum + poly.reduce((s, ring) => s + Math.max(ring.length - 1, 0), 0),
        0,
      );
    case "GeometryCollection":
      return g.geometries.reduce((sum, gg) => sum + countVertices(gg), 0);
    default:
      return 0;
  }
}

function lengthOf(g: Geometry): number {
  if (g.type === "LineString" || g.type === "MultiLineString") {
    return turfLength(turfFeature(g), { units: "meters" });
  }
  if (g.type === "GeometryCollection") return turfLength(g, { units: "meters" });
  return 0;
}

function areaOf(g: Geometry): number {
  if (
    g.type === "Polygon" ||
    g.type === "MultiPolygon" ||
    g.type === "GeometryCollection"
  ) {
    return turfArea(g);
  }
  return 0;
}

function perimeterOf(g: Geometry): number {
  if (g.type === "Polygon") {
    return turfLength(lineString(g.coordinates[0]), { units: "meters" });
  }
  if (g.type === "MultiPolygon") {
    return turfLength(multiLineString(g.coordinates.map((poly) => poly[0])), {
      units: "meters",
    });
  }
  if (g.type === "GeometryCollection") {
    return g.geometries.reduce((sum, gg) => sum + perimeterOf(gg), 0);
  }
  return 0;
}

const totalVertices = computed(() =>
  props.features.reduce((sum, f) => sum + countVertices(f.geometry), 0),
);

const totalLength = computed(() =>
  props.features.reduce((sum, f) => {
    if (f.geometryMeta.geometryKind === "Circle") return sum;
    return sum + lengthOf(f.geometry);
  }, 0),
);

const totalPerimeter = computed(() =>
  props.features.reduce((sum, f) => {
    if (f.geometryMeta.geometryKind === "Circle" && f.geometryMeta.radius != null) {
      return sum + 2 * Math.PI * f.geometryMeta.radius;
    }
    return sum + perimeterOf(f.geometry);
  }, 0),
);

const totalArea = computed(() =>
  props.features.reduce((sum, f) => {
    if (f.geometryMeta.geometryKind === "Circle" && f.geometryMeta.radius != null) {
      return sum + Math.PI * f.geometryMeta.radius * f.geometryMeta.radius;
    }
    return sum + areaOf(f.geometry);
  }, 0),
);

const kindLabels: Record<ScenarioFeatureType, { singular: string; plural: string }> = {
  Point: { singular: "point", plural: "points" },
  MultiPoint: { singular: "multi point", plural: "multi points" },
  LineString: { singular: "line", plural: "lines" },
  MultiLineString: { singular: "multi line", plural: "multi lines" },
  Polygon: { singular: "polygon", plural: "polygons" },
  MultiPolygon: { singular: "multi polygon", plural: "multi polygons" },
  Circle: { singular: "circle", plural: "circles" },
  GeometryCollection: {
    singular: "geometry collection",
    plural: "geometry collections",
  },
};

const kindBreakdown = computed(() => {
  const counts = new Map<ScenarioFeatureType, number>();
  for (const f of props.features) {
    const k = f.geometryMeta.geometryKind;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([kind, n]) => {
      const label = kindLabels[kind];
      return `${n} ${n === 1 ? label.singular : label.plural}`;
    })
    .join(", ");
});

const combinedBbox = computed<Position[] | null>(() => {
  if (!props.features.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const f of props.features) {
    try {
      const [a, b, c, d] = turfBbox(f.geometry);
      if (a < minX) minX = a;
      if (b < minY) minY = b;
      if (c > maxX) maxX = c;
      if (d > maxY) maxY = d;
    } catch {
      // skip empty geometries
    }
  }
  if (!isFinite(minX)) return null;
  return [
    [minX, minY],
    [maxX, maxY],
  ];
});
</script>

<template>
  <PanelDataGrid class="mt-4 grid-cols-[10ch_1fr]">
    <div class="col-span-2 -mb-2 font-semibold">Geometry</div>

    <div class="text-muted-foreground">Features</div>
    <div>{{ features.length }}</div>

    <template v-if="kindBreakdown">
      <div class="text-muted-foreground">Types</div>
      <div>{{ kindBreakdown }}</div>
    </template>

    <template v-if="totalVertices > 0">
      <div class="text-muted-foreground">Vertices</div>
      <div>{{ totalVertices }}</div>
    </template>

    <template v-if="totalLength > 0">
      <div class="text-muted-foreground">Length</div>
      <div>{{ formatLength(totalLength, measurementUnit) }}</div>
    </template>

    <template v-if="totalPerimeter > 0">
      <div class="text-muted-foreground">Perimeter</div>
      <div>{{ formatLength(totalPerimeter, measurementUnit) }}</div>
    </template>

    <template v-if="totalArea > 0">
      <div class="text-muted-foreground">Area</div>
      <div>{{ formatArea(totalArea, measurementUnit) }}</div>
    </template>

    <template v-if="combinedBbox">
      <div class="text-muted-foreground">Bounds</div>
      <div class="font-mono text-xs">
        {{ formatPosition(combinedBbox[0]) }} — {{ formatPosition(combinedBbox[1]) }}
      </div>
    </template>
  </PanelDataGrid>
</template>
