import { describe, expect, it, vi } from "vitest";
import {
  buildRecipientScenario,
  snapshotSourceAt,
  type SnapshotSource,
  type SnapshotUnit,
} from "./recipientScenario";
import type { Scenario } from "@/types/scenarioModels";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";

function createScenario(): Scenario {
  return {
    id: "master",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Op X",
    description: "Facilitator notes",
    startTime: 0,
    sides: [
      {
        id: "blue",
        name: "Blue 3",
        standardIdentity: "3",
        description: "Blue 3 plan",
        groups: [
          {
            id: "blue-units",
            name: "Okinawa Forces",
            description: "Own forces",
            subUnits: [
              {
                id: "b1",
                name: "B1",
                sidc: "10031000001211000000",
                description: "Own unit",
                state: [{ id: "s1", t: 100, location: [5, 5] }],
              },
            ],
          },
        ],
      },
      {
        id: "red",
        name: "Red",
        standardIdentity: "6",
        description: "Red commander's intent",
        subUnits: [{ id: "red-hq", name: "Red HQ", sidc: "10061000001002000000" }],
        groups: [
          {
            id: "red-detected",
            name: "Detected by Blue 3",
            description: "Adjudication notes",
            symbolOptions: { fillColor: "#ff0000" },
            subUnits: [
              {
                id: "r7",
                name: "R7",
                shortName: "7BN",
                sidc: "10061000001211000000",
                description: "BDA: 2 of 4 launchers lost",
                equipment: [{ name: "Launcher", count: 4 }],
                rangeRings: [{ name: "Weapons", range: 70, uom: "km" }],
                state: [
                  { id: "r7-a", t: 100, location: [1, 1], status: "Damaged" },
                  { id: "r7-b", t: 300, location: [2, 2], status: "Destroyed" },
                  { id: "r7-c", t: 400, status: null },
                ],
                subUnits: [{ id: "r7-1", name: "R7 1st Coy", sidc: "x" }],
              },
            ],
          },
          { id: "red-other", name: "Undetected", subUnits: [] },
        ],
      },
    ],
    events: [{ id: "e1", startTime: 200, title: "Red attacks at dawn" }],
    layerStack: [],
    settings: {
      statuses: [
        { name: "Damaged", color: "#ffa500" },
        { name: "Destroyed", color: "#ff0000" },
      ],
    },
  } as unknown as Scenario;
}

// Units under a group at the current time, as the store has drawn them.
const snapshotUnits: Record<string, SnapshotUnit[]> = {
  "red-detected": [
    {
      id: "r7",
      name: "R7",
      shortName: "7BN",
      sidc: "10061000001211000000",
      location: [1.5, 1.5],
    },
    { id: "r7-1", name: "R7 1st Coy", sidc: "x", location: [1.6, 1.6] },
    { id: "r8", name: "R8 (moved in)", sidc: "y", location: [3, 3] },
    { id: "r9", name: "R9 (off the map)", sidc: "z", location: null },
  ],
};

const source: SnapshotSource = { timestamp: 200, unitsByGroup: snapshotUnits };

const settings = {
  sideGroups: ["blue-units", "red-detected"],
  snapshotGroupIds: ["red-detected"],
  layerIds: [],
};

