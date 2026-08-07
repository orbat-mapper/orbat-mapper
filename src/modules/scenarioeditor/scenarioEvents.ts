import { useActiveScenario } from "@/composables/scenarioUtils";
import { useGeoStore } from "@/stores/geoStore";

const SCENARIO_EVENT_UNIT_PADDING: [number, number, number, number] = [
  50, 50, 50, 50,
];

export function useScenarioEvents() {
  const {
    time: { onGoToScenarioEventEvent },
    helpers: { getUnitById },
  } = useActiveScenario();
  const geoStore = useGeoStore();

  onGoToScenarioEventEvent(({ event }) => {
    const where = event.where;
    if (!where) return;
    const { maxZoom } = where;
    if (where.type === "units") {
      const units = where.units.map((u) => getUnitById(u));
      if (units) {
        geoStore.zoomToUnits(units, {
          duration: 900,
          maxZoom,
          padding: SCENARIO_EVENT_UNIT_PADDING,
        });
      }
    } else if (where.type === "geometry") {
      geoStore.zoomToGeometry(where.geometry, { duration: 900, maxZoom });
    }
  });
  return {};
}
