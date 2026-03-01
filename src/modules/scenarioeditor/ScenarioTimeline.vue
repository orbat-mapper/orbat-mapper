<script setup lang="ts">
import { IconTriangleDown } from "@iconify-prerendered/vue-mdi";
import { computed, ref, unref, watch } from "vue";
import { useElementSize, useThrottleFn } from "@vueuse/core";
import { utcDay, utcHour } from "d3-time";
import { utcFormat } from "d3-time-format";
import { interpolateOranges } from "d3-scale-chromatic";
import { scaleSequential } from "d3-scale";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { type NScenarioEvent } from "@/types/internalModels";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import TimelineContextMenu from "@/components/TimelineContextMenu.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { MS_PER_DAY, MS_PER_HOUR } from "@/utils/time";
import {
  buildDayTicksWithStep,
  buildTimelineRenderData,
  buildMonthTicksFromDayRange,
  calculatePixelDateFromViewport,
  cullOverlappingTickLabels,
  getDayTickStepForZoom,
  getMsPerPixel,
  roundToNearestQuarterHour,
  toLocalX,
  type BinWithX,
  type EventWithX,
  type HistogramBin,
  type TimelineAction,
  type TimelineRenderInputs,
} from "./scenarioTimelineMath";

const HOURS_PER_DAY = MS_PER_DAY / MS_PER_HOUR;
const MAJOR_WIDTH_DEFAULT = 100;
const MAJOR_WIDTH_SWITCH_THRESHOLD = 55;
const MAJOR_WIDTH_MIN = 5;
const ZOOM_STEP = 40;

const {
  time: {
    scenarioTime,
    setCurrentTime,
    computeTimeHistogram,
    goToScenarioEvent,
    addScenarioEvent,
  },
  store,
} = useActiveScenario();
const fmt = useTimeFormatStore();

const el = ref<HTMLDivElement | null>(null);
const isPointerInteraction = ref(false);
const isDragging = ref(false);
const redrawCounter = ref(0);
const { width } = useElementSize(el);
const tzOffset = scenarioTime.value.utcOffset();

const hourFormatter = utcFormat("%H");
function getMinorFormatter(majorWidth: number) {
  if (majorWidth < 50) {
    return () => "";
  }
  return hourFormatter;
}

function getMajorFormatter(majorWidth: number) {
  if (majorWidth < 100) {
    return utcFormat("%d %b");
  }
  return utcFormat("%a %d %b");
}

interface Tick {
  label: string;
  timestamp: number;
  width: number;
  showLabel: boolean;
}

const hoveredDate = ref<Date | null>(null);
const majorTicks = ref<Tick[]>([]);
const minorTicks = ref<Tick[]>([]);
const eventsWithX = ref<EventWithX[]>([]);
const binsWithX = ref<BinWithX[]>([]);
const centerTimeStamp = ref(0);
const xOffset = ref(0);
const draggedDiff = ref(0);
const majorWidth = ref(MAJOR_WIDTH_DEFAULT);
const isMonthDayMode = computed(() => majorWidth.value <= MAJOR_WIDTH_SWITCH_THRESHOLD);
const minorStep = computed(() => {
  if (majorWidth.value < 100) {
    return 12;
  }
  if (majorWidth.value < 180) {
    return 6;
  }
  if (majorWidth.value < 300) {
    return 4;
  }
  if (majorWidth.value < 500) {
    return 2;
  }
  return 1;
});

let maxCount = 1;
let histogram: HistogramBin[] = [];

const currentTimestamp = ref(0);
const animate = ref(false);
const hoveredX = ref(0);
const showHoverMarker = ref(false);

const { activeScenarioEventId } = useSelectedItems();

const countColor = scaleSequential(interpolateOranges).domain([1, maxCount]);

const timelineWidth = computed(() => {
  return majorTicks.value.reduce((total, tick) => total + tick.width, 0);
});

const totalXOffset = computed(() => {
  return xOffset.value + draggedDiff.value;
});

function updateTicks(
  centerTime: Date,
  containerWidth: number,
  majorWidth: number,
  minorStep: number,
) {
  const dayPadding = Math.ceil((containerWidth * 2) / majorWidth);
  const currentUtcDay = utcDay.floor(centerTime);
  const start = utcDay.offset(currentUtcDay, -dayPadding);
  const end = utcDay.offset(currentUtcDay, dayPadding);

  const dayRange = utcDay.range(start, end);
  if (isMonthDayMode.value) {
    const monthFormatter = utcFormat("%b %Y");
    majorTicks.value = cullOverlappingTickLabels(
      buildMonthTicksFromDayRange(dayRange, majorWidth, monthFormatter),
    );

    const dayFormatter = utcFormat("%d");
    const dayStep = getDayTickStepForZoom(majorWidth);
    minorTicks.value = cullOverlappingTickLabels(
      buildDayTicksWithStep(dayRange, majorWidth, dayFormatter, dayStep),
    );
  } else {
    const majorFormatter = getMajorFormatter(majorWidth);
    majorTicks.value = dayRange.map((d) => ({
      label: majorFormatter(d),
      timestamp: +d,
      width: majorWidth,
      showLabel: true,
    }));

    const hourRange = utcHour.range(start, end, minorStep);
    const minorFormatter = getMinorFormatter(majorWidth);
    const hourWidth = majorWidth / (HOURS_PER_DAY / minorStep);
    minorTicks.value = hourRange.map((d) => ({
      label: minorFormatter(d),
      timestamp: +d,
      width: hourWidth,
      showLabel: true,
    }));
  }
  return { minDate: start, maxDate: end };
}

