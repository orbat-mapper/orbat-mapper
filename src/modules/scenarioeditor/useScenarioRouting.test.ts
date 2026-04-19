// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { activeLayerKey, activeScenarioKey } from "@/components/injects";
import { RoutingError } from "@/geo/routing/types";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useRoutingStore } from "@/stores/routingStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useScenarioRouting } from "@/modules/scenarioeditor/useScenarioRouting";

const { computeRouteMock, prepareRoutingObstaclesMock, extractRoutingObstaclesMock } =
  vi.hoisted(() => ({
    computeRouteMock: vi.fn(),
    prepareRoutingObstaclesMock: vi.fn((obstacles) => obstacles),
    extractRoutingObstaclesMock: vi.fn(() => ({
      type: "FeatureCollection",
      features: [],
    })),
  }));

vi.mock("@/geo/routing/shortestPathService", () => ({
  DEFAULT_ROUTING_OPTIONS: {
    bufferObstacles: true,
    bufferRadius: 300,
  },
  getShortestPathService: () => ({
    computeRoute: computeRouteMock,
  }),
  prepareRoutingObstacles: prepareRoutingObstaclesMock,
}));

vi.mock("@/geo/routing/obstacleExtraction", () => ({
  extractRoutingObstacles: extractRoutingObstaclesMock,
}));

