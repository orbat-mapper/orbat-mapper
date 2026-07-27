// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, getActivePinia, setActivePinia } from "pinia";
import { defineComponent, reactive, ref } from "vue";
import LayersPanel from "@/components/LayersPanel.vue";
import { activeScenarioKey } from "@/components/injects";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";

const routeState = vi.hoisted(() => ({
  currentRouteName: "MapBetaModeRoute",
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    name: routeState.currentRouteName,
  }),
}));

// The panel reaches the handle store through the archives composable. Stubbed so no IndexedDB
// call is attempted in jsdom.
vi.mock("@/geo/basemapArchiveHandles", () => ({
  isFileHandleSupported: () => false,
  pickBasemapArchiveHandles: async () => ({ status: "unavailable" }),
  fileFromHandle: async () => null,
  queryBasemapArchivePermission: async () => "unsupported",
  requestBasemapArchivePermission: async () => "unsupported",
  saveBasemapArchiveHandle: async () => {},
  loadBasemapArchiveHandle: async () => null,
  deleteBasemapArchiveHandle: async () => {},
}));

const BaseLayerSwitcherStub = defineComponent({
  name: "BaseLayerSwitcher",
  props: ["settings", "modelValue"],
  emits: ["update:modelValue", "update:layerOpacity", "activateLayer", "removeLayer"],
  template: "<div />",
});

const OpacityInputStub = defineComponent({
  name: "OpacityInput",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    "<button type='button' data-test='opacity-trigger' @click=\"$emit('update:modelValue', 0.25)\" />",
});