function getLocalX(clientX: number) {
  const host = unref(el);
  if (!host) return clientX;
  const rect = host.getBoundingClientRect();
  return toLocalX(clientX, rect.left);
}

function calculatePixelDate(localX: number) {
  return calculatePixelDateFromViewport(localX, {
    centerTimestamp: centerTimeStamp.value,
    viewportWidth: width.value,
    majorWidth: majorWidth.value,
  });
}

let startX = 0;
let accumulatedDrag = 0;
let startTimestamp = 0;

function recomputeTimelineLayout(currentScenarioTimestamp: number) {
  if (!width.value) return;
  const tt = new Date(currentScenarioTimestamp);

  centerTimeStamp.value = currentScenarioTimestamp;
  animate.value = false;
  xOffset.value =
    (tt.getUTCHours() * 60 + tt.getUTCMinutes() + tzOffset + tt.getUTCSeconds() / 60) *
    (majorWidth.value / (HOURS_PER_DAY * 60)) *
    -1;

  const { minDate, maxDate } = updateTicks(
    tt,
    width.value,
    majorWidth.value,
    minorStep.value,
  );
  updateEvents(minDate, maxDate);
}

function onPointerDown(evt: PointerEvent) {
  const e = unref(el)!;
  startX = evt.clientX;
  startTimestamp = scenarioTime.value.valueOf();
  e.setPointerCapture(evt.pointerId);
  isPointerInteraction.value = true;
  isDragging.value = false;
}

function onPointerUp(evt: PointerEvent) {
  const wasDragging = isDragging.value;

  if (!isDragging.value && evt.button !== 2) {
    const { date, diff } = calculatePixelDate(getLocalX(evt.clientX));
    animate.value = true;
    draggedDiff.value = -diff;
    setCurrentTime(roundToNearestQuarterHour(date).valueOf());
  } else {
    animate.value = false;
    draggedDiff.value = 0;
  }

  isPointerInteraction.value = false;
  isDragging.value = false;
  accumulatedDrag = 0;

  if (wasDragging) {
    recomputeTimelineLayout(store.state.currentTime);
  }
}

function onPointerMove(evt: PointerEvent) {
  if (isPointerInteraction.value) {
    const diff = evt.clientX - startX;
    accumulatedDrag += Math.abs(diff);
    if (accumulatedDrag < 5) {
      isDragging.value = false;
      return;
    }

    isDragging.value = true;
    draggedDiff.value = diff;
    currentTimestamp.value = Math.floor(
      startTimestamp - diff * getMsPerPixel(majorWidth.value),
    );
    throttledTimeUpdate(currentTimestamp.value);
  }
}

const throttledTimeUpdate = useThrottleFn(setCurrentTime, 0);

function onHover(e: MouseEvent) {
  updateHoverFromClientX(e.clientX);
}

function updateHoverFromClientX(clientX: number) {
  const localX = getLocalX(clientX);
  const { date } = calculatePixelDate(localX);
  hoveredX.value = localX;
  hoveredDate.value = roundToNearestQuarterHour(date);
}

function onContextMenuOpen(
  event: MouseEvent,
  onContextMenu: (event: MouseEvent) => void,
) {
  updateHoverFromClientX(event.clientX);
  onContextMenu(event);
}

const formattedHoveredDate = computed(() => {
  if (!hoveredDate.value) return "";
  return fmt.scenarioFormatter.format(+hoveredDate.value);
});

function zoomIn() {
  majorWidth.value += ZOOM_STEP;
}

function zoomOut() {
  majorWidth.value = Math.max(majorWidth.value - ZOOM_STEP, MAJOR_WIDTH_MIN);
}

function onWheel(e: WheelEvent) {
  if (e.deltaY > 0) {
    zoomOut();
  } else {
    zoomIn();
  }
}

const events = computed(() => {
  return store.state.events.map((id) => store.state.eventMap[id]);
});

function updateEvents(minDate: Date, maxDate: Date) {
  const renderInputs: TimelineRenderInputs = {
    events: events.value,
    histogram,
    minTimestamp: +minDate,
    maxTimestamp: +maxDate,
    majorWidth: majorWidth.value,
    tzOffsetMinutes: tzOffset,
  };
  const { eventsWithX: renderEvents, binsWithX: renderBins } =
    buildTimelineRenderData(renderInputs);
  eventsWithX.value = renderEvents;
  binsWithX.value = renderBins;
}

