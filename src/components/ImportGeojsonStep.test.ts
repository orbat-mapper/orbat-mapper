// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import length from "@turf/length";
import ImportGeojsonStep from "@/components/ImportGeojsonStep.vue";
import { activeScenarioKey } from "@/components/injects";
import type { Feature as GeoJSONFeature, LineString } from "geojson";

const InputRadioStub = defineComponent({
  name: "InputRadio",
  props: ["modelValue", "value"],
  emits: ["update:modelValue"],
  template:
    "<button type='button' :data-value='value' @click='$emit(\"update:modelValue\", value)'><slot /></button>",
});

const DataGridStub = defineComponent({
  name: "DataGrid",
  props: ["data", "columns", "selected"],
  emits: ["update:selected"],
  template: "<div data-testid='data-grid' />",
});

const UnitTreeSelectStub = defineComponent({
  name: "UnitTreeSelect",
  props: ["modelValue", "units"],
  emits: ["update:modelValue"],
  template:
    "<button type='button' data-testid='unit-tree-select' @click='$emit(\"update:modelValue\", \"group-unit\")'>{{ units.join(',') }}</button>",
});

const timedLineFeature = {
  type: "Feature" as const,
  properties: {
    name: "Route",
    coordinateProperties: {
      times: ["2026-04-28T10:00:00Z", "2026-04-28T10:05:00Z"],
    },
  },
  geometry: {
    type: "LineString" as const,
    coordinates: [
      [10, 60],
      [11, 61],
    ],
  },
};

function mountImportGeojsonStep(lineFeature: GeoJSONFeature = timedLineFeature) {
  const addFeature = vi.fn();
  const addUnitStateEntry = vi.fn();
  const setCurrentTime = vi.fn();
  const pointFeature = {
    type: "Feature" as const,
    properties: { name: "Point" },
    geometry: {
      type: "Point" as const,
      coordinates: [10, 60],
    },
  };

  const wrapper = mount(ImportGeojsonStep, {
    props: {
      data: {
        type: "FeatureCollection",
        features: [lineFeature, pointFeature],
      },
    },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          unitActions: {
            addUnitStateEntry,
            addUnit: vi.fn(),
            getCombinedSymbolOptions: vi.fn(() => ({})),
            getUnitHierarchy: vi.fn(() => ({
              side: { standardIdentity: "3" },
            })),
          },
          store: {
            state: {
              currentTime: Date.parse("2026-04-28T10:00:00Z"),
              unitMap: {
                "unit-1": {
                  id: "unit-1",
                  name: "Alpha",
                  sidc: "10031000000000000000",
                  subUnits: ["unit-child"],
                },
                "unit-child": {
                  id: "unit-child",
                  name: "Alpha Child",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                "group-unit": {
                  id: "group-unit",
                  name: "Group Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  location: [10, 60],
                  properties: { averageSpeed: { value: 10, uom: "m/s" } },
                },
              },
              sideMap: {
                "side-1": {
                  id: "side-1",
                  name: "Blue",
                  subUnits: ["unit-1"],
                },
              },
              sideGroupMap: {
                "group-1": {
                  id: "group-1",
                  name: "Group",
                  _pid: "side-1",
                  subUnits: ["group-unit"],
                },
              },
            },
            groupUpdate: (callback: () => void) => callback(),
          },
          geo: {
            addFeature,
            layerItemsLayers: {
              value: [{ id: "layer-1", name: "Layer 1" }],
            },
          },
          time: {
            setCurrentTime,
          },
        },
      },
      stubs: {
        ImportStepLayout: {
          template: "<div><slot name='actions' /><slot name='sidebar' /><slot /></div>",
        },
        BaseButton: { template: "<button><slot /></button>" },
        SimpleSelect: true,
        SymbolCodeSelect: true,
        UnitTreeSelect: UnitTreeSelectStub,
        MRadioGroup: { template: "<div><slot /></div>" },
        InputRadio: InputRadioStub,
        DataGrid: DataGridStub,
        AlertWarning: true,
      },
    },
  });

  return { wrapper, addFeature, addUnitStateEntry, setCurrentTime, lineFeature };
}

describe("ImportGeojsonStep", () => {
  it("shows only line features in track assignment mode", async () => {
    const { wrapper, lineFeature } = mountImportGeojsonStep();

    await wrapper.get('[data-value="unit-tracks"]').trigger("click");

    const dataGrid = wrapper.findComponent(DataGridStub);
    expect(dataGrid.props("data")).toEqual([lineFeature]);
  });

  it("keeps selected line features and assigns their positions to the selected unit", async () => {
    const { wrapper, addFeature, addUnitStateEntry, setCurrentTime, lineFeature } =
      mountImportGeojsonStep();

    await wrapper.get('[data-value="unit-tracks"]').trigger("click");
    wrapper.findComponent(DataGridStub).vm.$emit("update:selected", [lineFeature]);
    await nextTick();
    await wrapper.get('[data-testid="unit-tree-select"]').trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Import")!
      .trigger("click");

    expect(addFeature).toHaveBeenCalledTimes(1);
    expect(addUnitStateEntry).toHaveBeenCalledTimes(2);
    expect(addUnitStateEntry).toHaveBeenNthCalledWith(
      1,
      "group-unit",
      { t: Date.parse("2026-04-28T10:00:00Z"), location: [10, 60] },
      true,
    );
    expect(addUnitStateEntry).toHaveBeenNthCalledWith(
      2,
      "group-unit",
      { t: Date.parse("2026-04-28T10:05:00Z"), location: [11, 61] },
      true,
    );
    expect(setCurrentTime).toHaveBeenCalledWith(Date.parse("2026-04-28T10:00:00Z"));
  });

  it("gives untimed tracks a duration from the unit's speed", async () => {
    const untimedLineFeature: GeoJSONFeature<LineString> = {
      type: "Feature",
      properties: { name: "Route" },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [10.5, 60.2],
          [11, 61],
        ],
      },
    };
    const { wrapper, addUnitStateEntry } = mountImportGeojsonStep(untimedLineFeature);

    await wrapper.get('[data-value="unit-tracks"]').trigger("click");
    wrapper.findComponent(DataGridStub).vm.$emit("update:selected", [untimedLineFeature]);
    await nextTick();
    await wrapper.get('[data-testid="unit-tree-select"]').trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Import")!
      .trigger("click");

    const startTime = Date.parse("2026-04-28T10:00:00Z");
    const expectedEndTime = Math.round(
      startTime + (length(untimedLineFeature, { units: "meters" }) / 10) * 1000,
    );
    expect(addUnitStateEntry).toHaveBeenCalledTimes(1);
    expect(addUnitStateEntry).toHaveBeenCalledWith(
      "group-unit",
      { t: expectedEndTime, location: [11, 61], via: [[10.5, 60.2]] },
      true,
    );
  });
});
