import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioSettings } from "@/scenariostore/settingsManipulations";
import { useToeManipulations } from "@/scenariostore/toeManipulations";
import { useSupplyManipulations } from "@/scenariostore/supplyManipulations";

function createScenario() {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.7.0",
    name: "Scenario",
    startTime: 0,
    sides: [],
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

describe("updateCustomSymbol", () => {
  it("redraws units on the map, also on undo/redo", () => {
    const store = useNewScenarioStore(createScenario());
    const settings = useScenarioSettings(store);
    const { id } = settings.addCustomSymbol({ name: "Tank", src: "data:old" });
    const before = store.state.unitStateCounter;

    settings.updateCustomSymbol(id, { src: "data:new" });

    expect(store.state.customSymbolMap[id].src).toBe("data:new");
    expect(store.state.unitStateCounter).toBe(before + 1);
    store.undo();
    expect(store.state.unitStateCounter).toBe(before);
    store.redo();
    expect(store.state.unitStateCounter).toBe(before + 1);
  });
});

describe("settings updates", () => {
  // Panels such as UnitDetailsToe only watch settingsStateCounter, so undo/redo
  // must change it.
  it("change settingsStateCounter on undo and redo", () => {
    const store = useNewScenarioStore(createScenario());
    const settings = useScenarioSettings(store);
    const toe = useToeManipulations(store);
    const supply = useSupplyManipulations(store);
    const equipmentId = toe.addEquipment({ name: "Rifle" }).id;
    const supplyClassId = supply.addSupplyClass({ name: "Class I" });
    const supplyCategoryId = supply.addSupplyCategory({ name: "Water" }).id;
    const supplyUomId = supply.addSupplyUom({ name: "Litre" });
    const fillColorId = settings.addSymbolFillColor({ code: "#123456" });
    const customSymbolId = settings.addCustomSymbol({ name: "Tank" }).id;

    const edits = [
      () => toe.updateEquipment(equipmentId, { name: "Carbine" }),
      () => supply.updateSupplyClass(supplyClassId, { name: "Class III" }),
      () => supply.updateSupplyCategory(supplyCategoryId, { name: "Fuel" }),
      () => supply.updateSupplyUom(supplyUomId, { name: "Gallon" }),
      () => settings.updateSymbolFillColor(fillColorId, { code: "#654321" }),
      () => settings.updateCustomSymbol(customSymbolId, { name: "Truck" }),
    ];
    for (const edit of edits) {
      const before = store.state.settingsStateCounter;
      edit();
      expect(store.state.settingsStateCounter).toBe(before + 1);
      store.undo();
      expect(store.state.settingsStateCounter).toBe(before);
      store.redo();
      expect(store.state.settingsStateCounter).toBe(before + 1);
    }
  });
});
