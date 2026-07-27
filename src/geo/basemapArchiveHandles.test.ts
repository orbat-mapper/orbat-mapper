// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BasemapArchiveFileHandle,
  FilePermissionState,
} from "./basemapArchiveHandles";
import {
  deleteBasemapArchiveHandle,
  deleteOrphanBasemapArchiveHandles,
  fileFromHandle,
  isFileHandleSupported,
  loadBasemapArchiveHandle,
  pickBasemapArchiveHandles,
  queryBasemapArchivePermission,
  requestBasemapArchivePermission,
  saveBasemapArchiveHandle,
} from "./basemapArchiveHandles";

const { putArchiveHandle, getArchiveHandle, deleteArchiveHandle, listArchiveHandleKeys } =
  vi.hoisted(() => ({
    putArchiveHandle: vi.fn(),
    getArchiveHandle: vi.fn(),
    deleteArchiveHandle: vi.fn(),
    listArchiveHandleKeys: vi.fn(),
  }));

const buildSeam = vi.hoisted(() => ({ canPersistFileHandles: true }));

vi.mock("@/utils/runtimeEnvironment", () => ({
  get canPersistFileHandles() {
    return buildSeam.canPersistFileHandles;
  },
  isGeoSearchAvailable: true,
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    putArchiveHandle,
    getArchiveHandle,
    deleteArchiveHandle,
    listArchiveHandleKeys,
  }),
}));

const EXTENSIONS = [".pmtiles", ".mapbundle"] as const;

interface FakeHandleOptions {
  name?: string;
  getFile?: () => Promise<File>;
  queryPermission?: (descriptor: {
    mode: "read" | "readwrite";
  }) => Promise<FilePermissionState>;
  requestPermission?: (descriptor: {
    mode: "read" | "readwrite";
  }) => Promise<FilePermissionState>;
}

/** A structural stand-in for a FileSystemFileHandle. Built from an object literal on purpose. */
function fakeHandle(options: FakeHandleOptions = {}): BasemapArchiveFileHandle {
  const name = options.name ?? "world.pmtiles";
  const handle: BasemapArchiveFileHandle = {
    name,
    getFile: options.getFile ?? (async () => new File(["tiles"], name)),
  };
  if (options.queryPermission) handle.queryPermission = options.queryPermission;
  if (options.requestPermission) handle.requestPermission = options.requestPermission;
  return handle;
}

function notFoundError() {
  return new DOMException(
    "A requested file or directory could not be found",
    "NotFoundError",
  );
}

/** The shape the module reads off globalThis. Only what the assertions below need. */
type PickerOptions = {
  multiple?: boolean;
  types?: { description: string; accept: Record<string, string[]> }[];
};
type PickerMock = (options?: PickerOptions) => Promise<BasemapArchiveFileHandle[]>;

/** Puts the runtime in the state Chromium is in: picker present, handle type present. */
function enableFileHandleSupport(
  picker = vi.fn<PickerMock>(async () => [] as BasemapArchiveFileHandle[]),
) {
  vi.stubGlobal("showOpenFilePicker", picker);
  vi.stubGlobal("FileSystemFileHandle", class {});
  return picker;
}

/** `in` is what the capability check uses, so the property has to go away, not become undefined. */
function removeFileSystemFileHandle() {
  Reflect.deleteProperty(globalThis, "FileSystemFileHandle");
}

beforeEach(() => {
  putArchiveHandle.mockReset().mockResolvedValue(undefined);
  getArchiveHandle.mockReset().mockResolvedValue(undefined);
  deleteArchiveHandle.mockReset().mockResolvedValue(undefined);
  listArchiveHandleKeys.mockReset().mockResolvedValue([]);
  buildSeam.canPersistFileHandles = true;
  removeFileSystemFileHandle();
});

afterEach(() => {
  removeFileSystemFileHandle();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isFileHandleSupported", () => {
  it("is false when showOpenFilePicker is missing", () => {
    vi.stubGlobal("FileSystemFileHandle", class {});
    expect(isFileHandleSupported()).toBe(false);
  });

  it("is false when FileSystemFileHandle is missing", () => {
    vi.stubGlobal("showOpenFilePicker", vi.fn());
    removeFileSystemFileHandle();
    expect(isFileHandleSupported()).toBe(false);
  });

  it("is false in a build that cannot persist a handle, whatever the browser has", () => {
    enableFileHandleSupport();
    buildSeam.canPersistFileHandles = false;

    expect(isFileHandleSupported()).toBe(false);
  });

  it("is true when the origin, the picker and the handle type are all present", () => {
    enableFileHandleSupport();
    expect(isFileHandleSupported()).toBe(true);
  });
});

