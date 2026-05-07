import type { Scenario } from "@/types/scenarioModels";
import { compare as compareVersions } from "compare-versions";
import type {
  ScenarioFeature,
  ScenarioLayer,
  ScenarioMapLayer,
  ScenarioFeatureMeta,
  ScenarioFeatureType,
} from "@/types/scenarioGeoModels";
import type { GeoJsonProperties } from "geojson";
import { type SimpleStyleSpec } from "@/geo/simplestyle";
import type {
  AnnotationLayerItem,
  AnnotationLayerItemState,
  ArrowAnnotation,
  ArrowAnnotationState,
  GeometryLayerMeta,
  GeometryLayerItem,
  LoadableGeometryLayerItemState,
  MeasurementLayerItem,
  ScenarioLayerItemsLayer,
  TacticalGraphicLayerItem,
  TextAnnotation,
  TextAnnotationState,
} from "@/types/scenarioLayerItems";
import { normalizeGeometryLayerItemState } from "@/types/scenarioLayerItems";
import type {
  ScenarioOverlayLayer,
  ScenarioReferenceLayer,
  ScenarioStackLayer,
} from "@/types/scenarioStackLayers";

export type LoadableGeometryLayerItem = {
  id: string | number;
  kind: "geometry";
  geometry: ScenarioFeature["geometry"];
  style?: Partial<SimpleStyleSpec>;
  state?: LoadableGeometryLayerItemState[];
  type?: "Feature";
  properties?: GeoJsonProperties;
  meta?: Partial<ScenarioFeatureMeta>;
  geometryMeta?: Partial<GeometryLayerMeta>;
  name?: string;
  description?: string;
  externalUrl?: string;
  locked?: boolean;
  isHidden?: boolean;
  visibleFromT?: number | string;
  visibleUntilT?: number | string;
  media?: GeometryLayerItem["media"];
  userData?: Record<string, unknown>;
  _zIndex?: number;
  _hidden?: boolean;
  _state?: GeometryLayerItem["_state"];
};
type UnsupportedLayerItem =
  | TacticalGraphicLayerItem
  | MeasurementLayerItem
  | { kind?: string };

type LegacyTextAnnotationItem = {
  id: string | number;
  kind: "annotation";
  annotationType?: "label" | "note" | "callout" | "image";
  anchor?: TextAnnotation["anchor"];
  content?: TextAnnotation["content"];
  style?: TextAnnotation["style"];
  state?: Array<
    | TextAnnotationState
    | (Omit<TextAnnotationState, "annotationKind" | "patch"> & {
        anchor?: TextAnnotation["anchor"];
        content?: TextAnnotation["content"];
        style?: TextAnnotation["style"];
        name?: string;
        description?: string;
        isHidden?: boolean;
        anchorZoom?: number;
      })
  >;
  name?: string;
  description?: string;
  externalUrl?: string;
  locked?: boolean;
  isHidden?: boolean;
  visibleFromT?: number | string;
  visibleUntilT?: number | string;
  media?: TextAnnotation["media"];
  userData?: Record<string, unknown>;
  anchorZoom?: number;
};

type LoadableArrowAnnotationItem = {
  id: string | number;
  kind: "annotation";
  annotationKind: "arrow";
  geometry: ArrowAnnotation["geometry"];
  style?: ArrowAnnotation["style"];
  state?: Array<
    | ArrowAnnotationState
    | (Omit<ArrowAnnotationState, "annotationKind" | "patch"> & {
        geometry?: ArrowAnnotation["geometry"];
        style?: ArrowAnnotation["style"];
        name?: string;
        description?: string;
        isHidden?: boolean;
        anchorZoom?: number;
      })
  >;
  name?: string;
  description?: string;
  externalUrl?: string;
  locked?: boolean;
  isHidden?: boolean;
  visibleFromT?: number | string;
  visibleUntilT?: number | string;
  media?: ArrowAnnotation["media"];
  userData?: Record<string, unknown>;
  anchorZoom?: number;
};

type LoadableAnnotationItem = LegacyTextAnnotationItem | LoadableArrowAnnotationItem;

export type LegacyScenarioLayer = ScenarioLayer;

