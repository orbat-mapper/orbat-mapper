// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, ref, toRef } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import {
  activeLayerKey,
  activeScenarioKey,
  searchActionsKey,
} from "@/components/injects";
import MaplibreContextMenu from "@/modules/maplibreview/MaplibreContextMenu.vue";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { MAPLIBRE_VECTOR_BASEMAP_ID } from "@/modules/maplibreview/maplibreBasemaps";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useRecordingStore } from "@/stores/recordingStore";

vi.mock("@/composables/mainToolbarData", () => ({
  useActiveSidc: () => ({
    sidc: ref("SFGPUCI----K"),
    symbolOptions: ref({}),
  }),
}));

vi.mock("@/stores/dragStore", () => ({
  useActiveUnitStore: () => ({
    activeParent: ref({
      id: "parent-1",
      subUnits: [],
    }),
  }),
}));

vi.mock("@/stores/mainToolbarStore.ts", () => ({
  useMainToolbarStore: () => ({
    currentDrawStyle: {},
  }),
}));

vi.mock("@/stores/timeFormatStore", () => ({
  useTimeFormatStore: () => ({
    scenarioFormatter: {
      format: (value: number) => `time:${value}`,
    },
  }),
}));

vi.mock("@/modules/scenarioeditor/featureLayerUtils", () => ({
  getGeometryIcon: vi.fn(() =>
    defineComponent({
      name: "GeometryIconStub",
      template: "<span />",
    }),
  ),
}));

const radioGroupKey = Symbol("radio-group");

const ContextMenuStub = defineComponent({
  name: "ContextMenu",
  template: "<div><slot /></div>",
});

const ContextMenuTriggerStub = defineComponent({
  name: "ContextMenuTrigger",
  template: "<div><slot /></div>",
});

const ContextMenuContentStub = defineComponent({
  name: "ContextMenuContent",
  template: "<div><slot /></div>",
});

const ContextMenuItemStub = defineComponent({
  name: "ContextMenuItem",
  emits: ["select"],
  setup(_, { emit, slots }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          onClick: () => emit("select", new Event("select")),
        },
        slots.default?.(),
      );
  },
});

const ContextMenuCheckboxItemStub = defineComponent({
  name: "ContextMenuCheckboxItem",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue", "select"],
  setup(props, { emit, slots }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          onClick: () => {
            emit("update:modelValue", !props.modelValue);
            emit("select", new Event("select"));
          },
        },
        slots.default?.(),
      );
  },
});

const ContextMenuSeparatorStub = defineComponent({
  name: "ContextMenuSeparator",
  template: "<div />",
});

const ContextMenuShortcutStub = defineComponent({
  name: "ContextMenuShortcut",
  template: "<span><slot /></span>",
});

const ContextMenuSubStub = defineComponent({
  name: "ContextMenuSub",
  template: "<div><slot /></div>",
});

const ContextMenuSubContentStub = defineComponent({
  name: "ContextMenuSubContent",
  template: "<div><slot /></div>",
});

const ContextMenuSubTriggerStub = defineComponent({
  name: "ContextMenuSubTrigger",
  template: "<div><slot /></div>",
});

const ContextMenuRadioGroupStub = defineComponent({
  name: "ContextMenuRadioGroup",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    const group = {
      modelValue: toRef(props, "modelValue"),
      setValue: (value: string) => emit("update:modelValue", value),
    };
    return () => h("div", { "data-testid": "radio-group" }, [slots.default?.()]);
  },
  provide() {
    return {
      [radioGroupKey]: {
        modelValue: toRef(this.$props, "modelValue"),
        setValue: (value: string) => this.$emit("update:modelValue", value),
      },
    };
  },
});

const ContextMenuRadioItemStub = defineComponent({
  name: "ContextMenuRadioItem",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ["select"],
  setup(props, { emit, slots }) {
    const group = inject<{ setValue: (value: string) => void }>(radioGroupKey)!;
    return () =>
      h(
        "button",
        {
          type: "button",
          "data-value": props.value,
          onClick: () => {
            group.setValue(props.value);
            emit("select", new Event("select"));
          },
        },
        slots.default?.(),
      );
  },
});

