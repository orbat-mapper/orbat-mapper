<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { ArrowDownIcon, ArrowUpIcon, ZoomInIcon } from "@lucide/vue";
import { onKeyStroke } from "@vueuse/core";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { storeToRefs } from "pinia";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { getTimeZoneOffset } from "@/geo/utils";
import GridHeaderResizeHandle from "@/modules/grid/GridHeaderResizeHandle.vue";
import {
  timelineChangesColumnLabels,
  useTimelineChangesStore,
  type TimelineChangesLaneColumn,
} from "@/stores/timelineChangesStore";
import { formatDuration, MS_PER_MINUTE } from "@/utils/time";
import TimelineChangeEntity from "./TimelineChangeEntity.vue";
import TimelineChangesNowLine from "./TimelineChangesNowLine.vue";
import { changeKindDotClasses, formatChangeKinds } from "./timelineChangeFormat";
import { changesBetween, changesInBox } from "./laneSelection";
import {
  atStart,
  groupChangesByEntity,
  laneAxisTicks,
  legShiftBounds,
  stateChangeId,
  type ChangeGroup,
  type ChangeMove,
  type TimelineChange,
} from "./timelineChanges";
import { DATE_TIME_PATTERN, useTimelineChangeNames } from "./useTimelineChanges";

const props = defineProps<{
  changes: TimelineChange[];
  axis: [number, number];
  /** A time range to shade, such as the timeline bin the axis is centred on. */
  highlight?: [number, number] | null;
  canRetime: (change: TimelineChange) => boolean;
  /** Whether a lane's unit or map item is selected in the scenario. */
  isLaneSelected?: (lane: ChangeGroup) => boolean;
}>();
const emit = defineEmits<{
  select: [change: TimelineChange];
  /** Adds lanes' units and map items to the selection, or toggles them in it. */
  selectMany: [lanes: ChangeGroup[], mode: "add" | "toggle"];
  zoom: [change: TimelineChange];
  jump: [change: TimelineChange];
  go: [change: TimelineChange];
  retime: [moves: ChangeMove[]];
  /** Moves a leg's start and end by the same time. */
  retimeLeg: [change: TimelineChange, delta: number];
  delete: [changes: TimelineChange[]];
}>();

const LANE_HEIGHT = 28;
const DRAG_THRESHOLD_PX = 3;
const DOUBLE_CLICK_MS = 300;

const labelColumns = (["unit", "side"] as const).map((key) => ({
  key,
  label: timelineChangesColumnLabels[key],
}));

const { time } = useActiveScenario();
const { entityName, sideName, details, formatTime } = useTimelineChangeNames();
const changesStore = useTimelineChangesStore();
const { laneColumns: shown, columnWidths, laneSort } = storeToRefs(changesStore);

