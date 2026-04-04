import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";

describe("scenario geo item accessors", () => {
  it("exposes layer-item accessors backed by the current feature store", () => {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.7.0",
      name: "Scenario",
      startTime: 0,
      sides: [],
      events: [],
      layers: [
        {
          id: "layer-1",
          name: "Features",
          features: [
            {
              id: "feature-1",
              type: "Feature",
              geometry: { type: "Point", coordinates: [10, 60] },
              properties: {},
              meta: { type: "Point", name: "HQ" },
              style: { showLabel: true },
            },
          ],
        },
      ],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    const geo = useGeo(store);
    const itemResult = geo.getLayerItemById("feature-1");
    const fullItemsLayer = geo.getFullLayerItemsLayer("layer-1");
    const geometryItemResult = geo.getGeometryLayerItemById("feature-1");

    expect(itemResult.layerItem?.id).toBe("feature-1");
    expect(itemResult.layer?.id).toBe("layer-1");
    expect(geometryItemResult.layerItem).toEqual(itemResult.layerItem);
    expect(fullItemsLayer?.items).toHaveLength(1);
    expect(geo.layerItemsLayers.value[0].items).toHaveLength(1);
    expect(geo.layersItems.value[0].items[0].id).toBe("feature-1");
  });

  it("keeps the item event hook aligned with the existing feature event hook", () => {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "2.7.0",
      name: "Scenario",
      startTime: 0,
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
    } as any);

    const geo = useGeo(store);
    expect(geo.onLayerItemEvent).toBe(geo.onFeatureLayerEvent);
  });

  it("creates patch-based geometry state entries at runtime", () => {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "3.0.0",
      name: "Scenario",
      startTime: 0,
      sides: [],
      events: [],
      layers: [
        {
          id: "layer-1",
          name: "Features",
          items: [
            {
              kind: "geometry",
              id: "feature-1",
              type: "Feature",
              geometry: { type: "Point", coordinates: [10, 60] },
              properties: {},
              meta: { type: "Point", name: "HQ" },
              style: {},
            },
          ],
        },
      ],
      mapLayers: [],
      settings: {
        rangeRingGroups: [],
        statuses: [],
        supplyClasses: [],
        supplyUoMs: [],
        symbolFillColors: [],
      },
    } as any);

    const geo = useGeo(store);
    geo.addFeatureStateGeometry("feature-1", {
      type: "Point",
      coordinates: [11, 61],
    });

    const feature = geo.getGeometryLayerItemById("feature-1").layerItem;
    expect(feature?.state).toEqual([
      {
        id: expect.any(String),
        t: 0,
        patch: {
          geometry: { type: "Point", coordinates: [11, 61] },
        },
      },
    ]);
    expect(feature?._state).toMatchObject({
      t: 0,
      geometry: { type: "Point", coordinates: [11, 61] },
    });
  });
});
