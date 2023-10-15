import { ref } from "vue";

const selectedWaypointIds = ref<Set<string>>(new Set());

export function useSelectedWaypoints() {
  return {
    selectedWaypointIds,
  };
}