describe("storage without support", () => {
  it("does not touch the database", async () => {
    // No picker stubbed, so the capability check is false.
    await expect(
      saveBasemapArchiveHandle("world", fakeHandle(), "world.pmtiles"),
    ).resolves.toBe(undefined);
    await expect(loadBasemapArchiveHandle("world")).resolves.toBeNull();
    await expect(deleteBasemapArchiveHandle("world")).resolves.toBe(undefined);
    await expect(pickBasemapArchiveHandles(EXTENSIONS)).resolves.toEqual({
      status: "unavailable",
    });
    expect(putArchiveHandle).not.toHaveBeenCalled();
    expect(getArchiveHandle).not.toHaveBeenCalled();
    expect(deleteArchiveHandle).not.toHaveBeenCalled();
  });
});

describe("save, load and delete", () => {
  beforeEach(() => {
    enableFileHandleSupport();
  });

  it("round-trips a granted handle through storage", async () => {
    const handle = fakeHandle({ queryPermission: async () => "granted" });
    vi.setSystemTime(new Date("2026-01-02T03:04:05Z"));
    await saveBasemapArchiveHandle("world", handle, "world.pmtiles");
    expect(putArchiveHandle).toHaveBeenCalledWith({
      key: "world",
      handle,
      fileName: "world.pmtiles",
      savedAt: Date.parse("2026-01-02T03:04:05Z"),
    });
    vi.useRealTimers();

    const stored = putArchiveHandle.mock.calls[0][0];
    getArchiveHandle.mockResolvedValue(stored);
    const record = await loadBasemapArchiveHandle("world");
    expect(record?.key).toBe("world");
    expect(record?.fileName).toBe("world.pmtiles");
    expect(await queryBasemapArchivePermission(record!.handle)).toBe("granted");
    expect(await fileFromHandle(record!.handle)).toBeInstanceOf(File);
  });

  it("swallows a rejecting write", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    putArchiveHandle.mockRejectedValue(new Error("quota"));
    await expect(
      saveBasemapArchiveHandle("world", fakeHandle(), "world.pmtiles"),
    ).resolves.toBe(undefined);
  });

  it("returns null for an unknown key and for a throwing read", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    getArchiveHandle.mockResolvedValue(undefined);
    await expect(loadBasemapArchiveHandle("nope")).resolves.toBeNull();
    getArchiveHandle.mockRejectedValue(new Error("blocked"));
    await expect(loadBasemapArchiveHandle("world")).resolves.toBeNull();
  });

  it("deletes the stored handle", async () => {
    await deleteBasemapArchiveHandle("world");
    expect(deleteArchiveHandle).toHaveBeenCalledWith("world");
  });

  it("swallows a rejecting delete", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    deleteArchiveHandle.mockRejectedValue(new Error("blocked"));
    await expect(deleteBasemapArchiveHandle("world")).resolves.toBe(undefined);
  });
});

describe("fileFromHandle", () => {
  it("returns the file on success", async () => {
    const file = new File(["tiles"], "world.pmtiles");
    const result = await fileFromHandle(fakeHandle({ getFile: async () => file }));
    expect(result).toBe(file);
  });

  it("returns null for a stale handle whose file was moved, renamed or deleted", async () => {
    const handle = fakeHandle({
      getFile: async () => {
        throw notFoundError();
      },
    });
    await expect(fileFromHandle(handle)).resolves.toBeNull();
  });
});

