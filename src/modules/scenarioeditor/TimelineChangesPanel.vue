<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { Columns3Icon, PanelBottomIcon, PictureInPicture2Icon, XIcon } from "@lucide/vue";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  timelineChangesColumnLabels,
  useTimelineChangesStore,
  type TimelineChangesListColumn,
  type TimelineChangesView,
} from "@/stores/timelineChangesStore";
import type { EntityId } from "@/types/base";
import TimelineChangesEnd from "./TimelineChangesEnd.vue";
import TimelineChangesLanes from "./TimelineChangesLanes.vue";
import TimelineChangesList from "./TimelineChangesList.vue";
import { changeKindDotClasses, changeKindLabels } from "./timelineChangeFormat";
import {
  countChangeKinds,
  type ChangeKind,
  type ChangeMove,
  type TimelineChange,
} from "./timelineChanges";
import {
  DATE_TIME_PATTERN,
  useTimelineChangeActions,
  useTimelineChangeNames,
  useTimelineChanges,
} from "./useTimelineChanges";

const MIN_HEIGHT = 120;
const MAX_HEIGHT_FRACTION = 0.75;

const changesStore = useTimelineChangesStore();
const {
  centerT,
  view,
  panelMode,
  panelHeight,
  windowHours,
  includeMoving,
  onlyInView,
  listColumns,
  laneColumns,
} = storeToRefs(changesStore);

const {
  now,
  range,
  binRange,
  changes,
  laneChanges,
  events,
  findBeforeRange,
  findAfterRange,
} = useTimelineChanges();
const {
  select,
  selectMany,
  isSelected,
  jumpTo,
  goTo,
  canRetime,
  retime,
  retimeLeg,
  deleteStates,
  jumpToEvent,
  selectEvent,
  goToEvent,
} = useTimelineChangeActions();
const { entityName, formatTime } = useTimelineChangeNames();

const nameFilter = ref("");
const hiddenKinds = ref(new Set<ChangeKind>());
const showEvents = ref(true);

const nameQuery = computed(() => nameFilter.value.trim().toLowerCase());
function passesFilters(change: TimelineChange) {
  return (
    change.kinds.some((k) => !hiddenKinds.value.has(k)) &&
    (!nameQuery.value || entityName(change).toLowerCase().includes(nameQuery.value))
  );
}

const kindCounts = computed(() => [...countChangeKinds(changes.value)]);
const listedChanges = computed(() => changes.value.filter(passesFilters));
// Scenario events have no lane: they are listed, or drawn as lines across the lanes.
const listedEvents = computed(() =>
  showEvents.value
    ? events.value.filter(
        (e) => !nameQuery.value || e.title.toLowerCase().includes(nameQuery.value),
      )
    : [],
);

// A unit retimed from the lanes stays in view even if its change left the range, so its
// lane doesn't vanish under the pointer. Cleared when the window is recentred.
const pinnedEntityIds = ref(new Set<EntityId>());
watch(centerT, () => pinnedEntityIds.value.clear());

const laneEntityIds = computed(
  () =>
    new Set([...listedChanges.value.map((c) => c.entityId), ...pinnedEntityIds.value]),
);
const laneChangesShown = computed(() =>
  laneChanges.value.filter(
    (c) => laneEntityIds.value.has(c.entityId) && passesFilters(c),
  ),
);

/** The column settings of the current view. */
const viewColumns = computed<Record<string, boolean>>(() =>
  view.value === "lanes" ? laneColumns.value : listColumns.value,
);
function isLastShownColumn(key: string) {
  return (
    viewColumns.value[key] &&
    Object.values(viewColumns.value).filter(Boolean).length === 1
  );
}

const isEmpty = computed(() =>
  view.value === "lanes"
    ? !laneChangesShown.value.length
    : !listedChanges.value.length && !listedEvents.value.length,
);
const hiddenCount = computed(
  () =>
    changes.value.length -
    listedChanges.value.length +
    events.value.length -
    listedEvents.value.length,
);
/** The changes either side of the range, so an empty stretch isn't a dead end. */
const previousChange = computed(() => findBeforeRange(passesFilters));
const nextChange = computed(() => findAfterRange(passesFilters));

function clearFilters() {
  nameFilter.value = "";
  hiddenKinds.value.clear();
  showEvents.value = true;
}

/** Moves the scenario time to a change, with the window following it. */
function goToChange(change: TimelineChange) {
  changesStore.followNow();
  jumpTo(change);
}

