import type { Scenario } from "@/types/scenarioModels";
import { compare as compareVersions } from "compare-versions";
import type {
  ScenarioFeature,
  ScenarioFeatureMeta,
  ScenarioLayer,
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

export type LoadableScenarioLayer =
  | ScenarioLayerItemsLayer
  | (Omit<ScenarioLayer, "features"> & {
      features?: ScenarioFeature[];
      items?: Array<LoadableGeometryLayerItem | UnsupportedLayerItem>;
    });

export type LoadableScenario = Omit<Scenario, "layers"> & {
  layers: LoadableScenarioLayer[];
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

function canonicalizeLayer(
  layer: LoadableScenarioLayer,
  scenarioId?: string,
): ScenarioLayerItemsLayer {
  if (!Array.isArray(layer.items)) {
    const { features = [], ...rest } = layer as Exclude<
      LoadableScenarioLayer,
      ScenarioLayerItemsLayer
    >;

    return {
      ...rest,
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

  return { ...rest, items: canonicalItems };
}

function canonicalizeScenarioLayers(scenario: LoadableScenario): Scenario {
  return {
    ...scenario,
    layers: scenario.layers.map((layer) => canonicalizeLayer(layer, scenario.id)),
  };
}

function upgradeLegacyFeatureProperties(scenario: Scenario): Scenario {
  const upgradedScenario = { ...scenario };
  upgradedScenario.layers = upgradedScenario.layers.map((layer) => {
    const upgradedLayer = { ...layer };
    upgradedLayer.items = upgradedLayer.items.map((item) => {
      if (item.kind !== "geometry") return item;
      const feature = item;
      const upgradedFeature = { ...feature };
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
  const canonicalScenario = canonicalizeScenarioLayers(scenario as LoadableScenario);

  if (compareVersions(canonicalScenario.version, "0.30.0", "<")) {
    console.log("Found outdated scenario version, upgrading from", scenario.version);
    return upgradeLegacyFeatureProperties(canonicalScenario);
  }
  return canonicalScenario;
}
