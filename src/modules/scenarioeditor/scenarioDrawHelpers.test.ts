import { describe, expect, it, vi } from "vitest";
import {
  addScenarioDrawFeature,
  getActiveDrawLayer,
  updateScenarioFeatureGeometry,
} from "@/modules/scenarioeditor/scenarioDrawHelpers";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";

function createFeature(id: string, zIndex?: number): GeometryLayerItem {
  return {
    kind: "geometry",
    id,
    geometry: { type: "Point", coordinates: [10, 20] },
    geometryMeta: { geometryKind: "Point" },
    style: {},
    ...(zIndex !== undefined ? { _zIndex: zIndex } : {}),
  };
}

function createScenario() {
  const existingFeature = createFeature("feature-1", 4);
  const activeLayer = {
    id: "layer-1",
    items: ["feature-1"],
  };
  const fallbackLayer = {
    id: "layer-2",
    items: [createFeature("feature-2", 7)],
  };
  const updateFeature = createFeature("feature-update");
  return {
    geo: {
      layerItemsLayers: { value: [fallbackLayer] },
      getLayerById: vi.fn((id: string) => (id === "layer-1" ? activeLayer : undefined)),
      getGeometryLayerItemById: vi.fn((id: string) => {
        if (id === "feature-1") return { layerItem: existingFeature, layer: activeLayer };
        if (id === "feature-update")
          return { layerItem: updateFeature, layer: activeLayer };
        if (id === "feature-2") {
          return { layerItem: fallbackLayer.items[0], layer: fallbackLayer };
        }
        return {};
      }),
      addFeature: vi.fn(),
      updateFeature: vi.fn(),
      addFeatureStateGeometry: vi.fn(),
    },
  } as any;
}

describe("scenarioDrawHelpers", () => {
  it("resolves the active layer or falls back to the first feature layer", () => {
    const scenario = createScenario();

    expect(getActiveDrawLayer(scenario, "layer-1")).toEqual({
      id: "layer-1",
      items: ["feature-1"],
    });
    expect(getActiveDrawLayer(scenario, null)).toEqual({
      id: "layer-2",
      items: ["feature-2"],
    });
  });

  it("normalizes active draw layer items to ids", () => {
    const scenario = createScenario();
    scenario.geo.getLayerById = vi.fn(() => ({
      id: "layer-1",
      items: [createFeature("feature-object")],
    }));

    expect(getActiveDrawLayer(scenario, "layer-1")).toEqual({
      id: "layer-1",
      items: ["feature-object"],
    });
  });

  it("assigns draw feature name, z-index, style, and target layer", () => {
    const scenario = createScenario();
    const feature = createFeature("");

    const added = addScenarioDrawFeature(scenario, feature, "layer-1", {
      stroke: "#ff0000",
    });

    expect(added?.id).toBeTruthy();
    expect(added?.name).toBe("Point 6");
    expect(added?._zIndex).toBe(5);
    expect(added?.style).toEqual({ stroke: "#ff0000" });
    expect(scenario.geo.addFeature).toHaveBeenCalledWith(added, "layer-1");
  });

  it("updates base geometry or records state geometry", () => {
    const scenario = createScenario();
    const geometry = {
      type: "Point" as const,
      coordinates: [30, 40] as [number, number],
    };

    updateScenarioFeatureGeometry(
      scenario,
      "feature-update",
      geometry,
      { geometryKind: "Point" },
      { label: "A" },
      false,
      { noEmit: false },
    );
    expect(scenario.geo.updateFeature).toHaveBeenCalledWith(
      "feature-update",
      expect.objectContaining({
        geometry,
        geometryMeta: { geometryKind: "Point" },
        userData: { label: "A" },
      }),
      { noEmit: false },
    );

    updateScenarioFeatureGeometry(
      scenario,
      "feature-update",
      geometry,
      { geometryKind: "Point" },
      {},
      true,
    );
    expect(scenario.geo.addFeatureStateGeometry).toHaveBeenCalledWith(
      "feature-update",
      geometry,
    );
  });
});
