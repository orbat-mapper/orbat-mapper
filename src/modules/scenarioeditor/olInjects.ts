import type { InjectionKey, ShallowRef } from "vue";
import type OLMap from "ol/Map";
import type Select from "ol/interaction/Select";

/**
 * Temporary escape hatch during scenario editor migration.
 * Prefer activeScenarioMapEngineKey with `engine.map.getNativeMap()` instead.
 * This injection key will be removed once the migration is complete.
 */
export const activeNativeMapKey = Symbol("Active native map") as InjectionKey<
  ShallowRef<OLMap>
>;

export const activeFeatureSelectInteractionKey = Symbol(
  "Active feature select",
) as InjectionKey<ShallowRef<Select>>;
