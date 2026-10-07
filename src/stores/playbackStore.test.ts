import { describe, expect, it } from "vitest";
import { formatPlaybackSpeed, getPlaybackStep } from "./playbackStore";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from "@/utils/time";

describe("getPlaybackStep", () => {
  it("advances by the speed per second of real time", () => {
    expect(getPlaybackStep(30 * MS_PER_HOUR, 100)).toBe(3 * MS_PER_HOUR);
    // Slow frames advance further, so the speed holds when frames drop.
    expect(getPlaybackStep(30 * MS_PER_HOUR, 40)).toBe(
      2 * getPlaybackStep(30 * MS_PER_HOUR, 20),
    );
  });

  it("caps a long frame, such as the first one after a hidden tab", () => {
    expect(getPlaybackStep(MS_PER_HOUR, 60_000)).toBe(MS_PER_HOUR / 4);
  });
});

describe("formatPlaybackSpeed", () => {
  it("shows the speed in the largest whole unit", () => {
    expect(formatPlaybackSpeed(30 * MS_PER_HOUR)).toBe("30 h/s");
    expect(formatPlaybackSpeed(60 * MS_PER_HOUR)).toBe("2.5 d/s");
    expect(formatPlaybackSpeed(MS_PER_DAY)).toBe("24 h/s");
    expect(formatPlaybackSpeed(15 * MS_PER_MINUTE)).toBe("15 min/s");
    expect(formatPlaybackSpeed(5000)).toBe("5 s/s");
  });

  it("rounds halved speeds to three significant digits", () => {
    expect(formatPlaybackSpeed((30 * MS_PER_HOUR) / 32)).toBe("56.3 min/s");
  });
});
