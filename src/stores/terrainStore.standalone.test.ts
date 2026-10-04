// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { useTerrainStore } from "@/stores/terrainStore";
import { MAPTERHORN_ELEVATION_SOURCE } from "@/modules/maplibreview/mapTerrain";

vi.mock("@/utils/runtimeEnvironment", () => ({ isOnlineElevationAvailable: false }));

describe("terrain store in a build without online elevation data", () => {
  beforeEach(() => localStorage.clear());

  it("uses online elevation data only once the user chooses it, and remembers the choice", async () => {
    setActivePinia(createPinia());
    const settings = useTerrainStore();
    expect(settings.onlineElevationOptional).toBe(true);
    expect(settings.elevationSource).toBeNull();

    settings.onlineElevationChosen = true;
    expect(settings.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
    await nextTick();

    setActivePinia(createPinia());
    expect(useTerrainStore().elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
  });

  it("prefers an opened archive over the chosen online data", () => {
    setActivePinia(createPinia());
    const settings = useTerrainStore();
    settings.onlineElevationChosen = true;
    const source = { type: "raster-dem" as const, url: "pmtiles://archive:x" };
    settings.setArchiveSource({ kind: "file", fileName: "dem.pmtiles" }, source);
    expect(settings.elevationSource).toEqual(source);

    settings.clearArchive();
    expect(settings.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
  });
});
