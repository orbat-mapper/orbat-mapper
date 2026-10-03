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

function createExpectedGeometryItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "feature-1",
    kind: "geometry",
    geometry: { type: "Point", coordinates: [10, 60] },
    geometryMeta: { geometryKind: "Point" },
    name: "HQ",
    description: "Feature description",
    externalUrl: undefined,
    locked: undefined,
    isHidden: undefined,
    visibleFromT: undefined,
    visibleUntilT: undefined,
    media: undefined,
    style: { showLabel: true, title: "HQ" },
    userData: undefined,
    _zIndex: undefined,
    _hidden: undefined,
    _state: undefined,
    state: [
      {
        id: "state-1",
        t: "2025-01-01T01:00:00Z",
        patch: {
          geometry: { type: "Point", coordinates: [11, 61] },
        },
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

    expect(getOverlayLayers(upgraded)[0].items).toEqual([createExpectedGeometryItem()]);
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

    expect(getOverlayLayers(upgraded)[0].items).toEqual([createExpectedGeometryItem()]);
    expect(getOverlayLayers(upgraded)[0]).not.toHaveProperty("features");
  });

  it("keeps mixed items and warns about tactical graphics in an unspecialized layer", () => {
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
              id: "tacticalGraphic-1",
              kind: "tacticalGraphic",
              graphicKind: "boundary",
              controlPoints: [
                [10, 60],
                [11, 61],
              ],
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

    const items = getOverlayLayers(upgraded)[0].items;
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual(createExpectedGeometryItem());
    expect(items.map((item) => item.id)).toEqual([
      "feature-1",
      "annotation-1",
      "tacticalGraphic-1",
      "measurement-1",
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("mismatched items");
  });

  it("warns once for the whole scenario about unsupported graphicKinds", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scenario = createScenario({
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              id: "tacticalGraphic-1",
              kind: "tacticalGraphic",
              graphicKind: "from-the-future",
              controlPoints: [[10, 60]],
            },
            {
              id: "tacticalGraphic-2",
              kind: "tacticalGraphic",
              graphicKind: "from-the-future",
              controlPoints: [[11, 61]],
            },
          ],
        },
        {
          id: "layer-2",
          name: "More features",
          items: [
            {
              id: "tacticalGraphic-3",
              kind: "tacticalGraphic",
              graphicKind: "also-unknown",
              controlPoints: [[12, 62]],
            },
          ],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    // Stored verbatim, never dropped and never replaced by a placeholder.
    expect(getOverlayLayers(upgraded)[0].items).toHaveLength(2);
    expect(getOverlayLayers(upgraded)[1].items).toHaveLength(1);
    const unsupportedWarning = warnSpy.mock.calls.find(([message]) =>
      String(message).includes("Unsupported control measure kinds"),
    );
    expect(unsupportedWarning).toBeDefined();
    expect(unsupportedWarning![0]).toContain("from-the-future=2");
    expect(unsupportedWarning![0]).toContain("also-unknown=1");
  });

  it("still drops items whose kind is entirely unknown", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scenario = createScenario({
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [{ id: "mystery-1", kind: "somethingElse" }],
        },
      ],
    });

    const upgraded = upgradeScenarioIfNecessary(scenario as any);

    expect(getOverlayLayers(upgraded)[0].items).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('layer "Features" (layer-1)');
    expect(warnSpy.mock.calls[0][0]).toContain("somethingElse=1");
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
      createExpectedGeometryItem({
        id: "item-feature",
        name: "Items",
        description: undefined,
      }),
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
    expect(feature).toMatchObject({
      geometryMeta: { geometryKind: "Point" },
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
    expect(feature.userData).toEqual({ foo: "bar" });
  });
});

describe("Classic Arrow upgrade", () => {
  function createArrowScenario(item: Record<string, unknown>, version = "3.4.0") {
    return createScenario({
      version,
      layers: undefined,
      mapLayers: undefined,
      layerStack: [
        {
          id: "layer-1",
          kind: "overlay",
          name: "Control measures",
          specialization: "controlMeasure",
          items: [{ id: "arrow-1", kind: "tacticalGraphic", ...item }],
        },
      ],
    });
  }

  function firstItem(scenario: { layerStack: any[] }) {
    return getOverlayLayers(scenario)[0].items[0] as any;
  }

  it("reverses Classic Arrow control points, including timed state", () => {
    const upgraded = upgradeScenarioIfNecessary(
      createArrowScenario({
        graphicKind: "classic-arrow",
        controlPoints: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
        state: [
          {
            id: "s1",
            t: 1,
            patch: {
              controlPoints: [
                [3, 3],
                [4, 4],
              ],
            },
          },
          { id: "s2", t: 2, patch: { name: "No points" } },
        ],
      }) as any,
    );

    const item = firstItem(upgraded);
    expect(upgraded.version).toBe("3.5.0");
    expect(item.controlPoints).toEqual([
      [2, 2],
      [1, 1],
      [0, 0],
    ]);
    expect(item.state[0].patch.controlPoints).toEqual([
      [4, 4],
      [3, 3],
    ]);
    expect(item.state[1].patch).toEqual({ name: "No points" });
  });

  it("does not reverse twice when a scenario is upgraded again", () => {
    const once = upgradeScenarioIfNecessary(
      createArrowScenario({
        graphicKind: "classic-arrow",
        controlPoints: [
          [0, 0],
          [1, 1],
        ],
      }) as any,
    );
    const twice = upgradeScenarioIfNecessary(once);
    expect(firstItem(twice).controlPoints).toEqual([
      [1, 1],
      [0, 0],
    ]);
  });

  it("leaves other graphics and current-version scenarios untouched", () => {
    const points = [
      [0, 0],
      [1, 1],
    ];
    const otherKind = upgradeScenarioIfNecessary(
      createArrowScenario({ graphicKind: "phase-line", controlPoints: points }) as any,
    );
    expect(firstItem(otherKind).controlPoints).toEqual(points);

    const current = upgradeScenarioIfNecessary(
      createArrowScenario(
        { graphicKind: "classic-arrow", controlPoints: points },
        "3.5.0",
      ) as any,
    );
    expect(firstItem(current).controlPoints).toEqual(points);
  });
});
