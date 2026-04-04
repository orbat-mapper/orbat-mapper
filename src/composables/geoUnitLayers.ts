import { createUnitFeatureAt, createUnitLayer } from "@/geo/layers";
// import Fade from "ol-ext/featureanimation/Fade";
import { type MaybeRef, onUnmounted, ref, type Ref, unref, watch } from "vue";
import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import Point from "ol/geom/Point";
import Polygon, { fromExtent as polygonFromExtent } from "ol/geom/Polygon";
import DragBox from "ol/interaction/DragBox";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import PointerInteraction from "ol/interaction/Pointer";
import { ModifyEvent } from "ol/interaction/Modify";
import Feature from "ol/Feature";
import type MapBrowserEvent from "ol/MapBrowserEvent";

import {
  clearUnitStyleCache,
  createUnitLabelData,
  createUnitStyle,
  labelStyleCache,
  selectedUnitStyleCache,
  unitStyleCache,
} from "@/geo/unitStyles";
import {
  altKeyOnly,
  click as clickCondition,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { useOlEvent } from "./openlayersHelpers";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { EntityId } from "@/types/base";
import type { TScenario } from "@/scenariostore";
import { useSelectedItems } from "@/stores/selectedStore";
import type { FeatureLike } from "ol/Feature";
import BaseEvent from "ol/events/Event";
import { useMapDropTarget } from "@/composables/useMapDropTarget";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { Coordinate } from "ol/coordinate";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

import View from "ol/View";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import type SimpleGeometry from "ol/geom/SimpleGeometry";
import { LayerTypes } from "@/modules/scenarioeditor/featureLayerUtils.ts";
import { getTopHitLayerType } from "@/modules/scenarioeditor/featureLayerUtils.ts";
import { useRecordingStore } from "@/stores/recordingStore";
import { clusterUnits, type ClusterableUnit } from "@/geo/unitClustering";
import type { UnitClusteringSettings } from "@/types/mapSettings";
import { useGeoStore } from "@/stores/geoStore";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants";
import { getFullUnitSidc } from "@/symbology/helpers";
import { Sidc } from "@/symbology/sidc";
import { Dimension, symbolSetToDimension } from "@/symbology/values";
import { convex as turfConvex } from "@turf/convex";
import { featureCollection, point as turfPoint } from "@turf/helpers";

let zoomResolutions: number[] = [];
const ROTATION_EPSILON = 1e-6;

function normalizeRotation(rotation: number): number {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function toHeadingFromNorthDegrees(center: Coordinate, point: Coordinate): number {
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const angleFromEast = (Math.atan2(dy, dx) * 180) / Math.PI;
  return normalizeRotation(90 - angleFromEast);
}

function shortestRotationDelta(nextAngle: number, prevAngle: number) {
  let delta = normalizeRotation(nextAngle - prevAngle);
  if (delta > 180) delta -= 360;
  return delta;
}

function setMapCursor(mapRef: OLMap, cursor: string) {
  const targetElement = mapRef.getTargetElement();
  if (!targetElement) return;
  targetElement.style.cursor = cursor;
}

function getFeatureRotationRadians(feature: FeatureLike, fallbackDegrees = 0): number {
  const temporaryRotation = feature.get("_symbolRotation");
  const symbolRotationDeg =
    typeof temporaryRotation === "number" ? temporaryRotation : fallbackDegrees;
  return (normalizeRotation(symbolRotationDeg) * Math.PI) / 180;
}

function getClusterDomain(unit: { sidc: string; _state?: { sidc?: string | undefined } | null }) {
  const sidc = getFullUnitSidc(unit._state?.sidc || unit.sidc);
  const symbolSet = new Sidc(sidc).symbolSet;
  const dimension = symbolSetToDimension[symbolSet] ?? Dimension.Unknown;

  switch (dimension) {
    case Dimension.SeaSurface:
    case Dimension.SeaSubsurface:
      return "sea";
    case Dimension.Air:
      return "air";
    case Dimension.Space:
      return "space";
    case Dimension.LandUnit:
    case Dimension.LandEquipment:
    case Dimension.LandInstallation:
    case Dimension.DismountedIndividual:
      return "land";
    default:
      return "other";
  }
}

function getClusterStandardIdentity(unit: {
  sidc: string;
  _state?: { sidc?: string | undefined } | null;
}) {
  return new Sidc(getFullUnitSidc(unit._state?.sidc || unit.sidc)).standardIdentity;
}

function getClusterSegmentColor(standardIdentity: string, domain: string) {
  const domainLightness = {
    land: 52,
    sea: 40,
    air: 62,
    space: 70,
    other: 58,
  }[domain] ?? 58;

  const hue = {
    "0": 0,
    "1": 0,
    "2": 90,
    "3": 95,
    "4": 205,
    "5": 14,
    "6": 0,
    "7": 55,
    "8": 305,
  }[standardIdentity] ?? 275;

  const saturation = {
    "0": 0,
    "1": 0,
    "2": 45,
    "3": 42,
    "4": 48,
    "5": 70,
    "6": 72,
    "7": 58,
    "8": 58,
  }[standardIdentity] ?? 55;

  return `hsl(${hue} ${saturation}% ${domainLightness}%)`;
}

function getBufferedExtent(coords: Coordinate[], buffer: number): [number, number, number, number] {
  const xs = coords.map((coord) => coord[0]);
  const ys = coords.map((coord) => coord[1]);
  return [
    Math.min(...xs) - buffer,
    Math.min(...ys) - buffer,
    Math.max(...xs) + buffer,
    Math.max(...ys) + buffer,
  ];
}

function createClusterOutlineGeometry(
  coordinates: Coordinate[],
  resolution: number,
): SimpleGeometry | undefined {
  if (!coordinates.length) return;

  const buffer = Math.max(resolution * 24, 12);
  if (coordinates.length < 3) {
    return polygonFromExtent(getBufferedExtent(coordinates, buffer));
  }

  const hull = turfConvex(featureCollection(coordinates.map((coord) => turfPoint(coord))));
  const ring = hull?.geometry?.type === "Polygon" ? hull.geometry.coordinates[0] : undefined;
  if (ring?.length) {
    return new Polygon([ring as Coordinate[]]);
  }

  return polygonFromExtent(getBufferedExtent(coordinates, buffer));
}

function createClusterSummaryRingStyle(
  composition: {
    key: string;
    standardIdentity: string;
    domain: string;
    count: number;
  }[],
  overlapOffset: Coordinate,
) {
  const cacheKey = `${composition
    .map((entry) => `${entry.key}:${entry.count}`)
    .join("|")}:${overlapOffset[0]}:${overlapOffset[1]}`;
  const cached = clusterSummaryRingStyleCache.get(cacheKey);
  if (cached) return cached;

  const size = 76;
  const outerRadius = 34;
  const innerRadius = 25;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Style();

  const total = composition.reduce((sum, entry) => sum + entry.count, 0) || 1;
  let startAngle = -Math.PI / 2;
  const center = size / 2;

  composition.forEach((entry) => {
    const slice = (entry.count / total) * Math.PI * 2;
    const endAngle = startAngle + slice;
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, startAngle, endAngle);
    ctx.arc(center, center, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = getClusterSegmentColor(entry.standardIdentity, entry.domain);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle = endAngle;
  });

  const style = new Style({
    geometry: (feature) => {
      const point = feature.getGeometry();
      if (!(point instanceof Point)) return point;
      const coordinates = point.getCoordinates();
      return new Point([
        coordinates[0] + overlapOffset[0],
        coordinates[1] + overlapOffset[1],
      ]);
    },
    image: new Icon({
      img: canvas,
      anchor: [0.5, 0.5],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  });

  clusterSummaryRingStyleCache.set(cacheKey, style);
  return style;
}

export function calculateZoomToResolution(view: View) {
  zoomResolutions = [];
  for (let i = 0; i <= 24; i++) {
    zoomResolutions.push(view.getResolutionForZoom(i));
  }
}

calculateZoomToResolution(new View());

const unitLabelStyle = new Style({
  text: new Text({
    textAlign: "center",
    font: '12px "Inter Variable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgba(255,255,255,0.9)", width: 4 }),
    textBaseline: "top",
  }),
});

const selectedUnitLabelStyle = new Style({
  text: new Text({
    textAlign: "center",
    font: '12px "Inter Variable"',
    // fill: new Fill({ color: "#aa3300" }),
    fill: new Fill({ color: "black" }),
    stroke: new Stroke({ color: "rgb(232,230,7)", width: 3 }),
    textBaseline: "top",
  }),
});

const CLUSTER_HIDDEN_PROPERTY = "_clusterHidden";
const CLUSTER_MEMBER_IDS_PROPERTY = "_clusterMemberIds";
const CLUSTER_MODE_PROPERTY = "_clusterMode";
const CLUSTER_COUNT_PROPERTY = "_clusterCount";
const CLUSTER_SIDE_ID_PROPERTY = "_clusterSideId";
const CLUSTER_ANCESTOR_ID_PROPERTY = "_clusterAncestorId";
const CLUSTER_REPRESENTATIVE_UNIT_ID_PROPERTY = "_clusterRepresentativeUnitId";
const CLUSTER_OFFSET_PROPERTY = "_clusterOffset";
const CLUSTER_COMPOSITION_PROPERTY = "_clusterComposition";

const clusterBadgeStyleCache = new Map<string, Style>();
const clusterSymbolStyleCache = new Map<string, Style>();
const clusterSummaryRingStyleCache = new Map<string, Style>();
const clusterHoverOutlineStyle = new Style({
  stroke: new Stroke({
    color: "rgba(29,78,216,0.95)",
    width: 3,
    lineDash: [8, 6],
  }),
  fill: new Fill({ color: "rgba(29,78,216,0.08)" }),
});

function createClusterBadgeStyle(
  mode: "naive" | "hierarchy",
  count: number,
  overlapOffset: Coordinate,
) {
  const cacheKey = `${mode}:${count}:${overlapOffset[0]}:${overlapOffset[1]}`;
  const cached = clusterBadgeStyleCache.get(cacheKey);
  if (cached) return cached;

  const radius = Math.max(10, Math.min(18, 10 + Math.log2(count) * 2));
  const fillColor =
    mode === "hierarchy" ? "rgba(29,78,216,0.92)" : "rgba(71,85,105,0.92)";

  const style = new Style({
    geometry: (feature) => {
      const point = feature.getGeometry();
      if (!(point instanceof Point)) return point;
      const coordinates = point.getCoordinates();
      return new Point([
        coordinates[0] + overlapOffset[0] + radius * 0.9,
        coordinates[1] + overlapOffset[1] - radius * 0.9,
      ]);
    },
    image: new CircleStyle({
      radius,
      fill: new Fill({ color: fillColor }),
      stroke: new Stroke({ color: "rgba(255,255,255,0.95)", width: 2 }),
    }),
    text: new Text({
      text: `${count}`,
      font: `600 ${Math.max(11, Math.round(radius * 0.9))}px "Inter Variable"`,
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({ color: "rgba(15,23,42,0.85)", width: 3 }),
      textAlign: "center",
      textBaseline: "middle",
    }),
  });

  clusterBadgeStyleCache.set(cacheKey, style);
  return style;
}

export function useUnitLayer({
  activeScenario,
  mapRef,
}: {
  activeScenario?: TScenario;
  mapRef?: MaybeRef<OLMap | undefined>;
} = {}) {
  const scenario = activeScenario || injectStrict(activeScenarioKey);
  const {
    store: { state, onUndoRedo },
    geo,
    unitActions: { getCombinedSymbolOptions },
    helpers: { getUnitById },
  } = scenario;
  const mapSettings = useMapSettingsStore();
  const expandedClusterAncestorIds = new Set<EntityId>();

  const unitLayer = createUnitLayer();
  unitLayer.setStyle(unitStyleFunction);
  const clusterLayer = new VectorLayer({
    source: new VectorSource(),
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Unit clusters",
      layerType: LayerTypes.units,
    },
    style: clusterStyleFunction,
  });

  const labelLayer = new VectorLayer({
    declutter: true,
    source: unitLayer.getSource()!,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Unit labels",
      layerType: LayerTypes.labels,
    },
    style: mapSettings.mapUnitLabelBelow ? labelStyleFunction : undefined,
    visible: mapSettings.mapUnitLabelBelow,
  });

  watch(
    () => mapSettings.mapUnitLabelBelow,
    (v) => {
      labelLayer.setVisible(v);
      labelLayer.setStyle(v ? labelStyleFunction : undefined);
    },
  );

  watch(
    () => mapSettings.mapLabelSize,
    (v) => {
      unitLabelStyle.getText()?.setFont(`${v}px "Inter Variable"`);
      selectedUnitLabelStyle.getText()?.setFont(`${v}px "Inter Variable"`);
    },
    { immediate: true },
  );

  watch(
    () => mapSettings.unitClusteringMode,
    (mode) => {
      if (mode !== "hierarchy") {
        expandedClusterAncestorIds.clear();
      }
      clusterSymbolStyleCache.clear();
      clusterSummaryRingStyleCache.clear();
    },
  );

  watch(
    () => mapSettings.unitClusterGroupingMode,
    () => {
      clusterSymbolStyleCache.clear();
      clusterSummaryRingStyleCache.clear();
      syncClusterFeatures();
    },
  );

  function getClusteringSettings(): UnitClusteringSettings {
    return {
      unitClusteringMode: mapSettings.unitClusteringMode,
      unitClusterGroupingMode: mapSettings.unitClusterGroupingMode,
      unitClusteringDistancePx: Math.max(1, Number(mapSettings.unitClusteringDistancePx)),
      unitClusteringMinSize: Math.max(2, Number(mapSettings.unitClusteringMinSize)),
      unitClusteringMaxZoom: Math.max(0, Number(mapSettings.unitClusteringMaxZoom)),
      unitClusteringHierarchyMinDepth: Math.max(
        0,
        Number(mapSettings.unitClusteringHierarchyMinDepth),
      ),
    };
  }

  function getUnitDepth(unitId: EntityId) {
    let depth = 0;
    let currentParentId = state.unitMap[unitId]?._pid;
    while (currentParentId && currentParentId in state.unitMap) {
      depth += 1;
      currentParentId = state.unitMap[currentParentId]?._pid;
    }
    return depth;
  }

  function buildClusterCandidates(): ClusterableUnit[] {
    return geo.everyVisibleUnit.value
      .filter((unit) => !!unit._state?.location)
      .map((unit) => {
        return {
          id: unit.id,
          coordinate: fromLonLat(unit._state!.location!),
          sideId: unit._sid,
          domain: getClusterDomain(unit),
          standardIdentity: getClusterStandardIdentity(unit),
          parentId: unit._pid,
          depth: getUnitDepth(unit.id),
        };
      });
  }

  function applyClusterVisibility(clusteredUnitIds: Set<EntityId>) {
    unitLayer.getSource()
      ?.getFeatures()
      .forEach((feature) => {
        const unitId = feature.getId() as EntityId;
        feature.set(CLUSTER_HIDDEN_PROPERTY, clusteredUnitIds.has(unitId), true);
      });
  }

  function syncClusterFeatures() {
    const clusterSource = clusterLayer.getSource();
    if (!clusterSource) return;

    const map = unref(mapRef);
    const settings = getClusteringSettings();
    const view = map?.getView();
    const result = clusterUnits(buildClusterCandidates(), settings, {
      resolution: view?.getResolution(),
      zoom: view?.getZoom(),
      expandedAncestorIds: expandedClusterAncestorIds,
    });

    applyClusterVisibility(result.clusteredUnitIds);

    clusterSource.clear();
    if (!result.clusters.length) {
      unitLayer.changed();
      labelLayer.changed();
      return;
    }

    clusterSource.addFeatures(
      result.clusters.map((cluster) => {
        const feature = new Feature<Point>({
          geometry: new Point(cluster.coordinate),
        });
        feature.setId(cluster.id);
        feature.set(CLUSTER_MEMBER_IDS_PROPERTY, cluster.memberIds, true);
        feature.set(CLUSTER_MODE_PROPERTY, cluster.mode, true);
        feature.set(CLUSTER_COUNT_PROPERTY, cluster.memberIds.length, true);
        feature.set(CLUSTER_SIDE_ID_PROPERTY, cluster.sideId, true);
        feature.set(CLUSTER_ANCESTOR_ID_PROPERTY, cluster.ancestorId, true);
        feature.set(CLUSTER_REPRESENTATIVE_UNIT_ID_PROPERTY, cluster.representativeUnitId, true);
        feature.set(CLUSTER_COMPOSITION_PROPERTY, cluster.composition, true);
        feature.set(
          CLUSTER_OFFSET_PROPERTY,
          cluster.mode === "hierarchy" && state.unitMap[cluster.ancestorId]
            ? [18, -18]
            : [0, 0],
          true,
        );
        return feature;
      }),
    );

    unitLayer.changed();
    labelLayer.changed();
  }

  function getOrCreateCachedUnitStyle(
    unit: ReturnType<typeof getUnitById>,
    unitId: string,
  ) {
    if (!unit) return;

    let unitStyle = unitStyleCache.get(unit._ikey ?? unitId);
    if (!unitStyle) {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style, cacheKey } = createUnitStyle(unit, symbolOptions, scenario);
      unitStyle = style;
      unit._ikey = cacheKey;
      unitStyleCache.set(unit._ikey ?? unitId, unitStyle);
    }

    return unitStyle;
  }

  function unitStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;
    if (feature.get(CLUSTER_HIDDEN_PROPERTY)) return;

    const unit = getUnitById(unitId);
    if (!unit) return;
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }

    const temporaryRotation = feature.get("_symbolRotation");
    if (typeof temporaryRotation === "number") {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style } = createUnitStyle(
        unit,
        symbolOptions,
        scenario,
        undefined,
        temporaryRotation,
      );
      return style;
    }

    return getOrCreateCachedUnitStyle(unit, unitId);
  }

  function labelStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;
    if (feature.get(CLUSTER_HIDDEN_PROPERTY)) return;

    const unit = getUnitById(unitId);
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }

    if (!unit) return;
    let labelData = labelStyleCache.get(unitId);
    if (!labelData) {
      const unitStyle = getOrCreateCachedUnitStyle(unit, unitId);
      labelData = createUnitLabelData(unit, unitStyle, {
        wrapLabels: mapSettings.mapWrapUnitLabels,
        wrapWidth: mapSettings.mapWrapLabelWidth,
      });

      labelStyleCache.set(unitId, labelData);
    }

    const textStyle = unitLabelStyle.getText()!;
    textStyle.setText(labelData.text);
    textStyle.setOffsetY(labelData.yOffset);
    textStyle.setRotation(
      getFeatureRotationRadians(feature, unit._state?.symbolRotation ?? 0),
    );
    return unitLabelStyle;
  }

  function clusterStyleFunction(feature: FeatureLike) {
    const count = Number(feature.get(CLUSTER_COUNT_PROPERTY));
    if (!Number.isFinite(count) || count < 2) return;
    const mode = feature.get(CLUSTER_MODE_PROPERTY) as "naive" | "hierarchy";
    const representativeUnitId = feature.get(
      CLUSTER_REPRESENTATIVE_UNIT_ID_PROPERTY,
    ) as EntityId | undefined;
    const overlapOffset = (feature.get(CLUSTER_OFFSET_PROPERTY) as Coordinate | undefined) ?? [
      0, 0,
    ];
    const composition =
      (feature.get(CLUSTER_COMPOSITION_PROPERTY) as
        | { key: string; standardIdentity: string; domain: string; count: number }[]
        | undefined) ?? [];
    const representativeUnit =
      representativeUnitId && representativeUnitId in state.unitMap
        ? state.unitMap[representativeUnitId]
        : undefined;

    const styles: Style[] = [];
    if (
      mapSettings.unitClusterGroupingMode === "summary" &&
      composition.length > 0
    ) {
      styles.push(createClusterSummaryRingStyle(composition, overlapOffset));
    }
    if (representativeUnit) {
      const clusterSymbolKey = [
        representativeUnit.id,
        representativeUnit._ikey ?? representativeUnit.sidc,
        representativeUnit._state?.sidc ?? representativeUnit.sidc,
        representativeUnit._state?.symbolRotation ?? 0,
        count,
        mode,
        mapSettings.unitClusterGroupingMode,
      ].join(":");

      let baseStyle = clusterSymbolStyleCache.get(clusterSymbolKey);
      if (!baseStyle) {
        const useOriginalStyle = representativeUnit.sidc.startsWith(CUSTOM_SYMBOL_PREFIX);
        if (useOriginalStyle) {
          baseStyle = getOrCreateCachedUnitStyle(representativeUnit, representativeUnit.id);
        } else {
          const clusterOutlineColor =
            mode === "hierarchy" ? "rgb(29,78,216)" : "rgb(71,85,105)";
          const clusterUnit = {
            ...representativeUnit,
            style: {
              ...(representativeUnit.style || {}),
              mapSymbolSize:
                (representativeUnit.style?.mapSymbolSize ?? mapSettings.mapIconSize) * 1.15,
            },
            textAmplifiers: {
              ...(representativeUnit.textAmplifiers || {}),
              additionalInformation: mode === "hierarchy" ? "HCL" : "CL",
            },
          };
          const symbolOptions = {
            ...getCombinedSymbolOptions(representativeUnit),
            outlineColor: clusterOutlineColor,
            outlineWidth: 12,
            infoOutlineColor: clusterOutlineColor,
            infoOutlineWidth: 10,
          };
          baseStyle = createUnitStyle(clusterUnit, symbolOptions, scenario).style;
        }

        if (baseStyle) {
          clusterSymbolStyleCache.set(clusterSymbolKey, baseStyle);
        }
      }

      if (baseStyle) {
        const displacedStyle = new Style({
          image: baseStyle.getImage() ?? undefined,
          zIndex: baseStyle.getZIndex(),
          geometry: (clusterFeature) => {
            const point = clusterFeature.getGeometry();
            if (!(point instanceof Point)) return point;
            const coordinates = point.getCoordinates();
            return new Point([
              coordinates[0] + overlapOffset[0],
              coordinates[1] + overlapOffset[1],
            ]);
          },
        });
        styles.push(displacedStyle);
      }
    }

    styles.push(createClusterBadgeStyle(mode, count, overlapOffset));
    return styles;
  }

  onUndoRedo(() => {
    clearUnitStyleCache();
    clusterSymbolStyleCache.clear();
    clusterSummaryRingStyleCache.clear();
    state.unitStateCounter++;
  });

  const drawUnits = () => {
    clusterSymbolStyleCache.clear();
    clusterSummaryRingStyleCache.clear();
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource()?.addFeatures(units);
    syncClusterFeatures();
  };

  /**
   * Incrementally update unit features on the map. Only adds, removes, or
   * repositions features that actually changed instead of clearing and
   * recreating all features.
   */
  const updateUnitPositions = () => {
    const source = unitLayer.getSource();
    if (!source) return;
    const visibleUnits = geo.everyVisibleUnit.value;
    const wantedIds = new Set<string>();
    const toAdd: Feature<Point>[] = [];

    for (const unit of visibleUnits) {
      const id = unit.id;
      wantedIds.add(id);
      const location = unit._state!.location!;
      const existing = source.getFeatureById(id) as Feature<Point> | null;
      if (existing) {
        // Update position only if it actually changed
        const geom = existing.getGeometry()!;
        const projected = fromLonLat(location);
        const coords = geom.getCoordinates();
        if (coords[0] !== projected[0] || coords[1] !== projected[1]) {
          geom.setCoordinates(projected);
        }
      } else {
        toAdd.push(createUnitFeatureAt(location, unit));
      }
    }

    // Remove features that are no longer visible
    const toRemove: Feature<Point>[] = [];
    for (const feature of source.getFeatures()) {
      if (!wantedIds.has(feature.getId() as string)) {
        toRemove.push(feature as Feature<Point>);
      }
    }
    source.removeFeatures(toRemove);

    if (toAdd.length) {
      source.addFeatures(toAdd);
    }

    syncClusterFeatures();
  };

  const animateUnits = () => {
    clusterSymbolStyleCache.clear();
    clusterSummaryRingStyleCache.clear();
    unitLayer.getSource()?.clear();
    const units = geo.everyVisibleUnit.value.map((unit) => {
      return createUnitFeatureAt(unit._state!.location!, unit);
    });
    unitLayer.getSource()?.addFeatures(units);
    syncClusterFeatures();
    // units.forEach((f) =>
    //   //@ts-ignore
    //   unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
    // );
  };

  function refreshClusters() {
    syncClusterFeatures();
  }

  function toggleClusterExpansion(ancestorId: EntityId) {
    if (expandedClusterAncestorIds.has(ancestorId)) {
      expandedClusterAncestorIds.delete(ancestorId);
      syncClusterFeatures();
      return "collapsed" as const;
    }

    expandedClusterAncestorIds.add(ancestorId);
    syncClusterFeatures();
    return "expanded" as const;
  }

  function clearClusterExpansion() {
    if (!expandedClusterAncestorIds.size) return;
    expandedClusterAncestorIds.clear();
    syncClusterFeatures();
  }

  return {
    unitLayer,
    clusterLayer,
    labelLayer,
    drawUnits,
    updateUnitPositions,
    animateUnits,
    refreshClusters,
    toggleClusterExpansion,
    clearClusterExpansion,
  };
}

