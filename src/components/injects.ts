import type { InjectionKey, Ref } from "vue";
import { EntityId } from "../types/base";
import { TScenario } from "@/scenariostore";

export const testKey = Symbol() as InjectionKey<Ref<string>>;
export const activeUnitKey = Symbol() as InjectionKey<Ref<EntityId | undefined | null>>;
export const activeScenarioKey = Symbol() as InjectionKey<TScenario>;
