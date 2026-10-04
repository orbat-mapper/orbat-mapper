// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { useTerrainStore } from "@/stores/terrainStore";

describe("terrain store", () => {
  beforeEach(() => localStorage.clear());

  it("remembers terrain preferences between visits but not tile errors", async () => {
    setActivePinia(createPinia());
    const settings = useTerrainStore();
    settings.terrainEnabled = true;
    settings.hillshadeEnabled = true;
    settings.setExaggeration(2.5);
    settings.hillshadeSettings.direction = 90;
    settings.terrainError = true;
    await nextTick();

    setActivePinia(createPinia());
    const reopened = useTerrainStore();
    expect(reopened.terrainEnabled).toBe(true);
    expect(reopened.hillshadeEnabled).toBe(true);
    expect(reopened.exaggeration).toBe(2.5);
    expect(reopened.hillshadeSettings.direction).toBe(90);
    expect(reopened.hillshadeSettings.strength).toBe(0.5);
    expect(reopened.terrainError).toBe(false);
  });

  it("clamps a stored exaggeration outside the current bounds", () => {
    localStorage.setItem("terrainExaggeration", "40");
    setActivePinia(createPinia());
    expect(useTerrainStore().exaggeration).toBe(5);
  });
});
