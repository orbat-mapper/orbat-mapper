import { afterEach, describe, expect, it, vi } from "vitest";
import { upgradeScenarioIfNecessary } from "./upgrade";
import type { ScenarioOverlayLayer } from "@/types/scenarioStackLayers";

function getOverlayLayers(scenario: { layerStack: any[] }): ScenarioOverlayLayer[] {
  return scenario.layerStack.filter((layer) => layer.kind === "overlay");
}

function createScenario(overrides: Record<string, unknown> = {}) {
  return {
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "2.7.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    timeZone: "UTC",
    sides: [],
    events: [],
    layers: [{ id: "layer-1", name: "Features", features: [] }],
    mapLayers: [],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
    ...overrides,
  };
}

function createFeature(overrides: Record<string, unknown> = {}) {
  return {
    type: "Feature",
    id: "feature-1",
    geometry: { type: "Point", coordinates: [10, 60] },
    properties: { title: "Feature properties" },
    meta: { type: "Point", name: "HQ", description: "Feature description" },
    style: { showLabel: true, title: "HQ" },
    state: [
      {
        id: "state-1",
        t: "2025-01-01T01:00:00Z",
        geometry: { type: "Point", coordinates: [11, 61] },
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("upgradeScenarioIfNecessary", () => {
  it("converts legacy features[] layers to canonical geometry items[]", () => {
    const feature = createFeature();
    const scenario = createScenario({
      layers: [{ id: "layer-1", name: "Features", features: [feature] }],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    expect(getOverlayLayers(upgraded)[0].items).toEqual([
      {
        ...feature,
        kind: "geometry",
        state: [
          {
            id: "state-1",
            t: "2025-01-01T01:00:00Z",
            patch: {
              geometry: { type: "Point", coordinates: [11, 61] },
            },
          },
        ],
      },
    ]);
    expect(getOverlayLayers(upgraded)[0]).not.toHaveProperty("features");
  });

  it("leaves canonical geometry items[] layers unchanged", () => {
    const feature = createFeature();
    const scenario = createScenario({
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              ...feature,
              kind: "geometry",
              state: [
                {
                  id: "state-1",
                  t: "2025-01-01T01:00:00Z",
                  patch: {
                    geometry: { type: "Point", coordinates: [11, 61] },
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    expect(getOverlayLayers(upgraded)[0].items).toEqual([
      {
        ...feature,
        kind: "geometry",
        state: [
          {
            id: "state-1",
            t: "2025-01-01T01:00:00Z",
            patch: {
              geometry: { type: "Point", coordinates: [11, 61] },
            },
          },
        ],
      },
    ]);
    expect(getOverlayLayers(upgraded)[0]).not.toHaveProperty("features");
  });

  it("skips unsupported item kinds and warns with layer details and counts", () => {
    const feature = createFeature();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scenario = createScenario({
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            { ...feature, kind: "geometry" },
            {
              id: "annotation-1",
              kind: "annotation",
              annotationType: "label",
              anchor: { type: "point", position: [10, 60] },
              content: { text: "Note" },
            },
            {
              id: "measurement-1",
              kind: "measurement",
              measurementType: "distance",
              source: {
                type: "geometry",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [10, 60],
                    [11, 61],
                  ],
                },
              },
            },
          ],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    expect(getOverlayLayers(upgraded)[0].items).toEqual([
      {
        ...feature,
        kind: "geometry",
        state: [
          {
            id: "state-1",
            t: "2025-01-01T01:00:00Z",
            patch: {
              geometry: { type: "Point", coordinates: [11, 61] },
            },
          },
        ],
      },
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('layer "Features" (layer-1)');
    expect(warnSpy.mock.calls[0][0]).toContain("annotation=1");
    expect(warnSpy.mock.calls[0][0]).toContain("measurement=1");
  });

  it("prefers items[] over features[] when both are present", () => {
    const legacyFeature = createFeature({
      id: "legacy-feature",
      meta: { type: "Point", name: "Legacy" },
    });
    const itemFeature = createFeature({
      id: "item-feature",
      meta: { type: "Point", name: "Items" },
    });
    const scenario = createScenario({
      layers: [
        {
          id: "layer-1",
          name: "Features",
          features: [legacyFeature],
          items: [{ ...itemFeature, kind: "geometry" }],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    expect(getOverlayLayers(upgraded)[0].items).toEqual([
      {
        ...itemFeature,
        kind: "geometry",
        state: [
          {
            id: "state-1",
            t: "2025-01-01T01:00:00Z",
            patch: {
              geometry: { type: "Point", coordinates: [11, 61] },
            },
          },
        ],
      },
    ]);
  });

  it("applies the pre-0.30 feature properties upgrade after item canonicalization", () => {
    const scenario = createScenario({
      version: "0.20.0",
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              kind: "geometry",
              type: "Feature",
              id: "legacy-item-1",
              geometry: { type: "Point", coordinates: [10, 60] },
              properties: {
                type: "Point",
                name: "Legacy item",
                description: "Before v0.30",
                fill: "#ff0000",
                "fill-opacity": 0.4,
                stroke: "#000000",
                "stroke-opacity": 1,
                "stroke-width": 2,
                "marker-color": "#00ff00",
                "marker-size": "medium",
                "marker-symbol": "circle",
                showLabel: true,
                title: "Legacy title",
                "text-placement": "point",
                "text-align": "left",
                "text-offset-x": 0,
                "text-offset-y": 0,
                limitVisibility: false,
                minZoom: 0,
                maxZoom: 24,
                textMinZoom: 0,
                textMaxZoom: 24,
                foo: "bar",
              },
            },
          ],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);
    const feature = getOverlayLayers(upgraded)[0].items[0];

    expect(feature.kind).toBe("geometry");
    if (feature.kind !== "geometry") throw new Error("Expected geometry item");
    expect(feature.meta).toMatchObject({
      type: "Point",
      name: "Legacy item",
      description: "Before v0.30",
    });
    expect(feature.style).toMatchObject({
      fill: "#ff0000",
      "fill-opacity": 0.4,
      stroke: "#000000",
      "stroke-width": 2,
      showLabel: true,
      title: "Legacy title",
    });
    expect(feature.properties).toEqual({ foo: "bar" });
  });
});
