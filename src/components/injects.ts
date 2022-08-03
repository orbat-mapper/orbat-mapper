import type { InjectionKey, Ref } from "vue";
import type { EntityId } from "@/types/base";
import { TScenario } from "@/scenariostore";
import { UseFeatureStyles } from "@/geo/featureStyles";
import { TimeModalPromise } from "@/composables/modals";
import { SelectedScenarioFeatures } from "@/stores/dragStore";

export const activeUnitKey = Symbol("Active unit") as InjectionKey<
  Ref<EntityId | undefined | null>
>;

export const selectedUnitIdsKey = Symbol("Selected units") as InjectionKey<
  Ref<Set<EntityId>>
>;
export const selectedFeatureIdsKey = Symbol("Selected features") as InjectionKey<
  Ref<SelectedScenarioFeatures>
>;
export const activeScenarioKey = Symbol("Active scenario") as InjectionKey<TScenario>;
export const activeFeaturesKey = Symbol(
  "Active features"
) as InjectionKey<UseFeatureStyles>;

export const currentScenarioTabKey = Symbol("Current scenario tab") as InjectionKey<
  Ref<number>
>;

export const timeModalKey = Symbol("Time modal") as InjectionKey<{
  getModalTimestamp: TimeModalPromise;
}>;