export function useMapDrop(mapAdapter: MapAdapter, unitLayer: MaybeRef<VectorLayer>) {
  const activeScenario = injectStrict(activeScenarioKey);
  const {
    helpers: { getUnitById },
  } = activeScenario;

  return useMapDropTarget({
    activeScenario,
    mapAdapter,
    onUnitsDropped: (unitIds, position) => {
      for (const unitId of unitIds) {
        const unitSource = unref(unitLayer).getSource();
        const existingUnitFeature = unitSource?.getFeatureById(unitId);

        if (existingUnitFeature) {
          existingUnitFeature.setGeometry(new Point(fromLonLat(position)));
        } else {
          const unit = getUnitById(unitId);
          if (unit) {
            unitSource?.addFeature(createUnitFeatureAt(position, unit));
          }
        }
      }
    },
  });
}

export function useUnitClusterInteraction(
  olMap: OLMap,
  clusterLayer: VectorLayer,
  options: { toggleClusterExpansion?: (ancestorId: EntityId) => "expanded" | "collapsed" },
) {
  const geoStore = useGeoStore();
  const {
    helpers: { getUnitById },
  } = injectStrict(activeScenarioKey);

  useOlEvent(
    olMap.on("singleclick", (event) => {
      const clusterFeature = olMap.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer !== clusterLayer) return undefined;
          return feature as Feature<Point>;
        },
        { hitTolerance: 6 },
      ) as Feature<Point> | undefined;

      const memberIds = clusterFeature?.get(CLUSTER_MEMBER_IDS_PROPERTY) as
        | EntityId[]
        | undefined;
      if (!memberIds?.length) return;

      const mode = clusterFeature.get(CLUSTER_MODE_PROPERTY) as
        | "naive"
        | "hierarchy"
        | undefined;
      const ancestorId = clusterFeature.get(CLUSTER_ANCESTOR_ID_PROPERTY) as
        | EntityId
        | undefined;
      if (mode === "hierarchy" && ancestorId && options.toggleClusterExpansion) {
        options.toggleClusterExpansion(ancestorId);
        return;
      }

      const units = memberIds
        .map((unitId) => getUnitById(unitId))
        .filter((unit) => !!unit?._state?.location);
      if (!units.length) return;

      geoStore.zoomToUnits(units, {
        duration: 250,
        maxZoom: 18,
        padding: [80, 80, 80, 80],
      });
    }),
  );
}

