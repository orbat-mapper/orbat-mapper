import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it } from "vitest";
import { activeScenarioKey } from "@/components/injects";
import { useActionSearch, useScenarioSearch } from "./searching";

const SearchHarness = defineComponent({
  setup() {
    return useActionSearch();
  },
  template: "<div />",
});

describe("useActionSearch", () => {
  it("filters revert actions to match baseline availability", () => {
    const hasDistinctOpenedBaseline = ref(false);
    const hasSavedBaseline = ref(false);
    const wrapper = mount(SearchHarness, {
      global: {
        provide: {
          [activeScenarioKey as symbol]: {
            io: {
              hasDistinctOpenedBaseline,
              hasSavedBaseline,
            },
          },
        },
      },
    });

    let actions = (wrapper.vm as unknown as { searchActions: (q: string) => any[] })
      .searchActions("revert")
      .map((item) => item.action);
    expect(actions).toEqual([]);

    hasSavedBaseline.value = true;
    actions = (wrapper.vm as unknown as { searchActions: (q: string) => any[] })
      .searchActions("revert")
      .map((item) => item.action);
    expect(actions).toEqual(["revertToSaved"]);

    hasDistinctOpenedBaseline.value = true;
    actions = (wrapper.vm as unknown as { searchActions: (q: string) => any[] })
      .searchActions("revert")
      .map((item) => item.action);
    expect(actions).toEqual(["restoreOriginal", "revertToSaved"]);
  });
});

describe("useScenarioSearch", () => {
  it("returns the symbol projected for the current scenario time", () => {
    const unitMap: Record<string, any> = {
      "unit-1": {
        id: "unit-1",
        name: "General Belgrano",
        sidc: "10031000000000000000",
        _pid: "unit-parent",
        _state: { sidc: "10031000001100000000" },
      },
      "unit-parent": {
        id: "unit-parent",
        name: "Task Group",
        sidc: "10031000000000000000",
        _state: { sidc: "10031000001200000000" },
      },
    };
    const SearchUnitsHarness = defineComponent({
      setup() {
        return useScenarioSearch();
      },
      template: "<div />",
    });
    const wrapper = mount(SearchUnitsHarness, {
      global: {
        provide: {
          [activeScenarioKey as symbol]: {
            unitActions: {
              units: ref(Object.values(unitMap)),
              getCombinedSymbolOptions: () => ({}),
            },
            store: { state: { events: [], eventMap: {} } },
            geo: { itemsInfo: ref([]), mapLayers: ref([]) },
            helpers: { getUnitById: (id: string) => unitMap[id] },
          },
        },
      },
    });

    const { groups } = (
      wrapper.vm as unknown as { search: (q: string) => { groups: Map<string, any[]> } }
    ).search("Belgrano");
    const [hit] = groups.get("Units")!;

    expect(hit.sidc).toBe("10031000001100000000");
    expect(hit.parent.sidc).toBe("10031000001200000000");
  });
});
