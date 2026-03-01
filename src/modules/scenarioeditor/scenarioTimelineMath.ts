import { MS_PER_DAY } from "@/utils/time";
import { type NScenarioEvent } from "@/types/internalModels";

export type TimelineAction = "zoomIn" | "zoomOut" | "addScenarioEvent";

export interface EventWithX {
  x: number;
  event: NScenarioEvent;
}

export interface BinWithX {
  x: number;
  count: number;
}

export interface HistogramBin {
  t: number;
  count: number;
}

export interface TimelineViewportState {
  centerTimestamp: number;
  viewportWidth: number;
  majorWidth: number;
}

export interface TimelineRenderInputs {
  events: NScenarioEvent[];
  histogram: HistogramBin[];
  minTimestamp: number;
  maxTimestamp: number;
  majorWidth: number;
  tzOffsetMinutes: number;
}

export interface TimelineRenderOutputs {
  eventsWithX: EventWithX[];
  binsWithX: BinWithX[];
}

export interface TimelineTickInput {
  label: string;
  timestamp: number;
  width: number;
}

export interface TimelineTick extends TimelineTickInput {
  showLabel: boolean;
}

export interface LabelCullOptions {
  charWidthPx?: number;
  labelPaddingPx?: number;
  minGapPx?: number;
}

export function getMsPerPixel(majorWidth: number) {
  return MS_PER_DAY / majorWidth;
}

export function toLocalX(clientX: number, hostRectLeft: number) {
  return clientX - hostRectLeft;
}

export function calculatePixelDateFromViewport(
  localX: number,
  state: TimelineViewportState,
) {
  const center = state.viewportWidth / 2;
  const diff = localX - center;
  const newDate = state.centerTimestamp + diff * getMsPerPixel(state.majorWidth);
  const date = new Date(newDate);
  date.setUTCSeconds(0, 0);
  return { date, diff };
}

export function roundToNearestQuarterHour(date: Date) {
  date.setUTCMinutes(Math.round(date.getUTCMinutes() / 15) * 15);
  return date;
}

export function mapEventsToX({
  events,
  minTimestamp,
  maxTimestamp,
  majorWidth,
  tzOffsetMinutes,
}: TimelineRenderInputs) {
  const pxPerMs = majorWidth / MS_PER_DAY;
  const offsetMs = tzOffsetMinutes * 60 * 1000;
  return events
    .filter((event) => event.startTime >= minTimestamp && event.startTime <= maxTimestamp)
    .map((event) => ({
      x: (event.startTime - minTimestamp + offsetMs) * pxPerMs,
      event,
    }));
}

export function mapHistogramToX({
  histogram,
  minTimestamp,
  maxTimestamp,
  majorWidth,
  tzOffsetMinutes,
}: TimelineRenderInputs) {
  const pxPerMs = majorWidth / MS_PER_DAY;
  const offsetMs = tzOffsetMinutes * 60 * 1000;
  return histogram
    .filter((bin) => bin.t >= minTimestamp && bin.t <= maxTimestamp)
    .map((bin) => ({
      x: (bin.t - minTimestamp + offsetMs) * pxPerMs,
      count: bin.count,
    }));
}

export function buildTimelineRenderData(
  inputs: TimelineRenderInputs,
): TimelineRenderOutputs {
  return {
    eventsWithX: mapEventsToX(inputs),
    binsWithX: mapHistogramToX(inputs),
  };
}

export function buildMonthTicksFromDayRange(
  dayRange: Date[],
  dayWidth: number,
  formatter: (date: Date) => string,
): TimelineTickInput[] {
  if (!dayRange.length) return [];

  const ticks: TimelineTickInput[] = [];
  let bucketStart = dayRange[0];
  let bucketYear = bucketStart.getUTCFullYear();
  let bucketMonth = bucketStart.getUTCMonth();
  let bucketDayCount = 0;

  for (const day of dayRange) {
    const dayYear = day.getUTCFullYear();
    const dayMonth = day.getUTCMonth();
    const isCurrentBucket = dayYear === bucketYear && dayMonth === bucketMonth;

    if (!isCurrentBucket) {
      ticks.push({
        label: formatter(bucketStart),
        timestamp: +bucketStart,
        width: bucketDayCount * dayWidth,
      });
      bucketStart = day;
      bucketYear = dayYear;
      bucketMonth = dayMonth;
      bucketDayCount = 0;
    }

    bucketDayCount += 1;
  }

  ticks.push({
    label: formatter(bucketStart),
    timestamp: +bucketStart,
    width: bucketDayCount * dayWidth,
  });

  return ticks;
}

export function getDayTickStepForZoom(dayWidthPx: number) {
  if (dayWidthPx <= 7) return 14;
  if (dayWidthPx <= 10) return 7;
  if (dayWidthPx <= 14) return 5;
  if (dayWidthPx <= 20) return 3;
  if (dayWidthPx <= 28) return 2;
  return 1;
}

export function buildDayTicksWithStep(
  dayRange: Date[],
  dayWidth: number,
  formatter: (date: Date) => string,
  step: number,
): TimelineTickInput[] {
  if (!dayRange.length) return [];

  const normalizedStep = Math.max(1, Math.floor(step));
  const ticks: TimelineTickInput[] = [];
  let segmentStart = 0;

  while (segmentStart < dayRange.length) {
    const segmentMonth = dayRange[segmentStart].getUTCMonth();
    const segmentYear = dayRange[segmentStart].getUTCFullYear();
    let segmentEnd = segmentStart + 1;
    while (segmentEnd < dayRange.length) {
      const day = dayRange[segmentEnd];
      if (day.getUTCMonth() !== segmentMonth || day.getUTCFullYear() !== segmentYear) {
        break;
      }
      segmentEnd += 1;
    }

    let cursor = segmentStart;
    const firstDayOfMonth = dayRange[segmentStart].getUTCDate();
    const daysToNextBoundary =
      (normalizedStep - ((firstDayOfMonth - 1) % normalizedStep)) % normalizedStep;

    if (daysToNextBoundary > 0) {
      const leadingDays = Math.min(daysToNextBoundary, segmentEnd - segmentStart);
      ticks.push({
        label: "",
        timestamp: +dayRange[segmentStart],
        width: leadingDays * dayWidth,
      });
      cursor += leadingDays;
    }

    while (cursor < segmentEnd) {
      const day = dayRange[cursor];
      const blockDays = Math.min(normalizedStep, segmentEnd - cursor);
      ticks.push({
        label: formatter(day),
        timestamp: +day,
        width: blockDays * dayWidth,
      });
      cursor += blockDays;
    }

    segmentStart = segmentEnd;
  }

  return ticks;
}

export function cullOverlappingTickLabels(
  ticks: TimelineTickInput[],
  options: LabelCullOptions = {},
): TimelineTick[] {
  const charWidthPx = options.charWidthPx ?? 6;
  const labelPaddingPx = options.labelPaddingPx ?? 4;
  const minGapPx = options.minGapPx ?? 2;

  let currentX = 0;
  let previousLabelRight = -Infinity;

  return ticks.map((tick) => {
    const labelWidth = tick.label.length * charWidthPx + labelPaddingPx;
    const labelLeft = currentX + 2;
    const labelRight = labelLeft + labelWidth;
    const fitsInTick = labelWidth <= Math.max(tick.width - 2, 0);
    const noOverlap = labelLeft >= previousLabelRight + minGapPx;
    const showLabel = tick.label.length > 0 && fitsInTick && noOverlap;

    if (showLabel) {
      previousLabelRight = labelRight;
    }

    currentX += tick.width;

    return {
      ...tick,
      showLabel,
    };
  });
}
