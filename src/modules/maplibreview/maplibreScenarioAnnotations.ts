import turfAlong from "@turf/along";
import bearing from "@turf/bearing";
import centerOfMass from "@turf/center-of-mass";
import turfLength from "@turf/length";
import { lineString, point } from "@turf/helpers";
import type {
  Feature as GeoJsonFeature,
  GeoJsonProperties,
  Geometry,
  Position,
} from "geojson";
import {
  getArrowGlobeIconOffset,
  getArrowRenderScale,
  getArrowSpriteCanvasSize,
  getArrowSymbolDefinition,
  type ArrowSymbolDefinition,
} from "@/geo/arrowSymbols";
import type { ArrowType } from "@/geo/simplestyle";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type {
  ArrowAnnotation,
  FullScenarioLayerItemsLayer,
  NScenarioLayerItem,
  TextAnnotation,
} from "@/types/scenarioLayerItems";
import {
  isArrowAnnotation,
  isGeometryLayerItem,
  isNAnnotationLayerItem,
  isTextAnnotation,
} from "@/types/scenarioLayerItems";
import { hashObject } from "@/utils";

type RenderableGeoJsonFeature<T extends GeoJsonProperties = GeoJsonProperties> =
  GeoJsonFeature<Geometry, T>;

type GeometryKind = "point" | "line" | "polygon";

type GroupDefinition = {
  id: string;
  minzoom?: number;
  maxzoom?: number;
};

type LabelGroupDefinition = GroupDefinition & {
  placement: "point";
};

type ArrowGroupDefinition = GroupDefinition & {
  iconAnchor: "center" | "right";
  iconOffset: [number, number];
};

type AnnotationRenderFeatureProperties = {
  featureId: string;
  layerId: string;
  geometryKind: GeometryKind;
  renderGroup: string;
  selected: boolean;
  obstacleHighlighted: boolean;
  zIndex: number;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: string;
  fillColor: string;
  fillOpacity: number;
  markerColor: string;
  markerSize: number;
  markerSymbol: string;
  markerRenderKind: "circle";
  sourceOpacity: number;
  anchorZoom: number;
};

type AnnotationLabelProperties = {
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
  textOffset: [number, number];
  textSize: number;
  sourceOpacity: number;
  anchorZoom: number;
};

type AnnotationArrowProperties = {
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
  anchorZoom: number;
};

type ImageDefinition = {
  kind: "arrow";
  arrowType: ArrowType;
  color: string;
  spriteScale: number;
};

const FEATURE_PREFIX = "scenario-feature-annotation";
const DEFAULT_TEXT_SIZE = 16;

function toRgbaColor(
  color: string | null | undefined,
  opacity = 1,
  fallback = "#555555",
) {
  if (!color) return fallback;
  if (opacity >= 1) return color;
  return color;
}

function quantizeArrowSpriteScale(scale: number) {
  return Math.max(1, Math.ceil(scale * 2) / 2);
}

function arrowImageId(arrowType: string, color: string, spriteScale: number) {
  return `${FEATURE_PREFIX}-arrow-${hashObject({
    arrowType,
    color,
    spriteScale,
  })}`;
}

