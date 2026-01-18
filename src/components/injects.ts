import type { InjectionKey, Ref, ShallowRef } from "vue";
import type { EntityId } from "@/types/base";
import type { TScenario } from "@/scenariostore";
import type { UseFeatureStyles } from "@/geo/featureStyles";
import type { SidcModalPromise, TimeModalPromise } from "@/composables/modals";
import type { EventHook } from "@vueuse/core";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type OLMap from "ol/Map";
import type Select from "ol/interaction/Select";
import type { EventSearchResult } from "@/components/types";
import type { PhotonSearchResult } from "@/composables/geosearching";
import type { ScenarioActions } from "@/types/constants";

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

export const readonlyKey = Symbol("Readonly") as InjectionKey<Ref<boolean>>;
