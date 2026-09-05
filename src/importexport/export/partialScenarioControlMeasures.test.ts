import { buildRecipientScenario } from "./recipientScenario";
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
  function exporter() {
    const source = loadControlMeasureScenarioFixture();
    const activeScenario = {
      io: { toObject: () => source },
      store: { state: { sideMap: {} } },
      geo: { layerItemsLayers: { value: [] }, everyVisibleUnit: { value: [] } },
      unitActions: {},
      helpers: {},
    } as unknown as TScenario;
    return useScenarioExport({ activeScenario });
  }

  it("previews the downloaded content, including scenario-wide data", () => {
    const settings = {
      sideGroups: [],
      layerIds: ["layer-control-measures"],
      scenarioName: "Blue update",
      customColors: true,
      fileName: "blue.json",
    };
    const source = loadControlMeasureScenarioFixture();
    const preview = buildRecipientScenario(source, settings);
    const downloaded = JSON.parse(exporter().generateOrbatMapper(settings));
    const { id: previewId, meta: previewMeta, ...previewContent } = preview;
    const { id: downloadId, meta: downloadMeta, ...downloadContent } = downloaded;
    expect(downloadContent).toEqual(JSON.parse(JSON.stringify(previewContent)));
    expect(downloadId).not.toBe(previewId);
    expect(downloadMeta).toMatchObject({ ...previewMeta, exportedFrom: previewId });
    expect(preview.events).toEqual(source.events);
    expect(source.layerStack.length).toBeGreaterThan(preview.layerStack.length);
  });

  it("retains control-measure layers and their complete parameter bags", () => {
    const exported = JSON.parse(
      exporter().generateOrbatMapper({
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

  it("exports only explicitly selected layers", () => {
    const exported = JSON.parse(
      exporter().generateOrbatMapper({
        sideGroups: [],
        layerIds: ["layer-control-measures"],
        customColors: true,
        fileName: "selected-layers.json",
      }),
    );

    expect(exported.layerStack.map((layer: { id: string }) => layer.id)).toEqual([
      "layer-control-measures",
    ]);
    expect(
      exported.layerStack[0].items.some(
        (item: { id: string }) => item.id === "cm-phase-line",
      ),
    ).toBe(true);
  });

  it("exports no layers when the selection is explicitly empty", () => {
    const exported = JSON.parse(
      exporter().generateOrbatMapper({
        sideGroups: [],
        layerIds: [],
        customColors: true,
        fileName: "no-layers.json",
      }),
    );

    expect(exported.layerStack).toEqual([]);
  });
});
