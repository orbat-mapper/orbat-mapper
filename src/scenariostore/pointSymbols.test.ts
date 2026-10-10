import { describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioIO } from "@/scenariostore/io";
import { useGeo } from "@/scenariostore/geo";
import type { TScenario } from "@/scenariostore";
import type { Scenario } from "@/types/scenarioModels";
import type {
  NScenarioLayerItem,
  PointSymbolLayerItem,
  ScenarioLayerItem,
} from "@/types/scenarioLayerItems";
import { addScenarioPointSymbol } from "@/modules/scenarioeditor/pointSymbolDrawHelpers";
import { groundPointSymbolSize } from "@/geo/pointSymbolSizing";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

const SIDC = "15032500001303000000";

const symbol: PointSymbolLayerItem = {
  id: "ps-1",
  kind: "pointSymbol",
  name: "Checkpoint 1",
  sidc: SIDC,
  position: [10, 60],
  rotation: 0.5,
  size: { value: 30, unit: "pixels" },
};

function createScenario(): Scenario {
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
        id: "cm-layer",
        kind: "overlay",
        name: "Control measures",
        specialization: "controlMeasure",
        items: [symbol],
      },
      { id: "feature-layer", kind: "overlay", name: "Features", items: [] },
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

function serializedItems(scenario: Scenario): ScenarioLayerItem[] {
  return scenario.layerStack.flatMap((layer) =>
    layer.kind === "overlay" ? layer.items : [],
  );
}

describe("point symbol layer items", () => {
  it("survive a save and load", () => {
    const store = useNewScenarioStore(createScenario());
    const saved = useScenarioIO(shallowRef(store)).serializeToObject();
    const reloaded = useScenarioIO(
      shallowRef(useNewScenarioStore(saved)),
    ).serializeToObject();

    expect(serializedItems(reloaded).find((item) => item.id === "ps-1")).toMatchObject({
      kind: "pointSymbol",
      sidc: SIDC,
      position: [10, 60],
      rotation: 0.5,
      size: { value: 30, unit: "pixels" },
    });
  });

  it("go only into control-measure layers", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.addFeature({ ...symbol, id: "ps-2" }, "feature-layer");
    geo.addFeature({ ...symbol, id: "ps-3" }, "cm-layer");

    expect(store.state.layerItemMap["ps-2"]).toBeUndefined();
    expect(store.state.layerItemMap["ps-3"]).toBeDefined();
  });

  it("update through their own door as one undo step", () => {
    const store = useNewScenarioStore(createScenario());
    const geo = useGeo(store);

    geo.updatePointSymbol("ps-1", { position: [12, 61], rotation: 1 });
    const item = store.state.layerItemMap["ps-1"] as NScenarioLayerItem &
      PointSymbolLayerItem;
    expect(item.position).toEqual([12, 61]);
    expect(item.rotation).toBe(1);

    store.undo();
    expect((store.state.layerItemMap["ps-1"] as PointSymbolLayerItem).position).toEqual([
      10, 60,
    ]);
  });

  it("store a ground size with its on-screen bounds", () => {
    const store = useNewScenarioStore(createScenario());
    const size = groundPointSymbolSize(250, 30);
    const added = addScenarioPointSymbol(
      { store, geo: useGeo(store) } as unknown as TScenario,
      { sidc: SIDC, name: "Checkpoint", position: [11, 60], size },
      "cm-layer",
    );

    expect(added?.size).toEqual(size);
    const saved = useScenarioIO(shallowRef(store)).serializeToObject();
    expect(serializedItems(saved).find((item) => item.id === added?.id)).toMatchObject({
      size: { value: 250, unit: "meters", minPixels: 12, maxPixels: 30 },
    });
  });

  it("leave a default screen size unstored", () => {
    const store = useNewScenarioStore(createScenario());
    const added = addScenarioPointSymbol(
      { store, geo: useGeo(store) } as unknown as TScenario,
      {
        sidc: SIDC,
        name: "Checkpoint",
        position: [11, 60],
        size: { value: 30, unit: "pixels" },
      },
      "cm-layer",
    );

    expect(added).toBeDefined();
    expect(added?.size).toBeUndefined();
  });
});
