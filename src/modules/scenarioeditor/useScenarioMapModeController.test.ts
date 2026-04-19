// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { useScenarioMapModeController } from "@/modules/scenarioeditor/useScenarioMapModeController";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useSelectedItems } from "@/stores/selectedStore";

const Harness = defineComponent({
  setup() {
    const { showDetailsPanel } = useScenarioMapModeController(() => {});
    return { showDetailsPanel };
  },
  template: "<div>{{ showDetailsPanel ? 'open' : 'closed' }}</div>",
});

describe("useScenarioMapModeController", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().clear();
  });

  it("opens the details panel while route mode is active without a selection", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    toolbarStore.currentToolbar = "route";

    const wrapper = mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            store: {
              state: {
                currentTime: 0,
              },
            },
            time: {
              setCurrentTime: vi.fn(),
              add: vi.fn(),
              subtract: vi.fn(),
              goToNextScenarioEvent: vi.fn(),
              goToPrevScenarioEvent: vi.fn(),
            },
          } as any,
          [timeModalKey as symbol]: {
            getModalTimestamp: vi.fn(),
          },
        },
      },
    });

    expect(wrapper.text()).toBe("open");
  });
});
