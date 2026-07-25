// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMaplibreUnitHistory } from "@/composables/maplibreUnitHistory";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUnitSettingsStore } from "@/stores/geoStore";

const UNIT_ID = "unit-1";
const WAYPOINT_ID = "V1StGXR8Z5jdHi6BmyT"; // nanoid, not parseable as an integer

function createUnit() {
  return {
    id: UNIT_ID,
    name: "Unit 1",
    location: [10, 20],
    state: [
      { id: WAYPOINT_ID, t: 2000, location: [11, 21] },
      { id: "aBcDeFgHiJkLmNoPqRsT", t: 3000, location: [12, 22] },
    ] as { id: string; t: number; location: number[]; via?: number[][] }[],
    _state: { t: 0, location: [10, 20] },
  };
}

function createHarness() {
  const handlers = new Map<string, Function[]>();
  const layerHandlers = new Map<string, Function[]>();
  const sources = new Map<string, any>();
  const layers = new Map<string, any>();

  const mlMap = {
    on: vi.fn((name: string, layerIdOrHandler: any, maybeHandler?: Function) => {
      const isDelegated = typeof layerIdOrHandler === "string";
      const key = isDelegated ? `${name}:${layerIdOrHandler}` : name;
      const target = isDelegated ? layerHandlers : handlers;
      const handler = isDelegated ? maybeHandler! : layerIdOrHandler;
      target.set(key, [...(target.get(key) ?? []), handler]);
    }),
    off: vi.fn(),
    once: vi.fn((name: string, handler: Function) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    addSource: vi.fn((id: string, source: any) => {
      sources.set(id, {
        spec: source,
        data: source.data,
        setData: vi.fn((data: unknown) => {
          sources.get(id)!.data = data;
        }),
      });
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    addLayer: vi.fn((spec: any) => layers.set(spec.id, spec)),
    getLayer: vi.fn((id: string) => layers.get(id)),
    setLayoutProperty: vi.fn(),
    setPaintProperty: vi.fn(),
    setFeatureState: vi.fn(),
    removeFeatureState: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    // The test map is unprojected, so screen space and lng/lat coincide.
    project: vi.fn((coordinates: [number, number]) => ({
      x: coordinates[0],
      y: coordinates[1],
    })),
    unproject: vi.fn(([x, y]: [number, number]) => ({ lng: x, lat: y })),
    getCanvas: () => ({ style: { cursor: "" } }),
  } as any;

  const unit = createUnit();
  const addUnitPosition = vi.fn();
  const unitActions = {
    deleteUnitStateEntry: vi.fn(),
    updateUnit: vi.fn(),
    updateUnitState: vi.fn(),
    // Mirrors the store action so a redraw after an edit reflects the change.
    updateUnitStateVia: vi.fn(
      (
        id: string,
        action: string,
        stateIndex: number,
        viaIndex: number,
        data: number[],
      ) => {
        if (id !== UNIT_ID) return;
        const entry = unit.state[stateIndex];
        if (!entry) return;
        if (!entry.via) entry.via = [];
        if (action === "add") entry.via.splice(viaIndex, 0, data);
        else if (action === "modify") entry.via[viaIndex] = data;
        else if (action === "remove") entry.via.splice(viaIndex, 1);
      },
    ),
  };
  const activeScenario = {
    geo: { addUnitPosition },
    unitActions,
    helpers: { getUnitById: (id: string) => (id === UNIT_ID ? unit : undefined) },
    store: { state: { unitStateCounter: 0 }, onUndoRedo: vi.fn() },
  } as any;

  const history = useMaplibreUnitHistory(mlMap, activeScenario);

  function trigger(key: string, event: any) {
    for (const handler of layerHandlers.get(key) ?? handlers.get(key) ?? []) {
      handler(event);
    }
  }

  return { mlMap, sources, history, addUnitPosition, unitActions, trigger, unit };
}

function createEvent(
  lng: number,
  lat: number,
  features?: any[],
  originalEvent: Record<string, unknown> = {},
) {
  return {
    lngLat: { lng, lat },
    point: { x: lng, y: lat },
    features,
    preventDefault: vi.fn(),
    originalEvent: {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ...originalEvent,
    },
  } as any;
}

describe("useMaplibreUnitHistory", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().selectedUnitIds.value.clear();
  });

  it("promotes the waypoint id from a property", () => {
    // MapLibre coerces top-level GeoJSON feature ids with parseInt, which would
    // turn our nanoid waypoint ids into NaN.
    const { sources, history } = createHarness();
    history.setupUnitHistoryLayers();
    expect(sources.get("unitHistoryWaypointSource").spec.promoteId).toBe("waypointId");
  });

  it("renders waypoints with the waypoint id as a property", () => {
    const { sources, history } = createHarness();
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    history.drawHistory();

    const features = sources.get("unitHistoryWaypointSource").data.features;
    expect(features.map((f: any) => f.properties.waypointId)).toContain(WAYPOINT_ID);
  });

  it("moves the dragged waypoint instead of appending a position", () => {
    const { history, trigger, addUnitPosition, sources } = createHarness();
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = true;
    history.drawHistory();

    const feature = {
      // Mirrors what MapLibre hands back: the top-level id is unusable.
      id: NaN,
      properties: { unitId: UNIT_ID, waypointId: WAYPOINT_ID, t: 2000, isInitial: false },
    };
    trigger("mousedown:unitHistoryWaypointLayer", createEvent(11, 21, [feature]));
    trigger("mousemove", createEvent(30, 40));

    const dragged = sources
      .get("unitHistoryWaypointSource")
      .data.features.find((f: any) => f.properties.waypointId === WAYPOINT_ID);
    expect(dragged.geometry.coordinates).toEqual([30, 40]);

    trigger("mouseup", createEvent(30, 40));
    expect(addUnitPosition).toHaveBeenCalledWith(UNIT_ID, [30, 40], 2000);
  });

  it("moves the unit's initial location when the first waypoint is dragged", () => {
    const { history, trigger, addUnitPosition, unitActions } = createHarness();
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = true;
    history.drawHistory();

    const feature = {
      id: undefined,
      properties: {
        unitId: UNIT_ID,
        t: Number.MIN_SAFE_INTEGER,
        isInitial: true,
        stateIndex: -1,
      },
    };
    trigger("mousedown:unitHistoryWaypointLayer", createEvent(10, 20, [feature]));
    trigger("mouseup", createEvent(15, 25));

    expect(addUnitPosition).not.toHaveBeenCalled();
    expect(unitActions.updateUnit).toHaveBeenCalledWith(UNIT_ID, { location: [15, 25] });
  });

  it("moves a via point when it is dragged", () => {
    const { history, trigger, sources, unitActions, unit } = createHarness();
    unit.state[0].via = [[11.5, 21.5]];
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = true;
    history.drawHistory();

    const viaFeatures = sources.get("unitHistoryViaSource").data.features;
    expect(viaFeatures).toHaveLength(1);
    const { unitId, stateIndex, viaIndex } = viaFeatures[0].properties;
    expect(unitId).toBe(UNIT_ID);

    trigger(
      "mousedown:unitHistoryViaLayer",
      createEvent(11.5, 21.5, [{ properties: { unitId, stateIndex, viaIndex } }]),
    );
    trigger("mousemove", createEvent(30, 40));
    expect(
      sources.get("unitHistoryViaSource").data.features[0].geometry.coordinates,
    ).toEqual([30, 40]);

    trigger("mouseup", createEvent(30, 40));
    expect(unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "modify",
      stateIndex,
      viaIndex,
      [30, 40],
    );
  });

  it("ignores via drags while path editing is disabled", () => {
    const { history, trigger, unitActions, unit } = createHarness();
    unit.state[0].via = [[11.5, 21.5]];
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = false;
    history.drawHistory();

    trigger(
      "mousedown:unitHistoryViaLayer",
      createEvent(11.5, 21.5, [
        { properties: { unitId: UNIT_ID, stateIndex: 0, viaIndex: 0 } },
      ]),
    );
    trigger("mouseup", createEvent(30, 40));
    expect(unitActions.updateUnitStateVia).not.toHaveBeenCalled();
  });

  function setupEditing(harness: ReturnType<typeof createHarness>) {
    harness.history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = true;
    harness.history.drawHistory();
  }

  const LEG_FEATURE = [{ properties: { unitId: UNIT_ID } }];

  // Makes the via layer report a hit at the queried point.
  function stubViaHit(harness: ReturnType<typeof createHarness>) {
    harness.mlMap.queryRenderedFeatures = vi.fn(
      (_point: unknown, options: { layers: string[] }) =>
        options.layers[0] === "unitHistoryViaLayer"
          ? [
              {
                layer: { id: "unitHistoryViaLayer" },
                properties: { unitId: UNIT_ID, stateIndex: 0, viaIndex: 0 },
              },
            ]
          : [],
    );
  }

  it("annotates leg segments with the via insertion position", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [
      [10.4, 20.4],
      [10.8, 20.8],
    ];
    setupEditing(harness);

    const leg = harness.sources.get("unitHistoryLegSource").data.features[0];
    expect(leg.geometry.coordinates).toHaveLength(5);
    // The initial waypoint has no state entry, so the first segments belong to
    // the state entry at the end of the leg they precede.
    expect(leg.properties.segments).toEqual([
      { stateIndex: 0, viaIndex: 0 },
      { stateIndex: 0, viaIndex: 1 },
      { stateIndex: 0, viaIndex: 2 },
      { stateIndex: 1, viaIndex: 0 },
    ]);
  });

  it("adds a via point when the segment from the initial location is grabbed", () => {
    const harness = createHarness();
    setupEditing(harness);

    harness.trigger(
      "mousedown:unitHistoryLegLayer",
      createEvent(10.5, 20.5, LEG_FEATURE),
    );

    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "add",
      0,
      0,
      [10.5, 20.5],
    );
  });

  it("adds a via point between two existing via points", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [
      [10.4, 20.4],
      [10.8, 20.8],
    ];
    setupEditing(harness);

    harness.trigger(
      "mousedown:unitHistoryLegLayer",
      createEvent(10.6, 20.6, LEG_FEATURE),
    );

    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "add",
      0,
      1,
      [10.6, 20.6],
    );
  });

  it("drags the newly added via point", () => {
    const harness = createHarness();
    setupEditing(harness);

    // Midway on the leg between the two state entries.
    harness.trigger(
      "mousedown:unitHistoryLegLayer",
      createEvent(11.5, 21.5, LEG_FEATURE),
    );
    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "add",
      1,
      0,
      [11.5, 21.5],
    );

    harness.trigger("mousemove", createEvent(30, 40));
    const viaFeatures = harness.sources.get("unitHistoryViaSource").data.features;
    expect(viaFeatures).toHaveLength(1);
    expect(viaFeatures[0].geometry.coordinates).toEqual([30, 40]);

    harness.trigger("mouseup", createEvent(30, 40));
    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "modify",
      1,
      0,
      [30, 40],
    );
  });

  // Makes the midpoint handle layer report the handles it was given.
  function stubMidpointHits(harness: ReturnType<typeof createHarness>) {
    harness.mlMap.queryRenderedFeatures = vi.fn(
      (_box: unknown, options: { layers: string[] }) =>
        options.layers[0] === "unitHistoryLegMidpointLayer"
          ? harness.sources.get("unitHistoryLegMidpointSource").data.features
          : [],
    );
  }

  it("draws a midpoint handle per leg segment", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [[10.4, 20.4]];
    setupEditing(harness);

    const handles = harness.sources.get("unitHistoryLegMidpointSource").data.features;
    // initial -> via, via -> waypoint 1, waypoint 1 -> waypoint 2
    expect(handles).toHaveLength(3);
    expect(handles.map((f: { properties: unknown }) => f.properties)).toEqual([
      { unitId: UNIT_ID, stateIndex: 0, viaIndex: 0 },
      { unitId: UNIT_ID, stateIndex: 0, viaIndex: 1 },
      { unitId: UNIT_ID, stateIndex: 1, viaIndex: 0 },
    ]);
    // Placed halfway along the segment they belong to.
    expect(handles[2].geometry.coordinates).toEqual([11.5, 21.5]);
  });

  it("draws no midpoint handles while path editing is disabled", () => {
    const harness = createHarness();
    harness.history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = false;
    harness.history.drawHistory();

    expect(
      harness.sources.get("unitHistoryLegMidpointSource").data.features,
    ).toHaveLength(0);
  });

  it("adds a via point when a midpoint handle is grabbed near, not on, it", () => {
    const harness = createHarness();
    setupEditing(harness);
    stubMidpointHits(harness);

    // Well off the handle at [11.5, 21.5], but inside the tolerance box.
    harness.trigger("mousedown", createEvent(11.5 + 6, 21.5 + 6));

    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "add",
      1,
      0,
      [17.5, 27.5],
    );
  });

  it("redraws the line while a point is dragged", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [[10.4, 20.4]];
    setupEditing(harness);

    // The antimeridian unwind leaves floating point noise behind.
    const round = (coordinates: number[][]) =>
      coordinates.map((c) => c.map((n) => Math.round(n * 1e6) / 1e6));
    const legCoordinates = () =>
      round(
        harness.sources.get("unitHistoryLegSource").data.features[0].geometry.coordinates,
      );

    expect(legCoordinates()).toEqual([
      [10, 20],
      [10.4, 20.4],
      [11, 21],
      [12, 22],
    ]);

    harness.trigger(
      "mousedown:unitHistoryViaLayer",
      createEvent(10.4, 20.4, [
        { properties: { unitId: UNIT_ID, stateIndex: 0, viaIndex: 0 } },
      ]),
    );
    harness.trigger("mousemove", createEvent(30, 40));

    // The line follows the cursor, not just the dragged point.
    expect(legCoordinates()).toEqual([
      [10, 20],
      [30, 40],
      [11, 21],
      [12, 22],
    ]);
    // The arc is re-interpolated through the dragged position too.
    const arcCoordinates = round(
      harness.sources.get("unitHistoryArcSource").data.features[0].geometry.coordinates,
    );
    expect(arcCoordinates).toContainEqual([30, 40]);
  });

  it("redraws the line while a waypoint is dragged", () => {
    const harness = createHarness();
    setupEditing(harness);

    harness.trigger(
      "mousedown:unitHistoryWaypointLayer",
      createEvent(11, 21, [
        {
          properties: {
            unitId: UNIT_ID,
            waypointId: WAYPOINT_ID,
            t: 2000,
            stateIndex: 0,
            isInitial: false,
          },
        },
      ]),
    );
    harness.trigger("mousemove", createEvent(30, 40));

    expect(
      harness.sources
        .get("unitHistoryLegSource")
        .data.features[0].geometry.coordinates.map((c: number[]) =>
          c.map((n) => Math.round(n * 1e6) / 1e6),
        ),
    ).toEqual([
      [10, 20],
      [30, 40],
      [12, 22],
    ]);
  });

  it("does not add via points while path editing is disabled", () => {
    const harness = createHarness();
    harness.history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = false;
    harness.history.drawHistory();

    harness.trigger(
      "mousedown:unitHistoryLegLayer",
      createEvent(11.5, 21.5, LEG_FEATURE),
    );
    harness.trigger("mouseup", createEvent(30, 40));
    expect(harness.unitActions.updateUnitStateVia).not.toHaveBeenCalled();
  });

  it("removes a via point on alt-click without dragging it", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [[11.5, 21.5]];
    setupEditing(harness);
    stubViaHit(harness);

    // Alt-mousedown must not start a drag that would commit a move.
    harness.trigger(
      "mousedown:unitHistoryViaLayer",
      createEvent(
        11.5,
        21.5,
        [{ properties: { unitId: UNIT_ID, stateIndex: 0, viaIndex: 0 } }],
        {
          altKey: true,
        },
      ),
    );
    harness.trigger("mouseup", createEvent(11.5, 21.5, undefined, { altKey: true }));
    expect(harness.unitActions.updateUnitStateVia).not.toHaveBeenCalled();

    const consumed = harness.history.handleMapClick(
      createEvent(11.5, 21.5, undefined, { altKey: true }),
    );
    expect(consumed).toBe(true);
    expect(harness.unitActions.updateUnitStateVia).toHaveBeenCalledWith(
      UNIT_ID,
      "remove",
      0,
      0,
      [11.5, 21.5],
    );
    expect(harness.unit.state[0].via).toEqual([]);
  });

  it("does not remove via points while path editing is disabled", () => {
    const harness = createHarness();
    harness.unit.state[0].via = [[11.5, 21.5]];
    harness.history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = false;
    harness.history.drawHistory();
    stubViaHit(harness);

    harness.history.handleMapClick(createEvent(11.5, 21.5, undefined, { altKey: true }));
    expect(harness.unitActions.updateUnitStateVia).not.toHaveBeenCalled();
  });

  it("ignores waypoint drags while path editing is disabled", () => {
    const { history, trigger, addUnitPosition } = createHarness();
    history.setupUnitHistoryLayers();
    useSelectedItems().selectedUnitIds.value.add(UNIT_ID);
    useUnitSettingsStore().editHistory = false;
    history.drawHistory();

    const feature = {
      id: NaN,
      properties: { unitId: UNIT_ID, waypointId: WAYPOINT_ID, t: 2000, isInitial: false },
    };
    trigger("mousedown:unitHistoryWaypointLayer", createEvent(11, 21, [feature]));
    trigger("mouseup", createEvent(30, 40));
    expect(addUnitPosition).not.toHaveBeenCalled();
  });
});