watch(
  [() => store.state.unitStateCounter, () => store.state.featureStateCounter],
  () => {
    const { histogram: hg, max: mc } = computeTimeHistogram();
    histogram = hg;
    maxCount = mc;
    redrawCounter.value += 1;
  },
  { immediate: true },
);

watch(events, () => {
  if (!width.value) return;
  if (isDragging.value) return;
  recomputeTimelineLayout(store.state.currentTime);
});

watch(
  [width, () => store.state.currentTime, majorWidth, redrawCounter],
  ([currentWidth, currentScenarioTimestamp]) => {
    if (!currentWidth) return;
    if (isDragging.value) return;

    if (animate.value === true) {
      setTimeout(() => {
        animate.value = false;
        draggedDiff.value = 0;
        recomputeTimelineLayout(store.state.currentTime);
      }, 100);
      return;
    }

    recomputeTimelineLayout(currentScenarioTimestamp);
  },
  { immediate: true },
);

function onEventClick(event: NScenarioEvent) {
  goToScenarioEvent(event);
}

function onContextMenuAction(action: TimelineAction) {
  if (action === "zoomIn") {
    zoomIn();
  } else if (action === "zoomOut") {
    zoomOut();
  } else if (action === "addScenarioEvent") {
    const hovered = hoveredDate.value;
    if (!hovered) return;
    const day = hovered.getDate();
    const eventId = addScenarioEvent({
      title: `Event ${day}`,
      startTime: +hovered,
    });
    activeScenarioEventId.value = eventId;
  }
}
</script>
<template>
  <TimelineContextMenu
    @action="onContextMenuAction"
    v-slot="{ onContextMenu }"
    :formattedHoveredDate="formattedHoveredDate"
  >
    <div
      ref="el"
      data-testid="scenario-timeline"
      class="bg-sidebar border-border relative mb-2 w-full transform overflow-x-hidden border-t text-sm transition-all select-none"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointermove="onPointerMove"
      @wheel="onWheel"
      @mousemove="onHover"
      @mouseenter="showHoverMarker = true"
      @mouseleave="showHoverMarker = false"
      @contextmenu="onContextMenuOpen($event, onContextMenu)"
    >
      <div class="bg-sidebar flex h-3.5 items-center justify-center overflow-clip">
        <IconTriangleDown class="h-4 w-4 scale-x-150 transform text-red-900" />
      </div>
      <div
        class="touch-none text-sm select-none"
        :class="animate ? 'transition-all' : 'transition-none'"
        :style="`transform:translate(${totalXOffset}px)`"
      >
        <div class="flex justify-center">
          <div
            class="relative h-4 flex-none text-center"
            :style="`width: ${timelineWidth}px`"
          >
            <div
              v-for="{ x, count } in binsWithX"
              :key="x"
              class="absolute top-1 h-2 w-4 rounded border border-gray-500"
              :style="`left: ${x}px; width: ${Math.max(
                majorWidth / 24,
                8,
              )}px;background-color: ${countColor(count)}`"
              @mousemove.stop
              :title="`${count} unit events`"
            ></div>
            <button
              v-for="{ x, event } in eventsWithX"
              type="button"
              :key="event.id"
              data-testid="scenario-event-marker"
              class="absolute h-4 w-4 -translate-x-1/2 rounded-full border border-gray-500 bg-amber-500 hover:bg-red-900"
              :style="`left: ${x}px;`"
              @mousemove.stop
              :title="event.title"
              @click.stop="onEventClick(event)"
            />
          </div>
        </div>
        <div class="flex justify-center">
          <div
            class="relative flex-none text-center"
            :style="`width: ${timelineWidth}px`"
          ></div>
        </div>
        <div class="border-muted-foreground flex justify-center">
          <div
            v-for="tick in majorTicks"
            :key="tick.timestamp"
            data-testid="major-tick"
            class="border-muted-foreground flex-none border-r border-b pl-0.5"
            :style="`width: ${tick.width}px`"
          >
            {{ tick.showLabel ? tick.label : "" }}
          </div>
        </div>
        <div class="flex justify-center text-xs">
          <div
            v-for="tick in minorTicks"
            :key="tick.timestamp"
            data-testid="minor-tick"
            class="text-muted-foreground border-muted-foreground min-h-[1rem] flex-none border-r pl-0.5"
            :style="`width: ${tick.width}px`"
          >
            {{ tick.showLabel ? tick.label : "" }}
          </div>
        </div>
      </div>

      <p
        v-if="showHoverMarker && !isDragging"
        class="absolute top-0 right-1 hidden p-0 text-xs text-red-900 select-none sm:block dark:text-red-600"
      >
        {{ formattedHoveredDate }}
      </p>
      <div
        v-if="showHoverMarker"
        class="hover-hover:flex absolute top-0 bottom-0 w-0.5 bg-red-900/50 dark:bg-red-600/50"
        :style="`left: ${hoveredX}px`"
      />
    </div>
  </TimelineContextMenu>
</template>