describe("permissions", () => {
  it("reports the queried state, and 'prompt' does not read the file", async () => {
    const getFile = vi.fn(async () => new File(["tiles"], "world.pmtiles"));
    const handle = fakeHandle({ getFile, queryPermission: async () => "prompt" });
    expect(await queryBasemapArchivePermission(handle)).toBe("prompt");
    // Querying is safe at startup: it neither prompts nor opens anything.
    expect(getFile).not.toHaveBeenCalled();
  });

  it("reports 'unsupported' when the methods are absent", async () => {
    const handle = fakeHandle();
    expect(await queryBasemapArchivePermission(handle)).toBe("unsupported");
    expect(await requestBasemapArchivePermission(handle)).toBe("unsupported");
  });

  it("reports 'denied' when the calls throw", async () => {
    const handle = fakeHandle({
      queryPermission: async () => {
        throw new DOMException("nope", "SecurityError");
      },
      requestPermission: async () => {
        throw new DOMException("no transient activation", "SecurityError");
      },
    });
    expect(await queryBasemapArchivePermission(handle)).toBe("denied");
    expect(await requestBasemapArchivePermission(handle)).toBe("denied");
  });

  it("passes the read mode to both methods and returns the granted state", async () => {
    const queryPermission = vi.fn(async () => "granted" as FilePermissionState);
    const requestPermission = vi.fn(async () => "granted" as FilePermissionState);
    const handle = fakeHandle({ queryPermission, requestPermission });
    expect(await queryBasemapArchivePermission(handle)).toBe("granted");
    expect(await requestBasemapArchivePermission(handle)).toBe("granted");
    expect(queryPermission).toHaveBeenCalledWith({ mode: "read" });
    expect(requestPermission).toHaveBeenCalledWith({ mode: "read" });
  });
});

describe("pickBasemapArchiveHandles", () => {
  it("passes the extensions through to the picker", async () => {
    const handle = fakeHandle();
    const picker = enableFileHandleSupport(vi.fn<PickerMock>(async () => [handle]));
    await expect(pickBasemapArchiveHandles(EXTENSIONS)).resolves.toEqual({
      status: "picked",
      handles: [handle],
    });
    expect(picker).toHaveBeenCalledWith({
      multiple: false,
      types: [
        {
          description: "Basemap archive",
          accept: { "application/octet-stream": [".pmtiles", ".mapbundle"] },
        },
      ],
    });
  });

  it("passes multiple through", async () => {
    const picker = enableFileHandleSupport(
      vi.fn<PickerMock>(async () => [] as BasemapArchiveFileHandle[]),
    );
    await pickBasemapArchiveHandles(EXTENSIONS, true);
    expect(picker.mock.calls[0][0]).toMatchObject({ multiple: true });
  });

  it("reports a cancel as a pick of nothing", async () => {
    enableFileHandleSupport(
      vi.fn(async () => {
        throw new DOMException("The user aborted a request.", "AbortError");
      }),
    );
    await expect(pickBasemapArchiveHandles(EXTENSIONS)).resolves.toEqual({
      status: "picked",
      handles: [],
    });
  });

  it("reports a blocked picker as unavailable, so the caller can fall back", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // What an enterprise policy that blocks the File System Access API does: the function is still
    // on the window, so the capability check passes, but every call rejects.
    enableFileHandleSupport(
      vi.fn(async () => {
        throw new DOMException("File system access is blocked.", "SecurityError");
      }),
    );
    await expect(pickBasemapArchiveHandles(EXTENSIONS)).resolves.toEqual({
      status: "unavailable",
    });
  });
});

describe("deleteOrphanBasemapArchiveHandles", () => {
  it("deletes only the handles no archive is remembered for", async () => {
    enableFileHandleSupport();
    listArchiveHandleKeys.mockResolvedValue(["alpha", "bravo", "charlie"]);

    const removed = await deleteOrphanBasemapArchiveHandles(["bravo"]);

    expect(removed).toBe(2);
    expect(deleteArchiveHandle).toHaveBeenCalledWith("alpha");
    expect(deleteArchiveHandle).toHaveBeenCalledWith("charlie");
    expect(deleteArchiveHandle).not.toHaveBeenCalledWith("bravo");
  });

  it("does nothing where the API is not supported", async () => {
    listArchiveHandleKeys.mockResolvedValue(["alpha"]);

    expect(await deleteOrphanBasemapArchiveHandles([])).toBe(0);
    expect(deleteArchiveHandle).not.toHaveBeenCalled();
  });

  it("survives a failing read", async () => {
    enableFileHandleSupport();
    listArchiveHandleKeys.mockRejectedValue(new Error("blocked"));

    expect(await deleteOrphanBasemapArchiveHandles([])).toBe(0);
  });
});
