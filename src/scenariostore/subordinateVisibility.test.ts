import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import {
  partitionBranchVisibility,
  type SubordinateCutoff,
} from "@/scenariostore/subordinateVisibility";

const unitSidc = (echelon: string) => `10031000${echelon}1211000000`;
const EQUIPMENT_SIDC = "10031500001101000000";

// army > corps > { division > { brigade > battalion, equipment > company },
//                  attachedBattalion }
function createScenario({ hidden = [] as string[] } = {}) {
  const u = (id: string, sidc: string, subUnits: object[] = []) => ({
    id,
    name: id,
    sidc,
    subUnits,
    ...(hidden.includes(id) && { isHidden: true }),
  });
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.7.0",
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
              u("army", unitSidc("23"), [
                u("corps", unitSidc("22"), [
                  u("division", unitSidc("21"), [
                    u("brigade", unitSidc("18"), [u("battalion", unitSidc("16"))]),
                    u("equipment", EQUIPMENT_SIDC, [u("company", unitSidc("15"))]),
                  ]),
                  u("attachedBattalion", unitSidc("16")),
                ]),
              ]),
              u("other", unitSidc("16")),
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
  } as any;
}

function partition(rootIds: string[], cutoff: SubordinateCutoff) {
  const store = useNewScenarioStore(createScenario());
  const { show, hide } = partitionBranchVisibility(store.state.unitMap, rootIds, cutoff);
  return { show: [...show].sort(), hide: [...hide].sort() };
}

describe("partitionBranchVisibility", () => {
  it("keeps the given number of levels below the unit", () => {
    expect(partition(["corps"], { maxDepth: 1 })).toEqual({
      show: ["attachedBattalion", "corps", "division"],
      hide: ["battalion", "brigade", "company", "equipment"],
    });
  });

  it("keeps echelons down to the cutoff and hides everything under a cut unit", () => {
    expect(partition(["army"], { minEchelon: "21" })).toEqual({
      show: ["army", "corps", "division", "equipment"],
      hide: ["attachedBattalion", "battalion", "brigade", "company"],
    });
  });

  it("hides a unit that fails either test when both are set", () => {
    expect(partition(["army"], { maxDepth: 2, minEchelon: "18" })).toEqual({
      show: ["army", "corps", "division"],
      hide: ["attachedBattalion", "battalion", "brigade", "company", "equipment"],
    });
  });

  it("never cuts the root itself, whatever its echelon", () => {
    expect(partition(["battalion"], { minEchelon: "21" })).toEqual({
      show: ["battalion"],
      hide: [],
    });
  });

  it("covers several roots, and hiding wins when roots are nested", () => {
    expect(partition(["division", "corps"], { maxDepth: 1 })).toEqual({
      // brigade is kept under division but cut under corps
      show: ["attachedBattalion", "corps", "division"],
      hide: ["battalion", "brigade", "company", "equipment"],
    });
    expect(partition(["brigade", "attachedBattalion"], { maxDepth: 0 })).toEqual({
      show: ["attachedBattalion", "brigade"],
      hide: ["battalion"],
    });
  });
});

describe("setBranchVisibility", () => {
  it("shows kept units and hides the rest in one undo step", () => {
    const store = useNewScenarioStore(createScenario({ hidden: ["division"] }));
    const actions = useUnitManipulations(store);
    const hiddenIds = () =>
      Object.values(store.state.unitMap)
        .filter((u) => u.isHidden)
        .map((u) => u.id)
        .sort();
    const before = store.state.unitStateCounter;

    actions.setBranchVisibility(["corps"], { maxDepth: 1 });
    expect(hiddenIds()).toEqual(["battalion", "brigade", "company", "equipment"]);
    expect(store.state.unitStateCounter).toBe(before + 1);

    store.undo();
    expect(hiddenIds()).toEqual(["division"]);
  });

  it("leaves units outside the branches alone", () => {
    const store = useNewScenarioStore(createScenario({ hidden: ["other"] }));
    const actions = useUnitManipulations(store);

    actions.setBranchVisibility(["corps"], {});
    expect(store.state.unitMap["other"].isHidden).toBe(true);
    expect(store.canUndo.value).toBe(false);
  });
});
