import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it } from "vitest";
import { activeScenarioKey } from "@/components/injects";
import { useActionSearch } from "./searching";

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
