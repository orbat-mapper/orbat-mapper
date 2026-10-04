import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Feature, Polygon } from "geojson";
import type { Map as MlMap } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import type { NRangeRingGroup, NUnit } from "@/types/internalModels";
import type { RangeRingVisibility } from "@/types/scenarioGeoModels";
import { isRangeRingHidden, useMaplibreRangeRings } from "./maplibreRangeRings";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useGeo } from "@/scenariostore/geo";
import { useStateHelpers } from "@/scenariostore/helpers";

/** A GeoJSON source stand-in that applies setData and updateData like MapLibre. */
type DrawnFeature = Feature<
  Polygon,
  { key: string; id: string; visibilityGroup: string }
>;

function fakeSource() {
  let features = new Map<string, DrawnFeature>();
  const setData = vi.fn((data: { features: DrawnFeature[] }) => {
    features = new Map(data.features.map((f) => [f.properties.key, f]));
  });
  const updateData = vi.fn((diff: { add?: DrawnFeature[]; remove?: string[] }) => {
    for (const key of diff.remove ?? []) features.delete(key);
    for (const f of diff.add ?? []) features.set(f.properties.key, f);
  });
  return { setData, updateData, features: () => [...features.values()] };
}

function fixture() {
  const units = ref<Partial<NUnit>[]>([]);
  let source = fakeSource();
  const layers = new Map<string, any>();
  const map = {
    getSource: () => source,
    addSource: vi.fn(),
    getLayer: (id: string) => layers.get(id),
    getLayersOrder: () => [...layers.keys()],
    addLayer: (spec: any, beforeId?: string) => {
      if (beforeId === undefined || !layers.has(beforeId)) {
        layers.set(spec.id, spec);
        return;
      }
      const entries = [...layers.entries()];
      layers.clear();
      for (const [id, layer] of entries) {
        if (id === beforeId) layers.set(spec.id, spec);
        layers.set(id, layer);
      }
    },
    removeLayer: (id: string) => layers.delete(id),
  } as unknown as MlMap;
  const state: {
    rangeRingGroupMap: Record<string, NRangeRingGroup>;
    rangeRingVisibility?: RangeRingVisibility;
  } = { rangeRingGroupMap: {} };
  const scenario = {
    geo: { everyVisibleUnit: units },
    store: { state },
    helpers: { getUnitById: (id: string) => units.value.find((u) => u.id === id) },
  } as unknown as TScenario;
  const replaceSource = () => {
    source = fakeSource();
    return source;
  };
  return {
    ...useMaplibreRangeRings(map, scenario),
    units,
    state,
    layers,
    source: () => source,
    replaceSource,
  };
}

const ringUnit = (location: [number, number]): Partial<NUnit> => ({
  id: "u1",
  rangeRings: [{ name: "r", range: 10, uom: "km" }],
  _state: { location } as unknown as NUnit["_state"],
});

describe("drawRangeRings", () => {
  it("skips updates when the rings have not changed", () => {
    const { drawRangeRings, source, units } = fixture();
    units.value = [ringUnit([10, 60])];
    drawRangeRings();
    drawRangeRings();
    expect(source().setData).toHaveBeenCalledTimes(1);
    expect(source().updateData).not.toHaveBeenCalled();
  });

  it("sends only the rings that moved", () => {
    const { drawRangeRings, source, units } = fixture();
    const still = { ...ringUnit([20, 60]), id: "u2" };
    units.value = [ringUnit([10, 60]), still];
    drawRangeRings();
    units.value = [ringUnit([11, 60]), still];
    drawRangeRings();
    expect(source().setData).toHaveBeenCalledTimes(1);
    expect(source().updateData).toHaveBeenCalledTimes(1);
    const diff = source().updateData.mock.lastCall![0];
    expect(diff.add!.map((f) => f.properties.id)).toEqual(["u1-0"]);
    expect(diff.remove).toEqual([]);
  });

  it("removes the rings of units that are no longer visible", () => {
    const { drawRangeRings, source, units } = fixture();
    units.value = [ringUnit([10, 60])];
    drawRangeRings();
    units.value = [];
    drawRangeRings();
    expect(source().updateData.mock.lastCall![0]).toEqual({
      add: [],
      remove: ["ring:u1-0"],
    });
    expect(source().features()).toEqual([]);
  });

  it("merges a ring group again only when a member changes", () => {
    const { drawRangeRings, source, units } = fixture();
    const member = (id: string, location: [number, number]): Partial<NUnit> => ({
      id,
      rangeRings: [{ name: "r", range: 10, uom: "km", group: "g1" }],
      _state: { location } as unknown as NUnit["_state"],
    });
    units.value = [member("a", [10, 60]), member("b", [10.05, 60])];
    drawRangeRings();
    const [merged] = source().features();
    units.value = [member("a", [10, 60]), member("b", [10.05, 60])];
    drawRangeRings();
    expect(source().features()[0]).toBe(merged);
    units.value = [member("a", [10, 60]), member("b", [10.1, 60])];
    drawRangeRings();
    expect(source().features()[0].geometry).not.toBe(merged.geometry);
  });

  it("fills a replaced source even when the rings are unchanged", () => {
    const { drawRangeRings, replaceSource } = fixture();
    drawRangeRings();
    const next = replaceSource();
    drawRangeRings();
    expect(next.setData).toHaveBeenCalledTimes(1);
  });
});

