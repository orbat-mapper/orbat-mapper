// @vitest-environment jsdom
/**
 * Zoom and pan are shared chrome over every layer-item kind — the same Z/P shortcuts
 * and the same context menu act on whatever is selected. `toGeoJsonFeature` rejected
 * anything without a `geometry`, so both silently did nothing once a control measure
 * was selectable.
 */
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useGeoStore } from "@/stores/geoStore";
import { useScenarioFeatureActions } from "@/composables/scenarioActions";
import type { TScenario } from "@/scenariostore";
import "@/dayjs";

const CONTROL_POINTS = [
  [10, 60],
  [11, 61],
];

function createScenario(): TScenario {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [],
    events: [],
    layerStack: [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Control measures",
        items: [
          {
            id: "cm-1",
            kind: "tacticalGraphic",
            graphicKind: "phase-line",
            controlPoints: CONTROL_POINTS,
          },
        ],
      },
    ],
  } as any);
  return { store, geo: useGeo(store) } as unknown as TScenario;
}

describe("zoom and pan on a control measure", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("frames a control measure through its control points", () => {
    const activeScenario = createScenario();
    const geoStore = useGeoStore();
    const zoomToGeometry = vi
      .spyOn(geoStore, "zoomToGeometry")
      .mockImplementation(() => {});
    const { onFeatureAction } = useScenarioFeatureActions({ activeScenario });

    onFeatureAction("cm-1", "zoom");

    expect(zoomToGeometry).toHaveBeenCalledTimes(1);
    const collection = zoomToGeometry.mock.calls[0][0] as any;
    expect(collection.features[0].geometry).toEqual({
      type: "MultiPoint",
      coordinates: CONTROL_POINTS,
    });
  });

  it("pans to a control measure", () => {
    const activeScenario = createScenario();
    const geoStore = useGeoStore();
    const panToLocation = vi
      .spyOn(geoStore, "panToLocation")
      .mockImplementation(() => {});
    const { onFeatureAction } = useScenarioFeatureActions({ activeScenario });

    onFeatureAction("cm-1", "pan");

    expect(panToLocation).toHaveBeenCalledTimes(1);
    expect(panToLocation.mock.calls[0][0]).toEqual([10.5, 60.5]);
  });
});
