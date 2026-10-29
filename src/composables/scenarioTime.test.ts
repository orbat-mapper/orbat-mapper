import { describe, expect, it } from "vitest";
import "@/dayjs";
import { useYMDElements } from "@/composables/scenarioTime";

describe("useYMDElements", () => {
  it("shows a 1-based month and keeps the timestamp unchanged", () => {
    const timestamp = Date.UTC(2026, 9, 29, 12, 0);
    const { year, month, day, resDateTime } = useYMDElements({
      timestamp,
      isLocal: true,
      timeZone: "Europe/Oslo",
    });

    expect([year.value, month.value, day.value]).toEqual([2026, 10, 29]);
    expect(resDateTime.value.valueOf()).toBe(timestamp);
  });

  it("round-trips the last day of a 31-day month", () => {
    const timestamp = Date.UTC(2026, 0, 31, 0, 0);
    const { month, day, resDateTime } = useYMDElements({
      timestamp,
      isLocal: true,
      timeZone: "UTC",
    });

    expect([month.value, day.value]).toEqual([1, 31]);
    expect(resDateTime.value.valueOf()).toBe(timestamp);
  });
});
