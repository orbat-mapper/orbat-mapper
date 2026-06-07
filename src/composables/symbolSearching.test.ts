import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import { beforeEach, describe, expect, it } from "vitest";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { useSymbologyData } from "@/composables/symbolData";
import { useSymbologySearch } from "@/composables/symbolSearching";
import { Sidc } from "@/symbology/sidc";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useSymbologySearch", () => {
  it("returns 30-position SIDCs for 2525E common modifier hits", async () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";
    const { loadData } = useSymbologyData();
    await loadData();

    const { search } = useSymbologySearch(ref("3"), ref("15"));
    const results = search("Armored");
    const hit = results.groups.get("Modifier 1")?.find((item) => item.code === "107");

    expect(hit).toBeDefined();
    expect(hit!.sidc).toHaveLength(30);
    expect(new Sidc(hit!.sidc).modifierOne).toBe("107");
  });

  it("does not return 2525E common modifiers for 20-position SIDC mode", async () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";
    const { loadData } = useSymbologyData();
    await loadData();

    const { search } = useSymbologySearch(ref("3"), ref("10"));
    const results = search("Armored");
    const hit = results.groups.get("Modifier 1")?.find((item) => item.code === "107");

    expect(hit).toBeUndefined();
  });
});