export function useClusterHoverOutline(olMap: OLMap, clusterLayer: VectorLayer, unitLayer: VectorLayer) {
  const outlineSource = new VectorSource();
  const outlineLayer = new VectorLayer({
    source: outlineSource,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    properties: {
      id: nanoid(),
      title: "Cluster hover outline",
      layerType: LayerTypes.units,
    },
    style: clusterHoverOutlineStyle,
  });

  const clearOutline = () => outlineSource.clear();

  function syncOutline(clusterFeature?: Feature<Point>) {
    clearOutline();

    const memberIds = clusterFeature?.get(CLUSTER_MEMBER_IDS_PROPERTY) as EntityId[] | undefined;
    if (!memberIds?.length) return;

    const coordinates = memberIds
      .map((memberId) => unitLayer.getSource()?.getFeatureById(memberId) as Feature<Point> | null)
      .map((feature) => feature?.getGeometry()?.getCoordinates())
      .filter((coord): coord is Coordinate => !!coord);

    const resolution = olMap.getView().getResolution() ?? 1;
    const geometry = createClusterOutlineGeometry(coordinates, resolution);
    if (!geometry) return;

    outlineSource.addFeature(
      new Feature({
        geometry,
      }),
    );
  }

  useOlEvent(
    olMap.on("pointermove", (event) => {
      if (event.dragging) {
        clearOutline();
        return;
      }

      const clusterFeature = olMap.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer !== clusterLayer) return undefined;
          const memberIds = feature.get(CLUSTER_MEMBER_IDS_PROPERTY);
          if (!Array.isArray(memberIds) || memberIds.length === 0) return undefined;
          return feature as Feature<Point>;
        },
        { hitTolerance: 6 },
      ) as Feature<Point> | undefined;

      syncOutline(clusterFeature);
    }),
  );

  const viewport = olMap.getViewport();
  const clearOnPointerLeave = () => clearOutline();
  viewport.addEventListener("pointerleave", clearOnPointerLeave);

  onUnmounted(() => {
    viewport.removeEventListener("pointerleave", clearOnPointerLeave);
    clearOutline();
  });

  return { outlineLayer };
}

