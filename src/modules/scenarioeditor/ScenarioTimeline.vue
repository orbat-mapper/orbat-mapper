<script setup lang="ts">
import { IconTriangleDown } from "@iconify-prerendered/vue-mdi";
import { computed, ref, unref, watch, watchEffect } from "vue";
import { useElementSize, useThrottleFn } from "@vueuse/core";
import { utcDay, utcHour } from "d3-time";
import { utcFormat } from "d3-time-format";
import { interpolateOranges } from "d3-scale-chromatic";
import { scaleSequential } from "d3-scale";
import dayjs from "dayjs";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { NScenarioEvent } from "@/types/internalModels";

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const {
  time: {
    scenarioTime,
    setCurrentTime,
    timeZone,
    computeTimeHistogram,
    goToScenarioEvent,
  },
  store,
} = useActiveScenario();

const el = ref<HTMLDivElement | null>(null);
const isPointerInteraction = ref(false);
const isDragging = ref(false);
const redrawCounter = ref(0);
const { width } = useElementSize(el);
const tzOffset = scenarioTime.value.utcOffset();

const hourFormatter = utcFormat("%H");
function getMinorFormatter(majorWidth: number) {
  if (majorWidth < 50) {
    return (d: Date) => "";
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
}

interface EventWithX {
  x: number;
  event: NScenarioEvent;
}

interface BinWithX {
  x: number;
  count: number;
}

const hoveredDate = ref<Date | null>(null);
const majorTicks = ref<Tick[]>([]);
const minorTicks = ref<Tick[]>([]);
const eventsWithX = ref<EventWithX[]>([]);
const binsWithX = ref<BinWithX[]>([]);
const centerTimeStamp = ref(0);
const xOffset = ref(0);
const draggedDiff = ref(0);
const majorWidth = ref(100);
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
let histogram: { t: number; count: number }[] = [];

const minorWidth = computed(() => majorWidth.value / (24 / minorStep.value));
const currentTimestamp = ref(0);
const animate = ref(false);
const hoveredX = ref(0);
const showHoverMarker = ref(false);

const countColor = scaleSequential(interpolateOranges).domain([1, maxCount]);

const timelineWidth = computed(() => {
  return majorTicks.value.length * majorWidth.value;
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
  const majorFormatter = getMajorFormatter(majorWidth);
  majorTicks.value = dayRange.map((d) => ({
    label: majorFormatter(d),
    timestamp: +d,
  }));

  const hourRange = utcHour.range(start, end, minorStep);
  const minorFormatter = getMinorFormatter(majorWidth);
  minorTicks.value = hourRange.map((d) => ({
    label: minorFormatter(d),
    timestamp: +d,
  }));
  return { minDate: start, maxDate: end };
}

function calculatePixelDate(x: number) {
  const center = width.value / 2;
  const msPerPixel = (MS_PER_HOUR * 24) / majorWidth.value;
  const diff = x - center;
  const newDate = centerTimeStamp.value + diff * msPerPixel;
  const date = new Date(newDate);
  date.setUTCSeconds(0, 0);
  return { date, diff };
}

let startX = 0;
let accumulatedDrag = 0;
let startTimestamp = 0;

function onPointerDown(evt: PointerEvent) {
  const e = unref(el)!;
  startX = evt.clientX;
  startTimestamp = scenarioTime.value.valueOf();
  e.setPointerCapture(evt.pointerId);
  isPointerInteraction.value = true;
  isDragging.value = false;
}

function onPointerUp(evt: PointerEvent) {
  if (!isDragging.value && evt.button !== 2) {
    const { date, diff } = calculatePixelDate(evt.clientX);
    animate.value = true;
    draggedDiff.value = -diff;
    // round to the nearest 15 minutes
    date.setUTCMinutes(Math.round(date.getUTCMinutes() / 15) * 15);
    setCurrentTime(date.valueOf());
  } else {
    animate.value = false;
    draggedDiff.value = 0;
  }
  isPointerInteraction.value = false;
  isDragging.value = false;
  accumulatedDrag = 0;
}

function onPointerMove(evt: PointerEvent) {
  if (isPointerInteraction.value) {
    const diff = evt.clientX - startX;
    accumulatedDrag += Math.abs(diff);
    if (accumulatedDrag < 5) {
      isDragging.value = false;
      return;
    } else {
      isDragging.value = true;
    }
    draggedDiff.value = diff;
    const msPerPixel = (MS_PER_HOUR * 24) / majorWidth.value;
    currentTimestamp.value = Math.floor(startTimestamp - diff * msPerPixel);
    throttledTimeUpdate(currentTimestamp.value);
  }
}

const throttledTimeUpdate = useThrottleFn(setCurrentTime, 0);

function onHover(e: MouseEvent) {
  const { date } = calculatePixelDate(e.clientX);
  // round to the nearest 15 minutes
  date.setUTCMinutes(Math.round(date.getUTCMinutes() / 15) * 15);
  hoveredX.value = e.clientX;
  hoveredDate.value = date;
}

const formattedHoveredDate = computed(() => {
  return dayjs.utc(hoveredDate.value).tz(timeZone.value).format("YYYY-MM-DDTHH:mm:ss");
});

function onWheel(e: WheelEvent) {
  if (e.deltaY > 0) {
    majorWidth.value -= 40;
  } else {
    majorWidth.value += 40;
  }
}

const events = computed(() => store.state.events.map((id) => store.state.eventMap[id]));

function updateEvents(minDate: Date, maxDate: Date) {
  const minTs = +minDate;
  const maxTs = +maxDate;
  const msPerPixel = majorWidth.value / (MS_PER_HOUR * 24);
  eventsWithX.value = events.value
    .filter((e) => {
      return e.startTime >= minTs && e.startTime <= maxTs;
    })
    .map((event) => {
      return { x: (event.startTime - minTs + tzOffset * 60 * 1000) * msPerPixel, event };
    });
  binsWithX.value = histogram
    .filter((bin) => {
      return bin.t >= minTs && bin.t <= maxTs;
    })
    .map((event) => ({
      x: (event.t - minTs + tzOffset * 60 * 1000) * msPerPixel,
      count: event.count,
    }));
}

watch(
  () => store.state.unitStateCounter,
  () => {
    const { histogram: hg, max: mc } = computeTimeHistogram();
    histogram = hg;
    maxCount = mc;
    redrawCounter.value += 1;
  },
  { immediate: true },
);

watchEffect(() => {
  if (!width.value) return;
  const currentScenarioTimestamp = store.state.currentTime;
  redrawCounter.value;
  const tt = new Date(currentScenarioTimestamp);
  let redrawTimeline = false;
  if (isDragging.value) {
  } else if (animate.value === true) {
    setTimeout(() => {
      animate.value = false;
      draggedDiff.value = 0;
    }, 100);
  } else {
    redrawTimeline = true;
  }
  if (redrawTimeline) {
    centerTimeStamp.value = currentScenarioTimestamp;
    animate.value = false;
    xOffset.value =
      (tt.getUTCHours() * 60 + tt.getUTCMinutes() + tzOffset + tt.getUTCSeconds() / 60) *
      (majorWidth.value / (24 * 60)) *
      -1;
    const { minDate, maxDate } = updateTicks(
      tt,
      width.value,
      majorWidth.value,
      minorStep.value,
    );
    updateEvents(minDate, maxDate);
  }
});

function onEventClick(event: NScenarioEvent) {
  goToScenarioEvent(event);
}
</script>
<template>
  <div
    ref="el"
    class="mb-2 w-full transform select-none overflow-x-hidden border-t border-gray-500 bg-white text-sm transition-all"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
    @wheel="onWheel"
    @mousemove="onHover"
    @mouseenter="showHoverMarker = true"
    @mouseleave="showHoverMarker = false"
  >
    <div class="flex h-3.5 items-center justify-center overflow-clip bg-gray-100">
      <IconTriangleDown class="h-4 w-4 scale-x-150 transform text-red-900" />
    </div>
    <div
      class="touch-none select-none text-sm"
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
            class="absolute h-4 w-4 -translate-x-2 rounded-full border border-gray-500 bg-amber-500 hover:bg-red-900"
            :style="`left: ${x}px;`"
            @mousemove.stop
            :title="event.title"
            @click.stop="onEventClick(event)"
          ></button>
        </div>
      </div>
      <div class="flex justify-center">
        <div
          class="relative flex-none text-center"
          :style="`width: ${timelineWidth}px`"
        ></div>
      </div>
      <div class="flex justify-center border-gray-300">
        <div
          v-for="tick in majorTicks"
          :key="tick.timestamp"
          class="flex-none border-b border-r border-gray-300 border-r-gray-500 pl-0.5"
          :style="`width: ${majorWidth}px`"
        >
          {{ tick.label }}
        </div>
      </div>
      <div class="flex justify-center text-xs">
        <div
          v-for="tick in minorTicks"
          :key="tick.timestamp"
          class="min-h-[1rem] flex-none border-r border-gray-300"
          :style="`width: ${minorWidth}px`"
        >
          {{ tick.label }}
        </div>
      </div>
    </div>

    <p
      v-if="showHoverMarker && !isDragging"
      class="absolute right-1 top-0 hidden select-none p-0 text-xs text-red-900 sm:block"
    >
      {{ formattedHoveredDate }}
    </p>
    <div
      v-if="showHoverMarker"
      class="absolute bottom-0 top-0 hidden w-0.5 bg-red-500 bg-opacity-50 hover-hover:block"
      :style="`left: ${hoveredX}px`"
    />
  </div>
</template>
