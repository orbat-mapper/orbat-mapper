import type { ComputedRef, InjectionKey, MaybeRef, Ref, ShallowRef } from "vue";
import type { EntityId } from "@/types/base";
import type { TScenario } from "@/scenariostore";
import type { SidcModalPromise, TimeModalPromise } from "@/composables/modals";
import type { EventHook } from "@vueuse/core";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import type { EventSearchResult } from "@/components/types";
import type { PhotonSearchResult } from "@/composables/geosearching";
import type { ScenarioActions } from "@/types/constants";
import type {
  MeasurementInteractionOptions,
  MeasurementTypes,
} from "@/geo/measurementTypes";

export const activeParentKey = Symbol("Active unit") as InjectionKey<
  Ref<EntityId | undefined | null>
>;

export const activeLayerKey = Symbol("Active layer") as InjectionKey<
  Ref<FeatureId | undefined | null>
>;

export const activeScenarioKey = Symbol("Active scenario") as InjectionKey<TScenario>;
export const currentScenarioTabKey = Symbol("Current scenario tab") as InjectionKey<
  Ref<number>
>;

export const timeModalKey = Symbol("Time modal") as InjectionKey<{
  getModalTimestamp: TimeModalPromise;
}>;

export const sidcModalKey = Symbol("SIDC modal") as InjectionKey<{
  getModalSidc: SidcModalPromise;
}>;

export const searchActionsKey = Symbol("Search actions") as InjectionKey<{
  onUnitSelectHook: EventHook<{
    unitId: EntityId;
    // revealInOrbat defaults to true. Plain map selections pass false so that they only
    // change the selection, without opening the ORBAT panel or expanding the tree.
    options?: { noZoom?: boolean; revealInOrbat?: boolean };
  }>;
  onLayerSelectHook: EventHook<{ layerId: FeatureId }>;
  onImageLayerSelectHook: EventHook<{ layerId: FeatureId }>;
  onFeatureSelectHook: EventHook<{
    featureId: FeatureId;
    layerId: FeatureId;
    options?: { noZoom?: boolean };
  }>;
  onEventSelectHook: EventHook<EventSearchResult>;
  onPlaceSelectHook: EventHook<PhotonSearchResult>;
  onScenarioActionHook: EventHook<{ action: ScenarioActions }>;
}>;

export const activeScenarioMapEngineKey = Symbol(
  "Active scenario map engine",
) as InjectionKey<ShallowRef<ScenarioMapEngine | undefined>>;

export interface RouteDetailsPanelContext {
  activeRoutingUnitName: ComputedRef<string | null>;
  addRouteLeg: () => boolean;
  clearCurrentLeg: () => boolean;
  finishRoute: () => boolean;
  closeRouting: () => void;
  endRouting: () => void;
  handleEscape: () => boolean;
}

export interface MeasurementInteraction {
  clear: () => void;
}

/**
 * Engine specific factory for the map measurement interaction. Only provided by map views
 * that need to create the interaction themselves.
 */
export type MeasurementInteractionFactory = (
  measurementType: MaybeRef<MeasurementTypes>,
  options: MeasurementInteractionOptions,
) => MeasurementInteraction;

export const measurementInteractionFactoryKey = Symbol(
  "Measurement interaction factory",
) as InjectionKey<MeasurementInteractionFactory>;

export const routeDetailsPanelKey = Symbol(
  "Route details panel",
) as InjectionKey<RouteDetailsPanelContext>;
