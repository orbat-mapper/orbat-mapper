import centerOfMass from "@turf/center-of-mass";
import bearing from "@turf/bearing";
import turfCircle from "@turf/circle";
import { featureCollection, point } from "@turf/helpers";
import type {
  Feature as GeoJsonFeature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Point,
  Position,
} from "geojson";
import type {
  GeoJSONSource,
  Map as MlMap,
  MapGeoJSONFeature,
  MapStyleImageMissingEvent,
} from "maplibre-gl";
import { fromString as parseColor } from "ol/color";
import {
  drawArrowSymbol,
  getArrowGlobeIconOffset,
  getArrowRenderScale,
  getArrowSpriteCanvasSize,
  getArrowSymbolDefinition,
  type ArrowSymbolDefinition,
} from "@/geo/arrowSymbols";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type {
  FullScenarioLayerItemsLayer,
  NGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import { isNGeometryLayerItem } from "@/types/scenarioLayerItems";
import { hashObject } from "@/utils";
import type { ArrowType } from "@/geo/simplestyle";

export const GLOBE_SCENARIO_FEATURE_PREFIX = "scenario-feature";

type GeometryKind = "point" | "line" | "polygon";
type MarkerRenderKind = "circle" | "icon";
type StyleLike = Partial<NGeometryLayerItem["style"]>;

type RenderFeatureProperties = {
  featureId: string;
  layerId: string;
  geometryKind: GeometryKind;
  renderGroup: string;
  selected: boolean;
  zIndex: number;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: string;
  fillColor: string;
  fillOpacity: number;
  markerColor: string;
  markerSize: number;
  markerSymbol: string;
  markerRenderKind: MarkerRenderKind;
  markerImageId?: string;
  sourceOpacity: number;
};

type LabelFeatureProperties = {
  featureId: string;
  layerId: string;
  labelGroup: string;
  selected: boolean;
  zIndex: number;
  textField: string;
  textColor: string;
  textHaloColor: string;
  textHaloWidth: number;
  textAlign: string;
  textAnchor: string;
  textOffsetX: number;
  textOffsetY: number;
  sourceOpacity: number;
};

type ArrowFeatureProperties = {
  featureId: string;
  layerId: string;
  arrowGroup: string;
  selected: boolean;
  zIndex: number;
  arrowImageId: string;
  iconAnchor: "center" | "right";
  iconScale: number;
  rotation: number;
  sourceOpacity: number;
};

type RenderableGeoJsonFeature<T extends GeoJsonProperties = GeoJsonProperties> =
  GeoJsonFeature<Geometry, T>;

type GroupDefinition = {
  id: string;
  minzoom?: number;
  maxzoom?: number;
};

type ArrowGroupDefinition = GroupDefinition & {
  iconAnchor: "center" | "right";
  iconOffset: [number, number];
};

type ScenarioLayerRenderPlan = {
  layerId: string;
  sourceId: string;
  labelSourceId: string;
  arrowSourceId: string;
  featureData: FeatureCollection;
  labelData: FeatureCollection;
  arrowData: FeatureCollection;
  layerDefinitions: Array<{ id: string; spec: Record<string, unknown> }>;
  structureKey: string;
  imageDefinitions: Map<string, ImageDefinition>;
};

type ImageDefinition =
  | {
      kind: "marker";
      markerSymbol: string;
      markerColor: string;
      markerSize: number;
    }
  | {
      kind: "arrow";
      arrowType: ArrowType;
      color: string;
      spriteScale: number;
    };

function toRgbaColor(
  color: string | null | undefined,
  opacity = 1,
  fallback = "#555555",
) {
  const parsed = parseColor(color || fallback);
  const [r, g, b, a = 1] = Array.isArray(parsed) ? parsed : parseColor(fallback);
  const nextOpacity = Math.max(0, Math.min(1, a * opacity));
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${nextOpacity})`;
}

function getLabelText(feature: NGeometryLayerItem) {
  return feature.meta.name || feature.properties?.title || feature.properties?.name || "";
}

function getCurrentGeometry(feature: NGeometryLayerItem) {
  return feature._state?.geometry ?? feature.geometry;
}

function getFeatureOpacity(layerOpacity: number | undefined) {
  return typeof layerOpacity === "number" ? Math.max(0, Math.min(1, layerOpacity)) : 1;
}

function getStrokeWidth(style: StyleLike) {
  return typeof style["stroke-width"] === "number" ? style["stroke-width"] : 2;
}

function getMarkerSize(style: StyleLike) {
  const markerSize = style["marker-size"] || "medium";
  if (markerSize === "small") return 8;
  if (markerSize === "large") return 14;
  return 11;
}

function normalizeTextAnchor(textAlign: string | undefined) {
  if (textAlign === "center") return "center";
  if (textAlign === "right" || textAlign === "end") return "right";
  return "left";
}

function normalizeTextAlign(textAlign: string | undefined) {
  if (textAlign === "center") return "center";
  if (textAlign === "right" || textAlign === "end") return "right";
  return "left";
}

function isRenderableGeometryKind(type: Geometry["type"]): GeometryKind | undefined {
  if (type === "Point" || type === "MultiPoint") return "point";
  if (type === "LineString" || type === "MultiLineString") return "line";
  if (type === "Polygon" || type === "MultiPolygon") return "polygon";
  return undefined;
}

function getMarkerRenderKind(style: StyleLike): MarkerRenderKind {
  const markerSymbol = style["marker-symbol"] || "circle";
  return markerSymbol === "circle" ? "circle" : "icon";
}

function getVisibilityGroup(style: StyleLike, suffix: string, layerId: string) {
  if (!style.limitVisibility) {
    return {
      id: hashObject({
        layerId,
        suffix,
        type: "always",
      }),
    } satisfies GroupDefinition;
  }

  return {
    id: hashObject({
      layerId,
      suffix,
      minZoom: style.minZoom ?? 0,
      maxZoom: style.maxZoom ?? 24,
    }),
    minzoom: style.minZoom ?? 0,
    maxzoom: style.maxZoom ?? 24,
  } satisfies GroupDefinition;
}

// Derive the arrow visibility group from a symbol definition and its sprite
// scale. `icon-offset` is computed from the definition's tip position (in
// native sprite pixels) so the MapLibre `icon-anchor` preset lands on the
// logical tip; because offset pixels depend on sprite canvas size, the group
// is keyed on spriteScale as well.
function getArrowVisibilityGroup(
  style: StyleLike,
  suffix: string,
  layerId: string,
  symbolDefinition: ArrowSymbolDefinition | null,
  spriteScale: number,
) {
  const baseGroup = getVisibilityGroup(style, suffix, layerId);
  const iconAnchor = symbolDefinition?.anchorKind ?? "center";
  const iconOffset: [number, number] = symbolDefinition
    ? getArrowGlobeIconOffset(symbolDefinition, getArrowSpriteCanvasSize(spriteScale))
    : [0, 0];
  return {
    ...baseGroup,
    id: hashObject({
      baseGroupId: baseGroup.id,
      iconAnchor,
      iconOffset,
      spriteScale,
    }),
    iconAnchor,
    iconOffset,
  } satisfies ArrowGroupDefinition;
}

function getTextVisibilityGroup(style: StyleLike, layerId: string) {
  if (!style.showLabel) return undefined;
  if (typeof style.textMinZoom !== "number" && typeof style.textMaxZoom !== "number") {
    return {
      id: hashObject({
        layerId,
        suffix: "label",
        type: "always",
      }),
    } satisfies GroupDefinition;
  }

  return {
    id: hashObject({
      layerId,
      suffix: "label",
      minZoom: style.textMinZoom ?? 0,
      maxZoom: style.textMaxZoom ?? 24,
    }),
    minzoom: style.textMinZoom ?? 0,
    maxzoom: style.textMaxZoom ?? 24,
  } satisfies GroupDefinition;
}

function convertCircleFeature(feature: NGeometryLayerItem) {
  const geometry = getCurrentGeometry(feature);
  if (!feature.meta.radius || geometry.type !== "Point") return geometry;
  return turfCircle(geometry.coordinates as Position, feature.meta.radius / 1000, {
    steps: 48,
    units: "kilometers",
  }).geometry;
}

function flattenGeometry(
  geometry: Geometry,
): Array<{ geometry: Geometry; geometryKind: GeometryKind }> {
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.flatMap((subGeometry) => flattenGeometry(subGeometry));
  }
  const geometryKind = isRenderableGeometryKind(geometry.type);
  if (!geometryKind) return [];
  return [{ geometry, geometryKind }];
}

function getLabelGeometry(geometry: Geometry): Point | undefined {
  if (geometry.type === "Point") return geometry;
  try {
    const center = centerOfMass({
      type: "Feature",
      properties: {},
      geometry,
    } as GeoJsonFeature);
    return center.geometry as Point;
  } catch {
    return undefined;
  }
}

function getLineArrowAnchors(geometry: Geometry):
  | {
      start: Position;
      startAdjacent: Position;
      endAdjacent: Position;
      end: Position;
    }
  | undefined {
  const line =
    geometry.type === "LineString"
      ? geometry.coordinates
      : geometry.type === "MultiLineString"
        ? geometry.coordinates.find((entry) => entry.length > 1)
        : undefined;
  if (!(line && line.length > 1)) return;
  return {
    start: line[0] as Position,
    startAdjacent: line[1] as Position,
    endAdjacent: line[line.length - 2] as Position,
    end: line[line.length - 1] as Position,
  };
}

function getLineRotation(from: Position, to: Position) {
  return bearing(point(from), point(to)) - 90;
}

function featureSourceId(layerId: string) {
  return `${GLOBE_SCENARIO_FEATURE_PREFIX}-${hashObject({ layerId })}`;
}

function layerPrefix(layerId: string) {
  return `${GLOBE_SCENARIO_FEATURE_PREFIX}-layer-${hashObject({ layerId })}`;
}

function markerImageId(markerSymbol: string, markerColor: string, markerSize: number) {
  return `${GLOBE_SCENARIO_FEATURE_PREFIX}-marker-${hashObject({
    markerSymbol,
    markerColor,
    markerSize,
  })}`;
}

function arrowImageId(arrowType: string, color: string, spriteScale: number) {
  return `${GLOBE_SCENARIO_FEATURE_PREFIX}-arrow-${hashObject({
    arrowType,
    color,
    spriteScale,
  })}`;
}

function quantizeArrowSpriteScale(scale: number) {
  return Math.max(1, Math.ceil(scale * 2) / 2);
}

function buildFeatureData(
  layer: FullScenarioLayerItemsLayer,
  {
    filterVisible,
    selectedFeatureIds,
  }: { filterVisible: boolean; selectedFeatureIds: Set<FeatureId> },
) {
  const sourceOpacity = getFeatureOpacity(layer.opacity);
  const features: RenderableGeoJsonFeature<RenderFeatureProperties>[] = [];
  const labels: RenderableGeoJsonFeature<LabelFeatureProperties>[] = [];
  const arrows: RenderableGeoJsonFeature<ArrowFeatureProperties>[] = [];
  const renderGroups = new Set<string>();
  const labelGroups = new Set<string>();
  const renderGroupDefs = new Map<string, GroupDefinition>();
  const labelGroupDefs = new Map<string, GroupDefinition>();
  const arrowGroupDefs = new Map<string, ArrowGroupDefinition>();
  const imageDefinitions = new Map<string, ImageDefinition>();

  for (const item of layer.items.filter(isNGeometryLayerItem)) {
    if (filterVisible && item._hidden) continue;

    const style = item.style || {};
    const layerId = String(layer.id);
    const featureId = String(item.id);
    const geometry = convertCircleFeature(item);
    const flattened = flattenGeometry(geometry);
    const strokeColor = toRgbaColor(
      style.stroke,
      style["stroke-opacity"] ?? 1,
      "#555555",
    );
    const fillOpacity = style["fill-opacity"] ?? 0.25;
    const fillColor = toRgbaColor(style.fill, fillOpacity, "#555555");
    const markerColor = toRgbaColor(style["marker-color"], 1, "#7e7e7e");
    const markerSize = getMarkerSize(style);
    const strokeWidth = getStrokeWidth(style);
    const arrowScale = getArrowRenderScale(strokeWidth);
    const arrowSpriteScale = quantizeArrowSpriteScale(arrowScale);
    const arrowIconScale = arrowScale / arrowSpriteScale;
    const markerSymbol = style["marker-symbol"] || "circle";
    const markerRenderKind = getMarkerRenderKind(style);
    const markerId =
      markerRenderKind === "icon"
        ? markerImageId(markerSymbol, markerColor, markerSize)
        : undefined;
    const renderGroup = getVisibilityGroup(style, "render", layerId);
    renderGroups.add(renderGroup.id);
    renderGroupDefs.set(renderGroup.id, renderGroup);

    if (markerId) {
      imageDefinitions.set(markerId, {
        kind: "marker",
        markerSymbol,
        markerColor,
        markerSize,
      });
    }

    flattened.forEach(({ geometry: normalizedGeometry, geometryKind }, index) => {
      features.push({
        type: "Feature",
        id: `${featureId}-${geometryKind}-${index}`,
        geometry: normalizedGeometry,
        properties: {
          featureId,
          layerId,
          geometryKind,
          renderGroup: renderGroup.id,
          selected: selectedFeatureIds.has(item.id),
          zIndex: item.meta._zIndex ?? index,
          strokeColor,
          strokeWidth,
          strokeStyle: style["stroke-style"] || "solid",
          fillColor,
          fillOpacity,
          markerColor,
          markerSize,
          markerSymbol,
          markerRenderKind,
          markerImageId: markerId,
          sourceOpacity,
        },
      });

      const labelText = getLabelText(item);
      const labelGroup = getTextVisibilityGroup(style, layerId);
      if (style.showLabel && labelText && labelGroup) {
        const labelGeometry = getLabelGeometry(normalizedGeometry);
        if (labelGeometry) {
          labelGroups.add(labelGroup.id);
          labelGroupDefs.set(labelGroup.id, labelGroup);
          labels.push({
            type: "Feature",
            id: `${featureId}-label-${geometryKind}-${index}`,
            geometry: labelGeometry,
            properties: {
              featureId,
              layerId,
              labelGroup: labelGroup.id,
              selected: selectedFeatureIds.has(item.id),
              zIndex: item.meta._zIndex ?? index,
              textField: labelText,
              textColor: "#333333",
              textHaloColor: "#FBFCFB",
              textHaloWidth: 2,
              textAlign: normalizeTextAlign(style["text-align"]),
              textAnchor: normalizeTextAnchor(style["text-align"]),
              textOffsetX: style["text-offset-x"] ?? 1.15,
              textOffsetY: style["text-offset-y"] ?? 0,
              sourceOpacity,
            },
          });
        }
      }
    });

    const arrowAnchors = getLineArrowAnchors(geometry);
    if (arrowAnchors) {
      const startArrow = style["arrow-start"];
      const endArrow = style["arrow-end"];
      if (startArrow && startArrow !== "none") {
        const symbolDefinition = getArrowSymbolDefinition(startArrow);
        const group = getArrowVisibilityGroup(
          style,
          "arrow-start",
          layerId,
          symbolDefinition,
          arrowSpriteScale,
        );
        arrowGroupDefs.set(group.id, group);
        const imageId = arrowImageId(startArrow, strokeColor, arrowSpriteScale);
        imageDefinitions.set(imageId, {
          kind: "arrow",
          arrowType: startArrow,
          color: strokeColor,
          spriteScale: arrowSpriteScale,
        });
        arrows.push({
          type: "Feature",
          id: `${featureId}-arrow-start`,
          geometry: point(arrowAnchors.start).geometry,
          properties: {
            featureId,
            layerId,
            arrowGroup: group.id,
            selected: selectedFeatureIds.has(item.id),
            zIndex: item.meta._zIndex ?? 0,
            arrowImageId: imageId,
            iconAnchor: group.iconAnchor,
            iconScale: arrowIconScale,
            rotation: getLineRotation(arrowAnchors.startAdjacent, arrowAnchors.start),
            sourceOpacity,
          },
        });
      }
      if (endArrow && endArrow !== "none") {
        const symbolDefinition = getArrowSymbolDefinition(endArrow);
        const group = getArrowVisibilityGroup(
          style,
          "arrow-end",
          layerId,
          symbolDefinition,
          arrowSpriteScale,
        );
        arrowGroupDefs.set(group.id, group);
        const imageId = arrowImageId(endArrow, strokeColor, arrowSpriteScale);
        imageDefinitions.set(imageId, {
          kind: "arrow",
          arrowType: endArrow,
          color: strokeColor,
          spriteScale: arrowSpriteScale,
        });
        arrows.push({
          type: "Feature",
          id: `${featureId}-arrow-end`,
          geometry: point(arrowAnchors.end).geometry,
          properties: {
            featureId,
            layerId,
            arrowGroup: group.id,
            selected: selectedFeatureIds.has(item.id),
            zIndex: item.meta._zIndex ?? 0,
            arrowImageId: imageId,
            iconAnchor: group.iconAnchor,
            iconScale: arrowIconScale,
            rotation: getLineRotation(arrowAnchors.endAdjacent, arrowAnchors.end),
            sourceOpacity,
          },
        });
      }
    }
  }

  return {
    featureData: featureCollection(features),
    labelData: featureCollection(labels),
    arrowData: featureCollection(arrows),
    renderGroupDefs,
    labelGroupDefs,
    arrowGroupDefs,
    imageDefinitions,
    structureKey: hashObject({
      renderGroups: Array.from(renderGroups).sort(),
      labelGroups: Array.from(labelGroups).sort(),
      arrowGroups: Array.from(arrowGroupDefs.keys()).sort(),
      isHidden: layer.isHidden ?? false,
    }),
  };
}

function createRenderFilter(groupId: string, geometryKind: GeometryKind) {
  return [
    "all",
    ["==", ["get", "renderGroup"], groupId],
    ["==", ["get", "geometryKind"], geometryKind],
  ];
}

function createLabelFilter(groupId: string) {
  return ["==", ["get", "labelGroup"], groupId];
}

function createArrowFilter(groupId: string) {
  return ["==", ["get", "arrowGroup"], groupId];
}

function getLayoutVisibility(isHidden: boolean | undefined) {
  return isHidden ? "none" : "visible";
}

function createLayerDefinitions(
  layer: FullScenarioLayerItemsLayer,
  renderResult: ReturnType<typeof buildFeatureData>,
) {
  const sourceId = featureSourceId(String(layer.id));
  const labelSourceId = `${sourceId}-labels`;
  const arrowSourceId = `${sourceId}-arrows`;
  const prefix = layerPrefix(String(layer.id));
  const layerDefinitions: Array<{ id: string; spec: Record<string, unknown> }> = [];
  const layoutVisibility = getLayoutVisibility(layer.isHidden);

  for (const group of renderResult.renderGroupDefs.values()) {
    const suffix = group.id;
    const zoomBounds = {
      ...(typeof group.minzoom === "number" ? { minzoom: group.minzoom } : {}),
      ...(typeof group.maxzoom === "number" ? { maxzoom: group.maxzoom } : {}),
    };

    layerDefinitions.push({
      id: `${prefix}-polygon-highlight-${suffix}`,
      spec: {
        id: `${prefix}-polygon-highlight-${suffix}`,
        type: "line",
        source: sourceId,
        filter: [
          "all",
          createRenderFilter(group.id, "polygon"),
          ["==", ["get", "selected"], true],
        ],
        layout: {
          visibility: layoutVisibility,
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#facc15",
          "line-width": ["+", ["get", "strokeWidth"], 5],
          "line-opacity": ["get", "sourceOpacity"],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-polygon-fill-${suffix}`,
      spec: {
        id: `${prefix}-polygon-fill-${suffix}`,
        type: "fill",
        source: sourceId,
        filter: createRenderFilter(group.id, "polygon"),
        layout: { visibility: layoutVisibility },
        paint: {
          "fill-color": ["get", "fillColor"],
          "fill-opacity": ["*", ["get", "fillOpacity"], ["get", "sourceOpacity"]],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-polygon-line-${suffix}`,
      spec: {
        id: `${prefix}-polygon-line-${suffix}`,
        type: "line",
        source: sourceId,
        filter: createRenderFilter(group.id, "polygon"),
        layout: {
          visibility: layoutVisibility,
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", "strokeColor"],
          "line-width": ["get", "strokeWidth"],
          "line-opacity": ["get", "sourceOpacity"],
          "line-dasharray": [
            "case",
            ["==", ["get", "strokeStyle"], "dashed"],
            ["literal", [4, 2]],
            ["==", ["get", "strokeStyle"], "dotted"],
            ["literal", [1, 2]],
            ["literal", [1, 0]],
          ],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-line-highlight-${suffix}`,
      spec: {
        id: `${prefix}-line-highlight-${suffix}`,
        type: "line",
        source: sourceId,
        filter: [
          "all",
          createRenderFilter(group.id, "line"),
          ["==", ["get", "selected"], true],
        ],
        layout: {
          visibility: layoutVisibility,
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#facc15",
          "line-width": ["+", ["get", "strokeWidth"], 5],
          "line-opacity": ["get", "sourceOpacity"],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-line-${suffix}`,
      spec: {
        id: `${prefix}-line-${suffix}`,
        type: "line",
        source: sourceId,
        filter: createRenderFilter(group.id, "line"),
        layout: {
          visibility: layoutVisibility,
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", "strokeColor"],
          "line-width": ["get", "strokeWidth"],
          "line-opacity": ["get", "sourceOpacity"],
          "line-dasharray": [
            "case",
            ["==", ["get", "strokeStyle"], "dashed"],
            ["literal", [4, 2]],
            ["==", ["get", "strokeStyle"], "dotted"],
            ["literal", [1, 2]],
            ["literal", [1, 0]],
          ],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-point-highlight-${suffix}`,
      spec: {
        id: `${prefix}-point-highlight-${suffix}`,
        type: "circle",
        source: sourceId,
        filter: [
          "all",
          createRenderFilter(group.id, "point"),
          ["==", ["get", "selected"], true],
        ],
        layout: { visibility: layoutVisibility },
        paint: {
          "circle-color": "#facc15",
          "circle-radius": ["+", ["get", "markerSize"], 5],
          "circle-opacity": ["get", "sourceOpacity"],
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-point-circle-${suffix}`,
      spec: {
        id: `${prefix}-point-circle-${suffix}`,
        type: "circle",
        source: sourceId,
        filter: [
          "all",
          createRenderFilter(group.id, "point"),
          ["==", ["get", "markerRenderKind"], "circle"],
        ],
        layout: { visibility: layoutVisibility },
        paint: {
          "circle-color": ["get", "markerColor"],
          "circle-radius": ["get", "markerSize"],
          "circle-opacity": ["get", "sourceOpacity"],
          "circle-stroke-color": "#fafafa",
          "circle-stroke-width": 2,
        },
        ...zoomBounds,
      },
    });
    layerDefinitions.push({
      id: `${prefix}-point-icon-${suffix}`,
      spec: {
        id: `${prefix}-point-icon-${suffix}`,
        type: "symbol",
        source: sourceId,
        filter: [
          "all",
          createRenderFilter(group.id, "point"),
          ["==", ["get", "markerRenderKind"], "icon"],
        ],
        layout: {
          visibility: layoutVisibility,
          "icon-image": ["get", "markerImageId"],
          "icon-allow-overlap": true,
          "symbol-sort-key": ["get", "zIndex"],
        },
        paint: {
          "icon-opacity": ["get", "sourceOpacity"],
        },
        ...zoomBounds,
      },
    });
  }

  for (const group of renderResult.labelGroupDefs.values()) {
    const zoomBounds = {
      ...(typeof group.minzoom === "number" ? { minzoom: group.minzoom } : {}),
      ...(typeof group.maxzoom === "number" ? { maxzoom: group.maxzoom } : {}),
    };
    layerDefinitions.push({
      id: `${prefix}-labels-${group.id}`,
      spec: {
        id: `${prefix}-labels-${group.id}`,
        type: "symbol",
        source: labelSourceId,
        filter: createLabelFilter(group.id),
        layout: {
          visibility: layoutVisibility,
          "text-field": ["get", "textField"],
          "text-font": ["Noto Sans Italic"],
          "text-size": 13,
          "text-anchor": ["get", "textAnchor"],
          "text-offset": ["literal", [1, 0]],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "symbol-sort-key": ["get", "zIndex"],
        },
        paint: {
          "text-color": ["get", "textColor"],
          "text-opacity": ["get", "sourceOpacity"],
          "text-halo-color": ["get", "textHaloColor"],
          "text-halo-width": ["get", "textHaloWidth"],
        },
        ...zoomBounds,
      },
    });
  }

  for (const group of renderResult.arrowGroupDefs.values()) {
    const zoomBounds = {
      ...(typeof group.minzoom === "number" ? { minzoom: group.minzoom } : {}),
      ...(typeof group.maxzoom === "number" ? { maxzoom: group.maxzoom } : {}),
    };
    layerDefinitions.push({
      id: `${prefix}-arrows-${group.id}`,
      spec: {
        id: `${prefix}-arrows-${group.id}`,
        type: "symbol",
        source: arrowSourceId,
        filter: createArrowFilter(group.id),
        layout: {
          visibility: layoutVisibility,
          "icon-image": ["get", "arrowImageId"],
          "icon-size": ["get", "iconScale"],
          "icon-rotate": ["get", "rotation"],
          "icon-anchor": group.iconAnchor,
          "icon-offset": ["literal", group.iconOffset],
          "icon-rotation-alignment": "map",
          "icon-pitch-alignment": "map",
          "icon-allow-overlap": true,
          "symbol-sort-key": ["get", "zIndex"],
        },
        paint: {
          "icon-opacity": ["get", "sourceOpacity"],
        },
        ...zoomBounds,
      },
    });
  }

  return {
    sourceId,
    labelSourceId,
    arrowSourceId,
    layerDefinitions,
  };
}

export function buildScenarioFeatureRenderPlan(
  layer: FullScenarioLayerItemsLayer,
  options: { filterVisible: boolean; selectedFeatureIds: Set<FeatureId> },
): ScenarioLayerRenderPlan {
  const layerId = String(layer.id);
  const renderResult = buildFeatureData(layer, options);
  const definitions = createLayerDefinitions(layer, renderResult);

  return {
    layerId,
    sourceId: definitions.sourceId,
    labelSourceId: definitions.labelSourceId,
    arrowSourceId: definitions.arrowSourceId,
    featureData: renderResult.featureData,
    labelData: renderResult.labelData,
    arrowData: renderResult.arrowData,
    layerDefinitions: definitions.layerDefinitions,
    structureKey: renderResult.structureKey,
    imageDefinitions: renderResult.imageDefinitions,
  };
}

export function isManagedScenarioFeatureLayerId(layerId: string | undefined | null) {
  return typeof layerId === "string" && layerId.startsWith(GLOBE_SCENARIO_FEATURE_PREFIX);
}

export function getFeatureIdFromRenderedFeature(
  feature: MapGeoJSONFeature | { properties?: GeoJsonProperties } | undefined,
) {
  const featureId = feature?.properties?.featureId;
  return featureId ? String(featureId) : undefined;
}

export function getLayerIdFromRenderedFeature(
  feature: MapGeoJSONFeature | { properties?: GeoJsonProperties } | undefined,
) {
  const layerId = feature?.properties?.layerId;
  return layerId ? String(layerId) : undefined;
}

function ensureCanvasImageData(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, scale: number) => void,
) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(scale, scale);
  draw(context, scale);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function drawMarkerPath(
  context: CanvasRenderingContext2D,
  markerSymbol: string,
  center: number,
  radius: number,
) {
  if (markerSymbol === "square") {
    context.rect(center - radius, center - radius, radius * 2, radius * 2);
    return;
  }
  if (markerSymbol === "triangle") {
    context.moveTo(center, center - radius);
    context.lineTo(center + radius, center + radius);
    context.lineTo(center - radius, center + radius);
    context.closePath();
    return;
  }
  if (markerSymbol === "star") {
    const innerRadius = radius * 0.45;
    for (let i = 0; i < 10; i++) {
      const currentRadius = i % 2 === 0 ? radius : innerRadius;
      const currentAngle = (Math.PI / 2) * 3 + (Math.PI / 5) * i;
      const x = center + Math.cos(currentAngle) * currentRadius;
      const y = center + Math.sin(currentAngle) * currentRadius;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    return;
  }
  if (markerSymbol === "cross" || markerSymbol === "x") {
    const rotation = markerSymbol === "x" ? Math.PI / 4 : 0;
    context.save();
    context.translate(center, center);
    context.rotate(rotation);
    const width = radius * 0.55;
    context.rect(-width / 2, -radius, width, radius * 2);
    context.rect(-radius, -width / 2, radius * 2, width);
    context.restore();
    return;
  }
  if (markerSymbol === "hexagon" || markerSymbol === "pentagon") {
    const sides = markerSymbol === "hexagon" ? 6 : 5;
    for (let i = 0; i < sides; i++) {
      const currentAngle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = center + Math.cos(currentAngle) * radius;
      const y = center + Math.sin(currentAngle) * radius;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    return;
  }
  context.arc(center, center, radius, 0, Math.PI * 2);
}

function createMarkerImage(definition: Extract<ImageDefinition, { kind: "marker" }>) {
  const size = Math.max(20, Math.ceil(definition.markerSize * 2.4));
  return ensureCanvasImageData(size, size, (context) => {
    context.beginPath();
    drawMarkerPath(context, definition.markerSymbol, size / 2, size / 2.6);
    context.fillStyle = definition.markerColor;
    context.strokeStyle = "#fafafa";
    context.lineWidth = 2;
    context.fill();
    context.stroke();
  });
}

function createArrowImage(definition: Extract<ImageDefinition, { kind: "arrow" }>) {
  const size = getArrowSpriteCanvasSize(definition.spriteScale);
  return ensureCanvasImageData(size, size, (context) => {
    drawArrowSymbol(context, definition.arrowType, definition.color, size);
  });
}

function ensureImage(
  mlMap: MlMap,
  imageId: string,
  definition: ImageDefinition | undefined,
) {
  if (!definition || mlMap.hasImage(imageId)) return;
  const imageData =
    definition.kind === "marker"
      ? createMarkerImage(definition)
      : createArrowImage(definition);
  if (!imageData) return;
  mlMap.addImage(imageId, imageData, { pixelRatio: 2 });
}

export class MapLibreScenarioFeatureManager {
  private plans = new Map<string, ScenarioLayerRenderPlan>();
  private imageDefinitions = new Map<string, ImageDefinition>();
  private styleImageMissingHandler = (event: MapStyleImageMissingEvent) => {
    ensureImage(this.mlMap, event.id, this.imageDefinitions.get(event.id));
  };

  constructor(
    private mlMap: MlMap,
    private getSelectedFeatureIds: () => Set<FeatureId>,
  ) {
    this.mlMap.on("styleimagemissing", this.styleImageMissingHandler);
  }

  destroy() {
    this.clear();
    this.mlMap.off("styleimagemissing", this.styleImageMissingHandler);
  }

  clear() {
    Array.from(this.plans.values()).forEach((plan) => this.removePlan(plan));
    this.plans.clear();
    this.imageDefinitions.clear();
  }

  private getLayerSafe(layerId: string) {
    try {
      return this.mlMap.getLayer(layerId);
    } catch {
      return undefined;
    }
  }

  private getSourceSafe(sourceId: string) {
    try {
      return this.mlMap.getSource(sourceId);
    } catch {
      return undefined;
    }
  }

  refresh(
    layers: FullScenarioLayerItemsLayer[],
    options: {
      doClearCache?: boolean;
      filterVisible?: boolean;
    } = {},
  ) {
    if (options.doClearCache) {
      this.clear();
    }
    const filterVisible = options.filterVisible ?? true;
    const selectedFeatureIds = this.getSelectedFeatureIds();
    const desiredPlans = new Map<string, ScenarioLayerRenderPlan>();

    layers.forEach((layer) => {
      if (filterVisible && layer._hidden) return;
      const plan = buildScenarioFeatureRenderPlan(layer, {
        filterVisible,
        selectedFeatureIds,
      });
      desiredPlans.set(plan.layerId, plan);
    });

    for (const [layerId, currentPlan] of this.plans.entries()) {
      if (!desiredPlans.has(layerId)) {
        this.removePlan(currentPlan);
        this.plans.delete(layerId);
      }
    }

    const unitLayerExists = Boolean(this.getLayerSafe("unitLayer"));
    const beforeId = unitLayerExists ? "unitLayer" : undefined;
    this.imageDefinitions = new Map(
      Array.from(desiredPlans.values()).flatMap((plan) =>
        Array.from(plan.imageDefinitions.entries()),
      ),
    );

    for (const [layerId, nextPlan] of desiredPlans.entries()) {
      const currentPlan = this.plans.get(layerId);
      if (
        currentPlan &&
        currentPlan.structureKey === nextPlan.structureKey &&
        this.getSourceSafe(nextPlan.sourceId) &&
        this.getSourceSafe(nextPlan.labelSourceId) &&
        this.getSourceSafe(nextPlan.arrowSourceId)
      ) {
        (this.getSourceSafe(nextPlan.sourceId) as GeoJSONSource).setData(
          nextPlan.featureData,
        );
        (this.getSourceSafe(nextPlan.labelSourceId) as GeoJSONSource).setData(
          nextPlan.labelData,
        );
        (this.getSourceSafe(nextPlan.arrowSourceId) as GeoJSONSource).setData(
          nextPlan.arrowData,
        );
        this.plans.set(layerId, nextPlan);
        continue;
      }

      if (currentPlan) {
        this.removePlan(currentPlan);
      }
      this.addPlan(nextPlan, beforeId);
      this.plans.set(layerId, nextPlan);
    }
  }

  private removePlan(plan: ScenarioLayerRenderPlan) {
    [...plan.layerDefinitions].reverse().forEach(({ id }) => {
      if (this.getLayerSafe(id)) {
        this.mlMap.removeLayer(id);
      }
    });
    if (this.getSourceSafe(plan.arrowSourceId)) {
      this.mlMap.removeSource(plan.arrowSourceId);
    }
    if (this.getSourceSafe(plan.labelSourceId)) {
      this.mlMap.removeSource(plan.labelSourceId);
    }
    if (this.getSourceSafe(plan.sourceId)) {
      this.mlMap.removeSource(plan.sourceId);
    }
  }

  private addPlan(plan: ScenarioLayerRenderPlan, beforeId?: string) {
    if (!this.getSourceSafe(plan.sourceId)) {
      this.mlMap.addSource(plan.sourceId, {
        type: "geojson",
        data: plan.featureData,
      });
    }
    if (!this.getSourceSafe(plan.labelSourceId)) {
      this.mlMap.addSource(plan.labelSourceId, {
        type: "geojson",
        data: plan.labelData,
      });
    }
    if (!this.getSourceSafe(plan.arrowSourceId)) {
      this.mlMap.addSource(plan.arrowSourceId, {
        type: "geojson",
        data: plan.arrowData,
      });
    }

    plan.imageDefinitions.forEach((definition, imageId) => {
      ensureImage(this.mlMap, imageId, definition);
    });

    plan.layerDefinitions.forEach(({ spec, id }) => {
      if (this.getLayerSafe(id)) {
        this.mlMap.removeLayer(id);
      }
      this.mlMap.addLayer(spec as any, beforeId);
    });
  }
}