export type LoadableOverlayLayer =
  | ScenarioLayerItemsLayer
  | (Omit<ScenarioLayer, "features"> & {
      features?: ScenarioFeature[];
      items?: Array<LoadableGeometryLayerItem | LoadableAnnotationItem | UnsupportedLayerItem>;
    });

export type LoadableScenarioLayer =
  | ScenarioStackLayer
  | LoadableOverlayLayer
  | ScenarioMapLayer;

export type LoadableScenario = Omit<Scenario, "layerStack"> & {
  layerStack?: LoadableScenarioLayer[];
  layers?: LoadableOverlayLayer[];
  mapLayers?: ScenarioMapLayer[];
};

function isGeometryLayerItem(
  item: LoadableGeometryLayerItem | LoadableAnnotationItem | UnsupportedLayerItem,
): item is LoadableGeometryLayerItem {
  return item.kind === "geometry";
}

function isAnnotationLayerItem(
  item: LoadableGeometryLayerItem | LoadableAnnotationItem | UnsupportedLayerItem,
): item is LoadableAnnotationItem {
  return item.kind === "annotation";
}

function canonicalizeGeometryStateEntries(
  states: LoadableGeometryLayerItemState[] | undefined,
): GeometryLayerItem["state"] {
  return states?.map((state) => normalizeGeometryLayerItemState(state));
}

