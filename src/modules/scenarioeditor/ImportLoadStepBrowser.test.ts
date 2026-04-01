// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { defineComponent } from "vue";

import ImportLoadStepBrowser from "@/modules/scenarioeditor/ImportLoadStepBrowser.vue";

const { importScenarioMock, onActionMock, onBulkActionMock } = vi.hoisted(() => ({
  importScenarioMock: vi.fn(),
  onActionMock: vi.fn(),
  onBulkActionMock: vi.fn(),
}));

vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: () => ({
    importScenario: importScenarioMock,
    storedScenarios: [],
    sortOptions: [],
    onAction: onActionMock,
    onBulkAction: onBulkActionMock,
  }),
}));

const StoredScenarioBrowserStub = defineComponent({
  name: "StoredScenarioBrowser",
  props: {
    scenarios: { type: Array, default: () => [] },
    sortOptions: { type: Array, default: () => [] },
    searchInputId: { type: String, default: "" },
    noLink: { type: Boolean, default: false },
    enableBatchActions: { type: Boolean, default: false },
    emptyMessage: { type: String, default: "" },
    gridClass: { type: String, default: "" },
  },
  emits: ["action", "bulk-action"],
  template: "<div />",
});

describe("ImportLoadStepBrowser", () => {
  it("enables batch actions on the shared scenario browser", () => {
    const wrapper = shallowMount(ImportLoadStepBrowser, {
      global: {
        stubs: {
          StoredScenarioBrowser: StoredScenarioBrowserStub,
        },
      },
    });

    expect(
      wrapper.findComponent(StoredScenarioBrowserStub).props("enableBatchActions"),
    ).toBe(true);
  });

  it("forwards bulk actions to the composable handler", async () => {
    const wrapper = shallowMount(ImportLoadStepBrowser, {
      global: {
        stubs: {
          StoredScenarioBrowser: StoredScenarioBrowserStub,
        },
      },
    });

    const scenarios = [{ id: "scenario-1", name: "Scenario 1" }];
    wrapper
      .findComponent(StoredScenarioBrowserStub)
      .vm.$emit("bulk-action", "delete", scenarios);

    expect(onBulkActionMock).toHaveBeenCalledWith("delete", scenarios);
  });
});
