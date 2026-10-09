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

const selectedUnitIds = { value: new Set<string>() };
vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({ selectedUnitIds }),
}));

function mountPanel({
  addUnitStateEntry,
  getModalSidc,
  isMultiMode = false,
  standardIdentities = {},
}: {
  addUnitStateEntry: ReturnType<typeof vi.fn>;
  getModalSidc: ReturnType<typeof vi.fn>;
  isMultiMode?: boolean;
  standardIdentities?: Record<string, string>;
}) {
  return mount(UnitPanelState, {
    props: {
      isMultiMode,
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
            groupUpdate: (fn: () => void) => fn(),
          },
          time: { setCurrentTime: vi.fn() },
          helpers: { getUnitById: (id: string) => ({ id }) },
          unitActions: {
            addUnitStateEntry,
            getCombinedSymbolOptions: vi.fn(() => ({ fillColor: "#FF0000" })),
            getUnitHierarchy: (id: string) => ({
              side: { standardIdentity: standardIdentities[id] ?? "3" },
            }),
            isUnitLocked: (id: string) => id === "locked-unit",
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
}

describe("UnitPanelState", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    selectedUnitIds.value = new Set();
  });

  it("adds reinforcedStatus to timed symbol state updates", async () => {
    const addUnitStateEntry = vi.fn();
    const getModalSidc = vi.fn().mockResolvedValue({
      sidc: "10031000001211000000",
      symbolOptions: { fillColor: "#0055FF" },
      reinforcedStatus: "None",
    });

    const wrapper = mountPanel({ addUnitStateEntry, getModalSidc });

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

  it("adds symbol changes to all unlocked selected units, keeping each side's identity", async () => {
    const addUnitStateEntry = vi.fn();
    const getModalSidc = vi.fn().mockResolvedValue({
      sidc: "10031000001211000000",
      symbolOptions: {},
      reinforcedStatus: "None",
    });
    selectedUnitIds.value = new Set(["unit-1", "unit-2", "locked-unit"]);

    const wrapper = mountPanel({
      addUnitStateEntry,
      getModalSidc,
      isMultiMode: true,
      standardIdentities: { "unit-2": "6" },
    });

    await wrapper.get('[data-test="change-symbol"]').trigger("click");
    await flushPromises();

    expect(addUnitStateEntry).toHaveBeenCalledTimes(2);
    expect(addUnitStateEntry).toHaveBeenCalledWith(
      "unit-1",
      expect.objectContaining({ sidc: "10031000001211000000" }),
      true,
    );
    expect(addUnitStateEntry).toHaveBeenCalledWith(
      "unit-2",
      expect.objectContaining({ sidc: "10061000001211000000" }),
      true,
    );
  });
});
