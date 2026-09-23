import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import { useMaplibreRangeRings } from "./maplibreRangeRings";

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
