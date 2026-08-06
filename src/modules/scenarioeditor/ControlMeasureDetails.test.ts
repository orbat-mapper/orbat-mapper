// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref, shallowRef } from "vue";

import ControlMeasureDetails from "@/modules/scenarioeditor/ControlMeasureDetails.vue";
import {
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioDrawKey,
} from "@/components/injects";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

let pinia: ReturnType<typeof createPinia>;

const ScrollTabsStub = defineComponent({
  name: "ScrollTabs",
  props: { items: { type: Array, required: true }, modelValue: String },
  emits: ["update:modelValue"],
  template: "<div data-test='tabs'><slot /></div>",
});

const ControlMeasureStyleSettingsStub = defineComponent({
  name: "ControlMeasureStyleSettings",
  props: [
    "graphicKind",
    "measureStyle",
    "standardIdentity",
    "colorMode",
    "status",
    "options",
    "showHeading",
  ],
  emits: ["update"],
  template: "<div data-test='style-settings' />",
});

const ControlMeasureAmplifiersStub = defineComponent({
  name: "ControlMeasureAmplifiers",
  props: ["graphicKind", "textAmplifiers", "options"],
  emits: ["update", "update-options"],
  template: "<div data-test='amplifier-settings' />",
});

const ControlMeasureEchelonSelectStub = defineComponent({
  name: "ControlMeasureEchelonSelect",
  props: {
    graphicKind: String,
    options: Object,
    inline: Boolean,
  },
  emits: ["update"],
  template: "<div data-test='echelon-select' />",
});

const baseStubs = {
  DetailsPanelHeader: {
    template:
      "<header><slot name='leading' /><slot name='title' /><slot name='subtitle' /><slot name='trailing' /><slot name='actions' /></header>",
  },
  EditableLabel: true,
  PanelTitle: true,
  PanelDataGrid: { template: "<div><slot /></div>" },
  ScrollTabs: ScrollTabsStub,
  TabsContent: { template: "<section><slot /></section>" },
  ControlMeasureStyleSettings: ControlMeasureStyleSettingsStub,
  ControlMeasureAmplifiers: ControlMeasureAmplifiersStub,
  ControlMeasureEchelonSelect: ControlMeasureEchelonSelectStub,
  ScenarioLayerItemState: true,
  EditMetaForm: true,
  IconButton: {
    props: ["title", "disabled"],
    template:
      "<button :title='title' :disabled='disabled' @click='$emit(\"click\")'><slot /></button>",
  },
  Button: {
    template: "<button @click='$emit(\"click\")'><slot /></button>",
  },
  Switch: true,
};

function controlMeasure(
  overrides: Partial<NTacticalGraphicLayerItem> = {},
): NTacticalGraphicLayerItem {
  return {
    id: "cm-1",
    _pid: "layer-1",
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    name: "Phase Line Alpha",
    style: {},
    state: [{ id: "state-1", t: 100, patch: { controlPoints: [[12, 62]] } }],
    ...overrides,
  };
}

function mountDetails(
  itemOverrides: Partial<NTacticalGraphicLayerItem> = {},
  editingShape = false,
) {
  const item = controlMeasure(itemOverrides);
  const updateControlMeasure = vi.fn();
  const scenarioDraw = {
    updateControlMeasure,
    controlMeasureEditFeatureId: ref<string | number | null>(
      editingShape ? item.id : null,
    ),
    controlMeasureLabelDrag: ref(false),
    setControlMeasureLabelDrag: vi.fn(),
    cancel: vi.fn(),
    startControlMeasureEdit: vi.fn(),
    deleteSelected: vi.fn(),
  };

  const wrapper = mount(ControlMeasureDetails, {
    props: { selectedIds: new Set([item.id]) },
    global: {
      plugins: [pinia],
      provide: {
        [activeScenarioKey as symbol]: {
          geo: {
            getLayerItemById: vi.fn(() => ({ layerItem: item })),
            updateLayerItem: vi.fn(),
          },
        },
        [activeScenarioMapEngineKey as symbol]: shallowRef({
          draw: {},
          layers: { zoomToFeature: vi.fn() },
        }),
        [scenarioDrawKey as symbol]: scenarioDraw,
      },
      stubs: baseStubs,
    },
  });

  return { wrapper, updateControlMeasure };
}

