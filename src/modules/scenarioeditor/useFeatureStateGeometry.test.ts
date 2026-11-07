import { describe, expect, it } from "vitest";

import { useFeatureStateGeometry } from "@/modules/scenarioeditor/useFeatureStateGeometry";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useScenarioTime } from "@/scenariostore/time";

const alpha = {
  type: "Polygon",
  coordinates: [
    [
      [10, 60],
      [11, 60],
      [11, 61],
      [10, 60],
    ],
  ],
};

const beta = {
  type: "Polygon",
  coordinates: [
    [
      [12, 62],
      [13, 62],
      [13, 63],
      [12, 62],
    ],
  ],
};

function polygon(id: string, name: string, geometry: object) {
  return {
    id,
    kind: "geometry",
    name,
    geometry,
    geometryMeta: { geometryKind: "Polygon" },
    style: {},
  };
}

function createScenario() {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: 0,
    sides: [],
    events: [],
    layerStack: [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Features",
        items: [polygon("alpha", "Alpha", alpha), polygon("beta", "Beta", beta)],
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
  useScenarioTime(store).setCurrentTime(100);
  return { store, geo, stateGeometry: useFeatureStateGeometry({ store, geo }) };
}

describe("useFeatureStateGeometry", () => {
  it("records pasted GeoJSON as the feature's geometry from the current time", () => {
    const { store, geo, stateGeometry } = createScenario();
    const text = JSON.stringify({ type: "Feature", properties: {}, geometry: beta });

    expect(stateGeometry.applyGeoJsonText("alpha", text)).toEqual({
      ok: true,
      geometry: beta,
    });

    const item = geo.getGeometryLayerItemById("alpha").layerItem!;
    expect(item.geometry).toEqual(alpha);
    expect(item.state).toEqual([
      { id: expect.any(String), t: 100, patch: { geometry: beta } },
    ]);
    expect(item._state?.geometry).toEqual(beta);

    store.undo();
    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toBeUndefined();
  });

  it("takes another feature's geometry and can delete that feature in the same step", () => {
    const { store, geo, stateGeometry } = createScenario();

    expect(stateGeometry.applyFromFeature("alpha", "beta", true)).toEqual({
      ok: true,
      geometry: beta,
    });

    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toEqual([
      { id: expect.any(String), t: 100, patch: { geometry: beta } },
    ]);
    expect(geo.getGeometryLayerItemById("beta").layerItem).toBeUndefined();

    store.undo();
    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toBeUndefined();
    expect(geo.getGeometryLayerItemById("beta").layerItem?.name).toBe("Beta");
  });

  it("leaves locked features alone", () => {
    const { store, geo, stateGeometry } = createScenario();
    const locked = { ok: false, message: "Feature is locked" };

    geo.updateFeature("beta", { locked: true });
    expect(stateGeometry.applyFromFeature("alpha", "beta", true)).toEqual(locked);
    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toBeUndefined();

    store.undo();
    geo.updateLayer("layer-1", { locked: true });
    expect(stateGeometry.applyGeoJsonText("alpha", JSON.stringify(beta))).toEqual(locked);
    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toBeUndefined();
  });

  it("records nothing when the pasted text is not usable GeoJSON", () => {
    const { geo, stateGeometry } = createScenario();

    expect(stateGeometry.applyGeoJsonText("alpha", "POLYGON((12 62, 13 62))")).toEqual({
      ok: false,
      message: "Clipboard does not contain GeoJSON",
    });
    expect(
      stateGeometry.applyGeoJsonText(
        "alpha",
        JSON.stringify({ type: "Point", coordinates: [12, 62] }),
      ),
    ).toEqual({ ok: false, message: "Expected a Polygon geometry, got Point" });
    expect(geo.getGeometryLayerItemById("alpha").layerItem!.state).toBeUndefined();
  });
});
