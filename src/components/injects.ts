import type { InjectionKey, Ref, ShallowRef } from "vue";
import type { EntityId } from "@/types/base";
import { TScenario } from "@/scenariostore";
import { UseFeatureStyles } from "@/geo/featureStyles";
import { SidcModalPromise, TimeModalPromise } from "@/composables/modals";
import { EventHook } from "@vueuse/core";
import { FeatureId } from "@/types/scenarioGeoModels";
import type OLMap from "ol/Map";
import type Select from "ol/interaction/Select";
import { EventSearchResult } from "@/components/types";
import { PhotonSearchResult } from "@/composables/geosearching";
import { ScenarioActions } from "@/types/constants";

export const activeParentKey = Symbol("Active unit") as InjectionKey<
  Ref<EntityId | undefined | null>
>;

export const activeLayerKey = Symbol("Active layer") as InjectionKey<
  Ref<FeatureId | undefined | null>
>;

export const activeScenarioKey = Symbol("Active scenario") as InjectionKey<TScenario>;
export const activeFeatureStylesKey = Symbol(
  "Active feature styles",
) as InjectionKey<UseFeatureStyles>;

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
  onUnitSelectHook: EventHook<{ unitId: EntityId; options?: { noZoom?: boolean } }>;
  onLayerSelectHook: EventHook<{ layerId: FeatureId }>;
  onImageLayerSelectHook: EventHook<{ layerId: FeatureId }>;
  onFeatureSelectHook: EventHook<{ featureId: FeatureId; layerId: FeatureId }>;
  onEventSelectHook: EventHook<EventSearchResult>;
  onPlaceSelectHook: EventHook<PhotonSearchResult>;
  onScenarioActionHook: EventHook<{ action: ScenarioActions }>;
}>;

export const activeMapKey = Symbol("Active map") as InjectionKey<ShallowRef<OLMap>>;
export const activeFeatureSelectInteractionKey = Symbol(
  "Active feature select",
) as InjectionKey<ShallowRef<Select>>;
