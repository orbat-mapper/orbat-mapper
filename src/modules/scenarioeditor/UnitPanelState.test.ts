// @vitest-environment jsdom
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnitPanelState from "./UnitPanelState.vue";
import { activeScenarioKey, sidcModalKey, timeModalKey } from "@/components/injects";

vi.mock("@/geo/utils", () => ({
  formatDateString: () => "2025-01-01 00:00",
  formatPosition: () => "",
}));

vi.mock("@/composables/scenarioActions", () => ({
  useUnitActions: () => ({
    onUnitAction: vi.fn(),
  }),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: () => ({
    activeStateItem: null,
  }),
}));

vi.mock("@/stores/selectedWaypoints", () => ({
  useSelectedWaypoints: () => ({
    selectedWaypointIds: { value: new Set() },
  }),
}));

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({}),
}));

describe("UnitPanelState", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("adds reinforcedStatus to timed symbol state updates", async () => {
    const addUnitStateEntry = vi.fn();
    const getModalSidc = vi.fn().mockResolvedValue({
      sidc: "10031000001211000000",
      symbolOptions: { fillColor: "#0055FF" },
      reinforcedStatus: "None",
    });

    const wrapper = mount(UnitPanelState, {
      props: {
        unit: {
          id: "unit-1",
          name: "Unit",
          sidc: "10031000001211000000",
          reinforcedStatus: "Reinforced",
          subUnits: [],
          _pid: "group-1",
          _sid: "side-1",
          _state: {
            t: 1000,
            sidc: "10031000001211000000",
            reinforcedStatus: "Reduced",
          },
          state: [],
        },
      },
      global: {
        provide: {
          [activeScenarioKey as symbol]: {
            store: {
              state: {
                currentTime: 1000,
                info: { timeZone: "UTC" },
                unitStatusMap: {},
              },
            },
            time: { setCurrentTime: vi.fn() },
            unitActions: {
              addUnitStateEntry,
              getCombinedSymbolOptions: vi.fn(() => ({ fillColor: "#FF0000" })),
              deleteUnitStateEntry: vi.fn(),
              updateUnit: vi.fn(),
              updateUnitStateEntry: vi.fn(),
              convertStateEntryToInitialLocation: vi.fn(),
            },
          },
          [sidcModalKey as symbol]: {
            getModalSidc,
          },
          [timeModalKey as symbol]: {
            getModalTimestamp: vi.fn(),
          },
        },
        stubs: {
          SplitButton: {
            props: ["items"],
            template:
              '<button data-test="change-symbol" @click="items[0].onClick()">Change symbol</button>',
          },
          DotsMenu: true,
          IconButton: true,
          CoordinateInput: true,
          UnitStatusPopover: true,
          Input: true,
        },
      },
    });

    await wrapper.get('[data-test="change-symbol"]').trigger("click");
    await flushPromises();

    expect(getModalSidc).toHaveBeenCalledWith(
      "10031000001211000000",
      expect.objectContaining({
        reinforcedStatus: "Reduced",
      }),
    );
    expect(addUnitStateEntry).toHaveBeenCalledWith(
      "unit-1",
      {
        sidc: "10031000001211000000",
        t: 1000,
        symbolOptions: { fillColor: "#0055FF" },
        reinforcedStatus: "None",
      },
      true,
    );
  });
});
