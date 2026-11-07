// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  type CompassMap,
  splitCompassReset,
} from "@/modules/maplibreview/splitCompassReset";

function setup({ pitch = 0, roll = 0 } = {}) {
  const container = document.createElement("div");
  const compass = document.createElement("button");
  compass.className = "maplibregl-ctrl-compass";
  const icon = document.createElement("span");
  compass.append(icon);
  // Stands in for MapLibre's own compass handler, which resets bearing and pitch together.
  const builtInReset = vi.fn();
  compass.addEventListener("click", builtInReset);
  container.append(compass);

  const listeners = new Map<string, () => void>();
  const map = {
    on: vi.fn((type: string, fn: () => void) => listeners.set(type, fn)),
    off: vi.fn((type: string) => listeners.delete(type)),
    getPitch: () => pitch,
    getRoll: () => roll,
    resetNorth: vi.fn(),
    resetNorthPitch: vi.fn(),
    easeTo: vi.fn(),
  };
  const cleanup = splitCompassReset(container, map as unknown as CompassMap);
  const levelButton = container.querySelector<HTMLButtonElement>(
    ".maplibregl-ctrl-level-view",
  )!;
  function setPitch(value: number) {
    pitch = value;
    listeners.get("pitch")?.();
  }
  return { container, compass, icon, builtInReset, map, cleanup, levelButton, setPitch };
}

describe("splitCompassReset", () => {
  it("resets only the bearing on a compass click", () => {
    const { icon, builtInReset, map } = setup({ pitch: 40 });
    icon.click();
    expect(map.resetNorth).toHaveBeenCalledOnce();
    expect(map.resetNorth.mock.calls[0][1]).toHaveProperty("originalEvent");
    expect(map.resetNorthPitch).not.toHaveBeenCalled();
    expect(builtInReset).not.toHaveBeenCalled();
  });

  it("resets bearing and pitch on a compass double-click", () => {
    const { compass, map } = setup({ pitch: 40 });
    compass.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(map.resetNorthPitch).toHaveBeenCalledOnce();
  });

  it("levels pitch and roll but keeps the bearing from the level button", () => {
    const { levelButton, map } = setup({ pitch: 40 });
    levelButton.click();
    expect(map.easeTo).toHaveBeenCalledOnce();
    const [options, eventData] = map.easeTo.mock.calls[0];
    expect(options).toMatchObject({ pitch: 0, roll: 0 });
    expect(options).not.toHaveProperty("bearing");
    expect(eventData).toHaveProperty("originalEvent");
    expect(map.resetNorth).not.toHaveBeenCalled();
  });

  it("shows the level button only while the view is tilted or rolled", () => {
    const { levelButton, setPitch } = setup();
    expect(levelButton.hidden).toBe(true);
    setPitch(30);
    expect(levelButton.hidden).toBe(false);
    setPitch(0);
    expect(levelButton.hidden).toBe(true);
    expect(setup({ roll: 5 }).levelButton.hidden).toBe(false);
  });

  it("removes the level button and listeners on cleanup", () => {
    const { container, icon, map, cleanup, builtInReset } = setup();
    cleanup();
    expect(container.querySelector(".maplibregl-ctrl-level-view")).toBeNull();
    expect(map.off).toHaveBeenCalledWith("pitch", expect.any(Function));
    icon.click();
    expect(map.resetNorth).not.toHaveBeenCalled();
    expect(builtInReset).toHaveBeenCalledOnce();
  });
});
