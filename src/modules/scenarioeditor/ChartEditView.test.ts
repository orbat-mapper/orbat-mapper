// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEventHook } from "@vueuse/core";
import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick } from "vue";
import ChartEditView from "./ChartEditView.vue";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { ChartTabs } from "@/modules/charteditor/constants";
import { useSelectedChartElementStore } from "@/modules/charteditor/chartSettingsStore";

const TEST_SIDC = "10031000001211000000";

const OrbatChartSettingsStub = defineComponent({
  name: "OrbatChartSettings",
  props: {
    tab: {
      type: String,
      default: null,
    },
  },
  emits: ["update:tab"],
  template: `
    <div>
      <span data-testid="current-settings-tab">{{ tab }}</span>
      <button
        type="button"
        data-testid="emit-unit-tab"
        @click="$emit('update:tab', '${ChartTabs.Unit}')"
      >
        Units
      </button>
    </div>
  `,
});

const PassthroughStub = defineComponent({
  template: "<div><slot /></div>",
});

const mountedWrappers: VueWrapper[] = [];

function createSearchActions() {
  return {
    onUnitSelectHook: createEventHook<{ unitId: string }>(),
    onLayerSelectHook: createEventHook<{ layerId: string }>(),
    onImageLayerSelectHook: createEventHook<{ layerId: string }>(),
    onFeatureSelectHook: createEventHook<{ featureId: string; layerId: string }>(),
    onEventSelectHook: createEventHook<any>(),
    onPlaceSelectHook: createEventHook<any>(),
    onScenarioActionHook: createEventHook<any>(),
  };
}

function createScenario() {
  const side = { id: "side-1", name: "Blue side" };
  const sideGroup = { id: "group-1", name: "Main group" };
  const units = {
    "root-1": {
      id: "root-1",
      name: "Root One",
      shortName: "R1",
      sidc: TEST_SIDC,
      symbolOptions: {},
    },
    "root-2": {
      id: "root-2",
      name: "Root Two",
      shortName: "R2",
      sidc: TEST_SIDC,
      symbolOptions: {},
    },
  } as const;

  return {
    unitActions: {
      expandUnitWithSymbolOptions: (unit: (typeof units)[keyof typeof units] | null) =>
        unit ? { ...unit, symbolOptions: unit.symbolOptions ?? {} } : null,
      getUnitHierarchy: (unitId: keyof typeof units) => ({
        side,
        sideGroup,
        parents: [],
        unit: units[unitId],
      }),
    },
    store: { state: {} },
    helpers: {
      getUnitById: (unitId: keyof typeof units) => units[unitId] ?? null,
    },
  };
}

function mountChartEditView() {
  const wrapper = mount(ChartEditView, {
    global: {
      provide: {
        [activeScenarioKey as symbol]: createScenario(),
        [searchActionsKey as symbol]: createSearchActions(),
      },
      stubs: {
        Tabs: PassthroughStub,
        TabsList: PassthroughStub,
        TabsTrigger: PassthroughStub,
        TabsContent: PassthroughStub,
        OrbatPanel: PassthroughStub,
        OrbatChart: PassthroughStub,
        OrbatChartSettings: OrbatChartSettingsStub,
        SimpleBreadcrumbs: PassthroughStub,
        ToggleField: PassthroughStub,
        ResizablePanel: PassthroughStub,
        DotsMenu: PassthroughStub,
      },
    },
  });

  mountedWrappers.push(wrapper);
  return wrapper;
}

describe("ChartEditView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const selectedItems = useSelectedItems();
    selectedItems.clear();
    selectedItems.activeUnitId.value = null;
  });

  afterEach(() => {
    mountedWrappers.pop()?.unmount();
  });

  it("clears chart selection when the active root unit changes", async () => {
    const { activeUnitId } = useSelectedItems();
    const selectedChartElementStore = useSelectedChartElementStore();

    activeUnitId.value = "root-1";
    mountChartEditView();
    await nextTick();

    selectedChartElementStore.selectLevel(2);
    expect(selectedChartElementStore.level).toBe(2);

    activeUnitId.value = "root-2";
    await nextTick();

    expect(selectedChartElementStore.node).toBeNull();
    expect(selectedChartElementStore.level).toBeNull();
    expect(selectedChartElementStore.branch).toBeNull();
  });

  it("updates the current settings tab when the settings panel emits update:tab", async () => {
    const { activeUnitId } = useSelectedItems();
    activeUnitId.value = "root-1";

    const wrapper = mountChartEditView();
    expect(wrapper.get("[data-testid='current-settings-tab']").text()).toBe(
      ChartTabs.Chart,
    );

    await wrapper.get("[data-testid='emit-unit-tab']").trigger("click");
    await nextTick();

    expect(wrapper.get("[data-testid='current-settings-tab']").text()).toBe(
      ChartTabs.Unit,
    );
  });
});
