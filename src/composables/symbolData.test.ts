import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import type { SymbolSetMap } from "@/symbology/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const standardLoaders = vi.hoisted(() => ({
  milstd2525: vi.fn(),
  app6: vi.fn(),
}));

vi.mock("@/symbology/standards", () => ({
  symbologyStandards: {
    "2525d": { load: standardLoaders.milstd2525 },
    app6d: { load: standardLoaders.app6 },
  },
}));

function createSymbolSetMap(name: string): SymbolSetMap {
  return {
    "10": {
      symbolSet: "10",
      name,
      mainIcon: [],
      modifierOne: [],
      modifierTwo: [],
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function loadSubject() {
  const [{ useSymbologyData }, { useSymbolSettingsStore }] = await Promise.all([
    import("@/composables/symbolData"),
    import("@/stores/settingsStore"),
  ]);
  return { useSymbologyData, useSymbolSettingsStore };
}

beforeEach(() => {
  vi.resetModules();
  standardLoaders.milstd2525.mockReset();
  standardLoaders.app6.mockReset();
  setActivePinia(createPinia());
});

describe("useSymbologyData", () => {
  it("deduplicates concurrent loads for the selected standard", async () => {
    const data = createSymbolSetMap("MIL-STD-2525D");
    const pending = deferred<SymbolSetMap>();
    standardLoaders.milstd2525.mockReturnValue(pending.promise);

    const { useSymbologyData } = await loadSubject();
    const { loadData, symbology, isLoaded } = useSymbologyData();

    const firstLoad = loadData();
    const secondLoad = loadData();

    expect(standardLoaders.milstd2525).toHaveBeenCalledTimes(1);
    expect(isLoaded.value).toBe(false);

    pending.resolve(data);
    await Promise.all([firstLoad, secondLoad]);

    expect(symbology.value).toBe(data);
    expect(isLoaded.value).toBe(true);
  });

  it("reloads automatically when the selected standard changes", async () => {
    const milstd2525 = createSymbolSetMap("MIL-STD-2525D");
    const app6 = createSymbolSetMap("APP-6");
    standardLoaders.milstd2525.mockResolvedValue(milstd2525);
    standardLoaders.app6.mockResolvedValue(app6);

    const { useSymbologyData, useSymbolSettingsStore } = await loadSubject();
    const settingsStore = useSymbolSettingsStore();
    const { loadData, symbology } = useSymbologyData();
    await loadData();

    settingsStore.symbologyStandard = "app6d";
    await nextTick();
    await vi.waitFor(() => expect(symbology.value).toBe(app6));

    expect(standardLoaders.app6).toHaveBeenCalledTimes(1);
  });

  it("keeps the latest selection when an older load resolves last", async () => {
    const milstd2525 = createSymbolSetMap("MIL-STD-2525D");
    const app6 = createSymbolSetMap("APP-6");
    const pendingMilstd2525 = deferred<SymbolSetMap>();
    const pendingApp6 = deferred<SymbolSetMap>();
    standardLoaders.milstd2525.mockReturnValue(pendingMilstd2525.promise);
    standardLoaders.app6.mockReturnValue(pendingApp6.promise);

    const { useSymbologyData, useSymbolSettingsStore } = await loadSubject();
    const settingsStore = useSymbolSettingsStore();
    const { loadData, symbology, isLoaded } = useSymbologyData();
    const oldLoad = loadData();

    settingsStore.symbologyStandard = "app6d";
    const latestLoad = loadData();
    pendingApp6.resolve(app6);
    await latestLoad;

    pendingMilstd2525.resolve(milstd2525);
    await oldLoad;

    expect(symbology.value).toBe(app6);
    expect(isLoaded.value).toBe(true);
  });

  it("invalidates a pending load when switching back to the loaded standard", async () => {
    const milstd2525 = createSymbolSetMap("MIL-STD-2525D");
    const app6 = createSymbolSetMap("APP-6");
    const pendingApp6 = deferred<SymbolSetMap>();
    standardLoaders.milstd2525.mockResolvedValue(milstd2525);
    standardLoaders.app6.mockReturnValue(pendingApp6.promise);

    const { useSymbologyData, useSymbolSettingsStore } = await loadSubject();
    const settingsStore = useSymbolSettingsStore();
    const { loadData, symbology, isLoaded } = useSymbologyData();
    await loadData();

    settingsStore.symbologyStandard = "app6d";
    const obsoleteLoad = loadData();
    settingsStore.symbologyStandard = "2525d";
    await loadData();

    pendingApp6.resolve(app6);
    await obsoleteLoad;

    expect(symbology.value).toBe(milstd2525);
    expect(isLoaded.value).toBe(true);
  });
});