/** The label columns left of the lanes, as in the list and with the same widths. */
const columns = computed(() => labelColumns.filter(({ key }) => shown.value[key]));
const labelWidth = computed(() =>
  columns.value.reduce((sum, { key }) => sum + columnWidths.value[key], 0),
);
function columnStyle(key: TimelineChangesLaneColumn) {
  return { width: `${columnWidths.value[key]}px` };
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const sortValue = { unit: entityName, side: sideName };

// Lanes are ordered by their first change, but an edit, such as dragging a lane's first
// change, doesn't reorder them: the order is kept until the axis moves. New lanes go
// last.
let laneOrder = new Map<string, number>();
let laneOrderAxis: [number, number] | null = null;
function inFirstChangeOrder(groups: ChangeGroup[]) {
  if (props.axis !== laneOrderAxis) {
    laneOrderAxis = props.axis;
    laneOrder = new Map(groups.map((g, i) => [g.entityId, i]));
    return groups;
  }
  for (const { entityId } of groups) {
    if (!laneOrder.has(entityId)) laneOrder.set(entityId, laneOrder.size);
  }
  return groups.sort((a, b) => laneOrder.get(a.entityId)! - laneOrder.get(b.entityId)!);
}

/** One lane per unit or map item, in order of first change (changes come sorted), or
 * by a column. Lanes that tie keep their first-change order. */
const lanes = computed(() => {
  const groups = inFirstChangeOrder(groupChangesByEntity(props.changes));
  const sort = laneSort.value;
  if (!sort) return groups;
  const value = sortValue[sort.key];
  const sign = sort.descending ? -1 : 1;
  return groups
    .map((group) => ({ group, value: value(group) }))
    .sort((a, b) => sign * collator.compare(a.value, b.value))
    .map(({ group }) => group);
});

function ariaSort(key: TimelineChangesLaneColumn) {
  if (laneSort.value?.key !== key) return "none";
  return laneSort.value.descending ? "descending" : "ascending";
}

// Only the lanes in view are rendered.
const scrollEl = ref<HTMLElement | null>(null);
const virtualizer = useVirtualizer(
  computed(() => ({
    count: lanes.value.length,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => LANE_HEIGHT,
    getItemKey: (i: number) => lanes.value[i].entityId,
    overscan: 8,
  })),
);
const visibleLanes = computed(() =>
  virtualizer.value
    .getVirtualItems()
    .map(({ index, start }) => ({ start, lane: lanes.value[index] })),
);
const totalHeight = computed(() => virtualizer.value.getTotalSize());

function toPercent(t: number) {
  const [start, end] = props.axis;
  return ((t - start) / (end - start)) * 100;
}
function spanStyle([start, end]: [number, number]) {
  const left = Math.max(toPercent(start), 0);
  return { left: `${left}%`, width: `${Math.min(toPercent(end), 100) - left}%` };
}

// Ticks follow the scenario's local day, using its UTC offset at the axis midpoint.
const ticks = computed(() => {
  const mid = (props.axis[0] + props.axis[1]) / 2;
  const offset = getTimeZoneOffset(mid, time.timeZone.value || "UTC");
  return laneAxisTicks(props.axis, offset * MS_PER_MINUTE);
});
/** When a mark's change happens. A leg's `t` is clamped to the axis it was listed for, so
 * it goes by when the leg sets off. */
function markT(change: TimelineChange) {
  return change.leg?.start ?? change.t;
}
function markTitle(change: TimelineChange) {
  return [
    formatTime(markT(change), DATE_TIME_PATTERN),
    formatChangeKinds(change),
    change.title ? `“${change.title}”` : "",
    ...details(change),
    ...(change.leg
      ? [
          "Click to go to that time. Double-click to also zoom to the unit.",
          props.canRetime(change) ? "Drag to move the leg." : "",
        ]
      : [
          "Cmd/Ctrl-click or Shift-click to select more. Double-click to go to it.",
          props.canRetime(change) ? "Drag, or Alt+arrows, to change the time." : "",
        ]),
  ]
    .filter(Boolean)
    .join("\n");
}

// Names for screen readers, formatted once per change. Starts over when the changes or
// the time zone change.
const markLabelCache = computed(() => {
  void props.changes;
  void time.timeZone.value;
  return new Map<string, string>();
});
function markLabel(change: TimelineChange) {
  let label = markLabelCache.value.get(change.id);
  if (label === undefined) {
    label = `${entityName(change)}: ${formatChangeKinds(change)}, ${formatTime(markT(change), DATE_TIME_PATTERN)}`;
    markLabelCache.value.set(change.id, label);
  }
  return label;
}

// A mark's tooltip is set when the pointer enters it. Formatting every mark's tooltip on
// each render is slow when the axis follows the current time.
function onMarkPointerEnter(event: PointerEvent, change: TimelineChange) {
  (event.currentTarget as HTMLElement).title = drag.value?.moved ? "" : markTitle(change);
}

// When the axis follows the current time, a jump recentres it and moves the mark from
// under the pointer, so a click always waits to see whether it starts a double-click.
let pendingJump: ReturnType<typeof setTimeout> | undefined;
function jumpOnClick(change: TimelineChange) {
  clearTimeout(pendingJump);
  pendingJump = setTimeout(() => emit("jump", change), DOUBLE_CLICK_MS);
}
function onMarkDblClick(event: MouseEvent, change: TimelineChange) {
  clearTimeout(pendingJump);
  emit("go", change.leg ? atPointer(event, change) : change);
}
/** Clicks from the keyboard select and jump at once. Pointer clicks are handled on
 * pointerup, which knows whether the mark was dragged. */
function onMarkClick(event: MouseEvent, change: TimelineChange) {
  if (event.detail !== 0) return;
  if (change.leg) {
    // No pointer to go by, so the leg's start. Its `t` may be clamped to the axis.
    emit("jump", atStart(change));
    return;
  }
  selectOnly(change);
  emit("jump", change);
}
/** A leg with its time moved to where the pointer is on it, to the minute. A leg is a
 * stretch of time, so a click goes to the point clicked, like scrubbing the trip. */
function atPointer(event: MouseEvent, change: TimelineChange): TimelineChange {
  const { leg } = change;
  if (!leg) return change;
  const track = (
    event.currentTarget as HTMLElement
  ).parentElement!.getBoundingClientRect();
  const [start, end] = props.axis;
  const t = start + ((event.clientX - track.left) / track.width) * (end - start);
  const minute = Math.round(t / MS_PER_MINUTE) * MS_PER_MINUTE;
  return { ...change, t: Math.min(Math.max(minute, leg.start), leg.end) };
}
onBeforeUnmount(() => clearTimeout(pendingJump));

function formatDelta(ms: number) {
  return `${ms < 0 ? "−" : "+"}${formatDuration(Math.abs(ms))}`;
}

// State marks can be selected, by click, Cmd/Ctrl-click, Shift-click along a lane, or a
// box drawn over the lanes. Dragging, Delete and Alt+arrows act on all of them.
const selectedIds = ref(new Set<string>());
/** The mark a Shift-click selects from. */
let anchor: TimelineChange | null = null;

const changeById = computed(() => new Map(props.changes.map((c) => [c.id, c])));
/** The selected marks that can be changed. Marks that left the axis are left alone. */
const editableSelection = computed(() =>
  [...selectedIds.value]
    .map((id) => changeById.value.get(id))
    .filter((c): c is TimelineChange => !!c && props.canRetime(c)),
);

function isSelected(change: TimelineChange) {
  return selectedIds.value.has(change.id);
}
function selectOnly(change: TimelineChange) {
  selectedIds.value = new Set([change.id]);
  anchor = change;
}
function onMarkSelectClick(event: PointerEvent, change: TimelineChange) {
  if (event.ctrlKey || event.metaKey) {
    if (!selectedIds.value.delete(change.id)) selectedIds.value.add(change.id);
    anchor = change;
  } else if (event.shiftKey) {
    const lane = lanes.value.find((l) => l.entityId === change.entityId);
    const from = anchor?.entityId === change.entityId ? anchor : change;
    for (const c of lane ? changesBetween(lane, from, change) : [change]) {
      selectedIds.value.add(c.id);
    }
  } else {
    selectOnly(change);
    jumpOnClick(change);
  }
}

/** Moves the editable selection by a time step. */
function nudge(ms: number) {
  const moving = editableSelection.value;
  if (moving.length)
    emit(
      "retime",
      moving.map((change) => ({ change, t: change.t + ms })),
    );
}

function onKeyDown(event: KeyboardEvent) {
  let handled = true;
  if (event.key === "Escape" && box.value) box.value = null;
  else if (event.key === "Escape" && selectedIds.value.size && !drag.value?.moved) {
    selectedIds.value = new Set();
  } else if (
    (event.key === "Delete" || event.key === "Backspace") &&
    editableSelection.value.length
  ) {
    emit("delete", editableSelection.value);
    selectedIds.value = new Set();
  } else if (
    event.altKey &&
    (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
    editableSelection.value.length
  ) {
    const step = event.shiftKey ? MS_PER_MINUTE : 5 * MS_PER_MINUTE;
    nudge(event.key === "ArrowLeft" ? -step : step);
  } else handled = false;
  // Keeps the editor's own shortcuts, such as Delete for the selected units, from also
  // acting on the key.
  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
}

/** Keys reach the lanes once they are clicked, even where clicking a button doesn't
 * focus it. */
function focusLanes() {
  if (!scrollEl.value?.contains(document.activeElement)) {
    scrollEl.value?.focus({ preventScroll: true });
  }
}

// Dragging a mark retimes it, with the rest of the selection if it is selected, and
// keeps it on the axis. Dragging a leg moves its start and end, and its arrival mark,
// between the states around it. Snaps to 5 minutes, or 1 minute with Shift held. Esc
// cancels. A press without movement is a click.
interface Drag {
  change: TimelineChange;
  startX: number;
  msPerPx: number;
  delta: number;
  moved: boolean;
  moving: Set<string>;
}
const drag = ref<Drag | null>(null);

function onMarkPointerDown(event: PointerEvent, change: TimelineChange) {
  if (event.button !== 0) return;
  const mark = event.currentTarget as HTMLElement;
  const trackWidth = mark.parentElement!.getBoundingClientRect().width;
  drag.value = {
    change,
    startX: event.clientX,
    msPerPx: (props.axis[1] - props.axis[0]) / trackWidth,
    delta: 0,
    moved: false,
    moving: new Set(),
  };
  mark.setPointerCapture(event.pointerId);
}
function onMarkPointerMove(event: PointerEvent) {
  const d = drag.value;
  if (!d) return;
  const dx = event.clientX - d.startX;
  if (!d.moved) {
    if (Math.abs(dx) < DRAG_THRESHOLD_PX || !props.canRetime(d.change)) return;
    d.moved = true;
    if (d.change.leg) {
      d.moving = new Set([arrivalId(d.change)]);
    } else {
      // Dragging a mark that isn't selected selects it alone, as in other timelines.
      if (!isSelected(d.change)) selectOnly(d.change);
      d.moving = new Set(editableSelection.value.map((c) => c.id));
    }
    // No tooltip over the mark while it is dragged.
    (event.currentTarget as HTMLElement).title = "";
  }
  const snap = event.shiftKey ? MS_PER_MINUTE : 5 * MS_PER_MINUTE;
  const leg = d.change.leg;
  // A leg snaps by its arrival, a mark by its own time.
  const from = leg ? leg.end : d.change.t;
  const t = Math.round((from + dx * d.msPerPx) / snap) * snap;
  if (leg) {
    const [min, max] = legShiftBounds(leg);
    d.delta = Math.min(Math.max(t - from, min), max);
  } else {
    d.delta = Math.min(Math.max(t, props.axis[0]), props.axis[1]) - from;
  }
}
/** The id of the state mark a leg arrives at. */
function arrivalId(leg: TimelineChange) {
  return stateChangeId(leg.entityId, leg.stateId);
}
function onMarkPointerUp(event: PointerEvent) {
  const d = drag.value;
  drag.value = null;
  if (!d) return;
  if (!d.moved) {
    if (d.change.leg) jumpOnClick(atPointer(event, d.change));
    else onMarkSelectClick(event, d.change);
  } else if (d.change.leg) {
    if (d.delta) emit("retimeLeg", d.change, d.delta);
  } else if (d.delta) {
    const moves = [...d.moving].map((id) => changeById.value.get(id)!).filter(Boolean);
    emit(
      "retime",
      moves.map((change) => ({ change, t: change.t + d.delta })),
    );
  }
}
onKeyStroke("Escape", () => {
  if (drag.value?.moved) drag.value = null;
});

function isMoving(change: TimelineChange) {
  return !!drag.value?.moved && drag.value.moving.has(change.id);
}
function isDragging(change: TimelineChange) {
  return !!drag.value?.moved && drag.value.change.id === change.id;
}
function markTime(change: TimelineChange) {
  return isMoving(change) ? change.t + drag.value!.delta : change.t;
}
function legSpan({ leg }: TimelineChange, delta = 0): [number, number] {
  return [leg!.start + delta, leg!.end + delta];
}

// A drag on the lanes' empty track draws a box that selects the marks in it, adding to
// the selection with Shift or Cmd/Ctrl held. A click there clears the selection.
interface Box {
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
  additive: boolean;
  base: Set<string>;
}
const bodyEl = ref<HTMLElement | null>(null);
const box = ref<Box | null>(null);

function bodyPoint(event: PointerEvent) {
  const rect = bodyEl.value!.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
function onBodyPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;
  focusLanes();
  if ((event.target as Element).closest("button")) return;
  const { x, y } = bodyPoint(event);
  if (x < labelWidth.value) return;
  box.value = {
    startX: x,
    startY: y,
    x,
    y,
    moved: false,
    additive: event.shiftKey || event.ctrlKey || event.metaKey,
    base: new Set(selectedIds.value),
  };
  bodyEl.value!.setPointerCapture(event.pointerId);
}
function onBodyPointerMove(event: PointerEvent) {
  const b = box.value;
  if (!b) return;
  ({ x: b.x, y: b.y } = bodyPoint(event));
  if (!b.moved) {
    if (Math.hypot(b.x - b.startX, b.y - b.startY) < DRAG_THRESHOLD_PX) return;
    b.moved = true;
  }
  const inBox = changesInBox(lanes.value, boxRect(b), {
    laneHeight: LANE_HEIGHT,
    trackLeft: labelWidth.value,
    trackWidth: bodyEl.value!.getBoundingClientRect().width - labelWidth.value,
    axis: props.axis,
  });
  const ids = new Set(b.additive ? b.base : []);
  for (const c of inBox) ids.add(c.id);
  selectedIds.value = ids;
}
function onBodyPointerUp() {
  const b = box.value;
  box.value = null;
  if (b && !b.moved && !b.additive) selectedIds.value = new Set();
}
function boxRect(b: Box) {
  return {
    left: Math.min(b.startX, b.x),
    right: Math.max(b.startX, b.x),
    top: Math.min(b.startY, b.y),
    bottom: Math.max(b.startY, b.y),
  };
}
const boxStyle = computed(() => {
  if (!box.value?.moved) return null;
  const { left, right, top, bottom } = boxRect(box.value);
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${right - left}px`,
    height: `${bottom - top}px`,
  };
});

// Clicking a lane's name selects its unit or map item in the scenario, adding to or
// taking from the selection with Cmd/Ctrl, or selecting the lanes in between with Shift.
let laneAnchor: string | null = null;
function onLaneNameClick(event: MouseEvent, lane: ChangeGroup) {
  if (event.shiftKey && laneAnchor) {
    const ids = lanes.value.map((l) => l.entityId);
    const [a, b] = [ids.indexOf(laneAnchor), ids.indexOf(lane.entityId)].sort(
      (x, y) => x - y,
    );
    if (a >= 0) {
      emit("selectMany", lanes.value.slice(a, b + 1), "add");
      return;
    }
  }
  laneAnchor = lane.entityId;
  if (event.ctrlKey || event.metaKey) emit("selectMany", [lane], "toggle");
  else emit("select", lane.changes[0]);
}
</script>

<template>
  <div
    ref="scrollEl"
    tabindex="-1"
    class="relative min-h-0 flex-1 overflow-y-auto text-xs outline-none"
    @keydown="onKeyDown"
  >
    <div class="bg-muted text-muted-foreground sticky top-0 z-10 flex border-b">
      <div
        v-for="column in columns"
        :key="column.key"
        role="columnheader"
        :aria-sort="ariaSort(column.key)"
        class="relative flex-none px-2 py-1 font-medium"
        :style="columnStyle(column.key)"
      >
        <button
          type="button"
          class="hover:text-foreground flex max-w-full items-center gap-1"
          :title="`Sort by ${column.label.toLowerCase()}`"
          @click="changesStore.toggleLaneSort(column.key)"
        >
          <span class="truncate">{{ column.label }}</span>
          <template v-if="laneSort?.key === column.key">
            <ArrowDownIcon v-if="laneSort.descending" class="size-3 flex-none" />
            <ArrowUpIcon v-else class="size-3 flex-none" />
          </template>
        </button>
        <GridHeaderResizeHandle
          :width="columnWidths[column.key]"
          :aria-label="`Resize ${column.label} column`"
          @update="changesStore.resizeColumn(column.key, $event)"
        />
      </div>
      <div class="relative flex-1 overflow-x-clip">
        <div
          v-if="highlight"
          class="absolute inset-y-0 bg-amber-400/30"
          :style="spanStyle(highlight)"
        />
        <span
          v-for="tick in ticks"
          :key="tick.t"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tabular-nums"
          :class="{ 'text-foreground font-medium': tick.day }"
          :style="{ left: `${toPercent(tick.t)}%` }"
          >{{ tick.label }}</span
        >
      </div>
    </div>
    <div
      ref="bodyEl"
      class="relative select-none"
      :style="{ height: `${totalHeight}px` }"
      @pointerdown="onBodyPointerDown"
      @pointermove="onBodyPointerMove"
      @pointerup="onBodyPointerUp"
      @pointercancel="box = null"
    >
      <div
        v-for="{ start, lane } in visibleLanes"
        :key="lane.entityId"
        class="group hover:bg-accent/40 absolute inset-x-0 flex border-b"
        :class="{ 'bg-accent/60': isLaneSelected?.(lane) }"
        :style="{ top: `${start}px`, height: `${LANE_HEIGHT}px` }"
      >
        <div
          v-if="shown.unit"
          class="flex flex-none items-center gap-1 pr-1"
          :style="columnStyle('unit')"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center self-stretch overflow-hidden pl-2 text-left hover:underline"
            title="Select. Cmd/Ctrl-click or Shift-click to select more."
            @click="onLaneNameClick($event, lane)"
          >
            <TimelineChangeEntity
              :entity-type="lane.entityType"
              :entity-id="lane.entityId"
              :size="14"
            />
          </button>
          <button
            type="button"
            class="hover:bg-accent flex-none rounded p-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            title="Zoom to"
            aria-label="Zoom to"
            @click="emit('zoom', lane.changes[0])"
          >
            <ZoomInIcon class="size-3.5" />
          </button>
        </div>
        <div
          v-if="shown.side"
          class="text-muted-foreground flex-none self-center truncate px-2"
          :style="columnStyle('side')"
        >
          {{ sideName(lane) }}
        </div>
        <div class="relative flex-1 overflow-x-clip">
          <div
            v-if="highlight"
            class="absolute inset-y-0 bg-amber-400/15"
            :style="spanStyle(highlight)"
          />
          <div class="bg-border absolute inset-x-0 top-1/2 h-px" />
          <template v-for="change in lane.changes" :key="change.id">
            <template v-if="change.leg">
              <div
                v-if="isDragging(change)"
                class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full border border-dashed border-cyan-600/70 dark:border-cyan-300/70"
                :style="spanStyle(legSpan(change))"
              />
              <button
                type="button"
                class="absolute top-1/2 h-1.5 -translate-y-1/2 touch-none rounded-full bg-cyan-500/80 hover:bg-cyan-700 dark:bg-cyan-300/70 dark:hover:bg-cyan-300"
                :class="[
                  canRetime(change) ? 'cursor-ew-resize' : 'cursor-pointer',
                  isDragging(change) &&
                    'ring-primary z-10 bg-cyan-700 ring-2 dark:bg-cyan-300',
                ]"
                :style="spanStyle(legSpan(change, isDragging(change) ? drag!.delta : 0))"
                :aria-label="markLabel(change)"
                @pointerenter="onMarkPointerEnter($event, change)"
                @pointerdown="onMarkPointerDown($event, change)"
                @pointermove="onMarkPointerMove"
                @pointerup="onMarkPointerUp"
                @pointercancel="drag = null"
                @click="onMarkClick($event, change)"
                @dblclick="onMarkDblClick($event, change)"
              />
              <div
                v-if="isDragging(change)"
                class="bg-primary text-primary-foreground pointer-events-none absolute -top-0.5 z-20 rounded px-1 whitespace-nowrap tabular-nums"
                :style="{
                  left: `${Math.max(toPercent(change.leg.start + drag!.delta), 0)}%`,
                }"
              >
                {{ formatTime(change.leg.start + drag!.delta) }} →
                {{ formatTime(change.leg.end + drag!.delta) }} ({{
                  formatDelta(drag!.delta)
                }})
              </div>
            </template>
            <button
              v-else
              type="button"
              class="bg-background border-foreground/30 hover:border-foreground absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 touch-none flex-col gap-px rounded-sm border p-0.5 shadow-sm"
              :class="[
                canRetime(change) ? 'cursor-ew-resize' : 'cursor-pointer',
                isDragging(change) ? 'z-10 scale-150' : 'hover:scale-150',
                // Above the moving bars, which can start where a mark is.
                isSelected(change) || isMoving(change)
                  ? 'ring-primary bg-primary/30 z-10 ring-2'
                  : 'z-[2] hover:z-10',
              ]"
              :aria-pressed="isSelected(change)"
              :style="{ left: `${toPercent(markTime(change))}%` }"
              :aria-label="markLabel(change)"
              @pointerenter="onMarkPointerEnter($event, change)"
              @pointerdown="onMarkPointerDown($event, change)"
              @pointermove="onMarkPointerMove"
              @pointerup="onMarkPointerUp"
              @pointercancel="drag = null"
              @click="onMarkClick($event, change)"
              @dblclick="onMarkDblClick($event, change)"
            >
              <span
                v-for="kind in change.kinds"
                :key="kind"
                class="size-1.5 rounded-full"
                :class="changeKindDotClasses[kind]"
              />
            </button>
            <div
              v-if="isMoving(change)"
              class="border-primary/60 absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-dashed"
              :style="{ left: `${toPercent(change.t)}%` }"
            />
            <div
              v-if="isDragging(change) && !change.leg"
              class="bg-primary text-primary-foreground pointer-events-none absolute -top-0.5 z-20 ml-3 rounded px-1 whitespace-nowrap tabular-nums"
              :style="{ left: `${toPercent(markTime(change))}%` }"
            >
              {{ formatTime(markTime(change)) }} ({{ formatDelta(drag!.delta) }})
              <template v-if="drag!.moving.size > 1">
                · {{ drag!.moving.size }} changes
              </template>
            </div>
          </template>
        </div>
      </div>
      <div
        class="pointer-events-none absolute inset-y-0 right-0"
        :style="{ left: `${labelWidth}px` }"
      >
        <TimelineChangesNowLine :axis="axis" />
      </div>
      <div
        v-if="boxStyle"
        class="border-primary bg-primary/10 pointer-events-none absolute z-20 border"
        :style="boxStyle"
      />
    </div>
    <!-- After the lanes, such as what to show when there are none. -->
    <slot />
  </div>
</template>
