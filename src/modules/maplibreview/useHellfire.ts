import type { Map as MlMap, MapMouseEvent } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import { useUnitActions } from "@/composables/scenarioActions";
import {
  type HellfireImpactAction,
  useMapSettingsStore,
} from "@/stores/mapSettingsStore";
import { setStatus } from "@/symbology/helpers";
import type { NUnit } from "@/types/internalModels";
import { type UnitAction, UnitActions } from "@/types/constants";

const IMPACT_LABELS: Record<HellfireImpactAction, string> = {
  none: "Nothing (just visual)",
  hide: "Hide units",
  removeFromMap: "Remove units from map",
  delete: "Delete units",
  destroyed: "Set destroyed status",
};

export const HELLFIRE_IMPACT_ACTIONS = Object.entries(IMPACT_LABELS).map(
  ([value, label]) => ({ value: value as HellfireImpactAction, label }),
);

/** The symbol status code for a destroyed unit. */
const DESTROYED_STATUS = "4";

export type MapHellfire = ReturnType<typeof useHellfire>;

/**
 * Orbit mode's Hellfire missile, just for fun: a shift-click or the context menu fires one at a
 * point on the map, and the units caught in the blast get the impact action chosen in the map
 * settings, as one undoable change. Locked units shrug it off.
 *
 * Costs nothing while Hellfire is off: it has no map listeners of its own (orbit hands it
 * clicks through `claimClick`), and the animation code only loads on the first launch.
 */
export function useHellfire(
  getMap: () => MlMap | undefined,
  isOrbiting: () => boolean,
  scenario: TScenario,
) {
  const mapSettings = useMapSettingsStore();
  const { store, unitActions } = scenario;

  // The usual unit actions, so a strike's hide and delete behave like the menu's. Set up on
  // first use, so an unused Hellfire holds nothing.
  const onUnitAction = (units: NUnit[], action: UnitAction) =>
    useUnitActions({ activeScenario: scenario }).onUnitAction(units, action);

  const impacts: Record<
    Exclude<HellfireImpactAction, "none">,
    (units: NUnit[]) => void
  > = {
    hide: (units) => onUnitAction(units, UnitActions.Hide),
    delete: (units) => onUnitAction(units, UnitActions.Delete),
    // From now on the units have no location, as the unit panel's "Remove from map" does.
    removeFromMap: (units) =>
      units.forEach((unit) =>
        unitActions.addUnitStateEntry(
          unit.id,
          { t: store.state.currentTime, location: null },
          true,
        ),
      ),
    destroyed: (units) =>
      units.forEach((unit) => {
        const sidc = unit._state?.sidc || unit.sidc;
        const destroyed = setStatus(sidc, DESTROYED_STATUS);
        if (destroyed === sidc) return;
        unitActions.addUnitStateEntry(
          unit.id,
          {
            t: store.state.currentTime,
            sidc: destroyed,
            title: "Destroyed by Hellfire",
          },
          true,
        );
      }),
  };

  function onUnitsHit(unitIds: string[]) {
    const action = mapSettings.hellfireImpactAction;
    if (action === "none") return;
    const units = unitIds
      .map((id) => unitActions.getUnitById(id))
      .filter((unit): unit is NUnit => !!unit && !unitActions.isUnitLocked(unit.id));
    if (units.length) store.groupUpdate(() => impacts[action](units));
  }

  function launch(target: { lng: number; lat: number }) {
    const map = getMap();
    if (!map || !isOrbiting() || !mapSettings.hellfireEnabled) return;
    void import("@/modules/maplibreview/hellfire").then(({ launchHellfire }) =>
      launchHellfire(map, target, onUnitsHit),
    );
  }

  /** Fires at a shift-clicked point while orbiting; returns whether it took the click. */
  function claimClick(event: MapMouseEvent) {
    if (!mapSettings.hellfireEnabled || !event.originalEvent?.shiftKey) return false;
    launch(event.lngLat);
    return true;
  }

  return { launch, claimClick };
}
