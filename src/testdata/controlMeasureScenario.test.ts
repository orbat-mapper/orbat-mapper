// @vitest-environment jsdom
/**
 * The M1 end-to-end pass over the hand-authored control-measure fixture.
 *
 * "End-to-end" here means what ADR-0006 says CI can reach and no further: a scenario
 * *file* loads, projects at a time T, is selectable, and exports. Outbound testing
 * stops at the `Graphic[]` — nothing in this file knows whether the map drew, and
 * nothing simulates a gesture, because M1 has no sessions.
 *
 * Every other M1 test builds its own inline item. This one is the only place where the
 * whole chain runs over a single artifact, so a seam that was widened in isolation but
 * left unwired would show up here.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, shallowRef } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import { useGeo } from "@/scenariostore/geo";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { buildTacticalGraphicRenderPlan } from "@/modules/maplibreview/tacticalGraphicRenderPlan";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";
import { useScenarioFeatureSelection } from "@/modules/scenarioeditor/useScenarioFeatureSelection";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  controlMeasureExtentFeature,
  MONOCHROME_COLOR,
  PLANNED_STROKE_DASH,
} from "@/geo/controlMeasures";
import { identityColor } from "@/symbology/identityColors";
import {
  FIXTURE_T0,
  FIXTURE_T1,
  FIXTURE_T2,
  loadControlMeasureScenarioFixture,
} from "@/testdata/controlMeasureScenario";
import type { TScenario } from "@/scenariostore";
import type {
  NScenarioLayerItem,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import "@/dayjs";

function loadFixture() {
  const store = useNewScenarioStore(loadControlMeasureScenarioFixture());
  const geo = useGeo(store);
  const time = useScenarioTime(store);
  return { store, geo, time };
}

function measures(layers: ReturnType<typeof useGeo>["layerItemsLayers"]["value"]) {
  return buildTacticalGraphicRenderPlan(layers, { filterVisible: true });
}

function byId(graphics: readonly { id: string }[], id: string) {
  return graphics.find((g) => g.id === id) as ControlMeasure | undefined;
}

describe("control measure fixture — load", () => {
  it("warns exactly once for the whole scenario, naming the unsupported kind", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    loadFixture();

    // Unsupported kinds remain aggregated into one message even when specialization
    // mismatch warnings are also emitted for affected legacy layers.
    const unsupportedWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes("Unsupported control measure kinds"),
    );
    expect(unsupportedWarnings).toHaveLength(1);
    expect(unsupportedWarnings[0]![0]).toContain("phase-line-from-the-future=1");
    warn.mockRestore();
  });

  it("keeps the unsupported control measure in the store rather than dropping it", () => {
    const { store } = loadFixture();
    const item = store.state.layerItemMap["cm-unknown-kind"] as NScenarioLayerItem;
    expect(item).toBeDefined();
    expect(item.kind).toBe("tacticalGraphic");
  });

  it("loads all four item kinds, keyed by their owning layer", () => {
    const { geo } = loadFixture();
    const layers = geo.layerItemsLayers.value;
    expect(layers.map((layer) => layer.id)).toEqual([
      "layer-control-measures",
      "layer-mixed",
    ]);
    expect(new Set(layers.flatMap((l) => l.items).map((i) => i.kind))).toEqual(
      new Set(["tacticalGraphic", "geometry", "annotation", "measurement"]),
    );
    expect(geo.getLayerItemById("cm-bottom-layer").layer?.id).toBe("layer-mixed");
  });

  it("describes a control measure by its kind in the searchable item list", () => {
    const { geo } = loadFixture();
    const entry = geo.itemsInfo.value.find((i) => i.id === "cm-phase-line");
    // Used to be a flat "Point" placeholder, which made every control measure look
    // like a marker in search results and in the icon lookup.
    expect(entry).toMatchObject({ type: "tacticalGraphic", name: "PL BLUE" });
  });
});

describe("control measure fixture — render plan", () => {
  it("emits the drawable measures bottom-first and reports the rest", () => {
    const { geo } = loadFixture();
    const plan = measures(geo.layerItemsLayers.value);

    // `layer-mixed` is below `layer-control-measures` in the stack, so it renders first.
    // `cm-late` is outside its time window at T0, `cm-hidden` is toggled off, and
    // `cm-unknown-kind` cannot be drawn by the pinned library.
    expect(plan.graphics.map((g) => g.id)).toEqual([
      "cm-bottom-layer",
      "cm-phase-line",
      "cm-boundary-planned",
      "cm-monochrome",
      "cm-authored-style",
    ]);
    expect(plan.unsupportedIds).toEqual(["cm-unknown-kind"]);
    expect(plan.duplicateIds).toEqual([]);
  });

  it("carries the host projections into the batch", () => {
    const { geo } = loadFixture();
    const { graphics } = measures(geo.layerItemsLayers.value);

    expect(byId(graphics, "cm-phase-line")!.style).toMatchObject({
      color: identityColor("3"),
      strokeDash: [],
    });
    expect(byId(graphics, "cm-boundary-planned")!.style).toMatchObject({
      color: identityColor("6"),
      strokeDash: [...PLANNED_STROKE_DASH],
    });
    expect(byId(graphics, "cm-monochrome")!.style).toMatchObject({
      color: MONOCHROME_COLOR,
    });
    expect(byId(graphics, "cm-authored-style")!.style).toMatchObject({
      color: "#ff00ff",
      strokeDash: [1, 2],
    });
  });

  it("keeps a manually hidden measure out of the batch even with the layers panel open", () => {
    const { geo } = loadFixture();
    const ids = buildTacticalGraphicRenderPlan(geo.layerItemsLayers.value, {
      filterVisible: false,
    }).graphics.map((g) => g.id);
    // `cm-late` returns (time hiding is off), `cm-hidden` does not (the eye toggle
    // is unconditional).
    expect(ids).toContain("cm-late");
    expect(ids).not.toContain("cm-hidden");
  });
});

describe("control measure fixture — projection at time T", () => {
  it("projects every kind's timed state, and moves the render batch with it", () => {
    const { store, geo, time } = loadFixture();

    expect(store.state.currentTime).toBe(FIXTURE_T0);
    const before = byId(measures(geo.layerItemsLayers.value).graphics, "cm-phase-line");
    expect(before!.controlPoints).toEqual([
      [10, 60],
      [11, 60],
    ]);

    time.setCurrentTime(FIXTURE_T2);

    const item = (id: string) => store.state.layerItemMap[id] as NScenarioLayerItem;
    expect((item("annotation-note")._state as { content?: unknown })?.content).toEqual({
      text: "after",
    });
    expect(
      (item("measurement-distance")._state as { precision?: number })?.precision,
    ).toBe(3);
    expect((item("geo-point")._state as { geometry?: unknown })?.geometry).toEqual({
      type: "Point",
      coordinates: [12, 62],
    });

    const plan = measures(geo.layerItemsLayers.value);
    expect(byId(plan.graphics, "cm-phase-line")!.controlPoints).toEqual([
      [10, 61],
      [11, 61],
    ]);
    // `cm-late` is in force past T1, so the batch grows by exactly that one.
    expect(plan.graphics.map((g) => g.id)).toContain("cm-late");
  });

  it("treats visibleFromT as an exclusive bound for a control measure", () => {
    const { geo, time } = loadFixture();
    time.setCurrentTime(FIXTURE_T1);
    expect(measures(geo.layerItemsLayers.value).graphics.map((g) => g.id)).not.toContain(
      "cm-late",
    );
  });
});

describe("control measure fixture — selection", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().clear();
  });

  it("selects a control measure and reveals its owning layer", async () => {
    const { geo } = loadFixture();
    const zoomToFeature = vi.fn();
    let apply!: ReturnType<
      typeof useScenarioFeatureSelection
    >["applyScenarioFeatureSelection"];

    mount(
      defineComponent({
        setup() {
          ({ applyScenarioFeatureSelection: apply } = useScenarioFeatureSelection());
          return () => null;
        },
      }),
      {
        global: {
          provide: {
            // The real `geo` off the loaded fixture — the point of this test is that
            // selection resolves a control measure through the store, not a stub.
            [activeScenarioKey as symbol]: { geo },
            [activeScenarioMapEngineKey as symbol]: shallowRef({
              layers: { zoomToFeature },
            } as never),
          },
        },
      },
    );

    apply({ featureIds: ["cm-phase-line"] });

    expect(useSelectedItems().selectedFeatureIds.value.has("cm-phase-line")).toBe(true);
    expect(geo.getLayerById("layer-control-measures")?._isOpen).toBe(true);
    // The layer resolves even through the old geometry-only lookup (it returns the
    // layer while dropping the item), so the load-bearing part is that the item
    // itself resolves and that a zoom is actually requested for it.
    expect(geo.getLayerItemById("cm-phase-line").layerItem?.kind).toBe("tacticalGraphic");
    await nextTick();
    expect(zoomToFeature).toHaveBeenCalledWith("cm-phase-line");
  });

  it("has a zoom target for a control measure, projected at the current time", () => {
    const { store, time } = loadFixture();
    const item = () =>
      store.state.layerItemMap["cm-phase-line"] as TacticalGraphicLayerItem;

    // What `zoomToFeature` feeds to `fitGeometry`. Geometry items reach it through
    // their own geometry; a control measure has none, so this is the only source.
    expect(controlMeasureExtentFeature(item())?.geometry).toEqual({
      type: "MultiPoint",
      coordinates: [
        [10, 60],
        [11, 60],
      ],
    });

    time.setCurrentTime(FIXTURE_T2);
    expect(controlMeasureExtentFeature(item())?.geometry).toEqual({
      type: "MultiPoint",
      coordinates: [
        [10, 61],
        [11, 61],
      ],
    });
  });

  it("still frames a control measure whose kind cannot be drawn", () => {
    const { store } = loadFixture();
    const unknown = store.state.layerItemMap[
      "cm-unknown-kind"
    ] as TacticalGraphicLayerItem;
    // Deliberately built from control points rather than a render, so "zoom to"
    // survives a graphic the pinned library has no definition for.
    expect(controlMeasureExtentFeature(unknown)?.geometry).toMatchObject({
      type: "MultiPoint",
    });
  });
});

describe("control measure fixture — export", () => {
  function converter(store: ReturnType<typeof useNewScenarioStore>) {
    return useGeoJsonConverter({
      geo: useGeo(store),
      unitActions: useUnitManipulations(store),
    } as unknown as TScenario);
  }

  it("fans each drawable control measure out into rendered features tagged with its id", () => {
    const { store } = loadFixture();
    const collection = converter(store).convertScenarioFeaturesToGeoJson();

    const cmIds = collection.features
      .map((f) => f.properties?.cmId)
      .filter((id): id is string => typeof id === "string");
    expect(new Set(cmIds)).toEqual(
      new Set([
        "cm-phase-line",
        "cm-boundary-planned",
        "cm-monochrome",
        "cm-authored-style",
        "cm-late",
        "cm-hidden",
        "cm-bottom-layer",
      ]),
    );
    // One stored graphic becomes N features, so the export is strictly larger than
    // the item count it came from.
    expect(cmIds.length).toBeGreaterThan(7);

    // Export does not filter on visibility — the same rule the geometry path follows.
    expect(cmIds).toContain("cm-hidden");
    // …but an unsupported kind cannot be rendered, so it contributes nothing.
    expect(cmIds).not.toContain("cm-unknown-kind");
  });

  it("exports the geometry item alongside the control measures", () => {
    const { store } = loadFixture();
    const collection = converter(store).convertScenarioFeaturesToGeoJson({
      includeIdInProperties: true,
    });
    const geometryFeature = collection.features.find(
      (f) => f.properties?.id === "geo-point",
    );
    expect(geometryFeature?.geometry).toEqual({ type: "Point", coordinates: [10, 60] });
  });

  it("exports the parameter bag needed to reconstruct the graphic", () => {
    const { store } = loadFixture();
    const collection = converter(store).convertScenarioFeaturesToGeoJson();
    const feature = collection.features.find(
      (f) => f.properties?.cmId === "cm-authored-style",
    );

    expect(feature?.properties).toMatchObject({
      graphicKind: "phase-line",
      standardIdentity: "3",
      status: "planned",
      // The authored style, not the resolved one: a reconstruction re-runs the host
      // projections rather than having a colour baked in twice.
      style: { color: "#ff00ff", strokeDash: [1, 2] },
      controlPoints: [
        [10, 57],
        [11, 57],
      ],
    });
  });

  it("exports the graphic as projected at the current time", () => {
    const { store, time } = loadFixture();
    time.setCurrentTime(FIXTURE_T2);

    const collection = converter(store).convertScenarioFeaturesToGeoJson();
    const feature = collection.features.find(
      (f) => f.properties?.cmId === "cm-phase-line",
    );
    expect(feature?.properties?.controlPoints).toEqual([
      [10, 61],
      [11, 61],
    ]);
  });
});
