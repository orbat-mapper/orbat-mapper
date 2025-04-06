import type { EventBusKey } from "@vueuse/core";
import type { Unit } from "@/types/scenarioModels";
import type { NUnit } from "@/types/internalModels";
import { type FeatureId } from "@/types/scenarioGeoModels";

export const orbatUnitClick = Symbol() as EventBusKey<Unit | NUnit>;
export const mapUnitClick = Symbol() as EventBusKey<Unit | NUnit>;
export const imageLayerAction = Symbol() as EventBusKey<{
  action: "zoom" | "startTransform" | "endTransform";
  id: FeatureId;
}>;
