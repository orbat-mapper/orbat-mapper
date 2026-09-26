import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  REFERENCE_GRID_STORAGE_KEY,
  useReferenceGridStore,
} from "@/stores/referenceGridStore";

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("reference-grid display state", () => {
  it("starts hidden with the agreed first-use preferences", () => {
    const grid = useReferenceGridStore();

    expect(grid.visible).toBe(false);
    expect(grid.mode).toBe("mgrs");
    expect(grid.mgrsInterval).toBe(1_000);
    expect(grid.latLongInterval).toBe(0.01);
    expect(grid.color).toBe("#658cbb");
    expect(grid.opacity).toBe(0.52);
    expect(grid.strokeWidth).toBe(1);
  });

  it("restores device preferences without restoring visibility", () => {
    const grid = useReferenceGridStore();
    grid.visible = true;
    grid.setMode("latlong");
    grid.setMgrsInterval(10_000);
    grid.setLatLongInterval(0.25);
    grid.setColor("#AABBCC");
    grid.setOpacity(0.75);
    grid.setStrokeWidth(2.5);

    expect(JSON.parse(localStorage.getItem(REFERENCE_GRID_STORAGE_KEY)!)).toEqual({
      mode: "latlong",
      mgrsInterval: 10_000,
      latLongInterval: 0.25,
      color: "#aabbcc",
      opacity: 0.75,
      strokeWidth: 2.5,
    });

    setActivePinia(createPinia());
    const restored = useReferenceGridStore();
    expect(restored.visible).toBe(false);
    expect(restored.mode).toBe("latlong");
    expect(restored.mgrsInterval).toBe(10_000);
    expect(restored.latLongInterval).toBe(0.25);
    expect(restored.color).toBe("#aabbcc");
    expect(restored.opacity).toBe(0.75);
    expect(restored.strokeWidth).toBe(2.5);
  });
});
