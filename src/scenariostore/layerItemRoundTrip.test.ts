/**
 * Round-trip over the kind-agnostic base passes.
 *
 * `layerItemBasePasses.test.ts` asserts the *inbound* pass (ISO → epoch, id backfill,
 * `_state` / `_hidden` projection). This file closes the loop: serialize a loaded
 * scenario back out and load it again, so that the outbound stripping
 * (`INTERNAL_NAMES`) and the outbound timestamp coercion (`TIMESTAMP_NAMES`) are
 * proven to be kind-agnostic too, not merely the inbound half.
 *
 * Annotation and measurement matter here specifically: their timed state has never
 * projected before step 2, so this is the first time anything has checked that it
 * survives a save/load cycle.
 */
import { describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioIO } from "@/scenariostore/io";
import { useScenarioTime } from "@/scenariostore/time";
import {
  FIXTURE_T2,
  loadControlMeasureScenarioFixture,
} from "@/testdata/controlMeasureScenario";
import type { Scenario } from "@/types/scenarioModels";
import type {
  AnnotationLayerItem,
  MeasurementLayerItem,
  NScenarioLayerItem,
  ScenarioLayerItem,
  TacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

function loadStore(scenario: Scenario) {
  return useNewScenarioStore(scenario);
}

function serialize(store: ReturnType<typeof loadStore>): Scenario {
  return useScenarioIO(shallowRef(store)).serializeToObject();
}

function overlayItems(scenario: Scenario): ScenarioLayerItem[] {
  return scenario.layerStack
    .filter((layer): layer is Extract<typeof layer, { kind: "overlay" }> => {
      return layer.kind === "overlay";
    })
    .flatMap((layer) => layer.items);
}

function itemById<T extends ScenarioLayerItem>(scenario: Scenario, id: string): T {
  const found = overlayItems(scenario).find((item) => item.id === id);
  if (!found) throw new Error(`No serialized item ${id}`);
  return found as T;
}

function storeItem(store: ReturnType<typeof loadStore>, id: string) {
  return store.state.layerItemMap[id] as NScenarioLayerItem;
}

describe("layer item round trip", () => {
  it("preserves an empty control-measure layer specialization", () => {
    const scenario = loadControlMeasureScenarioFixture();
    scenario.layerStack.push({
      id: "empty-cm-layer",
      kind: "overlay",
      name: "Prepared control measures",
      specialization: "controlMeasure",
      items: [],
    });

    const serialized = serialize(loadStore(scenario));
    const layer = serialized.layerStack.find(
      (candidate) => candidate.id === "empty-cm-layer",
    );

    expect(layer).toMatchObject({
      kind: "overlay",
      specialization: "controlMeasure",
      items: [],
    });
  });

  it("preserves mismatched content and warns without rewriting it", () => {
    const scenario = loadControlMeasureScenarioFixture();
    const overlay = scenario.layerStack.find(
      (layer) =>
        layer.kind === "overlay" && layer.items.some((item) => item.kind === "geometry"),
    )!;
    if (overlay.kind !== "overlay") throw new Error("Expected overlay fixture");
    overlay.specialization = "controlMeasure";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const serialized = serialize(loadStore(scenario));
    const loadedOverlay = serialized.layerStack.find((layer) => layer.id === overlay.id)!;
    if (loadedOverlay.kind !== "overlay") throw new Error("Expected overlay round trip");

    expect(loadedOverlay.items.some((item) => item.kind === "geometry")).toBe(true);
    expect(loadedOverlay.specialization).toBe("controlMeasure");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("mismatched items"));
    warn.mockRestore();
  });

  it("keeps every item of every kind, in order, across a save and load", () => {
    const first = loadStore(loadControlMeasureScenarioFixture());
    const serialized = serialize(first);

    const expected = overlayItems(loadControlMeasureScenarioFixture()).map((item) => [
      item.id,
      item.kind,
    ]);
    expect(overlayItems(serialized).map((item) => [item.id, item.kind])).toEqual(
      expected,
    );

    // And again, so nothing is lost only on the second lap.
    const second = loadStore(serialized);
    expect(overlayItems(serialize(second)).map((item) => item.id)).toEqual(
      expected.map(([id]) => id),
    );
  });

  it("writes state timestamps back as strings and reads them back to the same instant", () => {
    const first = loadStore(loadControlMeasureScenarioFixture());
    const serialized = serialize(first);

    for (const id of ["annotation-note", "measurement-distance", "cm-phase-line"]) {
      const entry = itemById(serialized, id).state![0]!;
      expect(typeof entry.t).toBe("string");
      expect(Date.parse(String(entry.t))).toBe(FIXTURE_T2);
    }

    const second = loadStore(serialized);
    for (const id of ["annotation-note", "measurement-distance", "cm-phase-line"]) {
      const entry = (storeItem(second, id) as { state?: { t: number }[] }).state![0]!;
      expect(entry.t).toBe(FIXTURE_T2);
    }
  });

  it("persists the state ids the load pass backfilled", () => {
    const first = loadStore(loadControlMeasureScenarioFixture());
    // The fixture deliberately omits `state[].id` on the annotation and the control
    // measure, so the ids below exist only because the base pass minted them.
    const backfilled = (storeItem(first, "cm-phase-line") as { state?: { id: string }[] })
      .state![0]!.id;
    expect(backfilled).toBeTruthy();

    const serialized = serialize(first);
    expect(itemById(serialized, "cm-phase-line").state![0]!.id).toBe(backfilled);
    expect(itemById(serialized, "annotation-note").state![0]!.id).toBeTruthy();
  });

  it("strips every internal field from the serialized items", () => {
    const store = loadStore(loadControlMeasureScenarioFixture());
    // Project first, so `_state` and `_hidden` are actually populated and the
    // stripping has something to remove.
    useScenarioTime(store).setCurrentTime(FIXTURE_T2);
    expect(storeItem(store, "cm-phase-line")._state).toBeDefined();

    for (const item of overlayItems(serialize(store))) {
      expect(Object.keys(item).filter((key) => key.startsWith("_"))).toEqual([]);
    }
  });

  it("round-trips annotation and measurement content and their patches", () => {
    const serialized = serialize(loadStore(loadControlMeasureScenarioFixture()));

    const annotation = itemById<AnnotationLayerItem>(serialized, "annotation-note");
    expect(annotation.annotationType).toBe("label");
    expect(annotation.anchor).toEqual({ type: "point", position: [10, 60] });
    expect(annotation.content).toEqual({ text: "before" });
    expect(annotation.state![0]!.patch).toEqual({ content: { text: "after" } });
    expect(Date.parse(String(annotation.visibleFromT))).toBe(
      Date.parse("2025-06-01T06:00:00Z"),
    );

    const measurement = itemById<MeasurementLayerItem>(
      serialized,
      "measurement-distance",
    );
    expect(measurement.measurementType).toBe("distance");
    expect(measurement.precision).toBe(1);
    expect(measurement.source).toEqual({
      type: "geometry",
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [11, 61],
        ],
      },
    });
    expect(measurement.state![0]!.patch).toEqual({ precision: 3 });
  });

  it("round-trips control measure fields verbatim, unknown kinds included", () => {
    const serialized = serialize(loadStore(loadControlMeasureScenarioFixture()));

    const phaseLine = itemById<TacticalGraphicLayerItem>(serialized, "cm-phase-line");
    expect(phaseLine.graphicKind).toBe("phase-line");
    expect(phaseLine.standardIdentity).toBe("3");
    expect(phaseLine.controlPoints).toEqual([
      [10, 60],
      [11, 60],
    ]);
    expect(phaseLine.textAmplifiers).toEqual({ T: "BLUE" });
    expect(phaseLine.state![0]!.patch).toEqual({
      controlPoints: [
        [10, 61],
        [11, 61],
      ],
    });

    const authored = itemById<TacticalGraphicLayerItem>(serialized, "cm-authored-style");
    // The authored style is the library's own `ControlMeasureStyle`, stored verbatim —
    // and the resolved colour/dash are derived, so they must NOT appear here.
    expect(authored.style).toEqual({ color: "#ff00ff", strokeDash: [1, 2] });
    expect(authored.status).toBe("planned");

    const unknown = itemById<TacticalGraphicLayerItem>(serialized, "cm-unknown-kind");
    expect(unknown.graphicKind).toBe("phase-line-from-the-future");
    expect(unknown.controlPoints).toEqual([
      [10, 54],
      [11, 54],
    ]);
  });

  it("projects identically after a round trip", () => {
    const first = loadStore(loadControlMeasureScenarioFixture());
    const second = loadStore(serialize(first));

    useScenarioTime(first).setCurrentTime(FIXTURE_T2);
    useScenarioTime(second).setCurrentTime(FIXTURE_T2);

    for (const id of [
      "annotation-note",
      "measurement-distance",
      "cm-phase-line",
      "geo-point",
    ]) {
      expect(storeItem(second, id)._state).toEqual(storeItem(first, id)._state);
      expect(storeItem(second, id)._hidden).toBe(storeItem(first, id)._hidden);
    }
  });
});
