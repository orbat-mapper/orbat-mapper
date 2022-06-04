import type { InjectionKey, Ref } from "vue";
import { EntityId } from "../types/base";

export const testKey = Symbol() as InjectionKey<Ref<string>>;
export const activeUnitKey = Symbol() as InjectionKey<Ref<EntityId | undefined | null>>;
