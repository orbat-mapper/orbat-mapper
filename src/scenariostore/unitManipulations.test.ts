import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { useScenarioTime } from "@/scenariostore/time";
import { clearUnitStyleCache, unitStyleCache } from "@/geo/unitStyles";

function createScenario() {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: {},
        subUnits: [],
        groups: [
          {
            id: "group-1",
            name: "Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                location: [10, 60],
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
    },
  } as any;
}

function createScenarioWithTwoSides() {
  return {
    id: "scenario-2",
    type: "ORBAT-mapper",
    version: "2.3.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: { fillColor: "#0055FF" },
        subUnits: [],
        groups: [
          {
            id: "group-1",
            name: "Blue Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                location: [10, 60],
                subUnits: [],
              },
            ],
          },
          {
            id: "group-2",
            name: "Blue Reserve",
            symbolOptions: {},
            subUnits: [],
          },
        ],
      },
      {
        id: "side-2",
        name: "Red",
        standardIdentity: "6",
        symbolOptions: { fillColor: "#CC2222" },
        subUnits: [],
        groups: [
          {
            id: "group-3",
            name: "Red Units",
            symbolOptions: {},
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
    },
  } as any;
}

function createScenarioWithTimedHierarchy() {
  return {
    id: "scenario-3",
    type: "ORBAT-mapper",
    version: "2.5.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: {},
        subUnits: [],
        groups: [
          {
            id: "group-1",
            name: "Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                subUnits: [],
              },
              {
                id: "unit-2",
                name: "2nd Unit",
                sidc: "10031000000000000000",
                subUnits: [],
                state: [
                  {
                    id: "move-1",
                    t: "2025-01-01T01:00:00Z",
                    hierarchy: { targetId: "unit-1", placement: "on" },
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
    },
  } as any;
}

function createScenarioForHierarchyRecording() {
  return {
    id: "scenario-4",
    type: "ORBAT-mapper",
    version: "2.5.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: {},
        subUnits: [
          {
            id: "unit-side-1",
            name: "Side Root",
            sidc: "10031000000000000000",
            subUnits: [],
          },
        ],
        groups: [
          {
            id: "group-1",
            name: "Units",
            symbolOptions: {},
            subUnits: [
              {
                id: "unit-1",
                name: "1st Unit",
                sidc: "10031000000000000000",
                subUnits: [],
              },
              {
                id: "unit-2",
                name: "2nd Unit",
                sidc: "10031000000000000000",
                subUnits: [],
              },
              {
                id: "unit-3",
                name: "3rd Unit",
                sidc: "10031000000000000000",
                subUnits: [],
              },
            ],
          },
          {
            id: "group-2",
            name: "Reserve",
            symbolOptions: {},
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
    },
  } as any;
}

describe("unitManipulations settings redraw signaling", () => {
  it("refreshes the effective symbol immediately when the base sidc changes", () => {
    const store = useNewScenarioStore({
      ...createScenario(),
      sides: [
        {
          ...createScenario().sides[0],
          groups: [
            {
              ...createScenario().sides[0].groups[0],
              subUnits: [
                {
                  id: "unit-1",
                  name: "1st Unit",
                  sidc: "10031000000000000000",
                  location: [10, 60],
                  subUnits: [],
                  state: [
                    {
                      id: "state-1",
                      t: "2025-01-01T01:00:00Z",
                      symbolRotation: 45,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(Date.parse("2025-01-01T02:00:00Z"));
    expect(store.state.unitMap["unit-1"]._state?.sidc).toBe("10031000000000000000");

    actions.updateUnit(
      "unit-1",
      { sidc: "10031000001100000000" },
      { doUpdateUnitState: true },
    );

    expect(store.state.unitMap["unit-1"].sidc).toBe("10031000001100000000");
    expect(store.state.unitMap["unit-1"]._state?.sidc).toBe("10031000001100000000");
    expect(store.state.unitMap["unit-1"]._state?.symbolRotation).toBe(45);
  });

  it("updateSideGroup increments settingsStateCounter and updates fields", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSideGroup("group-1", {
      name: "Forward Units",
      symbolOptions: { fillColor: "#33AA44" },
    });

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideGroupMap["group-1"].name).toBe("Forward Units");
    expect(store.state.sideGroupMap["group-1"].symbolOptions?.fillColor).toBe("#33AA44");
  });

  it("updateSide increments settingsStateCounter and updates fields", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSide("side-1", {
      name: "Blue Force",
      symbolOptions: { fillColor: "#0055FF" },
    });

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideMap["side-1"].name).toBe("Blue Force");
    expect(store.state.sideMap["side-1"].symbolOptions?.fillColor).toBe("#0055FF");
  });

  it("updateSide noUndo path increments settingsStateCounter", () => {
    const store = useNewScenarioStore(createScenario());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.updateSide(
      "side-1",
      {
        symbolOptions: { fillColor: "#AA22AA" },
      },
      { noUndo: true },
    );

    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.sideMap["side-1"].symbolOptions?.fillColor).toBe("#AA22AA");
  });

  it("changeUnitParent clears style cache keys and increments settingsStateCounter", () => {
    clearUnitStyleCache();
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const unit = store.state.unitMap["unit-1"];
    unit._ikey = "cached-style-key";
    unitStyleCache.set("cached-style-key", {} as any);
    unitStyleCache.set("unit-1", {} as any);
    const before = store.state.settingsStateCounter;

    actions.changeUnitParent("unit-1", "group-3", "on");

    expect(unitStyleCache.has("cached-style-key")).toBe(false);
    expect(unitStyleCache.has("unit-1")).toBe(false);
    expect(store.state.unitMap["unit-1"]._ikey).toBeUndefined();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
    expect(store.state.unitMap["unit-1"]._gid).toBe("group-3");
  });

  it("changeUnitParent settings redraw signal is undo/redo aware", () => {
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.changeUnitParent("unit-1", "group-3", "on");
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");

    store.undo();
    expect(store.state.settingsStateCounter).toBe(before);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-1");

    store.redo();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });

  it("changeSideGroupParent clears affected unit cache keys and increments settingsStateCounter", () => {
    clearUnitStyleCache();
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const unit = store.state.unitMap["unit-1"];
    unit._ikey = "cached-style-key";
    unitStyleCache.set("cached-style-key", {} as any);
    unitStyleCache.set("unit-1", {} as any);
    const before = store.state.settingsStateCounter;

    actions.changeSideGroupParent("group-1", "side-2", "on");

    expect(unitStyleCache.has("cached-style-key")).toBe(false);
    expect(unitStyleCache.has("unit-1")).toBe(false);
    expect(store.state.unitMap["unit-1"]._ikey).toBeUndefined();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });

  it("changeSideGroupParent settings redraw signal is undo/redo aware", () => {
    const store = useNewScenarioStore(createScenarioWithTwoSides());
    const actions = useUnitManipulations(store);
    const before = store.state.settingsStateCounter;

    actions.changeSideGroupParent("group-1", "side-2", "on");
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");

    store.undo();
    expect(store.state.settingsStateCounter).toBe(before);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-1");

    store.redo();
    expect(store.state.settingsStateCounter).toBe(before + 1);
    expect(store.state.unitMap["unit-1"]._sid).toBe("side-2");
  });

  it("deleting a unit removes timed hierarchy references that target it", () => {
    const store = useNewScenarioStore(createScenarioWithTimedHierarchy());
    const actions = useUnitManipulations(store);

    actions.deleteUnit("unit-1");

    expect(store.state.unitMap["unit-2"].state).toEqual([]);
  });

  it("deleting a side group removes timed hierarchy references that target it", () => {
    const store = useNewScenarioStore({
      ...createScenarioWithTimedHierarchy(),
      sides: [
        {
          id: "side-1",
          name: "Blue",
          standardIdentity: "3",
          symbolOptions: {},
          subUnits: [],
          groups: [
            {
              id: "group-1",
              name: "Units",
              symbolOptions: {},
              subUnits: [
                {
                  id: "unit-1",
                  name: "1st Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
              ],
            },
            {
              id: "group-2",
              name: "Reserve",
              symbolOptions: {},
              subUnits: [
                {
                  id: "unit-2",
                  name: "2nd Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    {
                      id: "move-1",
                      t: "2025-01-01T01:00:00Z",
                      hierarchy: { targetId: "group-1", placement: "on" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);

    actions.deleteSideGroup("group-1");

    expect(store.state.unitMap["unit-2"].state).toEqual([]);
  });
});

describe("unitManipulations timed hierarchy recording", () => {
  it("records a same-parent reorder above and updates projected hierarchy", () => {
    const t = Date.parse("2025-01-01T01:00:00Z");
    const store = useNewScenarioStore(createScenarioForHierarchyRecording());
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-3", "unit-1", "above");

    expect(store.state.unitMap["unit-3"].state).toEqual([
      expect.objectContaining({
        t,
        hierarchy: { targetId: "unit-1", placement: "above", parentId: "group-1" },
      }),
    ]);
    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual([
      "unit-3",
      "unit-1",
      "unit-2",
    ]);
    expect(store.state.sideGroupMap["group-1"]._baseSubUnits).toEqual([
      "unit-1",
      "unit-2",
      "unit-3",
    ]);
  });

  it("records a same-parent reorder below and updates projected hierarchy", () => {
    const t = Date.parse("2025-01-01T01:00:00Z");
    const store = useNewScenarioStore(createScenarioForHierarchyRecording());
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-1", "unit-2", "below");

    expect(store.state.sideGroupMap["group-1"].subUnits).toEqual([
      "unit-2",
      "unit-3",
      "unit-1",
    ]);
    expect(store.state.unitMap["unit-1"].state).toEqual([
      expect.objectContaining({
        hierarchy: { targetId: "unit-2", placement: "below", parentId: "group-1" },
      }),
    ]);
  });

  it("records a timed reparent onto another unit", () => {
    const t = Date.parse("2025-01-01T01:00:00Z");
    const store = useNewScenarioStore(createScenarioForHierarchyRecording());
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-2", "unit-1", "on");

    expect(store.state.unitMap["unit-2"].state).toEqual([
      expect.objectContaining({
        hierarchy: { targetId: "unit-1", placement: "on" },
      }),
    ]);
    expect(store.state.unitMap["unit-1"].subUnits).toEqual(["unit-2"]);
    expect(store.state.unitMap["unit-2"]._pid).toBe("unit-1");
  });

  it("records a timed reparent onto a side group or side", () => {
    const t1 = Date.parse("2025-01-01T01:00:00Z");
    const t2 = Date.parse("2025-01-01T02:00:00Z");
    const store = useNewScenarioStore(createScenarioForHierarchyRecording());
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t1);
    actions.recordUnitHierarchyMove("unit-2", "group-2", "on");
    expect(store.state.sideGroupMap["group-2"].subUnits).toEqual(["unit-2"]);
    expect(store.state.unitMap["unit-2"]._pid).toBe("group-2");

    time.setCurrentTime(t2);
    actions.recordUnitHierarchyMove("unit-2", "side-1", "on");
    expect(store.state.sideMap["side-1"].subUnits).toContain("unit-2");
    expect(store.state.unitMap["unit-2"]._pid).toBe("side-1");
  });

  it("rejects recording a move onto self", () => {
    const t = Date.parse("2025-01-01T01:00:00Z");
    const store = useNewScenarioStore(createScenarioForHierarchyRecording());
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-1", "unit-1", "on");

    expect(store.state.unitMap["unit-1"].state ?? []).toEqual([]);
  });

  it("rejects recording a move onto a descendant", () => {
    const t = Date.parse("2025-01-01T01:00:00Z");
    const store = useNewScenarioStore({
      ...createScenarioForHierarchyRecording(),
      sides: [
        {
          ...createScenarioForHierarchyRecording().sides[0],
          groups: [
            {
              id: "group-1",
              name: "Units",
              symbolOptions: {},
              subUnits: [
                {
                  id: "unit-parent",
                  name: "Parent",
                  sidc: "10031000000000000000",
                  subUnits: [
                    {
                      id: "unit-child",
                      name: "Child",
                      sidc: "10031000000000000000",
                      subUnits: [
                        {
                          id: "unit-grandchild",
                          name: "Grandchild",
                          sidc: "10031000000000000000",
                          subUnits: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            createScenarioForHierarchyRecording().sides[0].groups[1],
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-parent", "unit-child", "on");
    expect(store.state.unitMap["unit-parent"].state ?? []).toEqual([]);

    actions.recordUnitHierarchyMove("unit-parent", "unit-grandchild", "on");
    expect(store.state.unitMap["unit-parent"].state ?? []).toEqual([]);
  });

  it("allows recording a move onto a unit that was moved out of the subtree", () => {
    const t1 = Date.parse("2025-01-01T01:00:00Z");
    const t2 = Date.parse("2025-01-01T02:00:00Z");
    const store = useNewScenarioStore({
      ...createScenarioForHierarchyRecording(),
      sides: [
        {
          ...createScenarioForHierarchyRecording().sides[0],
          groups: [
            {
              id: "group-1",
              name: "Units",
              symbolOptions: {},
              subUnits: [
                {
                  id: "unit-parent",
                  name: "Parent",
                  sidc: "10031000000000000000",
                  subUnits: [
                    {
                      id: "unit-child",
                      name: "Child",
                      sidc: "10031000000000000000",
                      subUnits: [],
                      state: [
                        {
                          id: "move-child",
                          t: "2025-01-01T01:00:00Z",
                          hierarchy: { targetId: "group-2", placement: "on" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "group-2",
              name: "Reserve",
              symbolOptions: {},
              subUnits: [],
            },
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    // At t1, unit-child has already moved to group-2 via its timed entry
    time.setCurrentTime(t1);
    expect(store.state.unitMap["unit-child"]._pid).toBe("group-2");
    expect(store.state.unitMap["unit-parent"].subUnits).not.toContain("unit-child");

    // At t2, moving unit-parent onto unit-child should now be allowed
    time.setCurrentTime(t2);
    actions.recordUnitHierarchyMove("unit-parent", "unit-child", "on");
    expect(store.state.unitMap["unit-parent"].state).toHaveLength(1);
    expect(store.state.unitMap["unit-parent"].state?.[0]).toEqual(
      expect.objectContaining({
        t: t2,
        hierarchy: { targetId: "unit-child", placement: "on" },
      }),
    );
    expect(store.state.unitMap["unit-parent"]._pid).toBe("unit-child");
  });

  it("records parentId from projected hierarchy, not base hierarchy", () => {
    const t1 = Date.parse("2025-01-01T01:00:00Z");
    const t2 = Date.parse("2025-01-01T02:00:00Z");
    const store = useNewScenarioStore({
      ...createScenarioForHierarchyRecording(),
      sides: [
        {
          ...createScenarioForHierarchyRecording().sides[0],
          groups: [
            {
              id: "group-1",
              name: "Units",
              symbolOptions: {},
              subUnits: [
                {
                  id: "unit-1",
                  name: "1st",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                {
                  id: "unit-2",
                  name: "2nd",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    {
                      id: "move-2",
                      t: "2025-01-01T01:00:00Z",
                      hierarchy: { targetId: "group-2", placement: "on" },
                    },
                  ],
                },
              ],
            },
            {
              id: "group-2",
              name: "Reserve",
              symbolOptions: {},
              subUnits: [],
            },
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t2);
    // unit-2 is now in group-2 (projected), parentId should reflect that
    expect(store.state.unitMap["unit-2"]._pid).toBe("group-2");
    actions.recordUnitHierarchyMove("unit-1", "unit-2", "above");

    expect(store.state.unitMap["unit-1"].state?.[0]).toEqual(
      expect.objectContaining({
        hierarchy: { targetId: "unit-2", placement: "above", parentId: "group-2" },
      }),
    );
  });

  it("merges hierarchy recording into an existing state entry at the same timestamp", () => {
    const t = 1735693200000;
    const baseScenario = createScenarioForHierarchyRecording();
    const store = useNewScenarioStore({
      ...baseScenario,
      sides: [
        {
          ...baseScenario.sides[0],
          groups: [
            {
              ...baseScenario.sides[0].groups[0],
              subUnits: [
                {
                  id: "unit-1",
                  name: "1st Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
                {
                  id: "unit-2",
                  name: "2nd Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                  state: [
                    {
                      id: "state-1",
                      t,
                      status: "status-ready",
                    },
                  ],
                },
                {
                  id: "unit-3",
                  name: "3rd Unit",
                  sidc: "10031000000000000000",
                  subUnits: [],
                },
              ],
            },
            baseScenario.sides[0].groups[1],
          ],
        },
      ],
    } as any);
    const actions = useUnitManipulations(store);
    const time = useScenarioTime(store);

    time.setCurrentTime(t);
    actions.recordUnitHierarchyMove("unit-2", "unit-1", "above");

    expect(store.state.unitMap["unit-2"].state).toHaveLength(1);
    expect(store.state.unitMap["unit-2"].state?.[0]).toEqual(
      expect.objectContaining({
        id: "state-1",
        t,
        hierarchy: { targetId: "unit-1", placement: "above", parentId: "group-1" },
      }),
    );
  });
});
