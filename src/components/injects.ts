import type { InjectionKey, Ref } from "vue";
import { EntityId } from "../types/base";
import { TScenario } from "@/scenariostore";

export const testKey = Symbol() as InjectionKey<Ref<string>>;
export const activeUnitKey = Symbol("Active unit") as InjectionKey<
  Ref<EntityId | undefined | null>
>;
export const activeScenarioKey = Symbol("Active scenario") as InjectionKey<TScenario>;
