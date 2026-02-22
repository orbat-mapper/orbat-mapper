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
