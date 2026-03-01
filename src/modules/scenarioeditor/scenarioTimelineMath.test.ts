import { describe, expect, it } from "vitest";
import { MS_PER_DAY, MS_PER_HOUR } from "@/utils/time";
import {
  buildDayTicksWithStep,
  buildMonthTicksFromDayRange,
  buildTimelineRenderData,
  calculatePixelDateFromViewport,
  cullOverlappingTickLabels,
  getDayTickStepForZoom,
  getMsPerPixel,
  toLocalX,
} from "./scenarioTimelineMath";

describe("scenarioTimelineMath", () => {
  it("computes milliseconds per pixel from major width", () => {
    expect(getMsPerPixel(100)).toBe(MS_PER_DAY / 100);
    expect(getMsPerPixel(55)).toBe(MS_PER_DAY / 55);
  });

  it("maps events and histogram bins using fixed offset", () => {
    const minTimestamp = Date.UTC(2024, 0, 1, 0, 0);
    const maxTimestamp = Date.UTC(2024, 0, 2, 0, 0);
    const eventAtStart = { id: "e-1", title: "A", startTime: minTimestamp } as any;
    const eventAtSixHours = {
      id: "e-2",
      title: "B",
      startTime: minTimestamp + 6 * MS_PER_HOUR,
    } as any;

    const { eventsWithX, binsWithX } = buildTimelineRenderData({
      events: [eventAtStart, eventAtSixHours],
      histogram: [
        { t: minTimestamp, count: 2 },
        { t: minTimestamp + 12 * MS_PER_HOUR, count: 5 },
      ],
      minTimestamp,
      maxTimestamp,
      majorWidth: 240,
      tzOffsetMinutes: 120,
    });

    expect(eventsWithX.map((entry) => entry.x)).toEqual([20, 80]);
    expect(binsWithX.map((entry) => entry.x)).toEqual([20, 140]);
    expect(binsWithX.map((entry) => entry.count)).toEqual([2, 5]);
  });

  it("converts local x to timeline date around viewport center", () => {
    const centerTimestamp = Date.UTC(2024, 0, 1, 10, 0);
    const viewportWidth = 1000;
    const majorWidth = 100;

    const center = calculatePixelDateFromViewport(500, {
      centerTimestamp,
      viewportWidth,
      majorWidth,
    });
    const right = calculatePixelDateFromViewport(750, {
      centerTimestamp,
      viewportWidth,
      majorWidth,
    });
    const left = calculatePixelDateFromViewport(250, {
      centerTimestamp,
      viewportWidth,
      majorWidth,
    });

    expect(center.date.valueOf()).toBe(centerTimestamp);
    expect(center.diff).toBe(0);
    expect(right.date.valueOf() - centerTimestamp).toBe(250 * (MS_PER_DAY / 100));
    expect(centerTimestamp - left.date.valueOf()).toBe(250 * (MS_PER_DAY / 100));
  });

  it("converts client coordinates to local coordinates", () => {
    expect(toLocalX(250, 10)).toBe(240);
  });

  it("builds month buckets from a visible day range", () => {
    const dayRange = [
      new Date(Date.UTC(2024, 0, 30)),
      new Date(Date.UTC(2024, 0, 31)),
      new Date(Date.UTC(2024, 1, 1)),
      new Date(Date.UTC(2024, 1, 2)),
    ];
    const ticks = buildMonthTicksFromDayRange(
      dayRange,
      20,
      (date) => `${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`,
    );

    expect(ticks).toEqual([
      { label: "1/2024", timestamp: Date.UTC(2024, 0, 30), width: 40 },
      { label: "2/2024", timestamp: Date.UTC(2024, 1, 1), width: 40 },
    ]);
  });

  it("returns adaptive day tick step from day width", () => {
    expect(getDayTickStepForZoom(5)).toBe(14);
    expect(getDayTickStepForZoom(10)).toBe(7);
    expect(getDayTickStepForZoom(14)).toBe(5);
    expect(getDayTickStepForZoom(20)).toBe(3);
    expect(getDayTickStepForZoom(28)).toBe(2);
    expect(getDayTickStepForZoom(55)).toBe(1);
  });

  it("builds stepped day ticks and preserves total width", () => {
    const dayRange = [
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 0, 2)),
      new Date(Date.UTC(2024, 0, 3)),
      new Date(Date.UTC(2024, 0, 4)),
      new Date(Date.UTC(2024, 0, 5)),
      new Date(Date.UTC(2024, 0, 6)),
      new Date(Date.UTC(2024, 0, 7)),
      new Date(Date.UTC(2024, 0, 8)),
      new Date(Date.UTC(2024, 0, 9)),
    ];
    const ticks = buildDayTicksWithStep(
      dayRange,
      20,
      (date) => String(date.getUTCDate()).padStart(2, "0"),
      7,
    );

    expect(ticks).toEqual([
      { label: "01", timestamp: Date.UTC(2024, 0, 1), width: 140 },
      { label: "08", timestamp: Date.UTC(2024, 0, 8), width: 40 },
    ]);
    expect(ticks.reduce((sum, tick) => sum + tick.width, 0)).toBe(dayRange.length * 20);
  });

  it("resets stepped day labels per month so each month starts at 01", () => {
    const dayRange = [
      new Date(Date.UTC(2024, 0, 29)),
      new Date(Date.UTC(2024, 0, 30)),
      new Date(Date.UTC(2024, 0, 31)),
      new Date(Date.UTC(2024, 1, 1)),
      new Date(Date.UTC(2024, 1, 2)),
      new Date(Date.UTC(2024, 1, 3)),
      new Date(Date.UTC(2024, 1, 4)),
      new Date(Date.UTC(2024, 1, 5)),
      new Date(Date.UTC(2024, 1, 6)),
    ];
    const ticks = buildDayTicksWithStep(
      dayRange,
      20,
      (date) => String(date.getUTCDate()).padStart(2, "0"),
      7,
    );

    expect(ticks).toEqual([
      { label: "29", timestamp: Date.UTC(2024, 0, 29), width: 60 },
      { label: "01", timestamp: Date.UTC(2024, 1, 1), width: 120 },
    ]);
  });

  it("creates a blank leading partial block for mid-month visible starts", () => {
    const dayRange = [
      new Date(Date.UTC(2024, 0, 30)),
      new Date(Date.UTC(2024, 0, 31)),
      new Date(Date.UTC(2024, 1, 1)),
      new Date(Date.UTC(2024, 1, 2)),
      new Date(Date.UTC(2024, 1, 3)),
      new Date(Date.UTC(2024, 1, 4)),
    ];
    const ticks = buildDayTicksWithStep(
      dayRange,
      20,
      (date) => String(date.getUTCDate()).padStart(2, "0"),
      7,
    );

    expect(ticks).toEqual([
      { label: "", timestamp: Date.UTC(2024, 0, 30), width: 40 },
      { label: "01", timestamp: Date.UTC(2024, 1, 1), width: 80 },
    ]);
  });

  it("culls overlapping labels while preserving ticks", () => {
    const ticks = cullOverlappingTickLabels(
      [
        { label: "01", timestamp: 1, width: 20 },
        { label: "02", timestamp: 2, width: 20 },
        { label: "03", timestamp: 3, width: 20 },
      ],
      { minGapPx: 10 },
    );

    expect(ticks.map((tick) => tick.showLabel)).toEqual([true, false, true]);
    expect(ticks.map((tick) => tick.width)).toEqual([20, 20, 20]);
  });

  it("keeps labels visible when there is enough space", () => {
    const ticks = cullOverlappingTickLabels([
      { label: "Jan 2024", timestamp: 1, width: 90 },
      { label: "Feb 2024", timestamp: 2, width: 90 },
    ]);

    expect(ticks.map((tick) => tick.showLabel)).toEqual([true, true]);
  });
});
