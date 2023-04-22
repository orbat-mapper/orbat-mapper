import { EventBusKey } from "@vueuse/core";
import { Unit } from "@/types/scenarioModels";
import type { NUnit } from "@/types/internalModels";

export const orbatUnitClick = Symbol() as EventBusKey<Unit | NUnit>;
export const mapUnitClick = Symbol() as EventBusKey<Unit | NUnit>;