describe("LayersPanel", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
    routeState.currentRouteName = "MapBetaModeRoute";
  });

  it("updates maplibre basemaps and scenario overlay layers", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const mapSettings = useMapSettingsStore();
    const maplibreLayersStore = useMaplibreLayersStore();
    maplibreLayersStore.layers = [
      {
        name: "osmRaster",
        title: "OSM Raster",
        sourceType: "raster",
        tiles: ["https://example.com/{z}/{x}/{y}.png"],
        opacity: 0.6,
      },
      {
        name: "bright",
        title: "Bright",
        sourceType: "style",
        styleUrl: "https://example.com/style.json",
      },
    ];

    const state = reactive({
      mapSettings: {
        baseMapId: "osmRaster",
      },
    });
    const update = vi.fn((fn: (draft: typeof state) => void) => fn(state));
    const updateLayer = vi.fn();
    const layerItemsLayers = ref([
      {
        id: "overlay-1",
        name: "Overlay 1",
        opacity: 0.4,
        isHidden: false,
        items: [],
      },
    ]);

    const wrapper = mount(LayersPanel, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: {
            store: {
              state,
              update,
            },
            geo: {
              layerItemsLayers,
              updateLayer,
            },
          },
        },
        stubs: {
          BaseLayerSwitcher: BaseLayerSwitcherStub,
          OpacityInput: OpacityInputStub,
        },
      },
    });

    expect(wrapper.text()).toContain("Overlay 1");

    const baseLayerSwitcher = wrapper.getComponent(BaseLayerSwitcherStub);
    const baseLayerSettings = baseLayerSwitcher.props("settings") as Array<{
      id: string;
      supportsOpacity?: boolean;
    }>;
    expect(
      baseLayerSettings.find((setting) => setting.id === "bright")?.supportsOpacity,
    ).toBe(false);

    const brightLayer = baseLayerSettings.find((setting) => setting.id === "bright");
    baseLayerSwitcher.vm.$emit("update:modelValue", brightLayer);
    await wrapper.vm.$nextTick();

    expect(update).not.toHaveBeenCalled();
    expect(state.mapSettings.baseMapId).toBe("osmRaster");
    expect(mapSettings.maplibreBaseLayerName).toBe("bright");
    expect(mapSettings.baseLayerName).toBe("osm");

    const rasterLayer = baseLayerSettings.find((setting) => setting.id === "osmRaster");
    baseLayerSwitcher.vm.$emit("update:layerOpacity", rasterLayer, 0.3);
    await wrapper.vm.$nextTick();

    expect(
      maplibreLayersStore.layers.find((layer) => layer.name === "osmRaster")?.opacity,
    ).toBe(0.3);

    const overlayButtons = wrapper.findAll("li button");
    await overlayButtons[0]!.trigger("click");
    expect(updateLayer).toHaveBeenCalledWith("overlay-1", { opacity: 0.25 });

    await overlayButtons[1]!.trigger("click");
    expect(updateLayer).toHaveBeenCalledWith("overlay-1", { isHidden: true });
  });

  describe("basemap flavour select", () => {
    function mountWithArchives(activeName: string) {
      const pinia = createPinia();
      setActivePinia(pinia);
      const mapSettings = useMapSettingsStore();
      const maplibreLayersStore = useMaplibreLayersStore();
      maplibreLayersStore.layers = [
        {
          name: "vectorArchive",
          title: "World (local)",
          sourceType: "pmtiles",
          archive: {
            kind: "vector",
            minZoom: 0,
            maxZoom: 14,
            bounds: [-180, -85, 180, 85],
          },
        },
        {
          name: "rasterArchive",
          title: "Scan (local)",
          sourceType: "pmtiles",
          archive: {
            kind: "raster",
            minZoom: 0,
            maxZoom: 12,
            bounds: [-180, -85, 180, 85],
          },
        },
      ];
      mapSettings.maplibreBaseLayerName = activeName;

      const wrapper = mount(LayersPanel, {
        global: {
          plugins: [pinia],
          stubs: {
            BaseLayerSwitcher: BaseLayerSwitcherStub,
            OpacityInput: OpacityInputStub,
          },
        },
      });
      const switcher = wrapper.getComponent(BaseLayerSwitcherStub);
      const settings = switcher.props("settings") as Array<{
        id: string;
        flavor?: string;
      }>;
      return { wrapper, switcher, settings, maplibreLayersStore };
    }

    it("offers a flavour only for the active vector archive", () => {
      const { settings } = mountWithArchives("vectorArchive");
      expect(settings.find((s) => s.id === "vectorArchive")?.flavor).toBe("light");
      expect(settings.find((s) => s.id === "rasterArchive")?.flavor).toBeUndefined();
    });

    it("offers no flavour for a raster archive, even when it is active", () => {
      const { settings } = mountWithArchives("rasterArchive");
      expect(settings.find((s) => s.id === "rasterArchive")?.flavor).toBeUndefined();
      // A vector archive that is not the active basemap is not styled, so it gets no select.
      expect(settings.find((s) => s.id === "vectorArchive")?.flavor).toBeUndefined();
    });

    it("writes a picked flavour back to the layer", async () => {
      const { switcher, settings, maplibreLayersStore, wrapper } =
        mountWithArchives("vectorArchive");
      const vectorLayer = settings.find((s) => s.id === "vectorArchive");

      switcher.vm.$emit(
        "update:layerFlavor",
        { ...vectorLayer, name: "vectorArchive" },
        "dark",
      );
      await wrapper.vm.$nextTick();

      const config = maplibreLayersStore.layers.find(
        (layer) => layer.name === "vectorArchive",
      );
      expect(config).toMatchObject({ flavor: "dark" });
    });
  });

  describe("basemap archive rows", () => {
    interface BaseRow {
      id: string;
      name: string;
      title: string;
      rowKind?: string;
      removable?: boolean;
      actionLabel?: string;
      supportsOpacity?: boolean;
    }

    function mountPanel() {
      const wrapper = mount(LayersPanel, {
        global: {
          plugins: [getActivePinia()!],
          stubs: {
            BaseLayerSwitcher: BaseLayerSwitcherStub,
            OpacityInput: OpacityInputStub,
          },
        },
      });
      const switcher = wrapper.getComponent(BaseLayerSwitcherStub);
      return {
        wrapper,
        switcher,
        rows: () => switcher.props("settings") as BaseRow[],
      };
    }

    function sessionArchive(url?: string) {
      return {
        name: "world",
        title: "World (local)",
        sourceType: "pmtiles" as const,
        url,
        archive: {
          kind: "vector" as const,
          minZoom: 0,
          maxZoom: 14,
          bounds: [-180, -85, 180, 85] as [number, number, number, number],
        },
      };
    }

    it("marks only an archive the user opened from disk as removable", () => {
      const store = useMaplibreLayersStore();
      store.layers = [
        sessionArchive(),
        {
          name: "bright",
          title: "Bright",
          sourceType: "style",
          styleUrl: "https://example.com/style.json",
        },
        {
          name: "osmRaster",
          title: "OSM Raster",
          sourceType: "raster",
          tiles: ["https://example.com/{z}/{x}/{y}.png"],
        },
      ];
      const { rows } = mountPanel();

      expect(rows().find((row) => row.id === "world")?.removable).toBe(true);
      expect(rows().find((row) => row.id === "bright")?.removable).toBe(false);
      expect(rows().find((row) => row.id === "osmRaster")?.removable).toBe(false);
      expect(rows().find((row) => row.title === "No base map")?.removable).toBe(false);
    });

    it("marks a config-declared archive as not removable", () => {
      const store = useMaplibreLayersStore();
      store.layers = [sessionArchive("/maps/world.pmtiles")];
      const { rows } = mountPanel();

      expect(rows().find((row) => row.id === "world")?.removable).toBe(false);
    });

    it("appends a pending row for a remembered archive that is not loaded", () => {
      useMapSettingsStore().basemapArchives = [
        {
          fileName: "world.pmtiles",
          kind: "pmtiles",
          key: "world",
        },
      ];
      useMaplibreLayersStore().layers = [];
      const { rows } = mountPanel();

      const pending = rows()[rows().length - 1]!;
      expect(pending).toMatchObject({
        id: "pending:world",
        name: "world",
        title: "world.pmtiles",
        rowKind: "pending-archive",
        removable: true,
        supportsOpacity: false,
        actionLabel: "Select map file…",
      });
    });

    it("drops the pending row once the archive is loaded", () => {
      useMapSettingsStore().basemapArchives = [
        {
          fileName: "world.pmtiles",
          kind: "pmtiles",
          key: "world",
        },
      ];
      useMaplibreLayersStore().layers = [sessionArchive()];
      const { rows } = mountPanel();

      expect(rows().some((row) => row.rowKind === "pending-archive")).toBe(false);
    });

    it("does not activate a pending row as a base layer", async () => {
      const mapSettings = useMapSettingsStore();
      mapSettings.basemapArchives = [
        {
          fileName: "world.pmtiles",
          kind: "pmtiles",
          key: "world",
        },
      ];
      mapSettings.maplibreBaseLayerName = "";
      useMaplibreLayersStore().layers = [];
      const { switcher, rows, wrapper } = mountPanel();
      const pending = rows()[rows().length - 1]!;

      switcher.vm.$emit("update:modelValue", pending);
      await wrapper.vm.$nextTick();

      expect(mapSettings.maplibreBaseLayerName).toBe("");
    });

    it("removes a removable base layer when the switcher asks for it", async () => {
      const store = useMaplibreLayersStore();
      store.layers = [sessionArchive()];
      const { switcher, rows, wrapper } = mountPanel();

      switcher.vm.$emit(
        "removeLayer",
        rows().find((row) => row.id === "world"),
      );
      await wrapper.vm.$nextTick();
      await Promise.resolve();

      expect(store.layers.some((layer) => layer.name === "world")).toBe(false);
    });
  });
});
