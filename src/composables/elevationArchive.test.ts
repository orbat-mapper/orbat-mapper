// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  resetElevationArchiveSessionState,
  useElevationArchive,
} from "@/composables/elevationArchive";
import { useNotifications } from "@/composables/notifications";
import { useTerrainStore } from "@/stores/terrainStore";
import { MAPTERHORN_ELEVATION_SOURCE } from "@/modules/maplibreview/mapTerrain";

const KEY = "elevation:archive";

const handles = vi.hoisted(() => ({
  isFileHandleSupported: vi.fn(() => true),
  pickBasemapArchiveHandles: vi.fn(),
  fileFromHandle: vi.fn(async () => null as File | null),
  queryBasemapArchivePermission: vi.fn(async () => "granted" as string),
  requestBasemapArchivePermission: vi.fn(async () => "granted" as string),
  saveBasemapArchiveHandle: vi.fn(async () => {}),
  loadBasemapArchiveHandle: vi.fn(async () => null as unknown),
  deleteBasemapArchiveHandle: vi.fn(async () => {}),
}));
vi.mock("@/geo/basemapArchiveHandles", () => handles);

const SOURCE = {
  type: "raster-dem" as const,
  url: "pmtiles://archive:elevation:archive",
};
const elevation = vi.hoisted(() => ({
  ELEVATION_ARCHIVE_KEY: "elevation:archive",
  openElevationArchiveFile: vi.fn(),
  openElevationArchiveUrl: vi.fn(),
  closeElevationArchive: vi.fn(),
}));
vi.mock("@/geo/elevationArchive", () => elevation);

const handle = {
  name: "dem.pmtiles",
  getFile: async () => new File(["x"], "dem.pmtiles"),
};

function lastNotification() {
  const list = useNotifications().notifications.value;
  return list[list.length - 1];
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  resetElevationArchiveSessionState();
  vi.clearAllMocks();
  handles.isFileHandleSupported.mockReturnValue(true);
  handles.queryBasemapArchivePermission.mockResolvedValue("granted");
  handles.requestBasemapArchivePermission.mockResolvedValue("granted");
  handles.loadBasemapArchiveHandle.mockResolvedValue(null);
  handles.fileFromHandle.mockResolvedValue(new File(["x"], "dem.pmtiles"));
  elevation.openElevationArchiveFile.mockResolvedValue(SOURCE);
  elevation.openElevationArchiveUrl.mockResolvedValue(SOURCE);
});

function rememberFile() {
  useTerrainStore().elevationArchive = { kind: "file", fileName: "dem.pmtiles" };
}

