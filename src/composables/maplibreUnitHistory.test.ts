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
    getCanvas: () => ({ style: { cursor: "" } }),
  } as any;

  const unit = createUnit();
  const addUnitPosition = vi.fn();
  const unitActions = {
    deleteUnitStateEntry: vi.fn(),
    updateUnit: vi.fn(),
    updateUnitState: vi.fn(),
    updateUnitStateVia: vi.fn(),
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

function createEvent(lng: number, lat: number, features?: any[]) {
  return {
    lngLat: { lng, lat },
    point: { x: lng, y: lat },
    features,
    preventDefault: vi.fn(),
    originalEvent: { preventDefault: vi.fn(), stopPropagation: vi.fn() },
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
