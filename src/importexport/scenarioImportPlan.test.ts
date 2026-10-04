import { describe, it, expect } from "vitest";
import { klona } from "klona";
import { planScenarioImport, type ImportOptions } from "./scenarioImportPlan";
import { loadControlMeasureScenarioFixture } from "@/testdata/controlMeasureScenario";
import type { Scenario, Unit } from "@/types/scenarioModels";

const unit = (id: string, fields: Partial<Unit> = {}): Unit => ({
  id,
  name: id,
  sidc: "10031000001211000000",
  ...fields,
});
function scenario(): Scenario {
  return {
    ...loadControlMeasureScenarioFixture(),
    sides: [
      {
        id: "blue",
        name: "Blue",
        standardIdentity: "3",
        groups: [
          {
            id: "own",
            name: "Own forces",
            subUnits: [
              unit("reserve"),
              unit("omitted"),
              unit("parent", { subUnits: [unit("child")] }),
            ],
          },
          { id: "contacts", name: "White-cell contacts", subUnits: [unit("contact")] },
        ],
      },
      {
        id: "red",
        name: "Red",
        standardIdentity: "6",
        groups: [{ id: "enemy", name: "Enemy", subUnits: [unit("enemy-unit")] }],
      },
    ],
  };
}
const opts: ImportOptions = {
  scopeId: "own",
  action: "update",
  content: "units-and-state",
  states: "replace",
  selectedIds: ["reserve"],
};
function contribution(units = [unit("reserve", { location: [10, 20] })]) {
  const s = scenario();
  s.sides[0].groups[0].subUnits = units;
  return s;
}
function own(s: Scenario) {
  return s.sides[0].groups[0].subUnits;
}
describe("scenario contribution import plan", () => {
  it("previews without mutating either scenario, so cancellation is inert", () => {
    const master = scenario(),
      incoming = contribution();
    const a = klona(master),
      b = klona(incoming);
    const plan = planScenarioImport(master, incoming, opts);
    expect(plan.errors).toEqual([]);
    expect(master).toEqual(a);
    expect(incoming).toEqual(b);
    expect(plan.changes.find((c) => c.id === "reserve")?.effect).toBe("changed");
  });
  it("deploys reserve by ID and preserves omitted units and excluded forces", () => {
    const master = scenario();
    const plan = planScenarioImport(master, contribution(), opts);
    expect(own(plan.scenario).map((u) => u.id)).toEqual(["reserve", "omitted", "parent"]);
    expect(own(plan.scenario)[0].location).toEqual([10, 20]);
    expect(
      plan.changes.filter((c) => c.effect === "preserved" && c.kind === "unit"),
    ).toHaveLength(3);
    expect(plan.scenario.sides[1]).toEqual(master.sides[1]);
    expect(plan.scenario.sides[0].groups[1]).toEqual(master.sides[0].groups[1]);
  });
  it("previews additions and clears omitted authored fields of included units", () => {
    const master = scenario();
    own(master)[0].description = "old";
    const plan = planScenarioImport(
      master,
      contribution([unit("reserve"), unit("new")]),
      { ...opts, selectedIds: ["reserve", "new"] },
    );
    expect(plan.errors).toEqual([]);
    expect(own(plan.scenario)[0].description).toBeUndefined();
    expect(plan.changes.find((c) => c.id === "new")?.effect).toBe("added");
  });
  it("moves included units and retains omitted descendants", () => {
    const plan = planScenarioImport(
      scenario(),
      contribution([unit("parent", { subUnits: [unit("reserve")] })]),
      { ...opts, selectedIds: ["parent", "reserve"] },
    );
    expect(plan.errors).toEqual([]);
    const parent = own(plan.scenario).find((u) => u.id === "parent")!;
    expect(parent.subUnits?.map((u) => u.id)).toContain("reserve");
    expect(parent.subUnits?.map((u) => u.id)).toContain("child");
    expect(plan.changes.find((c) => c.id === "reserve")?.after).toMatchObject({
      parent: "parent",
    });
  });
  it("explicit replacement previews every removed unit", () => {
    const plan = planScenarioImport(scenario(), contribution(), {
      ...opts,
      action: "replace",
    });
    expect(plan.errors).toEqual([]);
    expect(
      plan.changes
        .filter((c) => c.effect === "removed")
        .map((c) => c.id)
        .sort(),
    ).toEqual(["child", "omitted", "parent"]);
    expect(own(plan.scenario)).toHaveLength(1);
  });
  it("side replacement also previews removed groups", () => {
    const incoming = contribution();
    incoming.sides[0].groups = [incoming.sides[0].groups[0]];
    const plan = planScenarioImport(scenario(), incoming, {
      ...opts,
      scopeId: "blue",
      action: "replace",
    });
    expect(plan.changes.find((c) => c.id === "contacts")?.effect).toBe("removed");
    expect(plan.changes.find((c) => c.id === "contact")?.effect).toBe("removed");
  });
  it("blocks existing IDs outside scope even when names match", () => {
    const incoming = contribution([unit("enemy-unit")]);
    // Remove its original occurrence to isolate the scope collision.
    incoming.sides[1].groups[0].subUnits = [];
    const plan = planScenarioImport(scenario(), incoming, {
      ...opts,
      selectedIds: ["enemy-unit"],
    });
    expect(plan.errors.join(" ")).toContain("outside");
  });
  it("flags missing parents and unresolved / outside timed references", () => {
    const incoming = contribution([unit("new-parent", { subUnits: [unit("reserve")] })]);
    expect(planScenarioImport(scenario(), incoming, opts).errors.join(" ")).toContain(
      "unresolved parent",
    );
    for (const targetId of ["enemy-unit", "missing"]) {
      const p = planScenarioImport(
        scenario(),
        contribution([
          unit("reserve", {
            state: [{ id: "s", t: 10, hierarchy: { targetId, placement: "on" } }],
          }),
        ]),
        opts,
      );
      expect(p.errors.join(" ")).toContain("hierarchy reference");
    }
  });
  it("reports unchanged repeated submissions without duplication", () => {
    const first = planScenarioImport(scenario(), contribution(), opts);
    const second = planScenarioImport(first.scenario, contribution(), opts);
    expect(second.hasChanges).toBe(false);
    expect(second.changes.find((c) => c.id === "reserve")?.effect).toBe("unchanged");
  });
  it("preserves scope position during replacement and previews incoming sibling order", () => {
    const master = scenario();
    const incoming = contribution([unit("parent"), unit("reserve")]);
    const group = planScenarioImport(master, incoming, { ...opts, action: "replace" });
    expect(group.scenario.sides[0].groups.map((g) => g.id)).toEqual(["own", "contacts"]);
    expect(own(group.scenario).map((u) => u.id)).toEqual(["parent", "reserve"]);
    const side = planScenarioImport(master, incoming, {
      ...opts,
      scopeId: "blue",
      action: "replace",
    });
    expect(side.scenario.sides.map((s) => s.id)).toEqual(["blue", "red"]);
  });
  it("state-only respects unit selection even with the replacement action", () => {
    const incoming = contribution([
      unit("reserve", { state: [{ id: "s", t: 1000 }] }),
      unit("omitted", { name: "Changed", state: [{ id: "x", t: 2000 }] }),
    ]);
    const p = planScenarioImport(scenario(), incoming, {
      ...opts,
      action: "replace",
      content: "state-only",
    });
    expect(p.changes.find((c) => c.id === "omitted")?.effect).toBe("preserved");
    expect(own(p.scenario)[1].state).toBeUndefined();
  });
  it("state-only skips additions, preserves fields and structural hierarchy", () => {
    const incoming = contribution([
      unit("parent", {
        subUnits: [
          unit("reserve", {
            name: "renamed",
            state: [{ id: "s", t: 10, location: [1, 2] }],
          }),
        ],
      }),
      unit("new"),
    ]);
    const plan = planScenarioImport(scenario(), incoming, {
      ...opts,
      content: "state-only",
      selectedIds: ["reserve", "new"],
    });
    expect(plan.errors).toEqual([]);
    expect(own(plan.scenario)[0]).toMatchObject({
      id: "reserve",
      name: "reserve",
      state: [{ id: "s", t: 10, location: [1, 2] }],
    });
    expect(plan.changes.some((c) => c.effect === "added")).toBe(false);
    expect(plan.ignored.join(" ")).toContain("missing unit");
  });
  it("state replacement clears empty history while append ignores old/equal times", () => {
    const master = scenario();
    own(master)[0].state = [{ id: "old", t: 20, location: [0, 0] }];
    const incoming = contribution([
      unit("reserve", {
        state: [
          { id: "earlier", t: 10 },
          { id: "equal", t: 20 },
          { id: "later", t: 30 },
        ],
      }),
    ]);
    const plan = planScenarioImport(master, incoming, {
      ...opts,
      content: "state-only",
      states: "add_new",
    });
    expect(own(plan.scenario)[0].state?.map((s) => s.id)).toEqual(["old", "later"]);
    expect(plan.ignored[0]).toContain("2 states");
    const clear = planScenarioImport(master, contribution(), {
      ...opts,
      content: "state-only",
    });
    expect(own(clear.scenario)[0].state).toEqual([]);
  });
  it("state-only replacement never deletes omitted units; units-only retains history", () => {
    const master = scenario();
    own(master)[0].state = [{ id: "old", t: 20 }];
    const p = planScenarioImport(master, contribution(), {
      ...opts,
      content: "state-only",
      action: "replace",
    });
    expect(own(p.scenario)).toHaveLength(3);
    expect(p.changes.some((c) => c.effect === "removed")).toBe(false);
    const q = planScenarioImport(master, contribution(), {
      ...opts,
      content: "units-only",
    });
    expect(own(q.scenario)[0].state).toEqual(own(master)[0].state);
  });
  it("copies intentionally with fresh IDs and remapped hierarchy references", () => {
    const incoming = contribution([
      unit("reserve", {
        state: [{ id: "s", t: 10, hierarchy: { targetId: "own", placement: "on" } }],
      }),
    ]);
    const p = planScenarioImport(scenario(), incoming, {
      ...opts,
      action: "copy",
      targetSideId: "blue",
    });
    expect(p.errors).toEqual([]);
    const group = p.scenario.sides[0].groups.at(-1)!;
    expect(group.id).not.toBe("own");
    expect(group.subUnits[0].id).not.toBe("reserve");
    expect(group.subUnits[0].state![0].hierarchy?.targetId).toBe(group.id);
    expect(p.scenario.sides[0].groups[0]).toEqual(scenario().sides[0].groups[0]);
  });
});