describe("drawRangeRings with limited unit visibility", () => {
  it("shows a unit's rings only over the zoom range of the unit", () => {
    const { drawRangeRings, source, units, layers } = fixture();
    units.value = [
      {
        ...ringUnit([10, 60]),
        style: { limitVisibility: true, minZoom: 8, maxZoom: 12 } as NUnit["style"],
      },
    ];
    drawRangeRings();

    const { features } = { features: source().features() };
    const groupId = features[0].properties.visibilityGroup;
    const groupLayers = [...layers.values()].filter(
      (layer) => layer.filter?.[2] === groupId,
    );
    expect(groupLayers.map((layer) => layer.type).sort()).toEqual(["fill", "line"]);
    for (const layer of groupLayers) {
      expect(layer).toMatchObject({ minzoom: 8, maxzoom: 12 });
    }

    units.value = [ringUnit([10, 60])];
    drawRangeRings();

    expect([...layers.values()].some((layer) => layer.filter?.[2] === groupId)).toBe(
      false,
    );
  });

  it("adds zoom-limited ring layers next to the rings, wherever they were moved", () => {
    const { setupRangeRingLayers, drawRangeRings, units, layers } = fixture();
    layers.set("unitLayer", { id: "unitLayer" });
    setupRangeRingLayers("unitLayer");
    // The scenario layer controller has moved the rings below a feature layer.
    const rings = [...layers.entries()].filter(([id]) => id !== "unitLayer");
    layers.clear();
    for (const [id, layer] of rings) layers.set(id, layer);
    layers.set("featureLayer", { id: "featureLayer" });
    layers.set("unitLayer", { id: "unitLayer" });

    units.value = [
      {
        ...ringUnit([10, 60]),
        style: { limitVisibility: true, minZoom: 8, maxZoom: 12 } as NUnit["style"],
      },
    ];
    drawRangeRings();

    const order = [...layers.keys()];
    expect(order.slice(-2)).toEqual(["featureLayer", "unitLayer"]);
    expect(order).toHaveLength(6);
  });
});

describe("drawRangeRings with grouped rings", () => {
  const groupedRingUnit = (
    id: string,
    location: [number, number],
    style?: Partial<NUnit["style"]>,
  ): Partial<NUnit> => ({
    id,
    rangeRings: [{ name: "r", range: 10, uom: "km", group: "g1" }],
    _state: { location } as unknown as NUnit["_state"],
    style: style as NUnit["style"],
  });

  it("merges overlapping members wherever their zoom ranges overlap", () => {
    const { drawRangeRings, source, units, layers } = fixture();
    units.value = [
      groupedRingUnit("a", [10, 60]),
      groupedRingUnit("b", [10.05, 60], {
        limitVisibility: true,
        minZoom: 8,
        maxZoom: 12,
      }),
    ];
    drawRangeRings();

    const { features } = { features: source().features() };
    const zoomRanges = features.map((f: any) => {
      const layer = [...layers.values()].find(
        (l) => l.type === "fill" && l.filter?.[2] === f.properties.visibilityGroup,
      );
      return [layer.minzoom ?? 0, layer.maxzoom ?? 24];
    });
    expect([...zoomRanges].sort((a: number[], b: number[]) => a[0] - b[0])).toEqual([
      [0, 8],
      [8, 12],
      [12, 24],
    ]);
    // At zoom 10 both rings render as one merged area.
    expect(
      zoomRanges.filter(([min, max]: number[]) => min <= 10 && max > 10),
    ).toHaveLength(1);
  });

  it("keeps one always-visible feature when all members share a zoom range", () => {
    const { drawRangeRings, source, units } = fixture();
    units.value = [groupedRingUnit("a", [10, 60]), groupedRingUnit("b", [10.05, 60])];
    drawRangeRings();

    const { features } = { features: source().features() };
    expect(features).toHaveLength(1);
    expect(features[0].properties.visibilityGroup).toBe("always");
  });
});

