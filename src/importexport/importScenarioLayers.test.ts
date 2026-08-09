import { describe, expect, it, vi } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { importScenarioOverlayLayers } from "@/importexport/importScenarioLayers";
import type { Scenario } from "@/types/scenarioModels";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

function scenario(id: string, layerStack: Scenario["layerStack"] = []): Scenario {
  return {
    id,
    type: "ORBAT-mapper",
    version: "3.0.0",
    name: id,
    startTime: Date.parse("2025-01-01T00:00:00Z"),
    timeZone: "UTC",
    sides: [],
    events: [],
    layerStack,
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
  };
}

function controlMeasureLayer() {
  return {
    id: "control-measures",
    kind: "overlay" as const,
    name: "Control measures",
    specialization: "controlMeasure" as const,
    locked: true,
    items: [
      {
        id: "phase-line",
        kind: "tacticalGraphic" as const,
        graphicKind: "phase-line" as const,
        standardIdentity: "3" as const,
        controlPoints: [
          [10, 60],
          [11, 60],
        ] as [number, number][],
        textAmplifiers: { T: "BLUE" },
        state: [
          {
            id: "phase-line-state",
            t: Date.parse("2025-01-01T01:00:00Z"),
            patch: {
              controlPoints: [
                [10, 61],
                [11, 61],
              ] as [number, number][],
            },
          },
        ],
      },
    ],
  };
}

describe("importScenarioOverlayLayers", () => {
  it("imports a selected control-measure layer and its authored and timed fields", () => {
    const source = useNewScenarioStore(scenario("source", [controlMeasureLayer()])).state;
    const targetStore = useNewScenarioStore(scenario("target"));

    const result = importScenarioOverlayLayers(
      source,
      targetStore.state,
      useGeo(targetStore),
      ["control-measures"],
    );

    expect(result).toEqual({
      importedLayerIds: ["control-measures"],
      importedItemIds: ["phase-line"],
    });
    expect(targetStore.state.layerStackMap["control-measures"]).toMatchObject({
      specialization: "controlMeasure",
      locked: true,
      items: ["phase-line"],
    });
    expect(targetStore.state.layerItemMap["phase-line"]).toMatchObject({
      kind: "tacticalGraphic",
      graphicKind: "phase-line",
      standardIdentity: "3",
      textAmplifiers: { T: "BLUE" },
      _pid: "control-measures",
      state: [{ id: "phase-line-state", t: Date.parse("2025-01-01T01:00:00Z") }],
    });
  });

  it("remaps colliding layer and item ids without changing the source", () => {
    const source = useNewScenarioStore(scenario("source", [controlMeasureLayer()])).state;
    const targetStore = useNewScenarioStore(
      scenario("target", [
        {
          ...controlMeasureLayer(),
          name: "Existing control measures",
        },
      ]),
    );
    const ids = ["imported-layer", "imported-item"];

    const result = importScenarioOverlayLayers(
      source,
      targetStore.state,
      useGeo(targetStore),
      ["control-measures"],
      () => ids.shift()!,
    );

    expect(result).toEqual({
      importedLayerIds: ["imported-layer"],
      importedItemIds: ["imported-item"],
    });
    expect(targetStore.state.layerItemMap["imported-item"]).toMatchObject({
      id: "imported-item",
      _pid: "imported-layer",
      graphicKind: "phase-line",
    });
    expect(source.layerStackMap["control-measures"]).toMatchObject({
      id: "control-measures",
      items: ["phase-line"],
    });
  });

  it("ignores unselected layers", () => {
    const source = useNewScenarioStore(scenario("source", [controlMeasureLayer()])).state;
    const targetStore = useNewScenarioStore(scenario("target"));

    expect(
      importScenarioOverlayLayers(source, targetStore.state, useGeo(targetStore), []),
    ).toEqual({ importedLayerIds: [], importedItemIds: [] });
    expect(targetStore.state.layerStack).toEqual([]);
  });

  it("preserves legacy control measures in an unspecialized layer", () => {
    const legacyLayer = { ...controlMeasureLayer(), specialization: undefined };
    const source = useNewScenarioStore(scenario("source", [legacyLayer])).state;
    const targetStore = useNewScenarioStore(scenario("target"));

    const result = importScenarioOverlayLayers(
      source,
      targetStore.state,
      useGeo(targetStore),
      ["control-measures"],
    );

    expect(result.importedItemIds).toEqual(["phase-line"]);
    expect(targetStore.state.layerItemMap["phase-line"]).toMatchObject({
      kind: "tacticalGraphic",
      _pid: "control-measures",
    });
  });
});
