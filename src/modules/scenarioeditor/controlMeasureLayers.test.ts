import { describe, expect, it } from "vitest";
import {
  getControlMeasureLabel,
  getControlMeasureLayerGroups,
} from "@/modules/scenarioeditor/controlMeasureLayers";
import type {
  NScenarioLayerItem,
  NTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";

function layer(id: string, itemIds: string[]): NScenarioOverlayLayer {
  return { id, kind: "overlay", name: id, items: itemIds } as NScenarioOverlayLayer;
}

function controlMeasureLayer(id: string, itemIds: string[]): NScenarioOverlayLayer {
  return { ...layer(id, itemIds), specialization: "controlMeasure" };
}

function cm(
  id: string,
  graphicKind = "boundary",
  extra: Partial<NTacticalGraphicLayerItem> = {},
): NScenarioLayerItem {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind,
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    _pid: "layer-1",
    ...extra,
  } as unknown as NScenarioLayerItem;
}

function geometry(id: string): NScenarioLayerItem {
  return {
    id,
    kind: "geometry",
    _pid: "layer-1",
    geometry: { type: "Point", coordinates: [10, 60] },
    geometryMeta: { geometryKind: "Point" },
    style: {},
  } as unknown as NScenarioLayerItem;
}

describe("getControlMeasureLayerGroups", () => {
  it("includes an empty specialized control-measure layer", () => {
    const preparedLayer = {
      ...layer("prepared", []),
      specialization: "controlMeasure" as const,
    };

    expect(getControlMeasureLayerGroups([{ layer: preparedLayer, items: [] }])).toEqual([
      { layer: preparedLayer, items: [] },
    ]);
  });

  it("returns nothing when the scenario holds no control measures", () => {
    // Lazy by construction: no section, so the stored model stays untouched.
    expect(
      getControlMeasureLayerGroups([
        { layer: layer("layer-1", ["g1"]), items: [geometry("g1")] },
      ]),
    ).toEqual([]);
    expect(getControlMeasureLayerGroups([])).toEqual([]);
  });

  it("groups control measures under the layer that owns them, in store order", () => {
    const l = controlMeasureLayer("layer-1", ["g1", "cm1", "cm2"]);
    const groups = getControlMeasureLayerGroups([
      { layer: l, items: [geometry("g1"), cm("cm1"), cm("cm2")] },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.layer).toBe(l);
    expect(groups[0]!.items.map((i) => i.id)).toEqual(["cm1", "cm2"]);
  });

  it("keeps one group per layer rather than hiding scattered control measures", () => {
    const groups = getControlMeasureLayerGroups([
      { layer: controlMeasureLayer("layer-1", ["cm1"]), items: [cm("cm1")] },
      { layer: layer("layer-2", ["g1"]), items: [geometry("g1")] },
      { layer: controlMeasureLayer("layer-3", ["cm2"]), items: [cm("cm2")] },
    ]);

    expect(groups.map((g) => g.layer.id)).toEqual(["layer-1", "layer-3"]);
  });

  it("lists an unsupported graphicKind alongside the supported ones", () => {
    const groups = getControlMeasureLayerGroups([
      {
        layer: controlMeasureLayer("layer-1", ["cm1", "cm2"]),
        items: [cm("cm1"), cm("cm2", "from-the-future")],
      },
    ]);

    expect(groups[0]!.items.map((i) => i.id)).toEqual(["cm1", "cm2"]);
  });

  it("does not infer specialization from tactical-graphic contents", () => {
    expect(
      getControlMeasureLayerGroups([
        { layer: layer("unspecialized", ["cm1"]), items: [cm("cm1")] },
      ]),
    ).toEqual([]);
  });
});

describe("getControlMeasureLabel", () => {
  it("prefers the authored name", () => {
    const item = cm("cm1", "boundary", { name: "PL BLUE" }) as NTacticalGraphicLayerItem;
    expect(getControlMeasureLabel(item)).toBe("PL BLUE");
  });

  it("falls back to the library's doctrinal name for the kind", () => {
    const item = cm("cm1", "boundary") as NTacticalGraphicLayerItem;
    const label = getControlMeasureLabel(item);
    expect(label.length).toBeGreaterThan(0);
    expect(label.toLowerCase()).toContain("boundary");
  });

  it("falls back to the raw graphicKind for an unsupported kind", () => {
    const item = cm("cm1", "from-the-future") as NTacticalGraphicLayerItem;
    expect(getControlMeasureLabel(item)).toBe("from-the-future");
  });
});