function toggleKind(kind: ChangeKind) {
  if (!hiddenKinds.value.delete(kind)) hiddenKinds.value.add(kind);
}

function onRetime(moves: ChangeMove[]) {
  for (const { change } of moves) pinnedEntityIds.value.add(change.entityId);
  retime(moves);
}

function onRetimeLeg(change: TimelineChange, delta: number) {
  pinnedEntityIds.value.add(change.entityId);
  retimeLeg(change, delta);
}

// Dragging the top edge resizes the panel. The height is saved when the drag ends, not
// on every move.
const resizeHeight = ref<number | null>(null);
const isResizing = computed(() => resizeHeight.value !== null);
let resizeStartY = 0;

function clampHeight(height: number) {
  const max = window.innerHeight * MAX_HEIGHT_FRACTION;
  return Math.round(Math.min(Math.max(height, MIN_HEIGHT), max));
}
function onResizePointerDown(event: PointerEvent) {
  resizeHeight.value = panelHeight.value;
  resizeStartY = event.clientY;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}
function onResizePointerMove(event: PointerEvent) {
  if (resizeHeight.value === null) return;
  resizeHeight.value = clampHeight(panelHeight.value + resizeStartY - event.clientY);
}
function onResizeEnd() {
  if (resizeHeight.value === null) return;
  panelHeight.value = resizeHeight.value;
  resizeHeight.value = null;
}

function togglePanelMode() {
  panelMode.value = panelMode.value === "overlay" ? "docked" : "overlay";
}

const binLabel = computed(
  () =>
    binRange.value &&
    `${formatTime(binRange.value[0], DATE_TIME_PATTERN)}–${formatTime(binRange.value[1])}`,
);
const rangeLabel = computed(
  () =>
    `${formatTime(range.value[0], DATE_TIME_PATTERN)} – ${formatTime(range.value[1], DATE_TIME_PATTERN)}`,
);
</script>

