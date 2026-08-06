/**
 * The commit half of a control-measure **edit** session — the counterpart to
 * `controlMeasureDrawHelpers.ts`, and pure in the same way: no map, no session, just
 * the fold from a settled `ControlMeasure` back onto the stored item.
 *
 * ADR-0006: at most one store write per settled session, so a changed edit is one undo
 * step however many vertex drags it contained. The session owner filters unchanged
 * settles before reaching this helper.
 */
import { cloneControlMeasure } from "@orbat-mapper/control-measures";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import type { TScenario } from "@/scenariostore";
import type {
  NTacticalGraphicLayerItem,
  TacticalGraphicLayerItemUpdate,
  TacticalGraphicOptions,
} from "@/types/scenarioLayerItems";
import { toControlMeasure } from "@/geo/controlMeasures";

/**
 * The edit-start input handed to `surface.edit()`.
 *
 * Cloned off the projection rather than passed straight through: `toControlMeasure` is
 * memoised by item identity and the object it returns is the very one in the current
 * render batch, which tactical-draw's identity render cache keys on. The engine holds
 * the edit-start measure for the life of the session, so it gets its own copy.
 */
export function toEditStartMeasure(item: NTacticalGraphicLayerItem): ControlMeasure {
  return cloneControlMeasure(toControlMeasure(item));
}

/**
 * What a settled edit changes on the stored item.
 *
 * `style` is deliberately absent. The session started from the *resolved* style — the
 * identity/status projections folded into `color`/`strokeDash` — so writing it back
 * would bake a read-time projection into storage, which ADR-0006 forbids. Authored
 * colour is step 16's, and it writes the authored value, not this one.
 *
 * Everything is copied out of the object the engine still holds.
 */
export function toControlMeasureEditUpdate(
  measure: ControlMeasure,
): TacticalGraphicLayerItemUpdate {
  const update: TacticalGraphicLayerItemUpdate = {
    controlPoints: measure.controlPoints.map((position) => [...position] as Position),
  };
  if (measure.options !== undefined) {
    update.options = { ...(measure.options as TacticalGraphicOptions) };
  }
  if (measure.textAmplifiers !== undefined) {
    update.textAmplifiers = { ...measure.textAmplifiers };
  }
  if (measure.amplifierPlacements !== undefined) {
    update.amplifierPlacements = { ...measure.amplifierPlacements };
  }
  return update;
}

export interface ApplyControlMeasureEditOptions {
  /**
   * Record **shape** into `state[]` at the current scenario time instead of writing it
   * top-level. Reuses `isRecordingGeometry` — a control measure's shape is geometry,
   * and a fourth `RecordingMix` member would change the serialized mix shape.
   */
  recordShape?: boolean;
}

/**
 * The one store write a changed, settled edit session performs.
 *
 * With recording off it is a single top-level write. With recording on **shape only**
 * becomes timed: `controlPoints` goes into a `state[]` patch at the current time, while
 * option and amplifier edits stay top-level and timeless — there is no sensible reading
 * of "this graphic was a different *kind of option* at T". The two writes are grouped so
 * a changed session is still exactly one undo step (ADR-0006).
 *
 * Creation deliberately ignores recording, exactly as `addScenarioDrawFeature` does.
 */
export function applyScenarioControlMeasureEdit(
  scenario: TScenario,
  measure: ControlMeasure,
  options: ApplyControlMeasureEditOptions = {},
) {
  const update = toControlMeasureEditUpdate(measure);
  if (!options.recordShape) {
    scenario.geo.updateTacticalGraphic(measure.id, update);
    return;
  }
  const { controlPoints, ...timeless } = update;
  scenario.store.groupUpdate(
    () => {
      if (Object.keys(timeless).length > 0) {
        scenario.geo.updateTacticalGraphic(measure.id, timeless);
      }
      if (controlPoints) {
        scenario.geo.addTacticalGraphicStateControlPoints(measure.id, controlPoints);
      }
    },
    { label: "updateFeatureGeometry", value: measure.id },
  );
}
