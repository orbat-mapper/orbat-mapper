// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, ref } from "vue";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import MainMenu from "@/modules/scenarioeditor/MainMenu.vue";
import MapContextMenu from "@/components/MapContextMenu.vue";
import OrbatPanelFooterToolbar from "@/modules/scenarioeditor/OrbatPanelFooterToolbar.vue";
import { useRecordingStore } from "@/stores/recordingStore";
import {
  activeLayerKey,
  activeScenarioKey,
  searchActionsKey,
} from "@/components/injects";

vi.mock("@/components/ToggleField.vue", () => ({
  default: defineComponent({
    name: "ToggleField",
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template:
      '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
  }),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: defineComponent({
    name: "Switch",
    props: ["checked", "modelValue"],
    emits: ["update:checked", "update:modelValue"],
    template:
      '<input type="checkbox" :checked="checked ?? modelValue" @change="$emit(\'update:checked\', $event.target.checked); $emit(\'update:modelValue\', $event.target.checked)" />',
  }),
}));

vi.mock("@/components/SlideOver.vue", () => ({
  default: defineComponent({
    name: "SlideOver",
    template: "<div><slot /></div>",
  }),
}));

vi.mock("@/components/ScrollTabs.vue", () => ({
  default: defineComponent({
    name: "ScrollTabs",
    template: "<div><slot /></div>",
  }),
}));

vi.mock("@/components/ui/tabs/TabsContent.vue", () => ({
  default: defineComponent({
    name: "TabsContent",
    template: "<div><slot /></div>",
  }),
}));

vi.mock("@/components/NumberInputGroup.vue", () => ({
  default: defineComponent({
    name: "NumberInputGroup",
    template: "<div />",
  }),
}));

vi.mock("@/components/MapSettingsPanel.vue", () => ({
  default: defineComponent({
    name: "MapSettingsPanel",
    template: "<div />",
  }),
}));

vi.mock("@/components/LayersPanel.vue", () => ({
  default: defineComponent({
    name: "LayersPanel",
    template: "<div />",
  }),
}));

vi.mock("@/components/TimeDateSettingsPanel.vue", () => ({
  default: defineComponent({
    name: "TimeDateSettingsPanel",
    template: "<div />",
  }),
}));

vi.mock("@/components/ui/dropdown-menu", () => {
  const checkbox = defineComponent({
    name: "DropdownMenuCheckboxItem",
    props: ["modelValue"],
    emits: ["update:modelValue", "select"],
    template:
      '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
  });
  const passthrough = (name: string) =>
    defineComponent({
      name,
      template: "<div><slot /></div>",
    });
  return {
    DropdownMenu: passthrough("DropdownMenu"),
    DropdownMenuCheckboxItem: checkbox,
    DropdownMenuContent: passthrough("DropdownMenuContent"),
    DropdownMenuItem: passthrough("DropdownMenuItem"),
    DropdownMenuRadioGroup: passthrough("DropdownMenuRadioGroup"),
    DropdownMenuRadioItem: passthrough("DropdownMenuRadioItem"),
    DropdownMenuSeparator: passthrough("DropdownMenuSeparator"),
    DropdownMenuShortcut: passthrough("DropdownMenuShortcut"),
    DropdownMenuSub: passthrough("DropdownMenuSub"),
    DropdownMenuSubContent: passthrough("DropdownMenuSubContent"),
    DropdownMenuSubTrigger: passthrough("DropdownMenuSubTrigger"),
    DropdownMenuTrigger: passthrough("DropdownMenuTrigger"),
  };
});

vi.mock("@/components/ui/context-menu", () => {
  const checkbox = defineComponent({
    name: "ContextMenuCheckboxItem",
    props: ["modelValue"],
    emits: ["update:modelValue", "select"],
    template:
      '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
  });
  const passthrough = (name: string) =>
    defineComponent({
      name,
      template: "<div><slot /></div>",
    });
  return {
    ContextMenu: passthrough("ContextMenu"),
    ContextMenuCheckboxItem: checkbox,
    ContextMenuContent: passthrough("ContextMenuContent"),
    ContextMenuItem: passthrough("ContextMenuItem"),
    ContextMenuRadioGroup: passthrough("ContextMenuRadioGroup"),
    ContextMenuRadioItem: passthrough("ContextMenuRadioItem"),
    ContextMenuSeparator: passthrough("ContextMenuSeparator"),
    ContextMenuShortcut: passthrough("ContextMenuShortcut"),
    ContextMenuSub: passthrough("ContextMenuSub"),
    ContextMenuSubContent: passthrough("ContextMenuSubContent"),
    ContextMenuSubTrigger: passthrough("ContextMenuSubTrigger"),
    ContextMenuTrigger: passthrough("ContextMenuTrigger"),
  };
});

vi.mock("@/stores/settingsStore", () => ({
  useSettingsStore: () => ({ orbatShortName: false }),
  useSymbolSettingsStore: () => ({ simpleStatusModifier: false }),
}));