<template>
  <section
    data-testid="timeline-changes-panel"
    aria-label="Unit changes"
    class="border-border flex flex-col border-t text-sm"
    :class="
      panelMode === 'overlay'
        ? 'bg-background/95 absolute inset-x-0 bottom-full z-40 shadow-lg backdrop-blur'
        : 'bg-background relative'
    "
    :style="{ height: `${resizeHeight ?? panelHeight}px` }"
    @pointerdown.stop
    @wheel.stop
  >
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize panel"
      class="absolute inset-x-0 -top-1 z-20 h-2 cursor-row-resize"
      :class="isResizing ? 'bg-primary/40' : 'hover:bg-primary/30'"
      @pointerdown="onResizePointerDown"
      @pointermove="onResizePointerMove"
      @pointerup="onResizeEnd"
      @pointercancel="onResizeEnd"
    />
    <header class="flex flex-col gap-1.5 border-b px-3 py-1.5 text-xs">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="text-sm font-semibold">Unit changes</h3>
        <ToggleGroup
          :model-value="view"
          type="single"
          variant="outline"
          size="sm"
          aria-label="View"
          @update:model-value="(v) => v && (view = v as TimelineChangesView)"
        >
          <ToggleGroupItem value="list" class="h-6 px-2 text-xs">List</ToggleGroupItem>
          <ToggleGroupItem value="lanes" class="h-6 px-2 text-xs">Lanes</ToggleGroupItem>
        </ToggleGroup>
        <NativeSelect
          v-model.number="windowHours"
          aria-label="Time window"
          class="h-6 py-0 pr-7 pl-2 text-xs"
        >
          <NativeSelectOption :value="1">±1 h</NativeSelectOption>
          <NativeSelectOption :value="3">±3 h</NativeSelectOption>
          <NativeSelectOption :value="12">±12 h</NativeSelectOption>
          <NativeSelectOption :value="24">±24 h</NativeSelectOption>
          <NativeSelectOption :value="48">±2 d</NativeSelectOption>
          <NativeSelectOption :value="168">±7 d</NativeSelectOption>
        </NativeSelect>
        <!-- Kept ahead of the range label and kind chips, whose widths change while
           scrubbing, so the checkboxes stay put. -->
        <label
          class="flex items-center gap-1.5"
          title="Show units travelling between positions: trips under way when the time range starts, and when trips that start in it arrive. Lanes draw each trip as a bar."
        >
          <Checkbox v-model="includeMoving" />
          Trips
        </label>
        <label class="flex items-center gap-1.5">
          <Checkbox v-model="onlyInView" />
          Only in map view
        </label>
        <span
          v-if="binLabel"
          class="rounded bg-amber-400/30 px-1.5 tabular-nums"
          title="The timeline bin the window is centred on"
        >
          Bin {{ binLabel }}
        </span>
        <button
          v-if="centerT !== null"
          type="button"
          class="hover:bg-accent rounded border px-2 py-0.5"
          title="Show the changes around the current time"
          @click="changesStore.followNow()"
        >
          Back to now
        </button>
        <span class="text-muted-foreground tabular-nums">
          {{ rangeLabel }} · {{ listedChanges.length }} of {{ changes.length }}
        </span>
        <div class="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="hover:bg-accent rounded p-1" title="Columns">
                <Columns3Icon class="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel class="text-xs">Columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                v-for="(isShown, key) in viewColumns"
                :key="key"
                :model-value="isShown"
                :disabled="isLastShownColumn(key)"
                class="text-xs"
                @update:model-value="viewColumns[key] = !!$event"
                @select.prevent
              >
                {{ timelineChangesColumnLabels[key as TimelineChangesListColumn] }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            class="hover:bg-accent rounded p-1"
            :title="panelMode === 'overlay' ? 'Dock below the map' : 'Float over the map'"
            @click="togglePanelMode"
          >
            <PanelBottomIcon v-if="panelMode === 'overlay'" class="size-4" />
            <PictureInPicture2Icon v-else class="size-4" />
          </button>
          <button
            type="button"
            class="hover:bg-accent rounded p-1"
            title="Close"
            @click="changesStore.close()"
          >
            <XIcon class="size-4" />
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="[kind, count] in kindCounts"
            :key="kind"
            type="button"
            class="inline-flex items-center gap-1 rounded-full border px-1.5 tabular-nums"
            :class="hiddenKinds.has(kind) ? 'line-through opacity-40' : ''"
            :aria-pressed="!hiddenKinds.has(kind)"
            :title="hiddenKinds.has(kind) ? 'Show' : 'Hide'"
            @click="toggleKind(kind)"
          >
            <span class="size-1.5 rounded-full" :class="changeKindDotClasses[kind]" />
            {{ changeKindLabels[kind] }} {{ count }}
          </button>
          <button
            v-if="events.length"
            type="button"
            class="inline-flex items-center gap-1 rounded-full border px-1.5 tabular-nums"
            :class="showEvents ? '' : 'line-through opacity-40'"
            :aria-pressed="showEvents"
            :title="showEvents ? 'Hide scenario events' : 'Show scenario events'"
            @click="showEvents = !showEvents"
          >
            <span class="size-2 rounded-full border border-gray-500 bg-amber-500" />
            Events {{ events.length }}
          </button>
        </div>
        <Input
          v-model="nameFilter"
          placeholder="Filter by name…"
          aria-label="Filter by name"
          class="ml-auto h-6 w-40 text-xs"
        />
      </div>
    </header>
    <TimelineChangesLanes
      v-if="view === 'lanes'"
      :changes="laneChangesShown"
      :axis="range"
      :highlight="binRange"
      :can-retime="canRetime"
      :is-lane-selected="isSelected"
      :events="listedEvents"
      @select="(c) => select(c)"
      @select-many="selectMany"
      @zoom="(c) => select(c, { zoom: true })"
      @delete="deleteStates"
      @jump="jumpTo"
      @go="goTo"
      @retime="onRetime"
      @retime-leg="onRetimeLeg"
      @jump-event="jumpToEvent"
      @go-event="goToEvent"
    >
      <TimelineChangesEnd
        :empty="isEmpty"
        :hidden-count="hiddenCount"
        :previous="previousChange"
        :next="nextChange"
        @clear-filters="clearFilters"
        @go="goToChange"
      />
    </TimelineChangesLanes>
    <TimelineChangesList
      v-else
      :changes="listedChanges"
      :events="listedEvents"
      :now="now"
      :highlight="binRange"
      @select="(c) => select(c)"
      @jump="jumpTo"
      @go="goTo"
      @select-event="selectEvent"
      @jump-event="jumpToEvent"
      @go-event="goToEvent"
    >
      <TimelineChangesEnd
        :empty="isEmpty"
        :hidden-count="hiddenCount"
        :previous="previousChange"
        :next="nextChange"
        @clear-filters="clearFilters"
        @go="goToChange"
      />
    </TimelineChangesList>
  </section>
</template>