describe("drawRangeRings during playback", () => {
  function createScenario() {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.5.0",
      name: "Scenario",
      startTime: 0,
      sides: [
        {
          id: "side-1",
          name: "Blue",
          standardIdentity: "3",
          groups: [
            {
              id: "group-1",
              name: "Blue Group",
              subUnits: [
                {
                  id: "moving",
                  name: "Moving",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  rangeRings: [{ name: "r", range: 10, uom: "km" }],
                  state: [
                    { id: "m1", t: 100, location: [10, 60] },
                    { id: "m2", t: 1000, location: [12, 60] },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
    return {
      store,
      time: useScenarioTime(store),
      geo: useGeo(store),
      helpers: useStateHelpers(store),
    } as unknown as TScenario;
  }

  it("moves the rings of a moving unit on every time change", () => {
    const scenario = createScenario();
    const source = fakeSource();
    const map = { getSource: () => source, getLayer: () => ({}) } as unknown as MlMap;
    const { drawRangeRings } = useMaplibreRangeRings(map, scenario);
    const ringCenterLongitude = () => {
      const ring = source.features()[0].geometry.coordinates[0] as number[][];
      return ring.reduce((sum, [lng]) => sum + lng, 0) / ring.length;
    };

    scenario.time.setCurrentTime(200);
    drawRangeRings();
    const first = ringCenterLongitude();
    scenario.time.setCurrentTime(500);
    drawRangeRings();
    const second = ringCenterLongitude();
    scenario.time.setCurrentTime(1500);
    drawRangeRings();

    expect(source.setData).toHaveBeenCalledTimes(1);
    expect(source.updateData).toHaveBeenCalledTimes(2);
    expect(second).toBeGreaterThan(first);
    expect(ringCenterLongitude()).toBeCloseTo(12, 1);
  });
});

describe("isRangeRingHidden", () => {
  const groupMap = {
    shown: { id: "shown", name: "Shown" },
    hidden: { id: "hidden", name: "Hidden", hidden: true },
  };

  it.each([
    ["a shown ungrouped ring", {}, undefined, false],
    ["a ring hidden on its own", { hidden: true }, undefined, true],
    ["a ring in a shown group", { group: "shown" }, undefined, false],
    ["a ring in a hidden group", { group: "hidden" }, undefined, true],
    ["a ring whose group no longer exists", { group: "gone" }, undefined, false],
    ["any ring while all rings are hidden", { group: "shown" }, { hidden: true }, true],
    [
      "an ungrouped ring while ungrouped rings are hidden",
      {},
      { ungroupedHidden: true },
      true,
    ],
    [
      "a grouped ring while ungrouped rings are hidden",
      { group: "shown" },
      { ungroupedHidden: true },
      false,
    ],
  ])("handles %s", (_, ring, visibility, expected) => {
    expect(
      isRangeRingHidden(
        { name: "r", range: 1, uom: "km", ...ring },
        groupMap,
        visibility,
      ),
    ).toBe(expected);
  });
});

describe("drawRangeRings with hidden rings", () => {
  const unitWithRings = (): Partial<NUnit> => ({
    id: "u1",
    rangeRings: [
      { name: "grouped", range: 10, uom: "km", group: "g1" },
      { name: "ungrouped", range: 5, uom: "km" },
    ],
    _state: { location: [10, 60] } as unknown as NUnit["_state"],
  });
  const drawnIds = (source: ReturnType<typeof fakeSource>) =>
    source.features().map((f) => f.properties.id);

  it("leaves out the rings of a hidden group", () => {
    const { drawRangeRings, source, units, state } = fixture();
    units.value = [unitWithRings()];
    state.rangeRingGroupMap = { g1: { id: "g1", name: "G1", hidden: true } };
    drawRangeRings();
    expect(drawnIds(source())).toEqual(["u1-1"]);
  });

  it("leaves out ungrouped rings while they are hidden", () => {
    const { drawRangeRings, source, units, state } = fixture();
    units.value = [unitWithRings()];
    state.rangeRingGroupMap = { g1: { id: "g1", name: "G1" } };
    state.rangeRingVisibility = { ungroupedHidden: true };
    drawRangeRings();
    expect(drawnIds(source())).toEqual(["g1"]);
  });

  it("draws nothing while all rings are hidden", () => {
    const { drawRangeRings, source, units, state } = fixture();
    units.value = [unitWithRings()];
    state.rangeRingVisibility = { hidden: true };
    drawRangeRings();
    expect(drawnIds(source())).toEqual([]);
  });
});
