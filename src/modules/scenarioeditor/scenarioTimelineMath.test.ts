import { describe, expect, it } from "vitest";
import { MS_PER_DAY, MS_PER_HOUR } from "@/utils/time";
import {
  buildTimelineRenderData,
  calculatePixelDateFromViewport,
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
});
