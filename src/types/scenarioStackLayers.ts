import type { ScenarioMapLayer } from "@/types/scenarioGeoModels";
import type {
  LayerItemId,
  ScenarioLayerItem,
  ScenarioLayerItemsLayer,
} from "@/types/scenarioLayerItems";
import type { ScenarioTime } from "@/types/base";

export type ScenarioStackLayerId = string;
export type ScenarioStackLayerKind = "overlay" | "reference" | "data";

export interface ScenarioStackLayerBase {
  id: ScenarioStackLayerId;
  kind: ScenarioStackLayerKind;
  name: string;
  description?: string;
  attributions?: string;
  externalUrl?: string;
  visibleFromT?: ScenarioTime;
  visibleUntilT?: ScenarioTime;
  isHidden?: boolean;
  opacity?: number;
  locked?: boolean;
  _isNew?: boolean;
  _isOpen?: boolean;
  _hidden?: boolean;
}

export interface ScenarioOverlayLayer
  extends Omit<ScenarioLayerItemsLayer, "items" | "id">, ScenarioStackLayerBase {
  kind: "overlay";
  items: ScenarioLayerItem[];
}

export interface ScenarioReferenceLayer extends ScenarioStackLayerBase {
  kind: "reference";
  source: ScenarioMapLayer;
}

export interface ScenarioDataLayer extends ScenarioStackLayerBase {
  kind: "data";
  source: {
    type: string;
    [key: string]: unknown;
  };
  style?: {
    renderer?: string;
    [key: string]: unknown;
  };
}

export type ScenarioStackLayer =
  | ScenarioOverlayLayer
  | ScenarioReferenceLayer
  | ScenarioDataLayer;

export interface NScenarioOverlayLayer extends Omit<ScenarioOverlayLayer, "items"> {
  items: LayerItemId[];
}

export interface NScenarioReferenceLayer extends ScenarioReferenceLayer {}

export interface NScenarioDataLayer extends ScenarioDataLayer {}

export type NScenarioStackLayer =
  | NScenarioOverlayLayer
  | NScenarioReferenceLayer
  | NScenarioDataLayer;

export function isScenarioOverlayLayer(
  layer: ScenarioStackLayer | NScenarioStackLayer | undefined | null,
): layer is ScenarioOverlayLayer | NScenarioOverlayLayer {
  return !!layer && layer.kind === "overlay";
}

export function isScenarioReferenceLayer(
  layer: ScenarioStackLayer | NScenarioStackLayer | undefined | null,
): layer is ScenarioReferenceLayer | NScenarioReferenceLayer {
  return !!layer && layer.kind === "reference";
}

export function isScenarioDataLayer(
  layer: ScenarioStackLayer | NScenarioStackLayer | undefined | null,
): layer is ScenarioDataLayer | NScenarioDataLayer {
  return !!layer && layer.kind === "data";
}
