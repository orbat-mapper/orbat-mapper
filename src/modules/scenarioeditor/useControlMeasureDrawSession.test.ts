/**
 * Commit-on-settle over the shared medium-fidelity fake of the host-owned
 * `TacticalDrawSurface` seam, which rejects with the **real** `TacticalDrawAbortError`
 * so the abort path is exercised as the library actually produces it.
 *
 * Nothing here simulates gestures — the session is driven through the same handles a
 * pointer would drive.
 */
import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { TScenario } from "@/scenariostore";
import { createTacticalDrawSurfaceFake } from "@/geo/engines/maplibre/tacticalDrawSurfaceFake";
import { createTacticalGraphicRenderFeedFake } from "@/modules/maplibreview/tacticalGraphicRenderFeedFake";
import { useControlMeasureDrawSession } from "@/modules/scenarioeditor/useControlMeasureDrawSession";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

function createScenario(): TScenario {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [],
    events: [],
    layerStack: [],
  } as any);
  return { store, geo: useGeo(store) } as unknown as TScenario;
}

function controlMeasureIds(scenario: TScenario): string[] {
  return scenario.geo.layersItems.value.flatMap(({ items }) =>
    items.filter(isNTacticalGraphicLayerItem).map((item) => item.id),
  );
}

function setup() {
  const scenario = createScenario();
  const fake = createTacticalDrawSurfaceFake({ generateId: () => "cm-1" });
  const { feed, renders } = createTacticalGraphicRenderFeedFake();
  const settled: { committed: boolean; graphicKind: string }[] = [];
  const scope = effectScope();
  const draw = scope.run(() =>
    useControlMeasureDrawSession({
      scenario,
      surface: () => fake.surface,
      renderFeed: feed,
      onSettled: (result) => settled.push(result),
    }),
  )!;
  return { scenario, draw, fake, feed, renders, settled, scope };
}

describe("useControlMeasureDrawSession", () => {
  it("exposes the session's own point bounds while drawing", () => {
    const { draw } = setup();
    draw.start("phase-line");
    expect(draw.progress.value).toEqual({
      graphicKind: "phase-line",
      pointCount: 2,
      minControlPoints: 2,
      maxControlPoints: undefined,
      canCommit: true,
    });
  });

  it("writes nothing to the store mid-gesture", () => {
    const { draw, scenario, fake } = setup();
    draw.start("phase-line");
    fake.drawSession!.setControlPoints([
      [10, 60],
      [11, 61],
      [12, 62],
    ]);

    expect(draw.progress.value?.pointCount).toBe(3);
    expect(controlMeasureIds(scenario)).toEqual([]);
  });

  it("folds a settled session into the store exactly once and re-renders", async () => {
    const { draw, scenario, fake, renders, settled } = setup();
    draw.start("phase-line");
    fake.drawSession!.commit();
    await nextTick();
    await nextTick();

    expect(controlMeasureIds(scenario)).toEqual(["cm-1"]);
    expect(renders).toEqual(["commit"]);
    expect(settled).toEqual([{ committed: true, graphicKind: "phase-line" }]);
    expect(draw.progress.value).toBeNull();

    // One settled session, one undo step.
    scenario.store.undo();
    expect(controlMeasureIds(scenario)).toEqual([]);
  });

  it("treats an abort as a normal outcome that writes nothing", async () => {
    const { draw, scenario, feed, settled } = setup();
    draw.start("phase-line");
    // The settle-first guard's draw disposition, reached the way the feed reaches it.
    feed.settle("render");
    await nextTick();
    await nextTick();

    expect(controlMeasureIds(scenario)).toEqual([]);
    expect(settled).toEqual([{ committed: false, graphicKind: "phase-line" }]);
    expect(draw.progress.value).toBeNull();
  });

  it("ignores a superseded session's rejection", async () => {
    const { draw, settled, feed } = setup();
    draw.start("phase-line");
    feed.settle("arm");
    draw.start("boundary");
    await nextTick();
    await nextTick();

    expect(settled).toEqual([]);
    expect(draw.progress.value?.graphicKind).toBe("boundary");
  });

  it("does not cancel when it holds no session", () => {
    const { feed, fake } = setup();
    feed.settle("render");
    expect(fake.calls.cancel).toEqual([]);
  });

  it("rejects a draw against a missing surface without arming anything", () => {
    const scope = effectScope();
    const draw = scope.run(() =>
      useControlMeasureDrawSession({
        scenario: createScenario(),
        surface: () => null,
        onSettled: () => {},
      }),
    )!;
    draw.start("phase-line");
    expect(draw.progress.value).toBeNull();
  });

  it("writes nothing when the façade is detached mid-gesture", async () => {
    const scenario = createScenario();
    // A basemap swap: every authoring door rejects with `TacticalDrawAbortError`.
    const fake = createTacticalDrawSurfaceFake({ detached: true });
    const settled: { committed: boolean }[] = [];
    const scope = effectScope();
    const draw = scope.run(() =>
      useControlMeasureDrawSession({
        scenario,
        surface: () => fake.surface,
        onSettled: (result) => settled.push(result),
      }),
    )!;

    draw.start("phase-line");
    await nextTick();
    await nextTick();

    expect(controlMeasureIds(scenario)).toEqual([]);
    expect(settled).toEqual([{ committed: false, graphicKind: "phase-line" }]);
    scope.stop();
  });
});