describe("buildRecipientScenario snapshot groups", () => {
  it("exports a snapshot group as its units at the current time, flattened", () => {
    const red = buildRecipientScenario(createScenario(), settings, source).sides[1];

    expect(red.groups).toEqual([
      {
        id: "red-detected",
        name: "Detected by Blue 3",
        symbolOptions: { fillColor: "#ff0000" },
        snapshotTime: new Date(200).toISOString(),
        subUnits: [
          {
            id: "r7",
            name: "R7",
            shortName: "7BN",
            sidc: "10061000001211000000",
            state: [{ id: expect.any(String), t: 200, location: [1.5, 1.5] }],
          },
          {
            id: "r7-1",
            name: "R7 1st Coy",
            sidc: "x",
            state: [{ id: expect.any(String), t: 200, location: [1.6, 1.6] }],
          },
          {
            id: "r8",
            name: "R8 (moved in)",
            sidc: "y",
            state: [{ id: expect.any(String), t: 200, location: [3, 3] }],
          },
        ],
      },
    ]);
  });

  it("writes each snapshot unit's status with the status definitions", () => {
    const damaged: SnapshotSource = {
      ...source,
      unitsByGroup: {
        "red-detected": [
          { id: "r7", name: "R7", sidc: "x", status: "Damaged", location: [1, 1] },
        ],
      },
    };
    const build = (includeSnapshotStatus?: boolean) =>
      buildRecipientScenario(
        createScenario(),
        { ...settings, includeSnapshotStatus },
        damaged,
      );

    expect(build().sides[1].groups[0].subUnits[0].state?.[0].status).toBe("Damaged");
    expect(build().settings?.statuses).toContainEqual({
      name: "Damaged",
      color: "#ffa500",
    });
    expect(build(false).sides[1].groups[0].subUnits[0].state?.[0]).not.toHaveProperty(
      "status",
    );
  });

  it("writes each snapshot position as one state entry at the snapshot time", () => {
    const damaged: SnapshotSource = {
      ...source,
      unitsByGroup: {
        "red-detected": [
          { id: "r7", name: "R7", sidc: "x", status: "Damaged", location: [1, 1] },
        ],
      },
    };
    const unit = (extra: object = {}) =>
      buildRecipientScenario(createScenario(), { ...settings, ...extra }, damaged)
        .sides[1].groups[0].subUnits[0];

    expect(unit()).toEqual({
      id: "r7",
      name: "R7",
      sidc: "x",
      state: [{ id: expect.any(String), t: 200, location: [1, 1], status: "Damaged" }],
    });
    expect(unit({ includeSnapshotStatus: false })).toEqual({
      id: "r7",
      name: "R7",
      sidc: "x",
      state: [{ id: expect.any(String), t: 200, location: [1, 1] }],
    });
    expect(unit({ timedSnapshotPositions: false })).toEqual({
      id: "r7",
      name: "R7",
      sidc: "x",
      status: "Damaged",
      location: [1, 1],
    });
  });

  it("shows snapshot units to the recipient only from the snapshot time", () => {
    const recipient = useNewScenarioStore(
      buildRecipientScenario(createScenario(), settings, source),
    );
    const time = useScenarioTime(recipient);
    expect(recipient.state.currentTime).toBe(200);
    expect(recipient.state.unitMap["r8"]._state?.location).toEqual([3, 3]);
    const r8At = (timestamp: number) => {
      time.setCurrentTime(timestamp);
      return recipient.state.unitMap["r8"]._state?.location;
    };

    expect(r8At(199)).toBeFalsy();
    expect(r8At(200)).toEqual([3, 3]);
    expect(r8At(1000)).toEqual([3, 3]);
  });

  it("drops side data when every selected group of the side is a snapshot", () => {
    const [blue, red] = buildRecipientScenario(createScenario(), settings, source).sides;

    expect(red).toEqual({
      id: "red",
      name: "Red",
      standardIdentity: "6",
      groups: [expect.objectContaining({ id: "red-detected" })],
    });
    expect(blue.description).toBe("Blue 3 plan");
    expect(blue.groups[0].subUnits[0].state).toHaveLength(1);
  });

  it("keeps a group in full when it is not a snapshot", () => {
    const red = buildRecipientScenario(
      createScenario(),
      { ...settings, snapshotGroupIds: [] },
      source,
    ).sides[1];

    expect(red.description).toBe("Red commander's intent");
    expect(red.groups[0].subUnits[0].description).toBe("BDA: 2 of 4 launchers lost");
  });

  it("leaves out scenario events unless they are included", () => {
    const build = (includeEvents?: boolean) =>
      buildRecipientScenario(createScenario(), { ...settings, includeEvents }, source)
        .events;

    expect(build(false)).toEqual([]);
    expect(build(true)).toHaveLength(1);
    expect(build(undefined)).toHaveLength(1);
  });

  it("leaves out events after the snapshot time when asked", () => {
    const scenario = createScenario();
    scenario.events.push({ id: "e0", startTime: 50, title: "Red mobilises" });
    const build = (timestamp: number, excludeFutureEvents?: boolean) =>
      buildRecipientScenario(
        scenario,
        { ...settings, includeEvents: true, excludeFutureEvents },
        { ...source, timestamp },
      ).events.map((event) => event.id);

    expect(build(199, true)).toEqual(["e0"]);
    expect(build(200, true)).toEqual(["e1", "e0"]);
    expect(build(100, false)).toEqual(["e1", "e0"]);
  });
});

