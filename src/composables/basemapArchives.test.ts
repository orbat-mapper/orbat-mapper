// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  resetBasemapArchivePromptState,
  splitBasemapArchiveFiles,
  useBasemapArchives,
} from "@/composables/basemapArchives";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type { MlPmtilesLayerConfig } from "@/geo/maplibreLayerConfigTypes";

function lastNotification() {
  const list = useNotifications().notifications.value;
  return list[list.length - 1];
}

function file(name: string) {
  return new File(["x"], name);
}

function pmtilesLayer(name: string): MlPmtilesLayerConfig {
  return {
    sourceType: "pmtiles",
    name,
    title: name,
    archive: {
      kind: "vector",
      minZoom: 0,
      maxZoom: 14,
      bounds: [-180, -85, 180, 85],
    },
  };
}

describe("splitBasemapArchiveFiles", () => {
  it("splits archives from everything else by extension", () => {
    const { archives, others } = splitBasemapArchiveFiles([
      file("world.pmtiles"),
      file("units.geojson"),
      file("Europe.MAPBUNDLE"),
      file("scenario.json"),
    ]);
    expect(archives.map((f) => f.name)).toEqual(["world.pmtiles", "Europe.MAPBUNDLE"]);
    expect(others.map((f) => f.name)).toEqual(["units.geojson", "scenario.json"]);
  });
});

describe("useBasemapArchives drop routing", () => {
  let addBasemapArchive: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchivePromptState();
    useNotifications().clear();
    const layersStore = useMaplibreLayersStore();
    addBasemapArchive = vi.fn(async (f: File) => pmtilesLayer(f.name));
    layersStore.addBasemapArchive = addBasemapArchive as never;
  });

  it("routes an archive-only drop to the basemap path", async () => {
    const { handleDroppedFiles } = useBasemapArchives();
    const onOther = vi.fn();

    const handled = await handleDroppedFiles([file("world.pmtiles")], onOther);

    expect(handled).toBe(true);
    expect(onOther).not.toHaveBeenCalled();
    expect(addBasemapArchive).toHaveBeenCalledTimes(1);
    expect(useMapSettingsStore().maplibreBaseLayerName).toBe("world.pmtiles");
    expect(lastNotification()).toMatchObject({
      message: "Added world.pmtiles as basemap",
      type: "success",
    });
  });

  it("splits a mixed drop between the basemap path and the import wizard", async () => {
    const { handleDroppedFiles } = useBasemapArchives();
    const onOther = vi.fn();

    const handled = await handleDroppedFiles(
      [file("units.geojson"), file("world.pmtiles"), file("scenario.json")],
      onOther,
    );

    expect(handled).toBe(true);
    expect(addBasemapArchive).toHaveBeenCalledTimes(1);
    expect(addBasemapArchive.mock.calls[0]![0].name).toBe("world.pmtiles");
    expect(onOther).toHaveBeenCalledTimes(1);
    expect(onOther.mock.calls[0]![0].map((f: File) => f.name)).toEqual([
      "units.geojson",
      "scenario.json",
    ]);
  });

  it("sends a drop without archives straight to the import wizard", async () => {
    const { handleDroppedFiles } = useBasemapArchives();
    const onOther = vi.fn();

    const handled = await handleDroppedFiles(
      [file("units.geojson"), file("scenario.json")],
      onOther,
    );

    expect(handled).toBe(false);
    expect(addBasemapArchive).not.toHaveBeenCalled();
    expect(onOther.mock.calls[0]![0]).toHaveLength(2);
  });

  it("reports an unreadable archive as an error toast", async () => {
    addBasemapArchive.mockRejectedValueOnce(
      new Error('"broken.pmtiles" could not be read as a PMTiles archive.'),
    );
    const { handleDroppedFiles } = useBasemapArchives();

    await handleDroppedFiles([file("broken.pmtiles")], vi.fn());

    expect(lastNotification()).toMatchObject({
      message: '"broken.pmtiles" could not be read as a PMTiles archive.',
      type: "error",
    });
    expect(useMapSettingsStore().lastBasemapArchive).toBeNull();
  });
});

describe("useBasemapArchives mapbundle handling", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchivePromptState();
    useNotifications().clear();
  });

  it("fails a mapbundle with a clear not-yet-supported message", async () => {
    const { loadBasemapArchive } = useBasemapArchives();

    const loaded = await loadBasemapArchive(file("europe.mapbundle"));

    expect(loaded).toBe(false);
    const message = lastNotification()?.message ?? "";
    expect(message).toContain("not yet supported");
    expect(message).toContain("europe.mapbundle");
  });
});

describe("useBasemapArchives re-select prompt", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchivePromptState();
    useNotifications().clear();
  });

  it("asks for the remembered archive until it is dismissed", () => {
    useMapSettingsStore().lastBasemapArchive = {
      fileName: "world.pmtiles",
      kind: "pmtiles",
    };
    const { archiveToReselect, dismissArchivePrompt } = useBasemapArchives();

    expect(archiveToReselect.value?.fileName).toBe("world.pmtiles");
    dismissArchivePrompt();
    expect(archiveToReselect.value).toBeNull();
  });

  it("does not ask when nothing was ever opened", () => {
    expect(useBasemapArchives().archiveToReselect.value).toBeNull();
  });

  it("stops asking once an archive has been opened in this session", async () => {
    const layersStore = useMaplibreLayersStore();
    layersStore.addBasemapArchive = (async (f: File) => pmtilesLayer(f.name)) as never;
    useMapSettingsStore().lastBasemapArchive = {
      fileName: "world.pmtiles",
      kind: "pmtiles",
    };
    const { archiveToReselect, loadBasemapArchive } = useBasemapArchives();
    expect(archiveToReselect.value).not.toBeNull();

    await loadBasemapArchive(file("world.pmtiles"));

    expect(archiveToReselect.value).toBeNull();
    expect(useMapSettingsStore().lastBasemapArchive).toEqual({
      fileName: "world.pmtiles",
      kind: "pmtiles",
    });
  });
});
