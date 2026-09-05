import { describe, expect, it, vi } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { klona } from "klona";
import { useImportCheckpoint } from "@/importexport/importCheckpoint";
import {
  importScenarioOverlayLayers,
  previewScenarioOverlayReplacement,
} from "@/importexport/importScenarioLayers";
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

describe("overlay replacement", () => {
  const feature = (id: string, x = 1) => ({
    id,
    kind: "geometry" as const,
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [x, 2] },
    properties: {},
    geometryMeta: { geometryKind: "Point" as const },
    style: {},
  });
  const layer = (
    id: string,
    items = [feature("old"), feature("same"), feature("changed")],
  ) => ({ id, kind: "overlay" as const, name: id, items });

  it("previews without mutation and replaces properties, removals and geometry in place repeatedly", () => {
    const target = useNewScenarioStore(
      scenario("target", [
        layer("before", []),
        { ...layer("plan"), description: "obsolete", locked: true },
        layer("after", []),
      ]),
    );
    const source = useNewScenarioStore(
      scenario("source", [
        layer("plan", [feature("same"), feature("changed", 9), feature("added")]),
      ]),
    ).state;
    const before = klona(target.state);
    expect(previewScenarioOverlayReplacement(source, target.state, "plan")).toMatchObject(
      { added: ["added"], removed: ["old"], changed: ["changed"], unchanged: ["same"] },
    );
    expect(target.state).toEqual(before);
    for (let i = 0; i < 3; i++) {
      target.groupUpdate(() =>
        importScenarioOverlayLayers(
          source,
          target.state,
          useGeo(target),
          ["plan"],
          undefined,
          ["plan"],
        ),
      );
      expect(target.state.layerStack).toEqual(["before", "plan", "after"]);
      expect(Object.keys(target.state.layerItemMap).sort()).toEqual([
        "added",
        "changed",
        "same",
      ]);
      expect(target.state.layerStackMap.plan).not.toHaveProperty("description");
      expect(
        (target.state.layerItemMap.changed as { geometry: unknown }).geometry,
      ).toEqual({ type: "Point", coordinates: [9, 2] });
    }
    expect(previewScenarioOverlayReplacement(source, target.state, "plan")).toMatchObject(
      { changed: [], added: [], removed: [], unchanged: ["same", "changed", "added"] },
    );
  });

  it("replaces with an empty layer and restores the complete checkpoint after later edits", () => {
    const target = useNewScenarioStore(scenario("target", [layer("plan")]));
    const source = useNewScenarioStore(scenario("source", [layer("plan", [])])).state;
    const before = klona(target.state);
    const onRestore = vi.fn();
    target.onStateRestored(onRestore);
    const checkpoint = useImportCheckpoint(target);
    checkpoint.capture();
    target.groupUpdate(() =>
      importScenarioOverlayLayers(
        source,
        target.state,
        useGeo(target),
        ["plan"],
        undefined,
        ["plan"],
      ),
    );
    expect(target.state.layerItemMap).toEqual({});
    expect(target.state.layerStackMap.plan).toMatchObject({ items: [] });
    useGeo(target).addLayer({ id: "later", name: "later", items: [] });
    expect(useImportCheckpoint(target)).toBe(checkpoint);
    expect(checkpoint.restore()).toBe(true);
    expect(onRestore).toHaveBeenCalledOnce();
    expect(target.canUndo.value).toBe(false);
    expect(target.state.layerStack).toEqual(before.layerStack);
    expect(target.state.layerStackMap).toEqual(before.layerStackMap);
    expect(target.state.layerItemMap).toEqual(before.layerItemMap);
    expect(checkpoint.restore()).toBe(false);
  });

  it("preserves unrelated items on collision and does not accumulate remapped items", () => {
    const target = useNewScenarioStore(
      scenario("target", [layer("plan", []), layer("unrelated", [feature("collision")])]),
    );
    const source = useNewScenarioStore(
      scenario("source", [layer("plan", [feature("collision", 9)])]),
    ).state;
    const unrelated = klona(target.state.layerItemMap.collision);
    for (let i = 0; i < 3; i++) {
      importScenarioOverlayLayers(
        source,
        target.state,
        useGeo(target),
        ["plan"],
        () => "remapped",
        ["plan"],
      );
      expect(target.state.layerItemMap.collision).toEqual(unrelated);
      expect(Object.keys(target.state.layerItemMap).sort()).toEqual([
        "collision",
        "remapped",
      ]);
    }
  });

  it("replaces locked control measures with incoming specialization and history and supports undo", () => {
    const target = useNewScenarioStore(
      scenario("target", [{ ...controlMeasureLayer(), description: "old" }]),
    );
    const incoming = controlMeasureLayer();
    incoming.items[0].textAmplifiers.T = "RED";
    const source = useNewScenarioStore(scenario("source", [incoming])).state;
    const before = klona(target.state);
    target.groupUpdate(() =>
      importScenarioOverlayLayers(
        source,
        target.state,
        useGeo(target),
        [incoming.id],
        undefined,
        [incoming.id],
      ),
    );
    expect(target.state.layerStackMap[incoming.id]).toMatchObject({
      locked: true,
      specialization: "controlMeasure",
      items: ["phase-line"],
    });
    expect(target.state.layerItemMap["phase-line"]).toMatchObject({
      textAmplifiers: { T: "RED" },
      state: incoming.items[0].state,
    });
    target.undo();
    expect(target.state.layerStack).toEqual(before.layerStack);
    expect(target.state.layerStackMap).toEqual(before.layerStackMap);
    expect(target.state.layerItemMap).toEqual(before.layerItemMap);
  });

  it("adds nonmatching IDs normally even with identical layer names", () => {
    const target = useNewScenarioStore(scenario("target", [layer("plan", [])]));
    const source = useNewScenarioStore(
      scenario("source", [{ ...layer("other", []), name: "plan" }]),
    ).state;
    importScenarioOverlayLayers(
      source,
      target.state,
      useGeo(target),
      ["other"],
      undefined,
      ["other"],
    );
    expect(target.state.layerStack).toEqual(["plan", "other"]);
  });
});
