import { ref } from "vue";

const selectedWaypointIds = ref<Set<string>>(new Set());

/**
 * Selects a clicked waypoint: on its own, or added to the selection when
 * `additive` (Shift). Clicking a selected waypoint deselects it.
 */
function clickWaypoint(id: string, additive: boolean) {
  const ids = selectedWaypointIds.value;
  if (ids.has(id)) {
    ids.delete(id);
  } else {
    if (!additive) ids.clear();
    ids.add(id);
  }
}

export function useSelectedWaypoints() {
  return {
    selectedWaypointIds,
    clickWaypoint,
  };
}
