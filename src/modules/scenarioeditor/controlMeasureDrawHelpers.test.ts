import { describe, expect, it, vi } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { TScenario } from "@/scenariostore";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { CONTROL_MEASURE_LAYER_NAME } from "@/modules/scenarioeditor/controlMeasureLayers";
import {
  addScenarioControlMeasure,
  draftStyleForNewControlMeasure,
  toTacticalGraphicLayerItem,
} from "@/modules/scenarioeditor/controlMeasureDrawHelpers";
import { identityColor } from "@/symbology/identityColors";
import { MONOCHROME_COLOR, PLANNED_STROKE_DASH } from "@/geo/controlMeasures";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

function createScenario(): TScenario {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [],
    events: [],
    layerStack: [],
  } as any);
  return { store, geo: useGeo(store) } as unknown as TScenario;
}

function measure(overrides: Partial<ControlMeasure> = {}): ControlMeasure {
  return {
    id: "cm-1",
    kind: "phase-line",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    style: { color: "#ff0000" },
    ...overrides,
  } as ControlMeasure;
}

function controlMeasureItems(scenario: TScenario): NTacticalGraphicLayerItem[] {
  return scenario.geo.layersItems.value.flatMap(({ items }) =>
    items.filter((item): item is NTacticalGraphicLayerItem =>
      isNTacticalGraphicLayerItem(item),
    ),
  );
}

describe("toTacticalGraphicLayerItem", () => {
  it("flattens the library's measure and keeps the id it was born with", () => {
    const item = toTacticalGraphicLayerItem(
      measure({ options: { width: 3 }, textAmplifiers: { t: "PL BLUE" } } as any),
    );
    expect(item.kind).toBe("tacticalGraphic");
    expect(item.id).toBe("cm-1");
    expect(item.graphicKind).toBe("phase-line");
    expect(item.controlPoints).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(item.options).toEqual({ width: 3 });
    expect(item.textAmplifiers).toEqual({ t: "PL BLUE" });
  });

  it("drops the resolved draft style rather than baking a projection into storage", () => {
    const item = toTacticalGraphicLayerItem(measure(), { status: "planned" });
    expect(item.style).toBeUndefined();
    expect(item.status).toBe("planned");
  });

  it("copies the control points out of the measure the engine still holds", () => {
    const source = measure();
    const item = toTacticalGraphicLayerItem(source);
    expect(item.controlPoints[0]).not.toBe(source.controlPoints[0]);
  });
});

describe("draftStyleForNewControlMeasure", () => {
  it("resolves the same identity colour the committed graphic will render with", () => {
    expect(
      draftStyleForNewControlMeasure("phase-line", { standardIdentity: "3" }),
    ).toEqual({ color: identityColor("3"), strokeDash: [] });
  });

  it("lets an authored colour win over the identity projection, as the read path does", () => {
    expect(
      draftStyleForNewControlMeasure("polygon", {
        standardIdentity: "3",
        style: { color: "#ff00ff", fillPattern: "hatch" },
      }),
    ).toEqual({ color: "#ff00ff", fillPattern: "hatch", strokeDash: [] });
  });

  it("resolves monochrome and planned the same way the read path does", () => {
    expect(
      draftStyleForNewControlMeasure("phase-line", {
        colorMode: "monochrome",
        status: "planned",
      }),
    ).toEqual({ color: MONOCHROME_COLOR, strokeDash: [...PLANNED_STROKE_DASH] });
  });
});

describe("authored style on a new graphic", () => {
  it("stores the defaults' style verbatim and never the resolved draft style", () => {
    const item = toTacticalGraphicLayerItem(measure({ kind: "polygon" }), {
      standardIdentity: "3",
      style: { color: "#ff00ff" },
    });
    // The measure's own `style` is the resolved projection — it must not be stored.
    expect(item.style).toEqual({ color: "#ff00ff" });
  });
});

describe("addScenarioControlMeasure", () => {
  it("creates the control-measures layer lazily on the first commit", () => {
    const scenario = createScenario();
    expect(scenario.geo.layersItems.value).toHaveLength(0);

    addScenarioControlMeasure(scenario, measure());

    const layers = scenario.geo.layersItems.value;
    expect(layers).toHaveLength(1);
    expect(layers[0].layer.name).toBe(CONTROL_MEASURE_LAYER_NAME);
    expect(layers[0].layer.specialization).toBe("controlMeasure");
    expect(controlMeasureItems(scenario)).toHaveLength(1);
  });

  it("reuses the existing control-measure layer on later commits", () => {
    const scenario = createScenario();
    addScenarioControlMeasure(scenario, measure());
    addScenarioControlMeasure(scenario, measure({ id: "cm-2" }));

    expect(scenario.geo.layersItems.value).toHaveLength(1);
    expect(controlMeasureItems(scenario).map((item) => item.id)).toEqual([
      "cm-1",
      "cm-2",
    ]);
  });

  it("is one undo step even when it also created the layer", () => {
    const scenario = createScenario();
    addScenarioControlMeasure(scenario, measure());

    scenario.store.undo();

    expect(controlMeasureItems(scenario)).toHaveLength(0);
    expect(scenario.geo.layersItems.value).toHaveLength(0);
  });

  it("does not silently redirect when an explicit destination no longer exists", () => {
    const scenario = createScenario();

    const added = addScenarioControlMeasure(scenario, measure(), {}, "deleted-layer");

    expect(added).toBeUndefined();
    expect(controlMeasureItems(scenario)).toHaveLength(0);
    expect(scenario.geo.layersItems.value).toHaveLength(0);
  });
});
