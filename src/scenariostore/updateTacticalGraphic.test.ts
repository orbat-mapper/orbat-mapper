import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { Scenario } from "@/types/scenarioModels";

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
          {
            id: "f-1",
            kind: "geometry",
            geometry: { type: "Point", coordinates: [10, 60] },
            geometryMeta: { geometryKind: "Point" },
            style: {},
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

describe("geo.updateTacticalGraphic", () => {
  it("writes the authoring fields a settled edit session produces", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateTacticalGraphic("cm-1", {
      controlPoints: [
        [1, 2],
        [3, 4],
      ],
      options: { width: 100 },
    });

    const item = store.state.layerItemMap["cm-1"] as any;
    expect(item.controlPoints).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(item.options).toEqual({ width: 100 });
  });

  it("is one undo step", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateTacticalGraphic("cm-1", {
      controlPoints: [[1, 2]],
      status: "planned",
    });
    store.undo();

    const item = store.state.layerItemMap["cm-1"] as any;
    expect(item.controlPoints).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(item.status).toBeUndefined();
  });

  it("only copies allowlisted fields, so the timed projection cannot be stomped", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateTacticalGraphic("cm-1", {
      controlPoints: [[1, 2]],
      // Not on `TacticalGraphicLayerItemUpdate`; a blind `Object.entries` copy would
      // take them and corrupt the item.
      state: [{ id: "s1", t: 0, patch: {} }],
      kind: "geometry",
      _pid: "nowhere",
    } as any);

    const item = store.state.layerItemMap["cm-1"] as any;
    expect(item.controlPoints).toEqual([[1, 2]]);
    expect(item.state).toBeUndefined();
    expect(item.kind).toBe("tacticalGraphic");
    expect(item._pid).toBe("layer-1");
  });

  it("is a no-op on a geometry item and on a missing id", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updateTacticalGraphic("f-1", { controlPoints: [[1, 2]] });
    geo.updateTacticalGraphic("nope", { controlPoints: [[1, 2]] });

    expect((store.state.layerItemMap["f-1"] as any).controlPoints).toBeUndefined();
    expect(store.state.layerItemMap["cm-1"]).toBeDefined();
  });
});

describe("geo.addTacticalGraphicStateControlPoints", () => {
  it("records shape into state[] and projects it onto _state", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const t = store.state.currentTime;

    geo.addTacticalGraphicStateControlPoints("cm-1", [[1, 2]]);

    const item = store.state.layerItemMap["cm-1"] as any;
    expect(item.state).toEqual([
      { id: expect.any(String), t, patch: { controlPoints: [[1, 2]] } },
    ]);
    // The top-level shape is untouched — the patch projects over it at time T.
    expect(item.controlPoints).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(item._state.controlPoints).toEqual([[1, 2]]);
  });

  it("sorts a new entry in and merges into an existing one at the same time", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);
    const t = store.state.currentTime;

    geo.addTacticalGraphicStateControlPoints("cm-1", [[3, 4]], t + 1000);
    geo.addTacticalGraphicStateControlPoints("cm-1", [[1, 2]], t);
    geo.addTacticalGraphicStateControlPoints("cm-1", [[5, 6]], t + 1000);

    const item = store.state.layerItemMap["cm-1"] as any;
    expect(item.state.map((entry: any) => [entry.t, entry.patch.controlPoints])).toEqual([
      [t, [[1, 2]]],
      [t + 1000, [[5, 6]]],
    ]);
  });

  it("is a no-op on a geometry item and on a missing id", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.addTacticalGraphicStateControlPoints("f-1", [[1, 2]]);
    geo.addTacticalGraphicStateControlPoints("nope", [[1, 2]]);

    expect((store.state.layerItemMap["f-1"] as any).state).toBeUndefined();
  });
});
