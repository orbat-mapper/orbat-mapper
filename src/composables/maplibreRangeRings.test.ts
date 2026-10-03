import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import { useMaplibreRangeRings } from "./maplibreRangeRings";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useGeo } from "@/scenariostore/geo";
import { useStateHelpers } from "@/scenariostore/helpers";

function fixture() {
  const units = ref<Partial<NUnit>[]>([]);
  let source = { setData: vi.fn() };
  const map = {
    getSource: () => source,
    addSource: vi.fn(),
    getLayer: () => ({}),
  } as unknown as MlMap;
  const scenario = {
    geo: { everyVisibleUnit: units },
    store: { state: { rangeRingGroupMap: {} } },
    helpers: { getUnitById: (id: string) => units.value.find((u) => u.id === id) },
  } as unknown as TScenario;
  const replaceSource = () => {
    source = { setData: vi.fn() };
    return source;
  };
  return {
    ...useMaplibreRangeRings(map, scenario),
    units,
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
  it("skips setData when the rings have not changed", () => {
    const { drawRangeRings, source } = fixture();
    drawRangeRings();
    drawRangeRings();
    expect(source().setData).toHaveBeenCalledTimes(1);
  });

  it("pushes data again when a ring moves", () => {
    const { drawRangeRings, source, units } = fixture();
    units.value = [ringUnit([10, 60])];
    drawRangeRings();
    drawRangeRings();
    units.value = [ringUnit([11, 60])];
    drawRangeRings();
    expect(source().setData).toHaveBeenCalledTimes(2);
  });

  it("fills a replaced source even when the rings are unchanged", () => {
    const { drawRangeRings, replaceSource } = fixture();
    drawRangeRings();
    const next = replaceSource();
    drawRangeRings();
    expect(next.setData).toHaveBeenCalledTimes(1);
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
    const source = { setData: vi.fn() };
    const map = { getSource: () => source } as unknown as MlMap;
    const { drawRangeRings } = useMaplibreRangeRings(map, scenario);
    const ringCenterLongitude = () => {
      const { features } = source.setData.mock.lastCall![0];
      const ring = features[0].geometry.coordinates[0] as number[][];
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

    expect(source.setData).toHaveBeenCalledTimes(3);
    expect(second).toBeGreaterThan(first);
    expect(ringCenterLongitude()).toBeCloseTo(12, 1);
  });
});
