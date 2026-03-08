import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { syncTimedHierarchyProjection } from "@/scenariostore/hierarchy";

describe("timed hierarchy projection", () => {
  it("reparents a unit on the event timestamp and updates subtree side/group ids", () => {
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
                  id: "unit-a",
                  name: "A",
                  sidc: "10031000000000000000",
                  subUnits: [
                    {
                      id: "unit-a1",
                      name: "A1",
                      sidc: "10031000000000000000",
                      subUnits: [],
                    },
                  ],
                  state: [
                    {
                      id: "move-1",
                      t: 100,
                      hierarchy: { targetId: "group-2", placement: "on" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "side-2",
          name: "Red",
          standardIdentity: "6",
          groups: [{ id: "group-2", name: "Red Group", subUnits: [] }],
        },
      ],
      events: [],
      layers: [{ id: "layer-1", name: "Features", features: [] }],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    const time = useScenarioTime(store);
    time.setCurrentTime(99);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a"]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual([]);

    time.setCurrentTime(100);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual([]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-a"]._gid).toBe("group-2");
    expect(store.state.unitMap["unit-a"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-a"]._state?.sidc).toBe("10061000000000000000");
    expect(store.state.unitMap["unit-a1"]._gid).toBe("group-2");
    expect(store.state.unitMap["unit-a1"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-a1"]._state?.sidc).toBe("10061000000000000000");

    time.setCurrentTime(125);
    expect(store.state.unitMap["unit-a"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-a"]._state?.sidc).toBe("10061000000000000000");
    expect(store.state.unitMap["unit-a1"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-a1"]._state?.sidc).toBe("10061000000000000000");

    time.setCurrentTime(99);
    expect(store.state.unitMap["unit-a"]._sid).toBe("side-1");
    expect(
      store.state.unitMap["unit-a"]._state?.sidc ?? store.state.unitMap["unit-a"].sidc,
    ).toBe("10031000000000000000");
    expect(store.state.unitMap["unit-a1"]._sid).toBe("side-1");
    expect(
      store.state.unitMap["unit-a1"]._state?.sidc ?? store.state.unitMap["unit-a1"].sidc,
    ).toBe("10031000000000000000");
  });

  it("applies above and below using current projected sibling order", () => {
    const store = useNewScenarioStore({
      id: "scenario-2",
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
                  id: "unit-a",
                  name: "A",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                {
                  id: "unit-b",
                  name: "B",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                {
                  id: "unit-c",
                  name: "C",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    {
                      id: "move-1",
                      t: 100,
                      hierarchy: { targetId: "unit-a", placement: "above" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      events: [],
      layers: [{ id: "layer-1", name: "Features", features: [] }],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    const time = useScenarioTime(store);
    time.setCurrentTime(100);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual([
      "unit-c",
      "unit-a",
      "unit-b",
    ]);
  });

  it("ignores invalid moves into a descendant branch", () => {
    const store = useNewScenarioStore({
      id: "scenario-3",
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
                  id: "unit-a",
                  name: "A",
                  sidc: "10031000000000000000",
                  state: [
                    {
                      id: "move-1",
                      t: 100,
                      hierarchy: { targetId: "unit-a1", placement: "on" },
                    },
                  ],
                  subUnits: [
                    {
                      id: "unit-a1",
                      name: "A1",
                      sidc: "10031000000000000000",
                      subUnits: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      events: [],
      layers: [{ id: "layer-1", name: "Features", features: [] }],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    const time = useScenarioTime(store);
    time.setCurrentTime(100);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-a"].subUnits).toEqual(["unit-a1"]);
    expect(store.state.unitMap["unit-a"]._pid).toBe("group-1");
  });

  it("skips hierarchy reprojection when the active hierarchy bucket is unchanged", () => {
    const store = useNewScenarioStore({
      id: "scenario-4",
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
                  id: "unit-a",
                  name: "A",
                  sidc: "10031000000000000000",
                  state: [
                    {
                      id: "move-1",
                      t: 100,
                      hierarchy: { targetId: "group-1", placement: "on" },
                    },
                  ],
                  subUnits: [],
                },
              ],
            },
          ],
        },
      ],
      events: [],
      layers: [{ id: "layer-1", name: "Features", features: [] }],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    expect(syncTimedHierarchyProjection(store.state, 50)).toBe(false);
    expect(syncTimedHierarchyProjection(store.state, 75)).toBe(false);
    expect(syncTimedHierarchyProjection(store.state, 100)).toBe(true);
    expect(syncTimedHierarchyProjection(store.state, 125)).toBe(false);
  });
});
