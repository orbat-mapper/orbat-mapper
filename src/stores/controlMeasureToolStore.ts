import { defineStore } from "pinia";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import { SID } from "@/symbology/values";
import type { NewControlMeasureDefaults } from "@/modules/scenarioeditor/controlMeasureDrawHelpers";

/**
 * The kinds the draw toolbar shows as buttons before the user has picked anything.
 * A starting point, not a policy: the list is most-recently-used from the first pick.
 */
export const DEFAULT_PINNED_CONTROL_MEASURE_KINDS: ControlMeasureId[] = [
  "phase-line",
  "boundary",
  "main-attack",
  "area",
];

/** The sub-toolbar is one horizontal strip shared with the plain draw tools. */
export const MAX_PINNED_CONTROL_MEASURE_KINDS = 6;

/**
 * What a newly drawn control measure is born with before the user has changed
 * anything. Friend rather than Pending: a control measure is nearly always part of
 * one's own plan, and Pending yellow is the least useful thing to have to change on
 * every graphic.
 */
export const DEFAULT_NEW_CONTROL_MEASURE_DEFAULTS: NewControlMeasureDefaults = {
  standardIdentity: SID.Friend,
  colorMode: "identity",
  status: "present",
};

/**
 * Session-sticky UI state for the control-measure tools — pinned kinds and authoring
 * defaults are toolbar preferences, not scenario data, so they are never persisted into
 * a scenario and never reset when the `v-if`'d draw toolbar remounts.
 *
 * `defaults.style` is the *authored* style a new graphic may be born with. It is kept
 * ungated here and narrowed per kind on the way out (`newControlMeasureDefaults`), so a
 * colour picked for a polygon stays remembered while the user draws a phase line in
 * between.
 */
export const useControlMeasureToolStore = defineStore("controlMeasureTool", {
  state: () => ({
    pinnedKinds: [...DEFAULT_PINNED_CONTROL_MEASURE_KINDS] as ControlMeasureId[],
    defaults: { ...DEFAULT_NEW_CONTROL_MEASURE_DEFAULTS } as NewControlMeasureDefaults,
  }),
  actions: {
    /**
     * Merge a patch into the defaults. An explicitly `undefined` value clears the
     * field, which is how the styling UI resets an authored colour back to the
     * identity projection.
     */
    setDefaults(patch: NewControlMeasureDefaults) {
      this.defaults = { ...this.defaults, ...patch };
    },
    /**
     * Pin a kind, most-recently-used first, evicting the least recently used once the
     * strip is full. Re-pinning an already pinned kind just moves it to the front.
     */
    pinKind(kind: ControlMeasureId) {
      this.pinnedKinds = [
        kind,
        ...this.pinnedKinds.filter((pinned) => pinned !== kind),
      ].slice(0, MAX_PINNED_CONTROL_MEASURE_KINDS);
    },
    unpinKind(kind: ControlMeasureId) {
      this.pinnedKinds = this.pinnedKinds.filter((pinned) => pinned !== kind);
    },
    togglePinnedKind(kind: ControlMeasureId) {
      if (this.pinnedKinds.includes(kind)) this.unpinKind(kind);
      else this.pinKind(kind);
    },
  },
});