function scenarioAt(timestamp: number) {
  const store = useNewScenarioStore(createScenario());
  const time = useScenarioTime(store);
  time.setCurrentTime(timestamp);
  return { store, time, unitActions: useUnitManipulations(store) };
}

describe("snapshotSourceAt", () => {
  it("reads each unit as drawn at the current time, subordinates included", () => {
    const source = snapshotSourceAt(scenarioAt(200), settings);

    expect(source.timestamp).toBe(200);
    expect(source.unitsByGroup).toEqual({
      "red-detected": [
        {
          id: "r7",
          name: "R7",
          shortName: "7BN",
          sidc: "10061000001211000000",
          status: "Damaged",
          location: [expect.closeTo(1.5, 1), expect.closeTo(1.5, 1)],
        },
        { id: "r7-1", name: "R7 1st Coy", sidc: "x", location: null },
      ],
    });
  });

  it("leaves out units hidden on the map by themselves, their group or their side", () => {
    const hide = (apply: (scenario: ReturnType<typeof scenarioAt>) => void) => {
      const scenario = scenarioAt(200);
      apply(scenario);
      return snapshotSourceAt(scenario, settings).unitsByGroup["red-detected"];
    };

    expect(hide(({ store }) => (store.state.unitMap["r7"].isHidden = true))).toEqual([
      expect.objectContaining({ id: "r7-1" }),
    ]);
    expect(
      hide(({ store }) => (store.state.sideGroupMap["red-detected"].isHidden = true)),
    ).toEqual([]);
    expect(hide(({ store }) => (store.state.sideMap["red"].isHidden = true))).toEqual([]);
  });

  it("reads the units at another time and restores the current time", () => {
    const scenario = scenarioAt(200);
    const { state } = scenario.store;

    const source = snapshotSourceAt(scenario, { ...settings, snapshotTime: 300 });

    expect(source.timestamp).toBe(300);
    expect(source.unitsByGroup["red-detected"][0].location).toEqual([2, 2]);
    expect(state.currentTime).toBe(200);
    expect(state.unitMap["r7"]._state?.location).not.toEqual([2, 2]);
  });

  it("reads each unit's status at the snapshot time", () => {
    const statusAt = (snapshotTime: number) =>
      snapshotSourceAt(scenarioAt(200), { ...settings, snapshotTime }).unitsByGroup[
        "red-detected"
      ][0].status;

    expect(statusAt(200)).toBe("Damaged");
    expect(statusAt(300)).toBe("Destroyed");
  });

  it("keeps a status cleared to None and falls back to the base status otherwise", () => {
    const statusAt = (snapshotTime: number) => {
      const scenario = scenarioAt(200);
      const { unitMap, unitStatusMap } = scenario.store.state;
      const damaged = Object.values(unitStatusMap).find((s) => s.name === "Damaged")!;
      unitMap["r7"].status = damaged.id;
      unitMap["r7-1"].status = damaged.id;
      unitMap["r7-1"].location = [4, 4];
      const units = snapshotSourceAt(scenario, { ...settings, snapshotTime })
        .unitsByGroup["red-detected"];
      return units.map((unit) => unit.status);
    };

    expect(statusAt(400)).toEqual([undefined, "Damaged"]);
  });

  it("leaves the time alone when no selected group is a snapshot", () => {
    const scenario = scenarioAt(200);
    const setCurrentTime = vi.spyOn(scenario.time, "setCurrentTime");

    const source = snapshotSourceAt(scenario, {
      sideGroups: ["blue-units"],
      snapshotGroupIds: ["red-detected"],
      snapshotTime: 300,
    });

    expect(source).toEqual({ timestamp: 300, unitsByGroup: {} });
    expect(setCurrentTime).not.toHaveBeenCalled();
  });
});
