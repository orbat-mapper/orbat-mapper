// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, inject } from "vue";
import { describe, expect, it, vi } from "vitest";
import ImportModal from "@/components/ImportModal.vue";
import { activeScenarioKey } from "@/components/injects";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import * as fileHandling from "@/importexport/fileHandling";

const NewSimpleModalStub = defineComponent({
  name: "NewSimpleModal",
  props: ["modelValue"],
  emits: ["cancel", "update:modelValue"],
  template: "<div><slot /></div>",
});

const ImportLoadStepStub = defineComponent({
  name: "ImportLoadStep",
  emits: ["lod"],
  template: `
    <button
      type="button"
      data-testid="load-kml"
      @click="$emit('lod', {
        format: 'kml',
        data: ['blob:pending-kml'],
        fileInfo: [{ fileName: 'test.kml' }],
      })"
    >
      load
    </button>
  `,
});

const ImportKMLStepStub = defineComponent({
  name: "ImportKMLStep",
  emits: ["loaded", "cancel"],
  setup(_, { emit }) {
    const scenario = inject(activeScenarioKey as symbol) as {
      geo: ReturnType<typeof useGeo>;
    };
    function confirmImport() {
      scenario.geo.addMapLayer({
        id: "kml-layer-1",
        type: "KMLLayer",
        name: "Imported KML",
        url: "blob:imported-kml",
        extractStyles: true,
        showPointNames: true,
      });
      emit("loaded");
    }

    return {
      confirmImport,
    };
  },
  template: `
    <button type="button" data-testid="confirm-kml-import" @click="confirmImport">
      import
    </button>
  `,
});

describe("ImportModal", () => {
  it("retains the KMZ image cache until the imported blob-backed layer takes ownership", async () => {
    const callLog: string[] = [];
    vi.spyOn(fileHandling, "retainImageCache").mockImplementation(() => {
      callLog.push("retain");
    });
    vi.spyOn(fileHandling, "releaseImageCache").mockImplementation(() => {
      callLog.push("release");
    });

    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.7.0",
      name: "Scenario",
      startTime: 0,
      sides: [],
      events: [],
      layers: [],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);
    const geo = useGeo(store);

    const wrapper = mount(ImportModal, {
      props: {
        modelValue: true,
      },
      global: {
        provide: {
          [activeScenarioKey as symbol]: { geo },
        },
        stubs: {
          NewSimpleModal: NewSimpleModalStub,
          ImportLoadStep: ImportLoadStepStub,
          ImportKMLStep: ImportKMLStepStub,
          ImportImageStep: true,
          ImportGeojsonStep: true,
          ImportMilxStep: true,
          ImportSpreadsheetStep: true,
          ImportSpatialIllusionsStep: true,
          ImportOrbatGeneratorStep: true,
          ImportOrbatMapperStep: true,
          DecryptScenarioModal: true,
        },
      },
    });

    await wrapper.get('[data-testid="load-kml"]').trigger("click");
    await flushPromises();
    await wrapper.get('[data-testid="confirm-kml-import"]').trigger("click");
    await flushPromises();

    expect(callLog).toEqual(["retain", "retain", "release"]);
    expect(geo.mapLayers.value).toHaveLength(1);
    expect(geo.mapLayers.value[0]?.url).toBe("blob:imported-kml");
  });
});