export function useMoveInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer,
  enabled: Ref<boolean>,
) {
  const {
    geo,
    unitActions: { isUnitLocked },
  } = injectStrict(activeScenarioKey);
  const recordingStore = useRecordingStore();
  const modifyInteraction = new Modify({
    hitDetection: unitLayer,
    source: unitLayer.getSource()!,
  });

  modifyInteraction.on(["modifystart", "modifyend"], (evt) => {
    setMapCursor(mapRef, evt.type === "modifystart" ? "grabbing" : "pointer");
    if (evt.type === "modifystart") {
      (evt as ModifyEvent).features.forEach((f) => {
        const unitId = f.getId() as string;
        if (isUnitLocked(unitId)) {
          f.set("_geometry", f.getGeometry()?.clone(), true);
        }
      });
    }
    if (evt.type === "modifyend") {
      const unitFeature = (evt as ModifyEvent).features.pop() as Feature<Point>;
      if (unitFeature) {
        const movedUnitId = unitFeature.getId() as string;
        if (!movedUnitId) return;

        const oldGeometry = unitFeature.get("_geometry");
        if (oldGeometry) {
          unitFeature.setGeometry(oldGeometry);
          unitFeature.set("_geometry", undefined, true);
          return;
        }
        if (!recordingStore.isRecordingLocation) return;
        const newCoordinate = unitFeature.getGeometry()?.getCoordinates();
        if (newCoordinate) geo.addUnitPosition(movedUnitId, toLonLat(newCoordinate));
      }
    }
  });
  const overlaySource = modifyInteraction.getOverlay().getSource();
  overlaySource?.on(["addfeature", "removefeature"], function (evt: Event | BaseEvent) {
    setMapCursor(mapRef, evt.type === "addfeature" ? "pointer" : "");
  });

  watch(enabled, (v) => modifyInteraction.setActive(v), { immediate: true });
  return { moveInteraction: modifyInteraction };
}

