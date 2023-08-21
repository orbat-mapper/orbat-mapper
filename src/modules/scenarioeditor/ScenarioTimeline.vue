<script setup lang="ts">
import { IconTriangleDown } from "@iconify-prerendered/vue-mdi";
import { computed, ref, unref, watchEffect } from "vue";
import { useElementSize, useThrottleFn } from "@vueuse/core";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { utcDay, utcHour } from "d3-time";
import { utcFormat } from "d3-time-format";
import dayjs from "dayjs";

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const {
  time: { scenarioTime, setCurrentTime, utcTime, timeZone },
  store,
} = injectStrict(activeScenarioKey);

const el = ref<HTMLDivElement | null>(null);
const isPointerInteraction = ref(false);
const isDragging = ref(false);
const { width } = useElementSize(el);
const tzOffset = scenarioTime.value.utcOffset();

const hourFormatter = utcFormat("%H");
const dayFormatter = utcFormat("%a %d %b");

interface Tick {
  label: string;
  timestamp: number;
}

const hoveredDate = ref<Date | null>(null);
const majorTicks = ref<Tick[]>([]);
const minorTicks = ref<Tick[]>([]);
const centerTimeStamp = ref(0);
const xOffset = ref(0);
const draggedDiff = ref(0);
const majorWidth = ref(100);
const minorWidth = computed(() => majorWidth.value / 4);
const currentTimestamp = ref(0);
const animate = ref(false);
const hoveredX = ref(0);
const showHoverMarker = ref(false);

const totalXOffset = computed(() => {
  return xOffset.value + draggedDiff.value;
});

function updateTicks(centerTime: Date, containerWidth: number, majorWidth: number) {
  const dayPadding = Math.ceil((containerWidth * 2) / majorWidth);
  const currentUtcDay = utcDay.floor(centerTime);
  const start = utcDay.offset(currentUtcDay, -dayPadding);
  const end = utcDay.offset(currentUtcDay, dayPadding);

  const dayRange = utcDay.range(start, end);

  majorTicks.value = dayRange.map((d) => ({
    label: dayFormatter(d),
    timestamp: +d,
  }));

  const hourRange = utcHour.range(start, end, 6);
  minorTicks.value = hourRange.map((d) => ({
    label: hourFormatter(d),
    timestamp: +d,
  }));
}

function calculateDate(x: number) {
  const center = width.value / 2;
  const msPerPixel = (MS_PER_HOUR * 24) / majorWidth.value;
  const diff = x - center;
  const newDate = centerTimeStamp.value + diff * msPerPixel;
  return { date: new Date(newDate), diff };
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
  if (!isDragging.value) {
    const { date, diff } = calculateDate(evt.clientX);
    animate.value = true;
    draggedDiff.value = -diff;
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
  const { date } = calculateDate(e.clientX);
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

watchEffect(() => {
  if (!width.value) return;
  const currentScenarioTimestamp = store.state.currentTime;
  const tt = new Date(currentScenarioTimestamp);
  let redrawTimeline = false;
  if (isDragging.value) {
  } else if (animate.value === true) {
    xOffset.value;
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
    updateTicks(tt, width.value, majorWidth.value);
  }
});
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
      <div class="flex justify-center border-gray-300">
        <div
          v-for="tick in majorTicks"
          :key="tick.timestamp"
          class="flex-none border-b border-r border-gray-300"
          :style="`width: ${majorWidth}px`"
        >
          {{ tick.label }}
        </div>
      </div>
      <div class="flex justify-center text-xs">
        <div
          v-for="tick in minorTicks"
          :key="tick.timestamp"
          class="flex-none border-r border-gray-300"
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
      class="absolute bottom-0 top-0 w-0.5 bg-red-500 bg-opacity-50"
      :style="`left: ${hoveredX}px`"
    ></div>
  </div>
</template>
