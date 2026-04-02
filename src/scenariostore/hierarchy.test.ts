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

  it("uses stored parentId for above/below when target was reparented by earlier move", () => {
    const store = useNewScenarioStore({
      id: "scenario-5",
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
                  state: [
                    {
                      id: "move-a",
                      t: 100,
                      hierarchy: { targetId: "group-2", placement: "on" },
                    },
                  ],
                },
                {
                  id: "unit-b",
                  name: "B",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    {
                      id: "move-b",
                      t: 200,
                      hierarchy: {
                        targetId: "unit-a",
                        placement: "below",
                        parentId: "group-1",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "group-2",
              name: "Blue Group 2",
              subUnits: [],
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

    // Before any moves
    time.setCurrentTime(50);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a", "unit-b"]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual([]);

    // After unit-a moves to group-2, but before unit-b's move
    time.setCurrentTime(150);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-b"]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-a"]);

    // After both moves: unit-b should end up in group-1 (stored parentId),
    // not group-2 (where unit-a currently is)
    time.setCurrentTime(200);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-b"]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-b"]._pid).toBe("group-1");
  });

  it("falls back to parentId when targetId is missing", () => {
    const store = useNewScenarioStore({
      id: "scenario-6",
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
                  state: [
                    {
                      id: "move-a",
                      t: 100,
                      hierarchy: {
                        targetId: "deleted-unit",
                        placement: "below",
                        parentId: "group-2",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "group-2",
              name: "Blue Group 2",
              subUnits: [],
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
    // Target doesn't exist, but parentId is valid — unit-a should end up in group-2
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-a"]._pid).toBe("group-2");
  });

  it("appends to stored parent when target is no longer in that parent", () => {
    const store = useNewScenarioStore({
      id: "scenario-7",
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
                  state: [
                    {
                      id: "move-a",
                      t: 100,
                      hierarchy: { targetId: "group-2", placement: "on" },
                    },
                  ],
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
                      id: "move-c",
                      t: 200,
                      hierarchy: {
                        targetId: "unit-a",
                        placement: "below",
                        parentId: "group-1",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "group-2",
              name: "Blue Group 2",
              subUnits: [],
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

    // At t=200: unit-a moved to group-2 at t=100, so it's no longer in group-1.
    // unit-c's move targets unit-a "below" with parentId=group-1.
    // unit-a isn't in group-1 anymore, so unit-c should append to group-1.
    time.setCurrentTime(200);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-b", "unit-c"]);
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-c"]._pid).toBe("group-1");
  });

  it("drops move when target is missing and no parentId is stored", () => {
    const store = useNewScenarioStore({
      id: "scenario-8",
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
                  state: [
                    {
                      id: "move-a",
                      t: 100,
                      hierarchy: {
                        targetId: "deleted-unit",
                        placement: "below",
                      },
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
    // No fallback available — unit-a stays in its original parent
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-a"]._pid).toBe("group-1");
  });

  it("drops move when target is missing and parentId is also missing", () => {
    const store = useNewScenarioStore({
      id: "scenario-9",
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
                  state: [
                    {
                      id: "move-a",
                      t: 100,
                      hierarchy: {
                        targetId: "deleted-unit",
                        placement: "below",
                        parentId: "deleted-group",
                      },
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
    // Both target and parent are gone — unit-a stays put
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a"]);
    expect(store.state.unitMap["unit-a"]._pid).toBe("group-1");
  });

  it("drops move when target exists but stored parentId points to deleted entity", () => {
    const store = useNewScenarioStore({
      id: "scenario-10",
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
                  state: [
                    {
                      id: "move-b",
                      t: 100,
                      hierarchy: {
                        targetId: "unit-a",
                        placement: "below",
                        parentId: "deleted-group",
                      },
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
    // Target exists but stored parent is gone — move is dropped, unit-b stays
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual(["unit-a", "unit-b"]);
    expect(store.state.unitMap["unit-b"]._pid).toBe("group-1");
  });
});