export function useRotateInteraction(
  mapRef: OLMap,
  unitLayer: VectorLayer,
  enabled: Ref<boolean>,
) {
  const {
    unitActions: { addUnitStateEntry, getUnitById, isUnitLocked },
    store: { state, groupUpdate },
  } = injectStrict(activeScenarioKey);
  const { selectedUnitIds } = useSelectedItems();

  let anchor: Coordinate | null = null;
  let startHeading = 0;
  let isRotating = false;
  const previewUnitIds = new Set<EntityId>();
  let targets: { id: EntityId; initialRotation: number; rotation: number }[] = [];

  function getUnitFeatureAtEvent(
    event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>,
  ): Feature<Point> | undefined {
    return mapRef.forEachFeatureAtPixel(
      event.pixel,
      (feature, layer) => {
        if (layer !== unitLayer) return undefined;
        if (feature.get(CLUSTER_HIDDEN_PROPERTY)) return undefined;
        return feature as Feature<Point>;
      },
      { hitTolerance: 4 },
    );
  }

  function setPreviewRotation(unitId: EntityId, rotation: number) {
    const feature = unitLayer.getSource()?.getFeatureById(unitId);
    if (!feature) return;
    feature.set("_symbolRotation", rotation);
    previewUnitIds.add(unitId);
  }

  function clearPreviewRotation() {
    for (const unitId of previewUnitIds) {
      const feature = unitLayer.getSource()?.getFeatureById(unitId);
      feature?.unset("_symbolRotation");
    }
    previewUnitIds.clear();
  }

  function cancelRotation() {
    isRotating = false;
    anchor = null;
    targets = [];
    clearPreviewRotation();
    setMapCursor(mapRef, "");
  }

  const rotateInteraction = new PointerInteraction({
    handleDownEvent: (event) => {
      if (!enabled.value) return false;
      if ((event.originalEvent as PointerEvent).button !== 0) return false;
      const clickedFeature = getUnitFeatureAtEvent(event);
      const clickedUnitId = clickedFeature?.getId() as EntityId | undefined;
      if (!clickedUnitId) return false;

      const candidateIds = selectedUnitIds.value.has(clickedUnitId)
        ? [...selectedUnitIds.value]
        : [clickedUnitId];
      const selectedTargets = candidateIds
        .map((id) => getUnitById(id))
        .filter((u) => !!u && !isUnitLocked(u.id) && !!u._state?.location);
      if (!selectedTargets.length) return false;

      const anchorCoordinates = selectedTargets
        .map((u) => unitLayer.getSource()?.getFeatureById(u.id))
        .map((f) => (f as Feature<Point> | undefined)?.getGeometry()?.getCoordinates())
        .filter((c): c is Coordinate => !!c);
      if (!anchorCoordinates.length) return false;

      const anchorX =
        anchorCoordinates.reduce((sum, c) => sum + c[0], 0) / anchorCoordinates.length;
      const anchorY =
        anchorCoordinates.reduce((sum, c) => sum + c[1], 0) / anchorCoordinates.length;
      anchor = [anchorX, anchorY];

      startHeading = toHeadingFromNorthDegrees(anchor, event.coordinate);
      targets = selectedTargets.map((unit) => {
        const rotation = normalizeRotation(unit._state?.symbolRotation ?? 0);
        setPreviewRotation(unit.id, rotation);
        return { id: unit.id, initialRotation: rotation, rotation };
      });
      isRotating = true;
      setMapCursor(mapRef, "grabbing");
      return true;
    },
    handleDragEvent: (event) => {
      if (!isRotating || !anchor) return;
      const currentHeading = toHeadingFromNorthDegrees(anchor, event.coordinate);
      const delta = shortestRotationDelta(currentHeading, startHeading);
      targets.forEach((target) => {
        target.rotation = normalizeRotation(target.initialRotation + delta);
        setPreviewRotation(target.id, target.rotation);
      });
    },
    handleMoveEvent: (event) => {
      if (!enabled.value || isRotating) return;
      const hovered = getUnitFeatureAtEvent(event);
      setMapCursor(mapRef, hovered ? "grab" : "");
    },
    handleUpEvent: () => {
      if (!isRotating) return false;
      const changedTargets = targets.filter(
        (target) => Math.abs(target.rotation - target.initialRotation) > ROTATION_EPSILON,
      );
      if (changedTargets.length) {
        groupUpdate(() => {
          changedTargets.forEach((target) => {
            addUnitStateEntry(
              target.id,
              { t: state.currentTime, symbolRotation: target.rotation },
              true,
            );
          });
        });
      }
      cancelRotation();
      return false;
    },
    stopDown: (handled) => handled,
  });

  watch(
    enabled,
    (v) => {
      rotateInteraction.setActive(v);
      if (!v) cancelRotation();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cancelRotation();
  });

  return { rotateInteraction };
}

