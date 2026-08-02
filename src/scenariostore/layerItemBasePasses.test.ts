import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import {
  isSupportedGraphicKind,
  isSupportedTacticalGraphic,
} from "@/scenariostore/tacticalGraphics";
import type { Scenario } from "@/types/scenarioModels";
import type {
  NScenarioLayerItem,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";

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
        name: "Features",
        items: [
          {
            id: "annotation-1",
            kind: "annotation",
            annotationType: "label",
            anchor: { type: "point", position: [10, 60] },
            content: { text: "before" },
            visibleFromT: T1,
            state: [{ t: T2, patch: { content: { text: "after" } } }],
          },
          {
            id: "measurement-1",
            kind: "measurement",
            measurementType: "distance",
            source: {
              type: "geometry",
              geometry: {
                type: "LineString",
                coordinates: [
                  [10, 60],
                  [11, 61],
                ],
              },
            },
            state: [{ id: "m-state-1", t: T2, patch: { precision: 3 } }],
          },
          {
            id: "tacticalGraphic-1",
            kind: "tacticalGraphic",
            graphicKind: "boundary",
            controlPoints: [
              [10, 60],
              [11, 61],
            ],
            state: [
              {
                t: T2,
                patch: {
                  controlPoints: [
                    [12, 62],
                    [13, 63],
                  ],
                },
              },
            ],
          },
          {
            id: "tacticalGraphic-unknown",
            kind: "tacticalGraphic",
            graphicKind: "from-the-future",
            controlPoints: [[10, 60]],
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

function item(store: ReturnType<typeof useNewScenarioStore>, id: string) {
  return store.state.layerItemMap[id] as NScenarioLayerItem & {
    state?: { id: string; t: number }[];
  };
}

function projectedState(store: ReturnType<typeof useNewScenarioStore>, id: string) {
  return (item(store, id)._state ?? {}) as Record<string, unknown>;
}

describe("kind-agnostic layer item load pass", () => {
  it("coerces state timestamps and backfills state ids for non-geometry kinds", () => {
    const store = useNewScenarioStore(createScenario());

    for (const id of ["annotation-1", "measurement-1", "tacticalGraphic-1"]) {
      const entry = item(store, id).state![0];
      expect(entry.t).toBe(Date.parse(T2));
      expect(typeof entry.id).toBe("string");
      expect(entry.id.length).toBeGreaterThan(0);
    }
  });

  it("coerces visibility bounds for non-geometry kinds, leaving absent ones absent", () => {
    const store = useNewScenarioStore(createScenario());

    const annotation = item(store, "annotation-1");
    expect(annotation.visibleFromT).toBe(Date.parse(T1));
    // Absent must stay absent — coercing undefined would produce NaN, which
    // compares false against every bound and makes the item permanently visible.
    expect(annotation.visibleUntilT).toBeUndefined();
  });

  it("keeps an unsupported graphicKind verbatim", () => {
    const store = useNewScenarioStore(createScenario());

    const unknown = item(store, "tacticalGraphic-unknown") as TacticalGraphicLayerItem;
    expect(unknown.graphicKind).toBe("from-the-future");
    expect(unknown.controlPoints).toEqual([[10, 60]]);
    expect(isSupportedTacticalGraphic(unknown)).toBe(false);
    expect(isSupportedTacticalGraphic(item(store, "tacticalGraphic-1"))).toBe(true);
    expect(isSupportedGraphicKind("boundary")).toBe(true);
    expect(isSupportedGraphicKind("from-the-future")).toBe(false);
  });
});

describe("kind-agnostic time projection", () => {
  it("projects timed state for annotation, measurement and tacticalGraphic", () => {
    const store = useNewScenarioStore(createScenario());
    const time = useScenarioTime(store);

    time.setCurrentTime(Date.parse(T2));

    expect(projectedState(store, "annotation-1").content).toEqual({ text: "after" });
    expect(projectedState(store, "measurement-1").precision).toBe(3);
    expect(projectedState(store, "tacticalGraphic-1").controlPoints).toEqual([
      [12, 62],
      [13, 63],
    ]);
  });

  it("does not apply state entries later than the current time", () => {
    const store = useNewScenarioStore(createScenario());
    const time = useScenarioTime(store);

    time.setCurrentTime(Date.parse(T1));

    expect(projectedState(store, "annotation-1").content).toBeUndefined();
  });

  it("computes _hidden from the visibility bounds for non-geometry kinds", () => {
    const store = useNewScenarioStore(createScenario());
    const time = useScenarioTime(store);

    time.setCurrentTime(Date.parse(T1));
    // visibleFromT is an exclusive lower bound, matching the geometry behaviour.
    expect(item(store, "annotation-1")._hidden).toBe(true);
    expect(item(store, "measurement-1")._hidden).toBe(false);

    time.setCurrentTime(Date.parse(T2));
    expect(item(store, "annotation-1")._hidden).toBe(false);
  });

  it("includes non-geometry state entries in the time histogram", () => {
    const store = useNewScenarioStore(createScenario());
    const time = useScenarioTime(store);

    const { histogram } = time.computeTimeHistogram();
    const total = histogram.reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(3);
  });
});
