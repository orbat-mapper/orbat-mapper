<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import type { Geometry, Position } from "geojson";
import turfLength from "@turf/length";
import turfArea from "@turf/area";
import turfBbox from "@turf/bbox";
import { feature as turfFeature, lineString, multiLineString } from "@turf/helpers";
import type { NGeometryLayerItem } from "@/types/internalModels";
import { formatArea, formatLength, formatPosition } from "@/geo/utils";
import { useMeasurementsStore } from "@/stores/geoStore";
import PanelDataGrid from "@/components/PanelDataGrid.vue";

const props = defineProps<{ feature: NGeometryLayerItem }>();

const { measurementUnit } = storeToRefs(useMeasurementsStore());

const kind = computed(() => props.feature.geometryMeta.geometryKind);
const geom = computed<Geometry>(() => props.feature.geometry);
const radius = computed(() => props.feature.geometryMeta.radius);

const typeLabel = computed(() => {
  if (kind.value === "Circle") return "Circle";
  const labels: Record<string, string> = {
    Point: "Point",
    MultiPoint: "Multi point",
    LineString: "Line",
    MultiLineString: "Multi line",
    Polygon: "Polygon",
    MultiPolygon: "Multi polygon",
    GeometryCollection: "Geometry collection",
  };
  return labels[geom.value.type] ?? geom.value.type;
});

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

function countParts(g: Geometry): number {
  switch (g.type) {
    case "MultiPoint":
    case "MultiLineString":
      return g.coordinates.length;
    case "MultiPolygon":
      return g.coordinates.length;
    case "GeometryCollection":
      return g.geometries.length;
    default:
      return 0;
  }
}

function countRings(g: Geometry): number {
  if (g.type === "Polygon") return g.coordinates.length;
  if (g.type === "MultiPolygon")
    return g.coordinates.reduce((sum, poly) => sum + poly.length, 0);
  if (g.type === "GeometryCollection")
    return g.geometries.reduce((sum, gg) => sum + countRings(gg), 0);
  return 0;
}

const vertexCount = computed(() => countVertices(geom.value));
const partsCount = computed(() => countParts(geom.value));
const ringsCount = computed(() => countRings(geom.value));

const hasVertexCount = computed(() =>
  [
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
    "GeometryCollection",
  ].includes(geom.value.type),
);
const hasPartsCount = computed(() =>
  ["MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection"].includes(
    geom.value.type,
  ),
);
const hasRingsCount = computed(() => ringsCount.value > 0);

const lengthMeters = computed(() => {
  const g = geom.value;
  if (g.type === "LineString" || g.type === "MultiLineString") {
    return turfLength(turfFeature(g), { units: "meters" });
  }
  if (g.type === "GeometryCollection") {
    const total = turfLength(g, { units: "meters" });
    return total > 0 ? total : null;
  }
  return null;
});

const areaMeters = computed(() => {
  if (kind.value === "Circle" && radius.value != null) {
    return Math.PI * radius.value * radius.value;
  }
  const g = geom.value;
  if (g.type === "Polygon" || g.type === "MultiPolygon") return turfArea(g);
  if (g.type === "GeometryCollection") {
    const total = turfArea(g);
    return total > 0 ? total : null;
  }
  return null;
});

function ringsToMultiLineString(g: Geometry): Position[][] {
  if (g.type === "Polygon") return [g.coordinates[0]];
  if (g.type === "MultiPolygon") return g.coordinates.map((poly) => poly[0]);
  if (g.type === "GeometryCollection") {
    return g.geometries.flatMap(ringsToMultiLineString);
  }
  return [];
}

const perimeterMeters = computed(() => {
  if (kind.value === "Circle" && radius.value != null) {
    return 2 * Math.PI * radius.value;
  }
  const g = geom.value;
  if (g.type === "Polygon") {
    return turfLength(lineString(g.coordinates[0]), { units: "meters" });
  }
  if (g.type === "MultiPolygon") {
    const outerRings = g.coordinates.map((poly) => poly[0]);
    return turfLength(multiLineString(outerRings), { units: "meters" });
  }
  if (g.type === "GeometryCollection") {
    const rings = ringsToMultiLineString(g);
    if (!rings.length) return null;
    return turfLength(multiLineString(rings), { units: "meters" });
  }
  return null;
});

const position = computed<Position | null>(() => {
  const g = geom.value;
  if (g.type === "Point") return g.coordinates;
  return null;
});

const bboxText = computed(() => {
  const g = geom.value;
  if (g.type === "Point") return null;
  if (kind.value === "Circle") return null;
  try {
    const [minX, minY, maxX, maxY] = turfBbox(g);
    return `${formatPosition([minX, minY])} — ${formatPosition([maxX, maxY])}`;
  } catch {
    return null;
  }
});

const isCircle = computed(() => kind.value === "Circle");
</script>

<template>
  <PanelDataGrid class="mt-4 grid-cols-[10ch_1fr]">
    <div class="col-span-2 -mb-2 font-semibold">Geometry</div>

    <div class="text-muted-foreground">Type</div>
    <div>{{ typeLabel }}</div>

    <template v-if="isCircle && radius != null">
      <div class="text-muted-foreground">Radius</div>
      <div>{{ formatLength(radius, measurementUnit) }}</div>
    </template>

    <template v-if="position">
      <div class="text-muted-foreground">
        {{ isCircle ? "Center" : "Position" }}
      </div>
      <div class="font-mono text-xs">{{ formatPosition(position) }}</div>
    </template>

    <template v-if="hasPartsCount">
      <div class="text-muted-foreground">Parts</div>
      <div>{{ partsCount }}</div>
    </template>

    <template v-if="hasRingsCount">
      <div class="text-muted-foreground">Rings</div>
      <div>{{ ringsCount }}</div>
    </template>

    <template v-if="hasVertexCount">
      <div class="text-muted-foreground">Vertices</div>
      <div>{{ vertexCount }}</div>
    </template>

    <template v-if="lengthMeters != null">
      <div class="text-muted-foreground">Length</div>
      <div>{{ formatLength(lengthMeters, measurementUnit) }}</div>
    </template>

    <template v-if="perimeterMeters != null">
      <div class="text-muted-foreground">
        {{ isCircle ? "Circumference" : "Perimeter" }}
      </div>
      <div>{{ formatLength(perimeterMeters, measurementUnit) }}</div>
    </template>

    <template v-if="areaMeters != null">
      <div class="text-muted-foreground">Area</div>
      <div>{{ formatArea(areaMeters, measurementUnit) }}</div>
    </template>

    <template v-if="bboxText">
      <div class="text-muted-foreground">Bounds</div>
      <div class="font-mono text-xs">{{ bboxText }}</div>
    </template>
  </PanelDataGrid>
</template>