import { vi } from "vitest";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioIO } from "@/scenariostore/io";
import { useScenarioTime } from "@/scenariostore/time";
import { applyScenarioImport } from "./applyScenarioImport";
import "@/dayjs";
vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

describe("import application and recovery", () => {
  function setup() {
    const store = useNewScenarioStore(scenario());
    const io = useScenarioIO(shallowRef(store));
    return { store, io };
  }
  it("applies the preview through the codec and reports no changes on repeat", async () => {
    const { store, io } = setup();
    const original = io.serializeToObject();
    const source = contribution([
      unit("reserve", {
        location: [10, 20],
        state: [{ id: "s", t: 1000, location: [20, 30] }],
      }),
    ]);
    const p = planScenarioImport(original, source, opts);
    expect(p.errors).toEqual([]);
    const layers = klona(store.state.layerStackMap),
      enemy = klona(store.state.unitMap["enemy-unit"]);
    applyScenarioImport(store, p);
    expect(store.state.unitMap.reserve.location).toEqual([10, 20]);
    expect(store.state.layerStackMap).toEqual(layers);
    expect(store.state.unitMap["enemy-unit"]).toEqual(enemy);
    const next = planScenarioImport(io.serializeToObject(), source, opts);
    expect(next.changes.filter((c) => c.effect === "changed")).toEqual([]);
    expect(next.hasChanges).toBe(false);
  });
  it("restores the entire import with one Undo and reapplies it with Redo", () => {
    const { store, io } = setup();
    const original = io.serializeToObject();
    const p = planScenarioImport(original, contribution(), {
      ...opts,
      action: "replace",
    });
    applyScenarioImport(store, p);
    const imported = io.serializeToObject();
    expect(store.state.unitMap.omitted).toBeUndefined();
    expect(store.undo()).toBe(true);
    // Serialization stamps a fresh modification date on every export.
    expect(io.serializeToObject()).toEqual({
      ...original,
      meta: { ...original.meta, lastModifiedDate: expect.any(String) },
    });
    expect(store.canUndo.value).toBe(false);
    expect(store.redo()).toBe(true);
    expect(io.serializeToObject()).toEqual({
      ...imported,
      meta: { ...imported.meta, lastModifiedDate: expect.any(String) },
    });
  });
  it("never applies an invalid plan", () => {
    const { store, io } = setup();
    const original = klona(store.state);
    const invalid = planScenarioImport(io.serializeToObject(), contribution(), {
      ...opts,
      scopeId: "missing",
    });
    expect(() => applyScenarioImport(store, invalid)).toThrow("conflicts");
    expect(store.state).toEqual(original);
    expect(store.canUndo.value).toBe(false);
  });
  it("keeps catalog IDs stable and resolves imported resource history", async () => {
    const { store, io } = setup();
    const catalog = klona(store.state.equipmentMap);
    const source = contribution([
      unit("reserve", {
        equipment: [{ name: "New tank", count: 3 }],
        state: [
          { id: "s", t: 1000, update: { equipment: [{ name: "New tank", count: 4 }] } },
        ],
      }),
    ]);
    const p = planScenarioImport(io.serializeToObject(), source, opts);
    applyScenarioImport(store, p);
    for (const [id, entry] of Object.entries(catalog))
      expect(store.state.equipmentMap[id]).toEqual(entry);
    expect(own(io.serializeToObject())[0].equipment).toEqual([
      { name: "New tank", count: 3 },
    ]);
    expect(planScenarioImport(io.serializeToObject(), source, opts).hasChanges).toBe(
      false,
    );
  });
  it("updates projected hierarchy at current time and preserves omitted descendants", async () => {
    const { store, io } = setup();
    const source = contribution([unit("parent", { subUnits: [unit("reserve")] })]);
    const p = planScenarioImport(io.serializeToObject(), source, {
      ...opts,
      selectedIds: ["reserve", "parent"],
    });
    applyScenarioImport(store, p);
    useScenarioTime(store).setCurrentTime(store.state.currentTime);
    expect(store.state.unitMap.reserve._pid).toBe("parent");
    expect(store.state.unitMap.parent.subUnits).toContain("child");
    expect(store.state.unitMap.parent.subUnits).toContain("reserve");
  });
});
