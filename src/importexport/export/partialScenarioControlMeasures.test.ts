import { describe, expect, it, vi } from "vitest";
import { useScenarioExport } from "@/importexport/export/scenarioExport";
import { loadControlMeasureScenarioFixture } from "@/testdata/controlMeasureScenario";
import type { TScenario } from "@/scenariostore";

vi.mock("@/importexport/export/kmlExport", () => ({
  useKmlExport: () => ({
    generateKml: vi.fn(),
    downloadAsKML: vi.fn(),
    downloadAsKMZ: vi.fn(),
  }),
}));

describe("partial ORBAT Mapper export", () => {
  it("retains control-measure layers and their complete parameter bags", () => {
    const source = loadControlMeasureScenarioFixture();
    const activeScenario = {
      io: { toObject: () => source },
      store: { state: { sideMap: {} } },
      geo: { layerItemsLayers: { value: [] }, everyVisibleUnit: { value: [] } },
      unitActions: {},
      helpers: {},
    } as unknown as TScenario;

    const exported = JSON.parse(
      useScenarioExport({ activeScenario }).generateOrbatMapper({
        sideGroups: [],
        scenarioName: "Control measures only",
        customColors: true,
        fileName: "control-measures.json",
      }),
    );
    const items = exported.layerStack.flatMap(
      (layer: { kind: string; items?: unknown[] }) =>
        layer.kind === "overlay" ? (layer.items ?? []) : [],
    );
    const phaseLine = items.find((item: { id?: string }) => item.id === "cm-phase-line");

    expect(exported.name).toBe("Control measures only");
    expect(exported.sides).toEqual([]);
    expect(phaseLine).toMatchObject({
      kind: "tacticalGraphic",
      graphicKind: "phase-line",
      standardIdentity: "3",
      controlPoints: [
        [10, 60],
        [11, 60],
      ],
      textAmplifiers: { T: "BLUE" },
    });
    expect(phaseLine.state[0].patch.controlPoints).toEqual([
      [10, 61],
      [11, 61],
    ]);
  });
});
