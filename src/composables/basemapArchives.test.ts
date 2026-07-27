// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  resetBasemapArchiveSessionState,
  splitBasemapArchiveFiles,
  useBasemapArchives,
} from "@/composables/basemapArchives";
import { useNotifications } from "@/composables/notifications";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type { MlPmtilesLayerConfig } from "@/geo/maplibreLayerConfigTypes";
import type { BasemapArchiveFileHandle } from "@/geo/basemapArchiveHandles";

/** The picker outcome, loosely typed so a test can hand back either shape. */
type PickOutcome = { status: "picked"; handles: unknown[] } | { status: "unavailable" };

const handles = vi.hoisted(() => ({
  isFileHandleSupported: vi.fn(() => false),
  pickBasemapArchiveHandles: vi.fn(async (): Promise<PickOutcome> => ({
    status: "picked",
    handles: [],
  })),
  fileFromHandle: vi.fn(async () => null as File | null),
  queryBasemapArchivePermission: vi.fn(async () => "unsupported" as string),
  requestBasemapArchivePermission: vi.fn(async () => "unsupported" as string),
  saveBasemapArchiveHandle: vi.fn(async () => {}),
  loadBasemapArchiveHandle: vi.fn(async () => null as unknown),
  deleteBasemapArchiveHandle: vi.fn(async () => {}),
  deleteOrphanBasemapArchiveHandles: vi.fn(async () => 0),
}));

vi.mock("@/geo/basemapArchiveHandles", () => handles);

function resetHandleMocks() {
  handles.isFileHandleSupported.mockReset().mockReturnValue(false);
  handles.pickBasemapArchiveHandles
    .mockReset()
    .mockResolvedValue({ status: "picked", handles: [] });
  handles.fileFromHandle.mockReset().mockResolvedValue(null);
  handles.queryBasemapArchivePermission.mockReset().mockResolvedValue("unsupported");
  handles.requestBasemapArchivePermission.mockReset().mockResolvedValue("unsupported");
  handles.saveBasemapArchiveHandle.mockReset().mockResolvedValue(undefined);
  handles.loadBasemapArchiveHandle.mockReset().mockResolvedValue(null);
  handles.deleteBasemapArchiveHandle.mockReset().mockResolvedValue(undefined);
  handles.deleteOrphanBasemapArchiveHandles.mockReset().mockResolvedValue(0);
}

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

function fakeHandle(name: string): BasemapArchiveFileHandle {
  return {
    name,
    getFile: vi.fn(async () => file(name)),
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
    resetBasemapArchiveSessionState();
    resetHandleMocks();
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

  it("stores no handle for a dropped file", async () => {
    const { handleDroppedFiles } = useBasemapArchives();

    await handleDroppedFiles([file("world.pmtiles")], vi.fn());

    expect(handles.saveBasemapArchiveHandle).not.toHaveBeenCalled();
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
    expect(useMapSettingsStore().basemapArchives).toEqual([]);
  });
});

describe("useBasemapArchives mapbundle handling", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
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

describe("pending basemap archive", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    useMaplibreLayersStore().layers = [];
  });

  it("derives the key of an entry written before the key field existed", () => {
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
      },
    ];

    expect(useBasemapArchives().pendingBasemapArchives.value).toEqual([
      {
        key: "world",
        fileName: "world.pmtiles",
        kind: "pmtiles",
        action: "pick",
      },
    ]);
  });

  it("is empty once the archive has a layer of its own", () => {
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
    useMaplibreLayersStore().layers = [pmtilesLayer("world")];

    expect(useBasemapArchives().pendingBasemapArchives.value).toEqual([]);
  });

  it("offers a restore action once a usable stored handle is found", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.loadBasemapArchiveHandle.mockResolvedValue({
      key: "world",
      handle: fakeHandle("world.pmtiles"),
      fileName: "world.pmtiles",
      savedAt: 1,
    });
    handles.queryBasemapArchivePermission.mockResolvedValue("prompt");
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
    const { pendingBasemapArchives, restoreRememberedBasemapArchive } =
      useBasemapArchives();

    const outcome = await restoreRememberedBasemapArchive();

    expect(outcome).toBe("pending");
    expect(pendingBasemapArchives.value[0]?.action).toBe("restore");
  });
});

