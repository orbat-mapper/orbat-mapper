import { createPinia, setActivePinia } from "pinia";
import { nextTick, ref } from "vue";
import type { SymbolSetMap } from "@/symbology/types";
import { Sidc } from "@/symbology/sidc";
import { beforeEach, describe, expect, it, vi } from "vitest";

const standardLoaders = vi.hoisted(() => ({
  milstd2525: vi.fn(),
  milstd2525e: vi.fn(),
  app6: vi.fn(),
}));

vi.mock("@/symbology/standards", () => ({
  symbologyStandards: {
    "2525d": { load: standardLoaders.milstd2525 },
    "2525e": { load: standardLoaders.milstd2525e },
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
  const [{ useSymbologyData, useSymbolItems }, { useSymbolSettingsStore }] =
    await Promise.all([
      import("@/composables/symbolData"),
      import("@/stores/settingsStore"),
    ]);
  return { useSymbologyData, useSymbolItems, useSymbolSettingsStore };
}

beforeEach(() => {
  vi.resetModules();
  standardLoaders.milstd2525.mockReset();
  standardLoaders.milstd2525e.mockReset();
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

  it("emits 30-position SIDCs for 2525E modifier items", async () => {
    const milstd2525e = createSymbolSetMap("MIL-STD-2525E");
    milstd2525e["10"].modifierOne = [{ code: "107", modifier: "Armored" }];
    standardLoaders.milstd2525e.mockResolvedValue(milstd2525e);

    const { useSymbologyData, useSymbolItems, useSymbolSettingsStore } =
      await loadSubject();
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";
    const { loadData } = useSymbologyData();
    const { mod1Items, csidc, mod1Value } = useSymbolItems(
      ref("150310000000000000000000000000"),
    );
    await loadData();

    const armored = mod1Items.value.find((item) => item.code === "107");
    expect(armored).toBeDefined();
    const armoredSidc = armored!.sidc;
    expect(armoredSidc).toHaveLength(30);
    expect(new Sidc(armoredSidc).modifierOne).toBe("107");

    mod1Value.value = "107";
    expect(csidc.value).toHaveLength(30);
    expect(new Sidc(csidc.value).modifierOne).toBe("107");
  });

  it("keeps 20-position SIDC mode even when the selected standard is 2525E", async () => {
    const milstd2525e = createSymbolSetMap("MIL-STD-2525E");
    milstd2525e["10"].modifierOne = [
      { code: "46", modifier: "Naval" },
      { code: "107", modifier: "Armored" },
    ];
    standardLoaders.milstd2525e.mockResolvedValue(milstd2525e);

    const { useSymbologyData, useSymbolItems, useSymbolSettingsStore } =
      await loadSubject();
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";
    const { loadData } = useSymbologyData();
    const { mod1Items, csidc, mod1Value } = useSymbolItems(ref("10031000000000000000"));
    await loadData();

    expect(mod1Items.value.map((item) => item.code)).toContain("46");
    expect(mod1Items.value.map((item) => item.code)).not.toContain("107");

    mod1Value.value = "46";
    expect(csidc.value).toHaveLength(20);
    expect(new Sidc(csidc.value).modifierOne).toBe("46");
  });
});