describe("ControlMeasureDetails tabs", () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it("shows Style, Amplifiers, Details and State, with Debug gated by debug mode", async () => {
    const uiStore = useUiStore();
    const tabStore = useTabStore();
    const { wrapper } = mountDetails();
    const tabs = wrapper.findComponent(ScrollTabsStub);

    expect(tabs.props("items")).toEqual([
      { label: "Style", value: "0" },
      { label: "Amplifiers", value: "1" },
      { label: "Details", value: "2" },
      { label: "State", value: "3" },
    ]);

    uiStore.debugMode = true;
    await nextTick();
    expect(tabs.props("items")).toEqual([
      { label: "Style", value: "0" },
      { label: "Amplifiers", value: "1" },
      { label: "Details", value: "2" },
      { label: "State", value: "3" },
      { label: "Debug", value: "4" },
    ]);

    tabStore.controlMeasureDetailsTab = 4;
    uiStore.debugMode = false;
    await nextTick();
    expect(tabStore.controlMeasureDetailsTab).toBe(0);
  });

  it("falls back from a remembered Debug tab when mounting outside debug mode", () => {
    const tabStore = useTabStore();
    tabStore.controlMeasureDetailsTab = 4;

    mountDetails();

    expect(tabStore.controlMeasureDetailsTab).toBe(0);
  });

  it("uses independent tab state for the palette and edit-data actions", async () => {
    const tabStore = useTabStore();
    tabStore.featureDetailsTab = 2;
    tabStore.controlMeasureDetailsTab = 2;
    const { wrapper } = mountDetails();

    await wrapper.find("button[title='Change control measure style']").trigger("click");
    expect(tabStore.controlMeasureDetailsTab).toBe(0);
    expect(tabStore.featureDetailsTab).toBe(2);

    await wrapper.find("button[title='Edit data']").trigger("click");
    expect(tabStore.controlMeasureDetailsTab).toBe(2);
  });

  it("writes text amplifiers through the settle-first control-measure path", async () => {
    const { wrapper, updateControlMeasure } = mountDetails({
      textAmplifiers: { T: "ALPHA" },
    });
    const settings = wrapper.findComponent(ControlMeasureAmplifiersStub);

    expect(settings.props("graphicKind")).toBe("phase-line");
    expect(settings.props("textAmplifiers")).toEqual({ T: "ALPHA" });
    await settings.vm.$emit("update", { T: "BRAVO" });
    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", {
      textAmplifiers: { T: "BRAVO" },
    });
  });

  it("writes echelon options through the settle-first control-measure path", async () => {
    const { wrapper, updateControlMeasure } = mountDetails({
      graphicKind: "boundary",
      options: { echelon: "battalion" },
    });
    const settings = wrapper.findComponent(ControlMeasureEchelonSelectStub);

    expect(settings.props("graphicKind")).toBe("boundary");
    expect(settings.props("options")).toEqual({ echelon: "battalion" });
    expect(settings.props("inline")).toBe(true);
    await settings.vm.$emit("update", { echelon: "brigade" });

    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", {
      options: { echelon: "brigade" },
    });
  });

  it("keeps style writes on the settle-first control-measure path", async () => {
    const { wrapper, updateControlMeasure } = mountDetails();
    const settings = wrapper.findComponent(ControlMeasureStyleSettingsStub);

    expect(settings.props("showHeading")).toBe(false);
    await settings.vm.$emit("update", { status: "planned" });
    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", { status: "planned" });
  });

  it("resets custom label positions through the settle-first update path", async () => {
    const { wrapper, updateControlMeasure } = mountDetails(
      {
        amplifierPlacements: { T: { position: [10.5, 60.5] } },
      },
      true,
    );
    const button = wrapper.find(
      "button[title='Reset label positions to their default placement']",
    );

    expect(wrapper.text()).toContain("Move labels");
    await button.trigger("click");

    expect(updateControlMeasure).toHaveBeenCalledWith("cm-1", {
      amplifierPlacements: {},
    });
  });

  it("only shows label reset with the active label-movement controls", () => {
    const { wrapper } = mountDetails();

    expect(
      wrapper
        .find("button[title='Reset label positions to their default placement']")
        .exists(),
    ).toBe(false);
  });
});
