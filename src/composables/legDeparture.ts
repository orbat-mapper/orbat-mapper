import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { useNotifications } from "@/composables/notifications";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";

/**
 * Asks for the time a leg sets off, so the unit holds at the leg's start until then.
 * The leg is the one that ends at state entry `stateIndex`.
 */
export function useLegDeparturePicker() {
  const { store, unitActions } = injectStrict(activeScenarioKey);
  const { getModalTimestamp } = injectStrict(timeModalKey);
  const { send } = useNotifications();
  const fmt = useTimeFormatStore();

  async function pickLegDeparture(unitId: EntityId, stateIndex: number, title: string) {
    const window = unitActions.getLegDepartureWindow(unitId, stateIndex);
    if (!window) return;
    const { earliest, arrival, departure } = window;
    const now = store.state.currentTime;
    // Start from the current time when it falls on the leg, so scrubbing to the end of
    // the hold first makes this a single confirm.
    const isOnLeg = now < arrival && (earliest === undefined || now > earliest);
    const t = await getModalTimestamp(departure ?? (isOnLeg ? now : (earliest ?? now)), {
      timeZone: store.state.info.timeZone,
      title,
    });
    if (t === undefined) return;
    if (!unitActions.setLegDepartureTime(unitId, stateIndex, t)) {
      send({
        type: "warning",
        message: `The hold must end before the unit is due at the next waypoint (${fmt.scenarioFormatter.format(arrival)})`,
      });
    }
  }

  return { pickLegDeparture };
}
