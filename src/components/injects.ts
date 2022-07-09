import type { InjectionKey, Ref } from "vue";
import { EntityId } from "../types/base";
import { TScenario } from "@/scenariostore";
import { UseFeatureStyles } from "@/geo/featureStyles";

export const activeUnitKey = Symbol("Active unit") as InjectionKey<
  Ref<EntityId | undefined | null>
>;
export const activeScenarioKey = Symbol("Active scenario") as InjectionKey<TScenario>;
export const activeFeaturesKey = Symbol(
  "Active features"
) as InjectionKey<UseFeatureStyles>;