vi.mock("@/stores/mapSettingsStore", () => ({
  useMapSettingsStore: () => ({
    mapIconSize: 24,
    mapUnitLabelBelow: false,
    mapWrapUnitLabels: false,
    coordinateFormat: ref("DecimalDegrees"),
    showLocation: ref(false),
    showScaleLine: ref(false),
    showDayNightTerminator: ref(false),
    showFeatureTooltip: ref(false),
  }),
}));

vi.mock("@/stores/geoStore", () => ({
  useMeasurementsStore: () => ({ measurementUnit: ref("metric") }),
}));

vi.mock("@heroicons/vue/20/solid", () => ({
  ChevronDownIcon: defineComponent({ name: "ChevronDownIcon", template: "<span />" }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "scenario", meta: {} }),
  RouterLink: defineComponent({ name: "RouterLink", template: "<a><slot /></a>" }),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useBreakpoints: () => ({ smallerOrEqual: () => false }),
    breakpointsTailwind: {},
    useClipboard: () => ({ copy: vi.fn() }),
  };
});

vi.mock("@/composables/scenarioShare", () => ({
  useShareHistory: () => ({ history: [], clearHistory: vi.fn() }),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));

vi.mock("@/composables/mainToolbarData", () => ({
  useActiveSidc: () => ({ sidc: { value: "" }, symbolOptions: { value: {} } }),
}));

vi.mock("@/modules/scenarioeditor/featureLayerUtils", () => ({
  getGeometryIcon: vi.fn(),
}));

vi.mock("@/stores/baseLayersStore", () => ({
  useBaseLayersStore: () => ({}),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    activeUnitId: { value: null },
    activeFeatureId: { value: null },
    selectedUnitIds: { value: new Set() },
    selectedFeatureIds: { value: new Set() },
  }),
}));

vi.mock("@/stores/playbackStore", () => ({
  usePlaybackStore: () => ({}),
}));

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({ scenarioFormatter: { format: vi.fn(() => "") } }),
}));

vi.mock("@/stores/dragStore", () => ({
  useActiveUnitStore: () => ({ activeParent: { value: null } }),
}));

vi.mock("@/stores/mainToolbarStore.ts", () => ({
  useMainToolbarStore: () => ({}),
}));

vi.mock("@/components/MilitarySymbol.vue", () => ({
  default: defineComponent({ name: "MilitarySymbol", template: "<div />" }),
}));

vi.mock("@/components/UnitSymbol.vue", () => ({
  default: defineComponent({ name: "UnitSymbol", template: "<div />" }),
}));

function makeScenarioInjection() {
  return {
    store: {
      state: {
        mapSettings: {
          baseMapId: "default",
        },
      },
      undo: vi.fn(),
      redo: vi.fn(),
      canRedo: false,
      canUndo: false,
      groupUpdate: (fn: () => void) => fn(),
      update: vi.fn(),
    },
    unitActions: {
      isUnitLocked: vi.fn(() => false),
      createSubordinateUnit: vi.fn(),
    },
    geo: {
      getFeatureById: vi.fn(() => ({ feature: null })),
      addUnitPosition: vi.fn(),
    },
    helpers: {
      getUnitById: vi.fn(() => null),
    },
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("recording UI", () => {
  it("shows hierarchy and position recording status in the ORBAT footer toolbar", async () => {
    const recordStore = useRecordingStore();
    recordStore.isRecordingHierarchy = true;
    recordStore.isRecordingLocation = true;

    const wrapper = mount(OrbatPanelFooterToolbar);

    expect(wrapper.attributes("title")).toBeUndefined();
    expect(wrapper.text()).toBe("");
    expect(wrapper.find('[aria-label="Unit hierarchy recording is on."]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[aria-label="Unit position recording is on."]').exists()).toBe(
      true,
    );
    expect(wrapper.findAll("svg").length).toBeGreaterThanOrEqual(4);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);
  });

  it("toggles hierarchy recording from the ORBAT footer toolbar", async () => {
    const recordStore = useRecordingStore();
    const wrapper = mount(OrbatPanelFooterToolbar);
    const buttons = wrapper.findAll("button");

    await buttons[0].trigger("click");
    expect(recordStore.isRecordingHierarchy).toBe(true);
    expect(recordStore.isRecordingLocation).toBe(true);

    await buttons[0].trigger("click");
    expect(recordStore.isRecordingHierarchy).toBe(false);
  });

  it("toggles position recording from the ORBAT footer toolbar", async () => {
    const recordStore = useRecordingStore();
    const wrapper = mount(OrbatPanelFooterToolbar);
    const buttons = wrapper.findAll("button");

    await buttons[1].trigger("click");
    expect(recordStore.isRecordingLocation).toBe(false);

    await buttons[1].trigger("click");
    expect(recordStore.isRecordingLocation).toBe(true);
  });
});