describe("MaplibreContextMenu", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useRealTimers();
    useSelectedItems().clear();
    const playback = usePlaybackStore();
    playback.playbackRunning = false;
    playback.playbackLooping = false;
    playback.clearMarkers();
  });

  function mountMenu(props?: Record<string, unknown>) {
    const feature = {
      id: "feature-1",
      meta: {
        name: "Feature 1",
      },
    };
    const scenario = {
      store: {
        state: {
          currentTime: 123,
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
        isUnitLocked: vi.fn(() => false),
        createSubordinateUnit: vi.fn(() => "unit-2"),
      },
      geo: {
        addUnitPosition: vi.fn(),
        addFeature: vi.fn(),
        getLayerById: vi.fn(() => ({ id: "layer-1", items: [] })),
        getGeometryLayerItemById: vi.fn((id: string) => ({
          layerItem: id === "feature-1" ? feature : undefined,
        })),
        layerItemsLayers: ref([{ id: "layer-1", items: [] }]),
      },
      helpers: {
        getUnitById: vi.fn((id: string) =>
          id === "unit-1"
            ? {
                id: "unit-1",
                sidc: "SFGPUCI----K",
                name: "Unit 1",
              }
            : undefined,
        ),
      },
    } as any;
    const searchHooks = {
      onScenarioActionHook: {
        trigger: vi.fn(),
      },
    } as any;

    const wrapper = mount(MaplibreContextMenu, {
      props,
      slots: {
        default: "<div data-testid='trigger'>Trigger</div>",
      },
      global: {
        provide: {
          [activeScenarioKey as symbol]: scenario,
          [activeLayerKey as symbol]: ref("layer-1"),
          [searchActionsKey as symbol]: searchHooks,
        },
        stubs: {
          ContextMenu: ContextMenuStub,
          ContextMenuTrigger: ContextMenuTriggerStub,
          ContextMenuContent: ContextMenuContentStub,
          ContextMenuItem: ContextMenuItemStub,
          ContextMenuCheckboxItem: ContextMenuCheckboxItemStub,
          ContextMenuSeparator: ContextMenuSeparatorStub,
          ContextMenuShortcut: ContextMenuShortcutStub,
          ContextMenuSub: ContextMenuSubStub,
          ContextMenuSubContent: ContextMenuSubContentStub,
          ContextMenuSubTrigger: ContextMenuSubTriggerStub,
          ContextMenuRadioGroup: ContextMenuRadioGroupStub,
          ContextMenuRadioItem: ContextMenuRadioItemStub,
          MilitarySymbol: true,
          UnitSymbol: true,
        },
      },
    });

    return { wrapper, scenario, searchHooks };
  }

  it("updates the bound maplibre basemap when a basemap is selected", async () => {
    const maplibreLayersStore = useMaplibreLayersStore();
    const selectedBasemap = ref(MAPLIBRE_VECTOR_BASEMAP_ID);

    maplibreLayersStore.layers = [
      {
        name: "osm",
        title: "OSM",
        sourceType: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      },
      {
        name: "imagery",
        title: "Imagery",
        sourceType: "raster",
        tiles: ["https://tiles.example.com/{z}/{x}/{y}.png"],
      },
    ];

    const { wrapper } = mountMenu({
      baseMapId: selectedBasemap.value,
      "onUpdate:baseMapId": async (value: string) => {
        selectedBasemap.value = value;
        await wrapper.setProps({ baseMapId: value });
      },
    });

    await wrapper.get("[data-value='imagery']").trigger("click");

    expect(selectedBasemap.value).toBe("imagery");
  });

  it("re-dispatches captured contextmenu events through the trigger", async () => {
    const { wrapper } = mountMenu();

    const triggerWrapper = wrapper.get(".h-full.w-full");
    const dispatchSpy = vi.spyOn(triggerWrapper.element, "dispatchEvent");

    await triggerWrapper.trigger("contextmenu", {
      button: 2,
      buttons: 2,
      clientX: 10,
      clientY: 20,
    });

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("opens the context menu on touch long press", async () => {
    vi.useFakeTimers();

    const { wrapper } = mountMenu();

    const triggerWrapper = wrapper.get(".h-full.w-full");
    const dispatchSpy = vi.spyOn(triggerWrapper.element, "dispatchEvent");

    const pointerDownEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(pointerDownEvent, {
      pointerId: { value: 1 },
      pointerType: { value: "touch" },
      clientX: { value: 10 },
      clientY: { value: 20 },
    });

    triggerWrapper.element.dispatchEvent(pointerDownEvent);

    vi.advanceTimersByTime(600);

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("defaults to the vector maplibre basemap", () => {
    const { wrapper } = mountMenu();

    expect(wrapper.exists()).toBe(true);
    expect(
      (wrapper.props("baseMapId") as string | undefined) ?? MAPLIBRE_VECTOR_BASEMAP_ID,
    ).toBe(MAPLIBRE_VECTOR_BASEMAP_ID);
  });

  it("toggles shared UI controls from the maplibre context menu", async () => {
    const uiStore = useUiStore();
    uiStore.showToolbar = true;
    uiStore.showTimeline = true;
    uiStore.showOrbatBreadcrumbs = true;

    const { wrapper } = mountMenu();
    const buttons = wrapper.findAll("button");

    await buttons.find((button) => button.text() === "Map toolbar")?.trigger("click");
    await buttons.find((button) => button.text() === "Timeline")?.trigger("click");
    await buttons
      .find((button) => button.text() === "Unit breadcrumbs")
      ?.trigger("click");

    expect(uiStore.showToolbar).toBe(false);
    expect(uiStore.showTimeline).toBe(false);
    expect(uiStore.showOrbatBreadcrumbs).toBe(false);
  });

  it("controls playback from the maplibre context menu", async () => {
    const playback = usePlaybackStore();
    playback.playbackRunning = false;
    playback.playbackLooping = false;
    const increaseSpy = vi.spyOn(playback, "increaseSpeed");
    const decreaseSpy = vi.spyOn(playback, "decreaseSpeed");

    const { wrapper } = mountMenu();
    const buttons = wrapper.findAll("button");

    await buttons.find((button) => button.text().includes("Play"))?.trigger("click");
    await buttons.find((button) => button.text().includes("Speed up"))?.trigger("click");
    await buttons.find((button) => button.text().includes("Slow down"))?.trigger("click");
    await buttons.find((button) => button.text() === "Loop playback")?.trigger("click");
    await buttons
      .find((button) => button.text().includes("Add marker"))
      ?.trigger("click");
    await buttons.find((button) => button.text() === "Clear markers")?.trigger("click");

    expect(playback.playbackRunning).toBe(true);
    expect(increaseSpy).toHaveBeenCalled();
    expect(decreaseSpy).toHaveBeenCalled();
    expect(playback.playbackLooping).toBe(true);
    expect(playback.startMarker).toBeUndefined();
    expect(playback.endMarker).toBeUndefined();
  });

  it("shows clicked units and features from the maplibre map hit test", async () => {
    const mapRef = {
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      }),
      unproject: () => ({ lng: 10, lat: 20 }),
      getZoom: () => 7,
      queryRenderedFeatures: () => [
        {
          layer: { id: "unitLayer" },
          properties: { id: "unit-1" },
        },
        {
          layer: { id: "scenario-feature-layer-1-fill" },
          properties: { featureId: "feature-1", layerId: "layer-1" },
        },
      ],
    };

    const { wrapper } = mountMenu({ mapRef });

    await wrapper.get(".h-full.w-full").trigger("contextmenu", {
      button: 2,
      clientX: 10,
      clientY: 20,
    });

    expect(wrapper.text()).toContain("Unit 1");
    expect(wrapper.text()).toContain("Feature 1");
    expect(wrapper.text()).toContain("Open in");
    expect(wrapper.text()).toContain("Map as image");
  });

  it("triggers the shared export action from the maplibre context menu", async () => {
    const { wrapper, searchHooks } = mountMenu();

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Map as image")
      ?.trigger("click");

    expect(searchHooks.onScenarioActionHook.trigger).toHaveBeenCalledWith({
      action: "exportToImage",
    });
  });
});
