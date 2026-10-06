import { defineStore } from "pinia";
import { ref } from "vue";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";

export type TimelineChangesView = "list" | "lanes";
export type TimelineChangesPanelMode = "overlay" | "docked";
export type TimelineChangesListColumn = "time" | "unit" | "side" | "changes";
export type TimelineChangesLaneColumn = "unit" | "side";
export type TimelineChangesResizableColumn = "time" | "unit" | "side";
export const timelineChangesColumnLabels: Record<TimelineChangesListColumn, string> = {
  time: "Time",
  unit: "Unit",
  side: "Side",
  changes: "What changed",
};
export interface TimelineChangesLaneSort {
  key: TimelineChangesLaneColumn;
  descending: boolean;
}

const MIN_COLUMN_WIDTH = 60;

/** State of the timeline changes panel, which lists the unit changes in a window around
 * the current time, or around a time picked on the timeline. View preferences persist
 * per browser. */
export const useTimelineChangesStore = defineStore("timelineChanges", () => {
  const isOpen = ref(false);
  /** The time the window is centred on, such as a clicked timeline bin. Null follows the
   * current time. */
  const centerT = ref<number | null>(null);
  const windowHours = ref(24);

  const view = useLocalStorage<TimelineChangesView>("timelineChanges.view", "list");
  const panelMode = useLocalStorage<TimelineChangesPanelMode>(
    "timelineChanges.panelMode",
    "overlay",
  );
  const panelHeight = useLocalStorage("timelineChanges.panelHeight", 288);
  const includeMoving = useLocalStorage("timelineChanges.includeMoving", false);
  const onlyInView = useLocalStorage("timelineChanges.onlyInView", false);
  /** The columns shown in each view. */
  const listColumns = useLocalStorage<Record<TimelineChangesListColumn, boolean>>(
    "timelineChanges.listColumns",
    { time: true, unit: true, side: true, changes: true },
    { mergeDefaults: true },
  );
  const laneColumns = useLocalStorage<Record<TimelineChangesLaneColumn, boolean>>(
    "timelineChanges.laneColumns",
    { unit: true, side: false },
    { mergeDefaults: true },
  );
  /** How the lanes are sorted. Null keeps them in order of their first change. */
  const laneSort = useLocalStorage<TimelineChangesLaneSort | null>(
    "timelineChanges.laneSort",
    null,
    { serializer: StorageSerializers.object },
  );
  /** Sorts the lanes by a column: ascending, then descending, then unsorted. */
  function toggleLaneSort(key: TimelineChangesLaneColumn) {
    const sort = laneSort.value;
    if (sort?.key !== key) laneSort.value = { key, descending: false };
    else if (!sort.descending) laneSort.value = { key, descending: true };
    else laneSort.value = null;
  }
  /** Widths in px of the resizable columns, shared by the list and the lanes. "What
   * changed" and the lanes' track take the rest. */
  const columnWidths = useLocalStorage<Record<TimelineChangesResizableColumn, number>>(
    "timelineChanges.columnWidths",
    { time: 112, unit: 220, side: 160 },
    { mergeDefaults: true },
  );
  function resizeColumn(key: TimelineChangesResizableColumn, width: number) {
    columnWidths.value[key] = Math.max(Math.round(width), MIN_COLUMN_WIDTH);
  }

  /** Shows the changes around a time, without moving the scenario time, or closes the
   * panel if it already does. Null is the current time. */
  function toggle(t: number | null) {
    if (isOpen.value && centerT.value === t) {
      close();
      return;
    }
    centerT.value = t;
    isOpen.value = true;
  }

  function followNow() {
    centerT.value = null;
  }

  function close() {
    isOpen.value = false;
    centerT.value = null;
  }

  return {
    isOpen,
    centerT,
    windowHours,
    view,
    panelMode,
    panelHeight,
    includeMoving,
    onlyInView,
    listColumns,
    laneColumns,
    columnWidths,
    resizeColumn,
    laneSort,
    toggleLaneSort,
    toggle,
    followNow,
    close,
  };
});