describe("useElevationArchive", () => {
  it("opens a picked archive, keeps its handle and turns terrain on", async () => {
    handles.pickBasemapArchiveHandles.mockResolvedValue({
      status: "picked",
      handles: [handle],
    });
    const terrain = useTerrainStore();

    expect(await useElevationArchive().openElevationArchivePicker()).toBe(true);

    expect(terrain.elevationSource).toEqual(SOURCE);
    expect(terrain.elevationArchive).toEqual({ kind: "file", fileName: "dem.pmtiles" });
    expect(terrain.terrainEnabled && terrain.hillshadeEnabled).toBe(true);
    expect(handles.saveBasemapArchiveHandle).toHaveBeenCalledWith(
      KEY,
      handle,
      "dem.pmtiles",
    );
  });

  it("keeps the current source when a file is not an elevation archive", async () => {
    elevation.openElevationArchiveFile.mockRejectedValue(new Error("not elevation"));
    const terrain = useTerrainStore();

    expect(
      await useElevationArchive().loadElevationArchiveFile(new File(["x"], "a.pmtiles")),
    ).toBe(false);

    expect(terrain.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
    expect(terrain.elevationArchive).toBeNull();
    expect(lastNotification()).toMatchObject({ type: "error", message: "not elevation" });
  });

  it("reopens a granted archive at startup when terrain was on", async () => {
    rememberFile();
    useTerrainStore().hillshadeEnabled = true;
    handles.loadBasemapArchiveHandle.mockResolvedValue({ key: KEY, handle });

    expect(await useElevationArchive().restoreRememberedElevationArchive()).toBe(
      "reopened",
    );
    expect(useTerrainStore().elevationSource).toEqual(SOURCE);
  });

  it("offers a restore instead of reading the file when terrain is off", async () => {
    rememberFile();
    handles.loadBasemapArchiveHandle.mockResolvedValue({ key: KEY, handle });
    const api = useElevationArchive();

    expect(await api.restoreRememberedElevationArchive()).toBe("pending");
    expect(elevation.openElevationArchiveFile).not.toHaveBeenCalled();
    expect(useTerrainStore().elevationSource).toBeNull();
    expect(api.pendingElevationArchive.value).toEqual({
      label: "dem.pmtiles",
      action: "restore",
      verb: "Restore",
      menuText: "Restore dem.pmtiles",
    });

    expect(await api.activatePendingElevationArchive()).toBe(true);
    expect(handles.requestBasemapArchivePermission).toHaveBeenCalledWith(handle);
    expect(useTerrainStore().elevationSource).toEqual(SOURCE);
  });

  it("asks for the file again when no handle is stored", async () => {
    rememberFile();
    const api = useElevationArchive();

    expect(await api.restoreRememberedElevationArchive()).toBe("pending");
    expect(api.pendingElevationArchive.value).toEqual({
      label: "dem.pmtiles",
      action: "pick",
      verb: "Select",
      menuText: "Select dem.pmtiles…",
    });
  });

  it("opens a remembered address again by itself", async () => {
    useTerrainStore().elevationArchive = {
      kind: "url",
      url: "https://tiles.example.lan/dem.pmtiles",
    };

    expect(await useElevationArchive().restoreRememberedElevationArchive()).toBe(
      "reopened",
    );
    expect(elevation.openElevationArchiveUrl).toHaveBeenCalledWith(
      "https://tiles.example.lan/dem.pmtiles",
      expect.any(AbortSignal),
    );
    expect(useTerrainStore().elevationSource).toEqual(SOURCE);
  });

  it("drops a stored handle when no archive is remembered", async () => {
    expect(await useElevationArchive().restoreRememberedElevationArchive()).toBe("none");
    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith(KEY);
  });

  it("refuses an address that is not http or https", async () => {
    expect(
      await useElevationArchive().addElevationArchiveUrl("ftp://x/dem.pmtiles"),
    ).toBe(false);
    expect(elevation.openElevationArchiveUrl).not.toHaveBeenCalled();
  });

  it("returns to the default source when the archive is removed", async () => {
    const api = useElevationArchive();
    await api.addElevationArchiveUrl("https://tiles.example.lan/dem.pmtiles");

    await api.removeElevationArchive();

    const terrain = useTerrainStore();
    expect(terrain.elevationArchive).toBeNull();
    expect(terrain.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
    expect(elevation.closeElevationArchive).toHaveBeenCalled();
    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith(KEY);
  });

  it("forgets a remembered archive when online elevation data is chosen", async () => {
    rememberFile();
    const terrain = useTerrainStore();

    await useElevationArchive().chooseOnlineElevation();

    expect(terrain.onlineElevationChosen).toBe(true);
    expect(terrain.elevationArchive).toBeNull();
    expect(terrain.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
    expect(handles.deleteBasemapArchiveHandle).toHaveBeenCalledWith(KEY);
    expect(elevation.closeElevationArchive).toHaveBeenCalled();
  });

  it("abandons a slow restore when the archive is removed meanwhile", async () => {
    const terrain = useTerrainStore();
    terrain.elevationArchive = {
      kind: "url",
      url: "https://tiles.example.lan/dem.pmtiles",
    };
    let resolveOpen!: (source: typeof SOURCE) => void;
    elevation.openElevationArchiveUrl.mockReturnValue(
      new Promise((resolve) => (resolveOpen = resolve)),
    );
    const api = useElevationArchive();

    const restoring = api.restoreRememberedElevationArchive();
    await api.removeElevationArchive();
    resolveOpen(SOURCE);

    expect(await restoring).toBe("none");
    expect(terrain.elevationArchive).toBeNull();
    expect(terrain.elevationSource).toEqual(MAPTERHORN_ELEVATION_SOURCE);
    expect(elevation.openElevationArchiveUrl.mock.calls[0]?.[1]?.aborted).toBe(true);
  });

  it("abandons a slow restore when another archive is chosen meanwhile", async () => {
    const terrain = useTerrainStore();
    terrain.elevationArchive = { kind: "url", url: "https://a.example.lan/dem.pmtiles" };
    let resolveOpen!: (source: typeof SOURCE) => void;
    elevation.openElevationArchiveUrl.mockReturnValueOnce(
      new Promise((resolve) => (resolveOpen = resolve)),
    );
    const api = useElevationArchive();

    const restoring = api.restoreRememberedElevationArchive();
    await api.addElevationArchiveUrl("https://b.example.lan/dem.pmtiles");
    resolveOpen({ ...SOURCE });

    expect(await restoring).toBe("none");
    expect(terrain.elevationArchive).toEqual({
      kind: "url",
      url: "https://b.example.lan/dem.pmtiles",
    });
  });

  it("offers the archive another tab chose instead of labelling the open one with it", async () => {
    const api = useElevationArchive();
    await api.addElevationArchiveUrl("https://a.example.lan/dem.pmtiles");
    const terrain = useTerrainStore();

    // What a storage event from another tab does.
    terrain.elevationArchive = { kind: "url", url: "https://b.example.lan/dem.pmtiles" };

    expect(terrain.elevationSource).toBeNull();
    expect(terrain.elevationArchivePending).toBe(true);
    expect(api.pendingElevationArchive.value?.menuText).toBe(
      "Retry https://b.example.lan/dem.pmtiles",
    );
  });
});
