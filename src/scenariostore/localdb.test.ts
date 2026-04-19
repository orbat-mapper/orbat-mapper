import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Scenario } from "@/types/scenarioModels";

type StoreState = {
  keyPath?: string;
  values: Map<string, any>;
  indexes: Set<string>;
};

const { openDBMock } = vi.hoisted(() => ({
  openDBMock: vi.fn(),
}));

vi.mock("idb", () => ({
  openDB: openDBMock,
}));

vi.mock("@/utils/files", () => ({
  saveBlobToLocalFile: vi.fn(),
}));

function createScenario(id: string, name = "Scenario"): Scenario {
  const now = "2025-01-01T00:00:00.000Z";
  const startTime = Date.parse(now);
  return {
    id,
    type: "ORBAT-mapper",
    version: "3.2.0",
    meta: {
      createdDate: now,
      lastModifiedDate: now,
    },
    name,
    description: "",
    startTime,
    timeZone: "UTC",
    symbologyStandard: "2525",
    sides: [],
    events: [],
    layerStack: [{ id: "layer-1", kind: "overlay", name: "Features", items: [] }],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
  };
}

function createStoreState(keyPath?: string): StoreState {
  return {
    keyPath,
    values: new Map(),
    indexes: new Set(),
  };
}

function createMockDb(
  initialVersion = 0,
  initialStores: Record<string, StoreState> = {},
) {
  const stores = new Map<string, StoreState>(Object.entries(initialStores));
  let version = initialVersion;

  function ensureStore(name: string) {
    if (!stores.has(name)) {
      stores.set(name, createStoreState());
    }
    return stores.get(name)!;
  }

  function makeObjectStore(name: string) {
    const store = ensureStore(name);
    return {
      createIndex(indexName: string) {
        store.indexes.add(indexName);
      },
      deleteIndex(indexName: string) {
        store.indexes.delete(indexName);
      },
      add(value: any, key?: string) {
        const recordKey = key ?? value?.[store.keyPath ?? "id"];
        store.values.set(recordKey, value);
        return Promise.resolve(recordKey);
      },
      put(value: any, key?: string) {
        const recordKey = key ?? value?.[store.keyPath ?? "id"];
        store.values.set(recordKey, value);
        return Promise.resolve(recordKey);
      },
      get(key: string) {
        return Promise.resolve(store.values.get(key));
      },
      delete(key: string) {
        store.values.delete(key);
        return Promise.resolve();
      },
    };
  }

  const db = {
    createObjectStore(name: string, options?: { keyPath?: string }) {
      const storeState = createStoreState(options?.keyPath);
      stores.set(name, storeState);
      return makeObjectStore(name);
    },
    add(name: string, value: any, key?: string) {
      return makeObjectStore(name).add(value, key);
    },
    put(name: string, value: any, key?: string) {
      return makeObjectStore(name).put(value, key);
    },
    get(name: string, key: string) {
      return makeObjectStore(name).get(key);
    },
    delete(name: string, key: string) {
      return makeObjectStore(name).delete(key);
    },
    getAllFromIndex(name: string) {
      const store = ensureStore(name);
      return Promise.resolve(Array.from(store.values.values()));
    },
    transaction(storeNames: string[]) {
      return {
        objectStore(name: string) {
          if (!storeNames.includes(name)) {
            throw new Error(`Store ${name} not available in transaction`);
          }
          return makeObjectStore(name);
        },
        done: Promise.resolve(),
      };
    },
    close: vi.fn(),
    __stores: stores,
    __getVersion: () => version,
    __setVersion: (nextVersion: number) => {
      version = nextVersion;
    },
  };

  return db;
}

describe("localdb draft persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("stores, loads, and deletes scenario drafts", async () => {
    const db = createMockDb();
    openDBMock.mockImplementation(async (_name, nextVersion, { upgrade }) => {
      upgrade?.(db as any, 0, nextVersion, {
        objectStore: (name: string) => db.transaction([name]).objectStore(name),
      });
      db.__setVersion(nextVersion);
      return db as any;
    });

    const { useIndexedDb } = await import("./localdb");
    const api = await useIndexedDb();
    const scenario = createScenario("scenario-1");

    await api.putScenarioDraft("scenario-1", scenario, {
      updatedAt: 1234,
      appVersion: "test",
    });

    expect(await api.getScenarioDraft("scenario-1")).toMatchObject({
      scenarioId: "scenario-1",
      scenario: expect.objectContaining({ id: "scenario-1" }),
      updatedAt: 1234,
      appVersion: "test",
    });

    await api.deleteScenarioDraft("scenario-1");

    expect(await api.getScenarioDraft("scenario-1")).toBeUndefined();
  });

  it("deletes associated drafts when scenarios are deleted", async () => {
    const db = createMockDb();
    openDBMock.mockImplementation(async (_name, nextVersion, { upgrade }) => {
      upgrade?.(db as any, 0, nextVersion, {
        objectStore: (name: string) => db.transaction([name]).objectStore(name),
      });
      db.__setVersion(nextVersion);
      return db as any;
    });

    const { useIndexedDb } = await import("./localdb");
    const api = await useIndexedDb();
    const scenario = createScenario("scenario-1");

    await api.addScenario(scenario);
    await api.putScenarioDraft("scenario-1", scenario, { updatedAt: 555 });
    await api.deleteScenario("scenario-1");

    expect(await api.loadScenario("scenario-1")).toBeUndefined();
    expect(await api.getScenarioDraft("scenario-1")).toBeUndefined();
  });

  it("upgrades an existing version 3 database and keeps canonical scenarios intact", async () => {
    const scenario = createScenario("scenario-upgrade", "Upgraded Scenario");
    const existingBlobStore = createStoreState();
    existingBlobStore.values.set("scenario-upgrade", scenario);
    const existingMetadataStore = createStoreState("id");
    existingMetadataStore.indexes.add("by-created");
    existingMetadataStore.indexes.add("by-modified");
    existingMetadataStore.values.set("scenario-upgrade", {
      id: "scenario-upgrade",
      name: "Upgraded Scenario",
      description: "",
      created: new Date(scenario.meta?.createdDate ?? ""),
      modified: new Date(scenario.meta?.lastModifiedDate ?? ""),
      image: "",
    });

    const db = createMockDb(3, {
      "scenario-blobs": existingBlobStore,
      "scenario-metadata": existingMetadataStore,
    });

    openDBMock.mockImplementation(async (_name, nextVersion, { upgrade }) => {
      if (db.__getVersion() < nextVersion) {
        upgrade?.(db as any, db.__getVersion(), nextVersion, {
          objectStore: (name: string) => db.transaction([name]).objectStore(name),
        });
        db.__setVersion(nextVersion);
      }
      return db as any;
    });

    const { useIndexedDb } = await import("./localdb");
    const api = await useIndexedDb();

    expect(await api.loadScenario("scenario-upgrade")).toMatchObject({
      id: "scenario-upgrade",
      name: "Upgraded Scenario",
    });

    await api.putScenarioDraft("scenario-upgrade", scenario, { updatedAt: 999 });

    expect(await api.getScenarioDraft("scenario-upgrade")).toMatchObject({
      scenarioId: "scenario-upgrade",
      updatedAt: 999,
    });
    expect(db.__stores.has("scenario-drafts")).toBe(true);
  });
});