function getVisibilityGroup(
  style: Partial<ArrowAnnotation["style"]> | Partial<TextAnnotation["style"]> | undefined,
  suffix: string,
  layerId: string,
) {
  if (!style?.limitVisibility) {
    return {
      id: hashObject({ layerId, suffix, type: "always" }),
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

function getTextVisibilityGroup(
  style: TextAnnotation["style"] | undefined,
  layerId: string,
) {
  const minzoom = style?.textMinZoom;
  const maxzoom = style?.textMaxZoom;
  return {
    id: hashObject({
      layerId,
      type: "annotation-text",
      minzoom: minzoom ?? null,
      maxzoom: maxzoom ?? null,
    }),
    ...(typeof minzoom === "number" ? { minzoom } : {}),
    ...(typeof maxzoom === "number" ? { maxzoom } : {}),
    placement: "point" as const,
  } satisfies LabelGroupDefinition;
}

function getArrowVisibilityGroup(
  style: ArrowAnnotation["style"] | undefined,
  layerId: string,
  suffix: string,
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

function getRepresentativePosition(
  item: NScenarioLayerItem | undefined,
): Position | undefined {
  if (!item) return;
  if (isArrowAnnotation(item)) {
    const feature = lineString(
      item._state?.geometry?.coordinates ?? item.geometry.coordinates,
    );
    return centerOfMass(feature).geometry.coordinates as Position;
  }
  if (!isGeometryLayerItem(item)) return;
  const geometry = item._state?.geometry ?? item.geometry;
  if (geometry.type === "Point") return geometry.coordinates;
  if (geometry.type === "LineString") {
    return centerOfMass(lineString(geometry.coordinates)).geometry
      .coordinates as Position;
  }
  return centerOfMass({ type: "Feature", geometry, properties: {} }).geometry
    .coordinates as Position;
}

function getLinePosition(
  item: NScenarioLayerItem | undefined,
  distance: number,
): Position | undefined {
  if (!item) return;
  let coordinates: Position[] | undefined;
  if (isArrowAnnotation(item)) {
    coordinates = item._state?.geometry?.coordinates ?? item.geometry.coordinates;
  } else if (isGeometryLayerItem(item)) {
    const geometry = item._state?.geometry ?? item.geometry;
    if (geometry.type === "LineString") {
      coordinates = geometry.coordinates as Position[];
    }
  }
  if (!coordinates?.length) return getRepresentativePosition(item);
  if (coordinates.length === 1) return coordinates[0];

  const line = lineString(coordinates);
  const totalKilometers = turfLength(line, { units: "kilometers" });
  if (totalKilometers <= 0) return coordinates[0];
  const alongDistance =
    distance >= 0 && distance <= 1 ? totalKilometers * distance : distance;
  return turfAlong(line, Math.max(0, Math.min(alongDistance, totalKilometers)), {
    units: "kilometers",
  }).geometry.coordinates as Position;
}

function resolveTextAnnotationPosition(
  annotation: TextAnnotation,
  itemLookup: Map<string, NScenarioLayerItem>,
): Position | undefined {
  const anchor = annotation._state?.anchor ?? annotation.anchor;
  if (anchor.type === "point") return anchor.position;
  if (anchor.type === "layerItem")
    return getRepresentativePosition(itemLookup.get(anchor.layerItemId));
  return getLinePosition(itemLookup.get(anchor.layerItemId), anchor.distance);
}

function getLineRotation(from: Position, to: Position) {
  return bearing(point(from), point(to));
}

export function buildAnnotationRenderData(
  layer: FullScenarioLayerItemsLayer,
  itemLookup: Map<string, NScenarioLayerItem>,
  options: {
    filterVisible: boolean;
    selectedFeatureIds: Set<FeatureId>;
    sourceOpacity: number;
  },
): {
  features: RenderableGeoJsonFeature<AnnotationRenderFeatureProperties>[];
  labels: RenderableGeoJsonFeature<AnnotationLabelProperties>[];
  arrows: RenderableGeoJsonFeature<AnnotationArrowProperties>[];
  renderGroupDefs: Map<string, GroupDefinition>;
  labelGroupDefs: Map<string, LabelGroupDefinition>;
  arrowGroupDefs: Map<string, ArrowGroupDefinition>;
  imageDefinitions: Map<string, ImageDefinition>;
  structureKey: string;
} {
  const features: RenderableGeoJsonFeature<AnnotationRenderFeatureProperties>[] = [];
  const labels: RenderableGeoJsonFeature<AnnotationLabelProperties>[] = [];
  const arrows: RenderableGeoJsonFeature<AnnotationArrowProperties>[] = [];
  const renderGroupDefs = new Map<string, GroupDefinition>();
  const labelGroupDefs = new Map<string, LabelGroupDefinition>();
  const arrowGroupDefs = new Map<string, ArrowGroupDefinition>();
  const imageDefinitions = new Map<string, ImageDefinition>();
  const renderGroups = new Set<string>();
  const labelGroups = new Set<string>();
  const arrowGroups = new Set<string>();

  layer.items.filter(isNAnnotationLayerItem).forEach((item, index) => {
    if (options.filterVisible && item._hidden) return;

    const layerId = String(layer.id);
    const featureId = String(item.id);
    const selected = options.selectedFeatureIds.has(item.id);
    const zIndex = index;
    const anchorZoom = item._state?.anchorZoom ?? item.anchorZoom;

    if (isArrowAnnotation(item)) {
      const geometry = item._state?.geometry ?? item.geometry;
      const style = item._state?.style ?? item.style ?? {};
      const strokeColor = toRgbaColor(style.stroke, style["stroke-opacity"] ?? 1);
      const strokeWidth =
        typeof style["stroke-width"] === "number" ? style["stroke-width"] : 2;
      const renderGroup = getVisibilityGroup(style, "annotation-render", layerId);
      renderGroups.add(renderGroup.id);
      renderGroupDefs.set(renderGroup.id, renderGroup);

      features.push({
        type: "Feature",
        id: `${featureId}-annotation-line`,
        geometry,
        properties: {
          featureId,
          layerId,
          geometryKind: "line",
          renderGroup: renderGroup.id,
          selected,
          obstacleHighlighted: false,
          zIndex,
          strokeColor,
          strokeWidth,
          strokeStyle: style["stroke-style"] || "solid",
          fillColor: "rgba(0,0,0,0)",
          fillOpacity: 0,
          markerColor: "rgba(0,0,0,0)",
          markerSize: 0,
          markerSymbol: "circle",
          markerRenderKind: "circle",
          sourceOpacity: options.sourceOpacity,
          anchorZoom,
        },
      });

      const coordinates = geometry.coordinates;
      if (coordinates.length < 2) return;
      const arrowScale = getArrowRenderScale(strokeWidth);
      const arrowSpriteScale = quantizeArrowSpriteScale(arrowScale);
      const arrowIconScale = arrowScale / arrowSpriteScale;

      [
        {
          key: "arrow-start" as const,
          idSuffix: "start",
          point: coordinates[0],
          adjacent: coordinates[1],
        },
        {
          key: "arrow-end" as const,
          idSuffix: "end",
          point: coordinates[coordinates.length - 1],
          adjacent: coordinates[coordinates.length - 2],
        },
      ].forEach(({ key, idSuffix, point: anchorPoint, adjacent }) => {
        const arrowType = style[key];
        if (!arrowType || arrowType === "none") return;
        const symbolDefinition = getArrowSymbolDefinition(arrowType);
        const group = getArrowVisibilityGroup(
          style,
          layerId,
          `annotation-${idSuffix}`,
          symbolDefinition,
          arrowSpriteScale,
        );
        arrowGroups.add(group.id);
        arrowGroupDefs.set(group.id, group);
        const imageId = arrowImageId(arrowType, strokeColor, arrowSpriteScale);
        imageDefinitions.set(imageId, {
          kind: "arrow",
          arrowType,
          color: strokeColor,
          spriteScale: arrowSpriteScale,
        });
        arrows.push({
          type: "Feature",
          id: `${featureId}-annotation-arrow-${idSuffix}`,
          geometry: point(anchorPoint).geometry,
          properties: {
            featureId,
            layerId,
            arrowGroup: group.id,
            selected,
            zIndex,
            arrowImageId: imageId,
            iconAnchor: group.iconAnchor,
            iconScale: arrowIconScale,
            rotation: getLineRotation(adjacent, anchorPoint),
            sourceOpacity: options.sourceOpacity,
            anchorZoom,
          },
        });
      });
      return;
    }

    if (!isTextAnnotation(item)) return;

    const style = item._state?.style ?? item.style ?? {};
    const position = resolveTextAnnotationPosition(item, itemLookup);
    const textField =
      item._state?.content?.text ??
      item._state?.content?.markdown ??
      item.content.text ??
      item.content.markdown ??
      "";
    if (!position || !textField) return;

    const labelGroup = getTextVisibilityGroup(style, layerId);
    labelGroups.add(labelGroup.id);
    labelGroupDefs.set(labelGroup.id, labelGroup);
    labels.push({
      type: "Feature",
      id: `${featureId}-annotation-label`,
      geometry: point(position).geometry,
      properties: {
        featureId,
        layerId,
        labelGroup: labelGroup.id,
        selected,
        zIndex,
        textField,
        textColor: style.textColor ?? "#111827",
        textHaloColor: style.textHaloColor ?? "#ffffff",
        textHaloWidth: style.textHaloWidth ?? 2,
        textAlign: style.textAlign ?? "left",
        textAnchor:
          style.textAlign === "center"
            ? "center"
            : style.textAlign === "right"
              ? "right"
              : "left",
        textOffset: [0, 0],
        textSize: style.textSize ?? DEFAULT_TEXT_SIZE,
        sourceOpacity: options.sourceOpacity,
        anchorZoom,
      },
    });
  });

  return {
    features,
    labels,
    arrows,
    renderGroupDefs,
    labelGroupDefs,
    arrowGroupDefs,
    imageDefinitions,
    structureKey: hashObject({
      renderGroups: Array.from(renderGroups).sort(),
      labelGroups: Array.from(labelGroups).sort(),
      arrowGroups: Array.from(arrowGroups).sort(),
    }),
  };
}

export function createAnnotationItemLookup(layers: FullScenarioLayerItemsLayer[]) {
  return new Map(
    layers.flatMap((layer) =>
      layer.items.map((item) => [String(item.id), item] as const),
    ),
  );
}