function buildRouteResult(coordinates: number[][], totalLengthMeters: number) {
  return {
    path: {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
      properties: {},
    },
    totalLengthMeters,
    waypoints: coordinates,
    options: {
      bufferObstacles: true,
      bufferRadius: 300,
    },
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function mountRoutingHarness(
  options: {
    currentTime?: number;
    activeLayerId?: string | null;
    targetLayerItems?: Array<{ id: string }>;
    unitLocation?: [number, number];
    unitLocations?: Record<string, [number, number]>;
    unitCurrentState?: { location: [number, number]; t: number };
    unitState?: Array<{ location?: [number, number] | null; t: number }>;
  } = {},
) {
  const handlers = new Map<string, (event: any) => void>();
  const mapAdapter = {
    on(event: string, handler: (event: any) => void) {
      handlers.set(event, handler);
      return () => handlers.delete(event);
    },
  };
  const addUnitPosition = vi.fn();
  const addFeature = vi.fn((feature) => feature.id);
  const getLayerById = vi.fn((id: string) =>
    id === "layer-1"
      ? {
          id,
          items: options.targetLayerItems ?? [],
        }
      : null,
  );

  const Harness = defineComponent({
    setup() {
      return useScenarioRouting(ref(mapAdapter as any));
    },
    template: "<div />",
  });

  const pinia = createPinia();
  setActivePinia(pinia);
  const toolbarStore = useMainToolbarStore(pinia);
  const routingStore = useRoutingStore(pinia);
  const { activeUnitId, clear } = useSelectedItems();
  clear();

  const wrapper = mount(Harness, {
    global: {
      plugins: [pinia],
      provide: {
        [activeScenarioKey as symbol]: {
          store: {
            state: {
              currentTime: options.currentTime ?? 1_000,
            },
          },
          geo: {
            layerItemsLayers: ref([]),
            addUnitPosition,
            addFeature,
            getLayerById,
          },
          helpers: {
            getUnitById: vi.fn((id: string) => {
              const fallbackLocations = {
                "unit-1": options.unitLocation ?? [0, 0],
              } satisfies Record<string, [number, number]>;
              const location = {
                ...fallbackLocations,
                ...(options.unitLocations ?? {}),
              }[id];
              return location
                ? {
                    id,
                    shortName: id === "unit-1" ? "Unit 1" : "Unit 2",
                    location,
                    ...(id === "unit-1" && options.unitCurrentState
                      ? { _state: options.unitCurrentState }
                      : {}),
                    ...(id === "unit-1" && options.unitState
                      ? { state: options.unitState }
                      : {}),
                    properties: {
                      averageSpeed: {
                        value: 30,
                        uom: "km/h",
                      },
                    },
                  }
                : null;
            }),
          },
        },
        [activeLayerKey as symbol]: ref(options.activeLayerId ?? "layer-1"),
      },
    },
  });

  return {
    wrapper,
    handlers,
    toolbarStore,
    routingStore,
    activeUnitId,
    addUnitPosition,
    addFeature,
    getLayerById,
  };
}

describe("useScenarioRouting", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    computeRouteMock.mockReset();
    prepareRoutingObstaclesMock.mockClear();
    extractRoutingObstaclesMock.mockClear();
    useSelectedItems().clear();
  });

  it("selects a unit from the map while track routing is open", async () => {
    const { handlers, toolbarStore, routingStore, activeUnitId } = mountRoutingHarness();

    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [10, 10],
      unitId: "unit-1",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(activeUnitId.value).toBe("unit-1");
    expect(routingStore.start).toEqual([0, 0]);
    expect(routingStore.routeOrigin).toEqual([0, 0]);
    expect(routingStore.currentLegPreview).toBeNull();
    expect(computeRouteMock).not.toHaveBeenCalled();
  });

  it("uses the map-selected track unit as the start for the next destination click", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { handlers, toolbarStore, routingStore } = mountRoutingHarness();

    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [10, 10],
      targetUnitId: "unit-1",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(computeRouteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        start: [0, 0],
        end: [2, 0],
      }),
    );
    expect(routingStore.canAddLeg).toBe(true);
  });

  it("shows a pending straight leg while calculating the route preview", async () => {
    const deferred = createDeferred<ReturnType<typeof buildRouteResult>>();
    computeRouteMock.mockReturnValue(deferred.promise);

    const { handlers, toolbarStore, routingStore, activeUnitId } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(routingStore.isBusy).toBe(true);
    expect(routingStore.pendingLegPath?.geometry.coordinates).toEqual([
      [0, 0],
      [2, 0],
    ]);
    expect(routingStore.previewRoutePath).toBeNull();
    expect(routingStore.displayDestination).toEqual([2, 0]);

    deferred.resolve(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );
    await flushPromises();

    expect(routingStore.isBusy).toBe(false);
    expect(routingStore.pendingLegPath).toBeNull();
    expect(routingStore.previewRoutePath?.geometry.coordinates).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
  });

  it("shows a pending straight leg immediately while the pointer moves", async () => {
    vi.useFakeTimers();
    try {
      computeRouteMock.mockResolvedValue(
        buildRouteResult(
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          2_000,
        ),
      );

      const { handlers, toolbarStore, routingStore, activeUnitId } =
        mountRoutingHarness();

      activeUnitId.value = "unit-1";
      toolbarStore.currentToolbar = "route";
      await nextTick();

      handlers.get("pointermove")?.({
        coordinate: [2, 0],
        stopPropagation: vi.fn(),
      });
      await nextTick();

      expect(routingStore.isBusy).toBe(false);
      expect(computeRouteMock).not.toHaveBeenCalled();
      expect(routingStore.pendingLegPath?.geometry.coordinates).toEqual([
        [0, 0],
        [2, 0],
      ]);
      expect(routingStore.previewRoutePath).toBeNull();
      expect(routingStore.displayDestination).toEqual([2, 0]);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("clears the current route draw on first Escape and closes routing on second Escape", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { wrapper, handlers, toolbarStore, routingStore, activeUnitId } =
      mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.currentLegPreview).not.toBeNull();
    expect((wrapper.vm as any).handleEscape()).toBe(true);
    expect(routingStore.destination).toBeNull();
    expect(routingStore.currentLegPreview).toBeNull();
    expect(toolbarStore.currentToolbar).toBe("route");

    expect((wrapper.vm as any).handleEscape()).toBe(true);
    expect(routingStore.active).toBe(false);
    expect(toolbarStore.currentToolbar).toBeNull();
  });

  it("keeps the route preview and shows a dashed cursor line after locking a leg", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { handlers, toolbarStore, routingStore, activeUnitId } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.previewRoutePath?.geometry.coordinates).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);

    handlers.get("pointermove")?.({
      coordinate: [4, 0],
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(routingStore.previewRoutePath?.geometry.coordinates).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
    expect(routingStore.cursorLegPath?.geometry.coordinates).toEqual([
      [0, 0],
      [4, 0],
    ]);
    expect(computeRouteMock).toHaveBeenCalledTimes(1);
  });

  it("switches track units from the map and clears the current draft", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { wrapper, handlers, toolbarStore, routingStore, activeUnitId } =
      mountRoutingHarness({
        unitLocations: {
          "unit-2": [5, 5],
        },
      });

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);
    expect(routingStore.hasDraftLegs).toBe(true);

    handlers.get("click")?.({
      coordinate: [5, 5],
      unitId: "unit-2",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(activeUnitId.value).toBe("unit-2");
    expect(routingStore.hasDraftLegs).toBe(false);
    expect(routingStore.draftWaypoints).toEqual([]);
    expect(routingStore.start).toEqual([5, 5]);
    expect(routingStore.routeOrigin).toEqual([5, 5]);
    expect(routingStore.destination).toBeNull();
    expect(routingStore.currentLegPreview).toBeNull();
  });

  it("switches track units from the map after route drawing is finished", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { wrapper, handlers, toolbarStore, routingStore, activeUnitId } =
      mountRoutingHarness({
        unitLocations: {
          "unit-2": [5, 5],
        },
      });

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    (wrapper.vm as any).endRouting();
    await nextTick();

    expect(routingStore.drawingFinished).toBe(true);
    expect(routingStore.canFinishRoute).toBe(true);

    handlers.get("click")?.({
      coordinate: [5, 5],
      unitId: "unit-2",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(activeUnitId.value).toBe("unit-2");
    expect(routingStore.drawingFinished).toBe(false);
    expect(routingStore.canFinishRoute).toBe(false);
    expect(routingStore.start).toEqual([5, 5]);
    expect(routingStore.routeOrigin).toEqual([5, 5]);
    expect(routingStore.draftWaypoints).toEqual([]);
    expect(routingStore.currentLegPreview).toBeNull();
  });

  it("does not reset a track draft when clicking the active unit again", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { wrapper, handlers, toolbarStore, routingStore, activeUnitId } =
      mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    handlers.get("click")?.({
      coordinate: [0, 0],
      unitId: "unit-1",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(routingStore.hasDraftLegs).toBe(true);
    expect(routingStore.draftWaypoints).toEqual([
      [0, 0],
      [2, 0],
    ]);
    expect(routingStore.start).toEqual([2, 0]);
    expect(computeRouteMock).toHaveBeenCalledTimes(1);
  });

  it("keeps feature routing clicks coordinate-based when the click hits a unit", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [10, 10],
          [12, 10],
        ],
        2_000,
      ),
    );

    const { handlers, toolbarStore, routingStore, activeUnitId } = mountRoutingHarness();

    toolbarStore.currentToolbar = "route";
    await nextTick();
    routingStore.startRouting("feature");
    await nextTick();

    handlers.get("click")?.({
      coordinate: [10, 10],
      unitId: "unit-1",
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(activeUnitId.value).toBeFalsy();
    expect(routingStore.start).toEqual([10, 10]);
    expect(routingStore.routeOrigin).toEqual([10, 10]);

    handlers.get("click")?.({
      coordinate: [12, 10],
      unitId: "unit-1",
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(computeRouteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        start: [10, 10],
        end: [12, 10],
      }),
    );
  });

  it("maps blocked endpoints to a clear user-facing error message", async () => {
    computeRouteMock.mockRejectedValue(
      new RoutingError(
        "The selected destination is inside a routing obstacle.",
        "blocked-endpoint",
      ),
    );

    const { handlers, toolbarStore, routingStore } = mountRoutingHarness({
      activeLayerId: null,
    });

    toolbarStore.currentToolbar = "route";
    await nextTick();

    routingStore.startRouting("feature");
    await nextTick();

    handlers.get("click")?.({
      coordinate: [0, 0],
      stopPropagation: vi.fn(),
    });
    await nextTick();

    handlers.get("click")?.({
      coordinate: [1, 1],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.error).toBe(
      "The selected destination is inside a routing obstacle.",
    );
  });

  it("appends the first leg into the draft and continues from the new endpoint", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
    } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.canAddLeg).toBe(true);
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);
    expect(routingStore.hasDraftLegs).toBe(true);
    expect(routingStore.draftWaypoints).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
    expect(routingStore.start).toEqual([2, 0]);
    expect(routingStore.routeOrigin).toEqual([0, 0]);
    expect(routingStore.currentLegPreview).toBeNull();
    expect(addUnitPosition).not.toHaveBeenCalled();
  });

  it("treats clicking the locked last point as add leg", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { handlers, toolbarStore, routingStore, activeUnitId } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.canAddLeg).toBe(true);
    expect(computeRouteMock).toHaveBeenCalledTimes(1);

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await nextTick();

    expect(routingStore.hasDraftLegs).toBe(true);
    expect(routingStore.start).toEqual([2, 0]);
    expect(routingStore.currentLegPreview).toBeNull();
    expect(computeRouteMock).toHaveBeenCalledTimes(1);
  });

  it("concatenates appended legs without duplicating shared endpoints", async () => {
    computeRouteMock
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          2_000,
        ),
      )
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [2, 0],
            [3, 0],
            [4, 0],
          ],
          2_000,
        ),
      );

    const { wrapper, handlers, toolbarStore, activeUnitId, routingStore } =
      mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    handlers.get("click")?.({
      coordinate: [4, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    expect(routingStore.draftWaypoints).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ]);
    expect(routingStore.draftTotalLengthMeters).toBe(4_000);
    expect(routingStore.start).toEqual([4, 0]);
  });

  it("finishes a unit route at the current scenario time by default", async () => {
    computeRouteMock
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          2_000,
        ),
      )
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [2, 0],
            [3, 0],
            [4, 0],
          ],
          2_000,
        ),
      );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
    } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    handlers.get("click")?.({
      coordinate: [4, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(routingStore.canFinishRoute).toBe(true);
    expect((wrapper.vm as any).finishRoute()).toBe(true);

    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [4, 0], 1_000, {
      via: [[2, 0]],
      viaStartTime: 1_000,
    });
    expect(toolbarStore.currentToolbar).toBeNull();
  });

  it("can finish a unit route at the speed-based arrival time", async () => {
    computeRouteMock
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          2_000,
        ),
      )
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [2, 0],
            [3, 0],
            [4, 0],
          ],
          2_000,
        ),
      );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
    } = mountRoutingHarness();

    routingStore.unitRouteTimingMode = "speedArrival";
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    handlers.get("click")?.({
      coordinate: [4, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect((wrapper.vm as any).finishRoute()).toBe(true);

    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [4, 0], 481_000, {
      via: [[2, 0]],
      viaStartTime: 1_000,
    });
  });

  it("uses the last stored unit position time before current state for speed-based routing", async () => {
    computeRouteMock.mockResolvedValueOnce(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
    } = mountRoutingHarness({
      currentTime: 100_000,
      unitCurrentState: { location: [50, 50], t: 10_000 },
      unitState: [{ location: [0, 0], t: 5_000 }],
    });

    routingStore.unitRouteTimingMode = "speedArrival";
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect((wrapper.vm as any).finishRoute()).toBe(true);

    expect(computeRouteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        start: [0, 0],
      }),
    );
    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [2, 0], 245_000, {
      via: [],
      viaStartTime: 5_000,
    });
  });

  it("uses the last stored unit position time as the speed-based route start time", async () => {
    computeRouteMock.mockResolvedValueOnce(
      buildRouteResult(
        [
          [10, 10],
          [11, 10],
          [12, 10],
        ],
        2_000,
      ),
    );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
    } = mountRoutingHarness({
      currentTime: 100_000,
      unitLocation: [0, 0],
      unitState: [
        { location: [5, 5], t: 1_000 },
        { location: [10, 10], t: 2_500 },
      ],
    });

    routingStore.unitRouteTimingMode = "speedArrival";
    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [12, 10],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect((wrapper.vm as any).finishRoute()).toBe(true);

    expect(addUnitPosition).toHaveBeenCalledWith("unit-1", [12, 10], 242_500, {
      via: [],
      viaStartTime: 2_500,
    });
  });

  it("finishes a feature route as one LineString with all legs", async () => {
    computeRouteMock
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [10, 10],
            [11, 10],
            [12, 10],
          ],
          2_000,
        ),
      )
      .mockResolvedValueOnce(
        buildRouteResult(
          [
            [12, 10],
            [13, 10],
            [14, 10],
          ],
          2_000,
        ),
      );

    const { wrapper, handlers, toolbarStore, routingStore, addFeature } =
      mountRoutingHarness({
        targetLayerItems: [{ id: "existing-route" }],
      });

    toolbarStore.currentToolbar = "route";
    await nextTick();
    routingStore.startRouting("feature");
    await nextTick();

    handlers.get("click")?.({
      coordinate: [10, 10],
      stopPropagation: vi.fn(),
    });
    await nextTick();

    handlers.get("click")?.({
      coordinate: [12, 10],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    handlers.get("click")?.({
      coordinate: [14, 10],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect((wrapper.vm as any).finishRoute()).toBe(true);
    expect(addFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Route 2",
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 10],
            [11, 10],
            [12, 10],
            [13, 10],
            [14, 10],
          ],
        },
      }),
      "layer-1",
    );
  });

  it("discards the draft route on close without mutating scenario data", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const {
      wrapper,
      handlers,
      toolbarStore,
      routingStore,
      activeUnitId,
      addUnitPosition,
      addFeature,
    } = mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();
    expect((wrapper.vm as any).addRouteLeg()).toBe(true);

    (wrapper.vm as any).closeRouting();

    expect(routingStore.active).toBe(false);
    expect(routingStore.draftWaypoints).toEqual([]);
    expect(toolbarStore.currentToolbar).toBeNull();
    expect(addUnitPosition).not.toHaveBeenCalled();
    expect(addFeature).not.toHaveBeenCalled();
  });

  it("reuses prepared obstacles between preview generation and finishing", async () => {
    computeRouteMock.mockResolvedValue(
      buildRouteResult(
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        2_000,
      ),
    );

    const { wrapper, handlers, toolbarStore, activeUnitId, addUnitPosition } =
      mountRoutingHarness();

    activeUnitId.value = "unit-1";
    toolbarStore.currentToolbar = "route";
    await nextTick();

    handlers.get("click")?.({
      coordinate: [2, 0],
      stopPropagation: vi.fn(),
    });
    await flushPromises();

    expect(computeRouteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        preparedObstacles: expect.objectContaining({
          type: "FeatureCollection",
          features: [],
        }),
      }),
    );
    expect(extractRoutingObstaclesMock).toHaveBeenCalledTimes(1);
    expect(prepareRoutingObstaclesMock).toHaveBeenCalledTimes(1);

    expect((wrapper.vm as any).finishRoute()).toBe(true);
    expect(extractRoutingObstaclesMock).toHaveBeenCalledTimes(1);
    expect(prepareRoutingObstaclesMock).toHaveBeenCalledTimes(1);
    expect(addUnitPosition).toHaveBeenCalled();
  });
});