describe("automatic reopen", () => {
  let addBasemapArchive: ReturnType<typeof vi.fn>;

  function rememberWorld() {
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
  }

  function storeGrantedHandle() {
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.loadBasemapArchiveHandle.mockResolvedValue({
      key: "world",
      handle: fakeHandle("world.pmtiles"),
      fileName: "world.pmtiles",
      savedAt: 1,
    });
    handles.queryBasemapArchivePermission.mockResolvedValue("granted");
    handles.fileFromHandle.mockResolvedValue(file("world.pmtiles"));
  }

  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [];
    addBasemapArchive = vi.fn(async () => pmtilesLayer("world"));
    layersStore.addBasemapArchive = addBasemapArchive as never;
  });

  it("reopens the archive that was active when the user left", async () => {
    storeGrantedHandle();
    rememberWorld();
    useMapSettingsStore().maplibreBaseLayerName = "world";

    const outcome = await useBasemapArchives().restoreRememberedBasemapArchive();

    expect(outcome).toBe("reopened");
    expect(addBasemapArchive).toHaveBeenCalledTimes(1);
    expect(lastNotification()).toMatchObject({
      message: "Reopened world.pmtiles as basemap",
      type: "success",
    });
  });

  it("does not reopen an archive that was not the active basemap", async () => {
    storeGrantedHandle();
    rememberWorld();
    useMapSettingsStore().maplibreBaseLayerName = "somethingElse";

    const outcome = await useBasemapArchives().restoreRememberedBasemapArchive();

    expect(outcome).toBe("pending");
    expect(addBasemapArchive).not.toHaveBeenCalled();
  });

  it("does not reopen when the permission is only 'prompt'", async () => {
    storeGrantedHandle();
    handles.queryBasemapArchivePermission.mockResolvedValue("prompt");
    rememberWorld();
    useMapSettingsStore().maplibreBaseLayerName = "world";
    const { pendingBasemapArchives, restoreRememberedBasemapArchive } =
      useBasemapArchives();

    const outcome = await restoreRememberedBasemapArchive();

    expect(outcome).toBe("pending");
    expect(addBasemapArchive).not.toHaveBeenCalled();
    expect(pendingBasemapArchives.value[0]?.action).toBe("restore");
  });

  it("falls back to the picker when the permission is denied", async () => {
    storeGrantedHandle();
    handles.queryBasemapArchivePermission.mockResolvedValue("denied");
    rememberWorld();
    useMapSettingsStore().maplibreBaseLayerName = "world";
    const { pendingBasemapArchives, restoreRememberedBasemapArchive } =
      useBasemapArchives();

    // "pending", not "none": the archive is still remembered, so its row stays in the list. Only
    // the action falls back from restore to pick.
    expect(await restoreRememberedBasemapArchive()).toBe("pending");
    expect(pendingBasemapArchives.value[0]?.action).toBe("pick");
  });

  it("drops a stale handle without a notification", async () => {
    storeGrantedHandle();
    handles.fileFromHandle.mockResolvedValue(null);
    rememberWorld();
    useMapSettingsStore().maplibreBaseLayerName = "world";

    const outcome = await useBasemapArchives().restoreRememberedBasemapArchive();

    // The row remains, offering the picker; only the dead handle went.
    expect(outcome).toBe("pending");
    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith("world");
    expect(useNotifications().notifications.value).toHaveLength(0);
  });

  it("returns 'none' before reading the layers store when nothing is remembered", async () => {
    expect(await useBasemapArchives().restoreRememberedBasemapArchive()).toBe("none");
    expect(handles.loadBasemapArchiveHandle).not.toHaveBeenCalled();
  });
});

