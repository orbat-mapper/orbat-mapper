import type { Scenario } from "@/types/scenarioModels";
import { compare as compareVersions } from "compare-versions";
import type {
  ScenarioFeature,
  ScenarioFeatureMeta,
  ScenarioLayer,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import { type SimpleStyleSpec } from "@/geo/simplestyle";
import type {
  AnnotationLayerItem,
  GeometryLayerItem,
  LoadableGeometryLayerItemState,
  MeasurementLayerItem,
  ScenarioLayerItemsLayer,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import { normalizeGeometryLayerItemState } from "@/types/scenarioLayerItems";
import type {
  ScenarioOverlayLayer,
  ScenarioReferenceLayer,
  ScenarioStackLayer,
} from "@/types/scenarioStackLayers";

export type LoadableGeometryLayerItem = Omit<ScenarioFeature, "state"> & {
  kind: "geometry";
  state?: LoadableGeometryLayerItemState[];
};
type UnsupportedLayerItem =
  | AnnotationLayerItem
  | TacticalGraphicLayerItem
  | MeasurementLayerItem
  | { kind?: string };

export type LegacyScenarioLayer = ScenarioLayer;

export type LoadableOverlayLayer =
  | ScenarioLayerItemsLayer
  | (Omit<ScenarioLayer, "features"> & {
      features?: ScenarioFeature[];
      items?: Array<LoadableGeometryLayerItem | UnsupportedLayerItem>;
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
  item: LoadableGeometryLayerItem | UnsupportedLayerItem,
): item is LoadableGeometryLayerItem {
  return item.kind === "geometry";
}

function canonicalizeGeometryStateEntries(
  states: LoadableGeometryLayerItemState[] | undefined,
): GeometryLayerItem["state"] {
  return states?.map((state) => normalizeGeometryLayerItemState(state));
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
        return {
          ...featureRest,
          id: String(feature.id),
          kind: "geometry",
          state: canonicalizeGeometryStateEntries(state),
        };
      }),
    };
  }

  const { items, ...rest } = layer;

  const canonicalItems: ScenarioLayerItemsLayer["items"] = [];
  const skippedKinds: Record<string, number> = {};

  items.forEach((item) => {
    if (isGeometryLayerItem(item)) {
      const { kind: _kind, state, ...feature } = item;
      canonicalItems.push({
        ...feature,
        id: String(feature.id),
        kind: "geometry",
        state: canonicalizeGeometryStateEntries(state),
      } satisfies GeometryLayerItem);
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
      const upgradedFeature = { ...item };
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

export function upgradeScenarioIfNecessary(
  scenario: LoadableScenario | Scenario,
): Scenario {
  const canonicalScenario = canonicalizeScenarioLayerStack(scenario as LoadableScenario);

  if (compareVersions(canonicalScenario.version, "0.30.0", "<")) {
    console.log("Found outdated scenario version, upgrading from", scenario.version);
    return upgradeLegacyFeatureProperties(canonicalScenario);
  }
  return canonicalScenario;
}