export function useUnitSelectInteraction(
  layers: VectorLayer[],
  olMap: OLMap,
  options: Partial<{
    enable: MaybeRef<boolean>;
    enableBoxSelect: MaybeRef<boolean>;
  }> = {},
) {
  const mapSettings = useMapSettingsStore();
  let isInternal = false;
  const enableRef = ref(options.enable ?? true);
  const enableBoxSelectRef = ref(options.enableBoxSelect ?? true);

  const {
    selectedUnitIds: selectedIds,
    selectedFeatureIds,
    clear: clearSelectedItems,
  } = useSelectedItems();
  const activeScenario = injectStrict(activeScenarioKey);
  const {
    geo,
    unitActions: { getCombinedSymbolOptions },
    helpers: { getUnitById },
  } = activeScenario;

  const hitTolerance = 20;

  const unitSelectInteraction = new Select({
    layers,
    style: selectedUnitStyleFunction,
    condition: (event) =>
      clickCondition(event) &&
      getTopHitLayerType(olMap, event.pixel, hitTolerance) !==
        LayerTypes.scenarioFeature &&
      !(event.originalEvent.shiftKey && selectedFeatureIds.value.size > 0),
    removeCondition: altKeyOnly,
  });

  function selectedUnitStyleFunction(feature: FeatureLike, resolution: number) {
    const unitId = feature?.getId() as string;
    if (feature.get(CLUSTER_HIDDEN_PROPERTY)) return;

    const unit = getUnitById(unitId);
    if (!unit) return;
    const { limitVisibility, minZoom = 0, maxZoom = 24 } = unit.style ?? {};

    if (
      limitVisibility &&
      (resolution > zoomResolutions[minZoom ?? 0] ||
        resolution < zoomResolutions[maxZoom ?? 24])
    ) {
      return;
    }
    const temporaryRotation = feature.get("_symbolRotation");
    let unitStyle =
      typeof temporaryRotation === "number"
        ? undefined
        : selectedUnitStyleCache.get(unit._ikey ?? unitId);

    if (!unitStyle) {
      const symbolOptions = getCombinedSymbolOptions(unit);
      const { style } = createUnitStyle(
        unit,
        {
          ...symbolOptions,
          infoOutlineColor: "yellow",
          infoOutlineWidth: 8,
          outlineColor: "yellow",
          outlineWidth: 21,
        },
        activeScenario,
        "yellow",
        typeof temporaryRotation === "number" ? temporaryRotation : undefined,
      )!;
      unitStyle = style;
      if (typeof temporaryRotation !== "number") {
        selectedUnitStyleCache.set(unit._ikey ?? unitId, unitStyle);
      }
    }

    if (!mapSettings.mapUnitLabelBelow) return unitStyle;

    const labelData =
      labelStyleCache.get(unitId) ??
      createUnitLabelData(unit, unitStyle, {
        wrapLabels: mapSettings.mapWrapUnitLabels,
        wrapWidth: mapSettings.mapWrapLabelWidth,
      });

    if (labelData) {
      const textStyle = selectedUnitLabelStyle.getText()!;
      textStyle.setText(labelData.text);
      textStyle.setOffsetY(labelData.yOffset);
      textStyle.setRotation(
        getFeatureRotationRadians(feature, unit._state?.symbolRotation ?? 0),
      );
      return [unitStyle, selectedUnitLabelStyle];
    }

    return unitStyle;
  }

  const boxSelectInteraction = new DragBox({ condition: platformModifierKeyOnly });

  const selectedUnitFeatures = unitSelectInteraction.getFeatures();

  watch(
    enableRef,
    (enabled) => {
      unitSelectInteraction.setActive(enabled);
      if (!enabled) selectedUnitFeatures.clear();
    },
    { immediate: true },
  );

  watch(
    enableBoxSelectRef,
    (enabled) => {
      boxSelectInteraction.setActive(enabled);
      selectedUnitFeatures.clear();
    },
    { immediate: true },
  );

  useOlEvent(
    unitSelectInteraction.on("select", (event: SelectEvent) => {
      isInternal = true;
      if (event.selected.length > 0 && !event.mapBrowserEvent.originalEvent.shiftKey) {
        clearSelectedItems();
      }
      if (
        selectedUnitFeatures.getLength() === 0 &&
        !event.mapBrowserEvent.originalEvent.shiftKey
      ) {
        clearSelectedItems();
        return;
      }
      event.selected.forEach((f) => selectedIds.value.add(f.getId() as string));
      event.deselected.forEach((f) => selectedIds.value.delete(f.getId() as string));
    }),
  );

  useOlEvent(
    boxSelectInteraction.on("boxend", function () {
      // from https://openlayers.org/en/latest/examples/box-selection.html
      const extent = boxSelectInteraction.getGeometry().getExtent();
      const boxFeatures = layers
        .map((layer) =>
          layer
            .getSource()
            ?.getFeaturesInExtent(extent)
            .filter((feature: Feature) =>
              !feature.get(CLUSTER_HIDDEN_PROPERTY) &&
              feature.getGeometry()!.intersectsExtent(extent),
            ),
        )
        .flat();

      // features that intersect the box geometry are added to the
      // collection of selected features

      // if the view is not obliquely rotated the box geometry and
      // its extent are equalivalent so intersecting features can
      // be added directly to the collection
      const rotation = olMap.getView().getRotation();
      const oblique = rotation % (Math.PI / 2) !== 0;

      // when the view is obliquely rotated the box extent will
      // exceed its geometry so both the box and the candidate
      // feature geometries are rotated around a common anchor
      // to confirm that, with the box geometry aligned with its
      // extent, the geometries intersect
      if (oblique) {
        const anchor = [0, 0];
        const geometry = boxSelectInteraction.getGeometry().clone();
        geometry.rotate(-rotation, anchor);
        const extent = geometry.getExtent();
        boxFeatures.forEach(function (feature) {
          const geometry = feature.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          if (geometry.intersectsExtent(extent)) {
            selectedIds.value.add(feature.getId() as string);
            // selectedFeatures.push(feature);
          }
        });
      } else {
        boxFeatures.forEach((f) => selectedIds.value.add(f.getId() as string));
      }
    }),
  );

  useOlEvent(
    boxSelectInteraction.on("boxstart", function () {
      clearSelectedItems();
    }),
  );

  watch(
    () => [...selectedIds.value],
    (v) => redrawSelectedLayer(v),
    { immediate: true },
  );

  watch(geo.everyVisibleUnit, () => {
    isInternal = false;
    redrawSelectedLayer([...selectedIds.value]);
  });

  function redrawSelectedLayer(v: EntityId[]) {
    if (!isInternal) {
      selectedUnitFeatures.clear();
      v.forEach((fid) => {
        const feature = layers[0]?.getSource()?.getFeatureById(fid);
        if (feature) selectedUnitFeatures.push(feature);
      });
    }
    isInternal = false;
  }

  function redraw() {
    redrawSelectedLayer([...selectedIds.value]);
  }

  return { unitSelectInteraction, isEnabled: enableRef, boxSelectInteraction, redraw };
}
