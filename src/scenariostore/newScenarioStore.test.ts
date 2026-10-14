import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "./newScenarioStore";

const START = Date.UTC(2026, 9, 1);
const HANDOFF = Date.UTC(2026, 9, 4);

function createScenario(snapshotTimes: string[] = []) {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.5.0",
    name: "Scenario",
    startTime: new Date(START).toISOString(),
    sides: [
      {
        id: "blue",
        name: "Blue",
        standardIdentity: "3",
        groups: [
          {
            id: "blue-group",
            name: "Blue Group",
            subUnits: [
              {
                id: "mover",
                name: "Mover",
                sidc: "10031000000000000000",
                subUnits: [],
                state: [
                  { id: "m1", t: START, location: [10, 60] },
                  { id: "m2", t: HANDOFF, location: [12, 60] },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "red",
        name: "Red",
        standardIdentity: "6",
        groups: snapshotTimes.map((snapshotTime, index) => ({
          id: `red-group-${index}`,
          name: "Red Group",
          snapshotTime,
          subUnits: [],
        })),
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
  } as any;
}

describe("opening time", () => {
  it("opens at the start time", () => {
    const store = useNewScenarioStore(createScenario());
    expect(store.state.currentTime).toBe(START);
    expect(store.state.unitMap["mover"]._state?.location).toEqual([10, 60]);
  });

  it("opens at the snapshot time of a recipient export", () => {
    const store = useNewScenarioStore(createScenario([new Date(HANDOFF).toISOString()]));
    expect(store.state.currentTime).toBe(HANDOFF);
    expect(store.state.unitMap["mover"]._state?.location).toEqual([12, 60]);
    expect(store.state.info.startTime).toBe(START);
  });

  it("opens at the latest snapshot time", () => {
    const store = useNewScenarioStore(
      createScenario([
        new Date(START + 1000).toISOString(),
        new Date(HANDOFF).toISOString(),
      ]),
    );
    expect(store.state.currentTime).toBe(HANDOFF);
  });
});
