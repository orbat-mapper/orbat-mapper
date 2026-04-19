// @vitest-environment jsdom
import "@/dayjs";
import { mount } from "@vue/test-utils";
import { computed, defineComponent } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailsPanelContent from "@/modules/scenarioeditor/DetailsPanelContent.vue";
import { activeScenarioKey, routeDetailsPanelKey } from "@/components/injects";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useRoutingStore } from "@/stores/routingStore";
import { useMeasurementsStore } from "@/stores/geoStore";

function createScenarioMock(currentTime = 3_600_000) {
  return {
    store: {
      state: {
        currentTime,
        info: { timeZone: "UTC" },
      },
    },
    geo: {
      layerItemsLayers: computed(() => []),
    },
    helpers: {
      getUnitById: vi.fn((id: string) =>
        id === "unit-1"
          ? {
              id,
              shortName: "Unit 1",
              location: [0, 0],
              properties: {
                averageSpeed: {
                  value: 30,
                  uom: "km/h",
                },
              },
            }
          : null,
      ),
    },
  };
}

function seedRoutePreview(routingStore: ReturnType<typeof useRoutingStore>) {
  routingStore.setRouteOrigin([0, 0], 0);
  routingStore.setStart([0, 0]);
  routingStore.setDestination([1, 0], true);
  routingStore.setPreview({
    start: [0, 0],
    end: [1, 0],
    totalLengthMeters: 30_001,
    waypoints: [
      [0, 0],
      [1, 0],
    ],
    path: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 0],
        ],
      },
    },
  });
}

describe("DetailsPanelContent", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().clear();
  });

  it("renders route controls ahead of selection details when routing is active", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    const routingStore = useRoutingStore(pinia);
    const { activeUnitId } = useSelectedItems();
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    routingStore.unitRouteTimingMode = "speedArrival";
    seedRoutePreview(routingStore);

    const wrapper = mount(DetailsPanelContent, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: createScenarioMock() as any,
          [routeDetailsPanelKey as symbol]: {
            activeRoutingUnitName: computed(() => "Unit 1"),
            addRouteLeg: vi.fn(),
            clearCurrentLeg: vi.fn(),
            finishRoute: vi.fn(),
            closeRouting: vi.fn(),
            endRouting: vi.fn(),
            handleEscape: vi.fn(),
          },
        },
        stubs: {
          UnitDetails: defineComponent({
            name: "UnitDetails",
            template: "<div>Unit details</div>",
          }),
        },
      },
    });

    expect(wrapper.text()).toContain("Route");
    expect(wrapper.text()).toContain("Buffer (m)");
    expect(wrapper.text()).toContain("Speed used");
    expect(wrapper.text()).toContain("30.0 km/h");
    expect(wrapper.text()).toContain("Duration");
    expect(wrapper.text()).toContain("1 h");
    expect(wrapper.text()).toContain("Arrival");
    expect(wrapper.text()).toContain("1970-01-01 01:00");
    expect(wrapper.text()).not.toContain("Unit details");
  });

  it("shows timing stats in current time mode", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    const routingStore = useRoutingStore(pinia);
    const { activeUnitId } = useSelectedItems();
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    routingStore.unitRouteTimingMode = "currentTime";
    seedRoutePreview(routingStore);

    const wrapper = mount(DetailsPanelContent, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: createScenarioMock(7_200_000) as any,
          [routeDetailsPanelKey as symbol]: {
            activeRoutingUnitName: computed(() => "Unit 1"),
            addRouteLeg: vi.fn(),
            clearCurrentLeg: vi.fn(),
            finishRoute: vi.fn(),
            closeRouting: vi.fn(),
            endRouting: vi.fn(),
            handleEscape: vi.fn(),
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Average speed");
    expect(wrapper.text()).toContain("15.0 km/h");
    expect(wrapper.text()).toContain("Duration");
    expect(wrapper.text()).toContain("2 h");
    expect(wrapper.text()).toContain("Arrival");
    expect(wrapper.text()).toContain("1970-01-01 02:00");
  });

  it("formats route timing speeds with the current measurement unit", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    const routingStore = useRoutingStore(pinia);
    const measurementsStore = useMeasurementsStore(pinia);
    const { activeUnitId } = useSelectedItems();
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    routingStore.unitRouteTimingMode = "currentTime";
    measurementsStore.measurementUnit = "imperial";
    seedRoutePreview(routingStore);

    const wrapper = mount(DetailsPanelContent, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: createScenarioMock(7_200_000) as any,
          [routeDetailsPanelKey as symbol]: {
            activeRoutingUnitName: computed(() => "Unit 1"),
            addRouteLeg: vi.fn(),
            clearCurrentLeg: vi.fn(),
            finishRoute: vi.fn(),
            closeRouting: vi.fn(),
            endRouting: vi.fn(),
            handleEscape: vi.fn(),
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Average speed");
    expect(wrapper.text()).toContain("9.3 mph");
  });

  it("shows a header warning when the route cursor is inside an obstacle", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    const routingStore = useRoutingStore(pinia);
    const { activeUnitId } = useSelectedItems();
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    seedRoutePreview(routingStore);
    routingStore.setError(
      "The route start or destination is inside a routing obstacle.",
      "blocked-endpoint",
    );

    const wrapper = mount(DetailsPanelContent, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: createScenarioMock() as any,
          [routeDetailsPanelKey as symbol]: {
            activeRoutingUnitName: computed(() => "Unit 1"),
            addRouteLeg: vi.fn(),
            clearCurrentLeg: vi.fn(),
            finishRoute: vi.fn(),
            closeRouting: vi.fn(),
            endRouting: vi.fn(),
            handleEscape: vi.fn(),
          },
        },
      },
    });

    expect(wrapper.find('[aria-label="Cursor is inside an obstacle"]').exists()).toBe(
      true,
    );
  });

  it("prompts for map unit selection when track routing has no unit", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const toolbarStore = useMainToolbarStore(pinia);
    toolbarStore.currentToolbar = "route";

    const wrapper = mount(DetailsPanelContent, {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: createScenarioMock() as any,
          [routeDetailsPanelKey as symbol]: {
            activeRoutingUnitName: computed(() => null),
            addRouteLeg: vi.fn(),
            clearCurrentLeg: vi.fn(),
            finishRoute: vi.fn(),
            closeRouting: vi.fn(),
            endRouting: vi.fn(),
            handleEscape: vi.fn(),
          },
        },
      },
    });

    expect(wrapper.text()).toContain(
      "Click a unit on the map or select a single unit with a known location.",
    );
  });
});