function canonicalizeTextAnnotationStates(
  states: LegacyTextAnnotationItem["state"],
): TextAnnotation["state"] {
  return states?.map((state) => {
    if ("patch" in state && state.patch) {
      return {
        ...state,
        annotationKind: "text",
      } satisfies TextAnnotationState;
    }
    const legacyState = state as Omit<TextAnnotationState, "annotationKind" | "patch"> & {
      anchor?: TextAnnotation["anchor"];
      content?: TextAnnotation["content"];
      style?: TextAnnotation["style"];
      name?: string;
      description?: string;
      isHidden?: boolean;
      anchorZoom?: number;
    };
    const { anchor, content, style, name, description, isHidden, anchorZoom, ...rest } =
      legacyState;
    return {
      ...rest,
      annotationKind: "text",
      patch: {
        ...(anchor !== undefined ? { anchor } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(style !== undefined ? { style } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isHidden !== undefined ? { isHidden } : {}),
        ...(anchorZoom !== undefined ? { anchorZoom } : {}),
      },
    } satisfies TextAnnotationState;
  });
}

function canonicalizeArrowAnnotationStates(
  states: LoadableArrowAnnotationItem["state"],
): ArrowAnnotation["state"] {
  return states?.map((state) => {
    if ("patch" in state && state.patch) {
      return {
        ...state,
        annotationKind: "arrow",
      } satisfies ArrowAnnotationState;
    }
    const legacyState = state as Omit<ArrowAnnotationState, "annotationKind" | "patch"> & {
      geometry?: ArrowAnnotation["geometry"];
      style?: ArrowAnnotation["style"];
      name?: string;
      description?: string;
      isHidden?: boolean;
      anchorZoom?: number;
    };
    const { geometry, style, name, description, isHidden, anchorZoom, ...rest } =
      legacyState;
    return {
      ...rest,
      annotationKind: "arrow",
      patch: {
        ...(geometry !== undefined ? { geometry } : {}),
        ...(style !== undefined ? { style } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isHidden !== undefined ? { isHidden } : {}),
        ...(anchorZoom !== undefined ? { anchorZoom } : {}),
      },
    } satisfies ArrowAnnotationState;
  });
}

function upgradeAnnotationItemToSharedBase(item: LoadableAnnotationItem): AnnotationLayerItem {
  const base = {
    id: String(item.id),
    kind: "annotation" as const,
    name: item.name,
    description: item.description,
    externalUrl: item.externalUrl,
    locked: item.locked,
    isHidden: item.isHidden,
    visibleFromT: item.visibleFromT as number | undefined,
    visibleUntilT: item.visibleUntilT as number | undefined,
    media: item.media,
    userData: item.userData,
    anchorZoom: item.anchorZoom ?? 0,
  };

  if ("annotationKind" in item && item.annotationKind === "arrow") {
    return {
      ...base,
      annotationKind: "arrow",
      geometry: item.geometry,
      style: item.style,
      state: canonicalizeArrowAnnotationStates(item.state),
    } satisfies ArrowAnnotation;
  }

  const textItem = item as LegacyTextAnnotationItem;
  return {
    ...base,
    annotationKind: "text",
    textType: textItem.annotationType ?? "label",
    anchor: textItem.anchor ?? { type: "point", position: [0, 0] },
    content: textItem.content ?? {},
    style: textItem.style,
    state: canonicalizeTextAnnotationStates(textItem.state),
  } satisfies TextAnnotation;
}

function inferGeometryKind(
  geometry: GeometryLayerItem["geometry"] | undefined,
  legacyKind: unknown,
): ScenarioFeatureType {
  if (legacyKind === "Circle") return "Circle";
  const geometryType = geometry?.type;
  if (
    geometryType === "Point" ||
    geometryType === "LineString" ||
    geometryType === "Polygon" ||
    geometryType === "MultiPoint" ||
    geometryType === "MultiLineString" ||
    geometryType === "MultiPolygon" ||
    geometryType === "GeometryCollection"
  ) {
    return geometryType;
  }
  return "Point";
}

const RESERVED_LEGACY_PROPERTY_KEYS = new Set([
  "visibleFromT",
  "visibleUntilT",
  "type",
  "name",
  "description",
  "externalUrl",
  "locked",
  "isHidden",
  "radius",
  "_zIndex",
  "fill-opacity",
  "fill",
  "showLabel",
  "stroke-opacity",
  "stroke",
  "marker-color",
  "marker-size",
  "marker-symbol",
  "stroke-width",
  "stroke-style",
  "title",
  "text-placement",
  "text-align",
  "text-offset-x",
  "text-offset-y",
  "limitVisibility",
  "minZoom",
  "maxZoom",
  "textMinZoom",
  "textMaxZoom",
  "arrow-start",
  "arrow-end",
]);

function sanitizeLegacyProperties(
  properties: GeoJsonProperties | undefined,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  if (!properties || typeof properties !== "object") return sanitized;
  Object.entries(properties).forEach(([key, value]) => {
    if (RESERVED_LEGACY_PROPERTY_KEYS.has(key) || value === undefined) return;
    sanitized[key] = value;
  });
  return sanitized;
}

function normalizeGeometryUserData(
  item: LoadableGeometryLayerItem,
): Record<string, unknown> | undefined {
  const next = {
    ...sanitizeLegacyProperties(item.properties),
    ...(item.userData ?? {}),
  };
  Object.keys(next).forEach((key) => {
    if (RESERVED_LEGACY_PROPERTY_KEYS.has(key) || next[key] === undefined) {
      delete next[key];
    }
  });
  return Object.keys(next).length ? next : undefined;
}

function upgradeGeometryItemToSharedBase(
  item: LoadableGeometryLayerItem,
): GeometryLayerItem {
  const legacyMeta = item.meta ?? {};
  const geometryMeta: GeometryLayerMeta = {
    geometryKind: inferGeometryKind(
      item.geometry,
      item.geometryMeta?.geometryKind ?? legacyMeta.type,
    ),
    ...(item.geometryMeta?.radius !== undefined
      ? { radius: item.geometryMeta.radius }
      : legacyMeta.radius !== undefined
        ? { radius: legacyMeta.radius }
        : {}),
  };

  return {
    id: String(item.id),
    kind: "geometry",
    geometry: item.geometry,
    geometryMeta,
    style: item.style ?? {},
    state: canonicalizeGeometryStateEntries(item.state),
    name: item.name ?? legacyMeta.name,
    description: item.description ?? legacyMeta.description,
    externalUrl: item.externalUrl ?? legacyMeta.externalUrl,
    locked: item.locked ?? legacyMeta.locked,
    isHidden: item.isHidden ?? legacyMeta.isHidden,
    visibleFromT: (item.visibleFromT ?? legacyMeta.visibleFromT) as number | undefined,
    visibleUntilT: (item.visibleUntilT ?? legacyMeta.visibleUntilT) as number | undefined,
    media: item.media,
    userData: normalizeGeometryUserData(item),
    _zIndex: item._zIndex ?? legacyMeta._zIndex,
    _hidden: item._hidden,
    _state: item._state,
  };
}

function canonicalizeOverlayLayer(
  layer: LoadableOverlayLayer,
  scenarioId?: string,
): ScenarioOverlayLayer {
  if (!Array.isArray(layer.items)) {
    const { features = [], ...rest } = layer as Exclude<
      LoadableOverlayLayer,
      ScenarioLayerItemsLayer
    >;

    return {
      ...rest,
      id: String(rest.id),
      kind: "overlay",
      items: features.map((feature) => {
        const { state, ...featureRest } = feature;
        // Transitional stage: canonicalization keeps legacy feature-shaped data intact.
        // The object is normalized to the real GeometryLayerItem shape by the
        // versioned shared-base upgrade later in this pipeline.
        return {
          ...featureRest,
          id: String(feature.id),
          kind: "geometry",
          state: canonicalizeGeometryStateEntries(state),
        } as unknown as GeometryLayerItem;
      }),
    };
  }

  const { items, ...rest } = layer;

  const canonicalItems: ScenarioLayerItemsLayer["items"] = [];
  const skippedKinds: Record<string, number> = {};

  items.forEach((item) => {
    if (isGeometryLayerItem(item)) {
      const { kind: _kind, state, ...feature } = item;
      // Transitional stage: canonicalization preserves the loaded shape here so
      // pre-3.2 scenarios can still flow through the later shared-base upgrader.
      canonicalItems.push({
        ...feature,
        id: String(feature.id),
        kind: "geometry",
        state: canonicalizeGeometryStateEntries(state),
      } as unknown as GeometryLayerItem);
      return;
    }

    if (isAnnotationLayerItem(item)) {
      canonicalItems.push(upgradeAnnotationItemToSharedBase(item));
      return;
    }

    const kind = item.kind || "unknown";
    skippedKinds[kind] = (skippedKinds[kind] || 0) + 1;
  });

  const skippedKindsEntries = Object.entries(skippedKinds);
  if (skippedKindsEntries.length > 0) {
    const counts = skippedKindsEntries
      .map(([kind, count]) => `${kind}=${count}`)
      .join(", ");
    console.warn(
      `Skipping unsupported scenario layer items in layer "${layer.name}" (${layer.id})` +
        `${scenarioId ? ` for scenario "${scenarioId}"` : ""}: ${counts}`,
    );
  }

  return { ...rest, id: String(rest.id), kind: "overlay", items: canonicalItems };
}

function isScenarioMapLayer(layer: LoadableScenarioLayer): layer is ScenarioMapLayer {
  return (
    !!layer &&
    typeof layer === "object" &&
    "type" in layer &&
    (layer.type === "ImageLayer" ||
      layer.type === "TileJSONLayer" ||
      layer.type === "XYZLayer" ||
      layer.type === "KMLLayer")
  );
}

function canonicalizeReferenceLayer(layer: ScenarioMapLayer): ScenarioReferenceLayer {
  return {
    id: String(layer.id),
    kind: "reference",
    name: layer.name,
    description: layer.description,
    attributions: layer.attributions,
    externalUrl: layer.externalUrl,
    visibleFromT: layer.visibleFromT,
    visibleUntilT: layer.visibleUntilT,
    isHidden: layer.isHidden,
    opacity: layer.opacity,
    _isNew: layer._isNew,
    source: { ...layer, id: String(layer.id) },
  };
}

function canonicalizeScenarioLayerStack(scenario: LoadableScenario): Scenario {
  if (Array.isArray(scenario.layerStack)) {
    const canonicalLayerStack: Scenario["layerStack"] = [];
    scenario.layerStack.forEach((layer) => {
      if (
        layer &&
        typeof layer === "object" &&
        "kind" in layer &&
        layer.kind === "reference"
      ) {
        canonicalLayerStack.push({ ...layer, id: String(layer.id) });
        return;
      }
      if (
        layer &&
        typeof layer === "object" &&
        "kind" in layer &&
        layer.kind === "data"
      ) {
        canonicalLayerStack.push({ ...layer, id: String(layer.id) });
        return;
      }
      if (
        layer &&
        typeof layer === "object" &&
        "kind" in layer &&
        layer.kind === "overlay"
      ) {
        canonicalLayerStack.push(canonicalizeOverlayLayer(layer, scenario.id));
        return;
      }
      if (isScenarioMapLayer(layer)) {
        canonicalLayerStack.push(canonicalizeReferenceLayer(layer));
        return;
      }
      canonicalLayerStack.push(
        canonicalizeOverlayLayer(layer as LoadableOverlayLayer, scenario.id),
      );
    });
    return {
      ...scenario,
      layerStack: canonicalLayerStack,
    };
  }

  const legacyMapLayers = (scenario.mapLayers ?? []).map((layer) =>
    canonicalizeReferenceLayer(layer),
  );
  const legacyOverlayLayers = (scenario.layers ?? []).map((layer) =>
    canonicalizeOverlayLayer(layer, scenario.id),
  );
  return {
    ...scenario,
    layerStack: [...legacyMapLayers, ...legacyOverlayLayers],
  };
}

function upgradeLegacyFeatureProperties(scenario: Scenario): Scenario {
  const upgradedScenario = { ...scenario };
  upgradedScenario.layerStack = upgradedScenario.layerStack.map((layer) => {
    if (layer.kind !== "overlay") return layer;
    const upgradedLayer = { ...layer };
    upgradedLayer.items = upgradedLayer.items.map((item) => {
      if (item.kind !== "geometry") return item;
      // This migration intentionally operates on the legacy pre-shared-base
      // geometry shape before the final 3.2.0 normalization step runs.
      const upgradedFeature = { ...(item as any) } as any;
      const {
        visibleFromT,
        visibleUntilT,
        type,
        name,
        description,
        externalUrl,
        radius,
        _zIndex,
        "fill-opacity": fillOpacity,
        fill,
        showLabel,
        "stroke-opacity": strokeOpacity,
        stroke,
        "marker-color": markerColor,
        "marker-size": markerSize,
        "marker-symbol": markerSymbol,
        "stroke-width": strokeWidth,
        title,
        "text-placement": textPlacement,
        "text-align": textAlign,
        "text-offset-x": textOffsetX,
        "text-offset-y": textOffsetY,
        limitVisibility,
        minZoom,
        maxZoom,
        textMinZoom,
        textMaxZoom,
        ...rest
      } = upgradedFeature.properties ?? {};

      const meta: Required<Omit<ScenarioFeatureMeta, "locked">> = {
        type,
        visibleFromT,
        visibleUntilT,
        name,
        description,
        externalUrl,
        radius,
        _zIndex,
        isHidden: false,
      };

      const style: Omit<Required<SimpleStyleSpec>, "_fill" | "_stroke"> = {
        fill,
        "fill-opacity": fillOpacity,
        "stroke-opacity": strokeOpacity,
        "stroke-style": "solid",
        showLabel,
        stroke,
        "marker-color": markerColor,
        "marker-size": markerSize,
        "marker-symbol": markerSymbol,
        "stroke-width": strokeWidth,
        "text-placement": textPlacement,
        "text-align": textAlign,
        "text-offset-x": textOffsetX,
        "text-offset-y": textOffsetY,
        title,
        limitVisibility,
        minZoom,
        maxZoom,
        textMinZoom,
        textMaxZoom,
        "arrow-start": "none",
        "arrow-end": "none",
      };
      upgradedFeature.meta = meta;
      upgradedFeature.style = style;
      upgradedFeature.properties = rest;
      return upgradedFeature;
    });
    return upgradedLayer;
  });
  return upgradedScenario;
}

function upgradeGeometryLayerItemsToSharedBase(scenario: Scenario): Scenario {
  const upgradedScenario = { ...scenario };
  upgradedScenario.layerStack = upgradedScenario.layerStack.map((layer) => {
    if (layer.kind !== "overlay") return layer;
    return {
      ...layer,
      items: layer.items.map((item) =>
        item.kind === "geometry"
          ? upgradeGeometryItemToSharedBase(item as LoadableGeometryLayerItem)
          : item,
      ),
    };
  });
  return upgradedScenario;
}

export function upgradeScenarioIfNecessary(
  scenario: LoadableScenario | Scenario,
): Scenario {
  let canonicalScenario = canonicalizeScenarioLayerStack(scenario as LoadableScenario);

  if (compareVersions(canonicalScenario.version, "0.30.0", "<")) {
    console.log("Found outdated scenario version, upgrading from", scenario.version);
    canonicalScenario = upgradeLegacyFeatureProperties(canonicalScenario);
  }
  if (compareVersions(canonicalScenario.version, "3.2.0", "<")) {
    canonicalScenario = upgradeGeometryLayerItemsToSharedBase(canonicalScenario);
  }
  return canonicalScenario;
}
