import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { Scenario } from "@/types/scenarioModels";

const T1 = "2025-01-01T01:00:00.000Z";
const T2 = "2025-01-01T02:00:00.000Z";

function createScenario() {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [],
    events: [],
    layerStack: [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Control measures",
        items: [
          {
            id: "cm-1",
            kind: "tacticalGraphic",
            graphicKind: "boundary",
            controlPoints: [
              [10, 60],
              [11, 61],
            ],
          },
        ],
      },
    ],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
  } as unknown as Scenario;
}

describe("geo.updateLayerItem", () => {
  it("writes base fields on a tacticalGraphic, which updateFeature cannot", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    // The geometry-only door is a silent no-op here — that is why the base door exists.
    geo.updateFeature("cm-1", { isHidden: true });
    expect(store.state.layerItemMap["cm-1"]!.isHidden).toBeUndefined();

    geo.updateLayerItem("cm-1", { isHidden: true });
    expect(store.state.layerItemMap["cm-1"]!.isHidden).toBe(true);
    expect(store.state.layerItemMap["cm-1"]!._hidden).toBe(true);
  });

  it("recomputes _hidden from visibility bounds against the current time", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateLayerItem("cm-1", { visibleFromT: Date.parse(T2) });
    expect(store.state.layerItemMap["cm-1"]!._hidden).toBe(true);

    geo.updateLayerItem("cm-1", { visibleFromT: Date.parse(T1) });
    store.state.currentTime = Date.parse(T2);
    geo.updateLayerItem("cm-1", { name: "PL BLUE" });
    expect(store.state.layerItemMap["cm-1"]!.name).toBe("PL BLUE");
    expect(store.state.layerItemMap["cm-1"]!._hidden).toBe(false);
  });

  it("is undoable as one step", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateLayerItem("cm-1", { isHidden: true, locked: true });
    store.undo();

    expect(store.state.layerItemMap["cm-1"]!.isHidden).toBeUndefined();
    expect(store.state.layerItemMap["cm-1"]!.locked).toBeUndefined();
  });

  it("does not replace the draft when the item is missing", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateLayerItem("nope", { isHidden: true });

    expect(store.state.layerItemMap["cm-1"]).toBeDefined();
  });
});