describe("activatePendingBasemapArchive", () => {
  let addBasemapArchive: ReturnType<typeof vi.fn>;

  async function pendingRestoreRow() {
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.loadBasemapArchiveHandle.mockResolvedValue({
      key: "world",
      handle: fakeHandle("world.pmtiles"),
      fileName: "world.pmtiles",
      savedAt: 1,
    });
    handles.queryBasemapArchivePermission.mockResolvedValue("prompt");
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
    const api = useBasemapArchives();
    await api.restoreRememberedBasemapArchive();
    return api;
  }

  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [];
    addBasemapArchive = vi.fn(async () => pmtilesLayer("world"));
    layersStore.addBasemapArchive = addBasemapArchive as never;
  });

  it("asks for permission and loads the archive when it is granted", async () => {
    const api = await pendingRestoreRow();
    handles.requestBasemapArchivePermission.mockResolvedValue("granted");
    handles.fileFromHandle.mockResolvedValue(file("world.pmtiles"));

    await api.activatePendingBasemapArchive("world");

    expect(handles.requestBasemapArchivePermission).toHaveBeenCalledTimes(1);
    expect(addBasemapArchive).toHaveBeenCalledTimes(1);
    expect(lastNotification()).toMatchObject({
      message: "Added world.pmtiles as basemap",
      type: "success",
    });
  });

  it("falls back to the picker action when the permission is refused", async () => {
    const api = await pendingRestoreRow();
    handles.requestBasemapArchivePermission.mockResolvedValue("denied");

    await api.activatePendingBasemapArchive("world");

    expect(lastNotification()).toMatchObject({
      message: "Permission to read world.pmtiles was not given.",
      type: "error",
    });
    expect(api.pendingBasemapArchives.value[0]?.action).toBe("pick");
  });

  it("drops a stale handle and does not open the picker in the same click", async () => {
    const api = await pendingRestoreRow();
    handles.requestBasemapArchivePermission.mockResolvedValue("granted");
    handles.fileFromHandle.mockResolvedValue(null);

    await api.activatePendingBasemapArchive("world");

    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith("world");
    expect(handles.pickBasemapArchiveHandles).not.toHaveBeenCalled();
    expect(lastNotification()).toMatchObject({
      message: "world.pmtiles could not be opened. Select the map file again.",
      type: "error",
    });
    expect(api.pendingBasemapArchives.value[0]?.action).toBe("pick");
  });

  it("offers the picker when another tab changed the remembered archive", async () => {
    const api = await pendingRestoreRow();
    expect(api.pendingBasemapArchives.value[0]?.action).toBe("restore");

    // Another tab opened a different archive. localStorage carries that into this tab, but the
    // handle probed at startup still belongs to world.pmtiles.
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "other.pmtiles",
        kind: "pmtiles",
        key: "other",
      },
    ];
    expect(api.pendingBasemapArchives.value).toMatchObject([
      { key: "other", action: "pick" },
    ]);

    await api.activatePendingBasemapArchive("other");

    expect(handles.requestBasemapArchivePermission).not.toHaveBeenCalled();
    expect(handles.deleteBasemapArchiveHandle).not.toHaveBeenCalled();
    expect(handles.pickBasemapArchiveHandles).toHaveBeenCalledTimes(1);
  });

  it("opens the handle picker for a 'pick' row", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
    const api = useBasemapArchives();
    expect(api.pendingBasemapArchives.value[0]?.action).toBe("pick");

    await api.activatePendingBasemapArchive("world");

    expect(handles.pickBasemapArchiveHandles).toHaveBeenCalledTimes(1);
    expect(handles.requestBasemapArchivePermission).not.toHaveBeenCalled();
  });
});

describe("openBasemapArchivePicker", () => {
  /** Stands in for the file dialog: a click on the hidden input cancels straight away. */
  function stubInputPicker() {
    return vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function (
      this: HTMLInputElement,
    ) {
      this.dispatchEvent(new Event("cancel"));
    });
  }

  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    useMaplibreLayersStore().layers = [];
  });

  it("falls back to the input picker when the File System Access picker is blocked", async () => {
    // An enterprise policy can block the API while showOpenFilePicker stays on the window.
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.pickBasemapArchiveHandles.mockResolvedValue({ status: "unavailable" });
    const click = stubInputPicker();

    await useBasemapArchives().openBasemapArchivePicker();

    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it("does not open the input picker when the user cancels the file dialog", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.pickBasemapArchiveHandles.mockResolvedValue({
      status: "picked",
      handles: [],
    });
    const click = stubInputPicker();

    await useBasemapArchives().openBasemapArchivePicker();

    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });
});

describe("removeBasemapArchive", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [
      pmtilesLayer("world"),
      {
        name: "bright",
        title: "Bright",
        sourceType: "style",
        styleUrl: "https://example.com/style.json",
      },
    ];
    layersStore.addBasemapArchive = (async (f: File) => pmtilesLayer(f.name)) as never;
    useMapSettingsStore().basemapArchives = [
      {
        fileName: "world.pmtiles",
        kind: "pmtiles",
        key: "world",
      },
    ];
  });

  it("does all five removal steps for the active archive", async () => {
    const mapSettings = useMapSettingsStore();
    const layersStore = useMaplibreLayersStore();
    mapSettings.maplibreBaseLayerName = "world";

    await useBasemapArchives().removeBasemapArchive("world");

    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith("world");
    expect(layersStore.layers.map((layer) => layer.name)).toEqual(["bright"]);
    expect(mapSettings.basemapArchives).toEqual([]);
    expect(mapSettings.maplibreBaseLayerName).toBe("bright");
    expect(lastNotification()).toMatchObject({
      message: "Removed world.pmtiles",
      type: "success",
    });
  });

  it("leaves the active basemap alone when another archive is removed", async () => {
    const mapSettings = useMapSettingsStore();
    mapSettings.maplibreBaseLayerName = "bright";

    await useBasemapArchives().removeBasemapArchive("world");

    expect(mapSettings.maplibreBaseLayerName).toBe("bright");
    expect(mapSettings.basemapArchives).toEqual([]);
  });

  it("keeps the remembered archive when a different archive is removed", async () => {
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [...layersStore.layers, pmtilesLayer("other")];

    await useBasemapArchives().removeBasemapArchive("other");

    expect(useMapSettingsStore().basemapArchives).toMatchObject([{ key: "world" }]);
    expect(layersStore.layers.map((layer) => layer.name)).toEqual(["world", "bright"]);
  });

  it("clears the remembered archive when the pending row is removed", async () => {
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [
      {
        name: "bright",
        title: "Bright",
        sourceType: "style",
        styleUrl: "https://example.com/style.json",
      },
    ];

    await useBasemapArchives().removeBasemapArchive("world");

    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith("world");
    expect(useMapSettingsStore().basemapArchives).toEqual([]);
    expect(useBasemapArchives().pendingBasemapArchives.value).toEqual([]);
  });
});

