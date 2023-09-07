import { useActiveScenario } from "@/composables/scenarioUtils";
import OLMap from "ol/Map";
import { useGeoStore } from "@/stores/geoStore";

export function useScenarioEvents(olMap: OLMap) {
  const {
    time: { onGoToScenarioEventEvent },
    store: { state },
  } = useActiveScenario();
  const geoStore = useGeoStore();

  onGoToScenarioEventEvent(({ event }) => {
    const where = event.where;
    if (!where) return;
    if (where.type === "units") {
      const units = where.units.map((u) => state.getUnitById(u));
      if (units) {
        geoStore.zoomToUnits(units, 900);
      }
    }
  });
  return {};
}