describe("several remembered archives", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    resetBasemapArchiveSessionState();
    resetHandleMocks();
    useNotifications().clear();
    const layersStore = useMaplibreLayersStore();
    layersStore.layers = [];
    // Adds the layer to the store, as the real action does, so a loaded archive stops being
    // pending.
    layersStore.addBasemapArchive = vi.fn(async (f: File) => {
      const layer = pmtilesLayer(f.name.replace(".pmtiles", ""));
      layersStore.layers = [...layersStore.layers, layer];
      return layer;
    }) as never;
  });

  it("remembers every archive that is opened, not only the last one", async () => {
    const { loadBasemapArchive } = useBasemapArchives();

    await loadBasemapArchive(file("alpha.pmtiles"));
    await loadBasemapArchive(file("bravo.pmtiles"));

    expect(useMapSettingsStore().basemapArchives).toMatchObject([
      { key: "alpha" },
      { key: "bravo" },
    ]);
  });

  it("updates one entry when the same archive is opened again", async () => {
    const { loadBasemapArchive } = useBasemapArchives();

    await loadBasemapArchive(file("alpha.pmtiles"));
    await loadBasemapArchive(file("alpha.pmtiles"));

    expect(useMapSettingsStore().basemapArchives).toHaveLength(1);
  });

  it("gives every archive that is not loaded its own pending row", () => {
    useMapSettingsStore().basemapArchives = [
      { fileName: "alpha.pmtiles", kind: "pmtiles", key: "alpha" },
      { fileName: "bravo.pmtiles", kind: "pmtiles", key: "bravo" },
    ];
    useMaplibreLayersStore().layers = [pmtilesLayer("bravo")];

    expect(useBasemapArchives().pendingBasemapArchives.value).toMatchObject([
      { key: "alpha", fileName: "alpha.pmtiles" },
    ]);
  });

  it("restores one row and leaves the other pending", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);
    handles.loadBasemapArchiveHandle.mockImplementation((async (key: string) => ({
      key,
      handle: fakeHandle(`${key}.pmtiles`),
      fileName: `${key}.pmtiles`,
      savedAt: 1,
    })) as never);
    handles.queryBasemapArchivePermission.mockResolvedValue("granted");
    handles.fileFromHandle.mockResolvedValue(file("alpha.pmtiles"));
    useMapSettingsStore().basemapArchives = [
      { fileName: "alpha.pmtiles", kind: "pmtiles", key: "alpha" },
      { fileName: "bravo.pmtiles", kind: "pmtiles", key: "bravo" },
    ];
    // Only alpha was the active basemap, so only alpha may open by itself.
    useMapSettingsStore().maplibreBaseLayerName = "alpha";
    const { pendingBasemapArchives, restoreRememberedBasemapArchive } =
      useBasemapArchives();

    expect(await restoreRememberedBasemapArchive()).toBe("reopened");

    expect(pendingBasemapArchives.value).toMatchObject([
      { key: "bravo", action: "restore" },
    ]);
  });

  it("removes one archive without disturbing the others", async () => {
    useMapSettingsStore().basemapArchives = [
      { fileName: "alpha.pmtiles", kind: "pmtiles", key: "alpha" },
      { fileName: "bravo.pmtiles", kind: "pmtiles", key: "bravo" },
    ];

    await useBasemapArchives().removeBasemapArchive("alpha");

    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith("alpha");
    expect(handles.deleteBasemapArchiveHandle).not.toHaveBeenCalledWith("bravo");
    expect(useMapSettingsStore().basemapArchives).toMatchObject([{ key: "bravo" }]);
  });

  it("deletes stored handles that no archive is remembered for", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);
    useMapSettingsStore().basemapArchives = [
      { fileName: "alpha.pmtiles", kind: "pmtiles", key: "alpha" },
    ];

    await useBasemapArchives().restoreRememberedBasemapArchive();

    // The orphan sweep is told exactly which keys survive; anything else in IndexedDB goes.
    expect(handles.deleteOrphanBasemapArchiveHandles).toHaveBeenCalledWith(["alpha"]);
  });

  it("deletes every stored handle when nothing is remembered", async () => {
    handles.isFileHandleSupported.mockReturnValue(true);

    await useBasemapArchives().restoreRememberedBasemapArchive();

    expect(handles.deleteOrphanBasemapArchiveHandles).toHaveBeenCalledWith([]);
  });
});
