/**
 * Commit-on-settle for the *edit* half, over the shared medium-fidelity fake of the
 * host-owned `TacticalDrawSurface` seam (real `TacticalDrawAbortError` included).
 *
 * The behaviour that separates edit from draw is the settle disposition: where a draw
 * aborts, an edit closes and keeps its work. Both the "settled by the feed" and the
 * "closed on its own" paths are exercised. Nothing here simulates gestures — the
 * session is driven through the same handles a pointer would drive.
 */
import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { TScenario } from "@/scenariostore";
import { createTacticalDrawSurfaceFake } from "@/geo/engines/maplibre/tacticalDrawSurfaceFake";
import { createTacticalGraphicRenderFeedFake } from "@/modules/maplibreview/tacticalGraphicRenderFeedFake";
import { useControlMeasureEditSession } from "@/modules/scenarioeditor/useControlMeasureEditSession";
import type { SettleReason } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

/** The working geometry every session in here is moved to. */
const EDITED_POINTS = [
  [20, 70],
  [21, 71],
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
            controlPoints: [
              [10, 60],
              [11, 61],
            ],
          },
          {
            // An import can carry a pixel-denominated size; nothing drawn in the app
            // can, since every draw bakes to ground on commit.
            id: "cm-screen",
            kind: "tacticalGraphic",
            graphicKind: "boundary",
            controlPoints: [
              [10, 60],
              [11, 61],
            ],
            options: { echelon: "battalion", echelonSizePixels: 16 },
          },
          {
            id: "cm-unsupported",
            kind: "tacticalGraphic",
            graphicKind: "not-a-real-kind",
            controlPoints: [[10, 60]],
          },
        ],
      },
    ],
  } as any);
  return { store, geo: useGeo(store) } as unknown as TScenario;
}

function storedControlPoints(scenario: TScenario, id = "cm-1") {
  return (scenario.store.state.layerItemMap[id] as any).controlPoints;
}

function setup({ recordShape = false } = {}) {
  const scenario = createScenario();
  // The session opens on the stored geometry and is moved to `EDITED_POINTS`, which is
  // what a settled edit must fold in.
  const fake = createTacticalDrawSurfaceFake({ editControlPoints: EDITED_POINTS });
  const { feed, renders } = createTacticalGraphicRenderFeedFake();
  const settled: {
    committed: boolean;
    featureId: string;
    settleReason?: SettleReason;
  }[] = [];
  const scope = effectScope();
  const edit = scope.run(() =>
    useControlMeasureEditSession({
      scenario,
      surface: () => fake.surface,
      renderFeed: feed,
      recordShape: () => recordShape,
      onSettled: (result) => settled.push(result as any),
    }),
  )!;
  return { scenario, edit, fake, feed, renders, settled, scope };
}

describe("useControlMeasureEditSession", () => {
  /**
   * Label drag is additive, not a mode swap: reshape and transform stay in the set, so
   * turning it on never takes the handles away. It is also sticky across sessions —
   * placing several labels means editing several graphics in a row.
   */
  describe("label drag mode", () => {
    it("is off by default and leaves the library's own mode set", () => {
      const { edit, fake } = setup();
      edit.start("cm-1");
      expect(edit.labelDrag.value).toBe(false);
      expect(fake.editSession!.modes).toEqual(["reshape", "transform"]);
    });

    it("adds the mode to the open session without closing it", () => {
      const { edit, fake, settled } = setup();
      edit.start("cm-1");
      edit.setLabelDrag(true);

      expect(fake.editSession!.modes).toEqual(["reshape", "transform", "labeldrag"]);
      // Nothing settled: mode is session state, not model state.
      expect(settled).toEqual([]);
      expect(edit.featureId.value).toBe("cm-1");
    });

    it("stays on for the next session and comes back off", () => {
      const { edit, fake } = setup();
      edit.setLabelDrag(true);
      edit.start("cm-1");
      expect(fake.editSession!.modes).toEqual(["reshape", "transform", "labeldrag"]);

      edit.stop();
      edit.setLabelDrag(false);
      edit.start("cm-1");
      expect(fake.editSession!.modes).toEqual(["reshape", "transform"]);
    });
  });

  // The point of the mode: a dragged label has to survive the session.
  it("folds a moved label's placement into the store", async () => {
    const { edit, scenario, fake } = setup();
    edit.start("cm-1");
    edit.setLabelDrag(true);
    fake.editSession!.setWorkingGraphic({
      ...fake.editSession!.startMeasure,
      amplifierPlacements: { T: { offset: [12, -8] } },
    } as any);
    edit.stop();
    await nextTick();

    expect(
      (scenario.store.state.layerItemMap["cm-1"] as any).amplifierPlacements,
    ).toEqual({ T: { offset: [12, -8] } });
  });

  // An edit must never silently re-anchor a graphic: reshaping a ground-sized boundary
  // must not freeze its glyph to the zoom that happened to be showing, and reshaping a
  // screen-anchored import must not bake it just because it was touched.
  it("edits at whatever size anchor the graphic already encodes", () => {
    const { edit, fake } = setup();

    edit.start("cm-1");
    edit.stop();
    edit.start("cm-screen");

    expect(fake.calls.editSizeAnchor).toEqual(["ground", "screen"]);
  });

  it("opens a session on a control measure and refuses everything else", () => {
    const { edit, fake } = setup();

    expect(edit.start("cm-1")).toBe(true);
    expect(edit.featureId.value).toBe("cm-1");
    expect(fake.calls.edit).toHaveLength(1);

    // Unknown kinds are filtered out of the render batch, so there is nothing to edit.
    expect(edit.start("cm-unsupported")).toBe(false);
    expect(edit.start("nope")).toBe(false);
  });

  it("writes nothing to the store while the session is open", () => {
    const { edit, scenario } = setup();
    edit.start("cm-1");
    expect(storedControlPoints(scenario)).toEqual([
      [10, 60],
      [11, 61],
    ]);
  });

  it("closes and keeps its work when the feed settles, before the feed re-renders", async () => {
    const { edit, scenario, feed, renders, settled } = setup();
    edit.start("cm-1");

    // Exactly how a time scrub or a layer-visibility toggle reaches it.
    feed.render("render");

    // Folded synchronously, inside the settle, so the batch the feed then builds
    // already carries the new geometry — and the fold did not re-enter `render()`.
    expect(storedControlPoints(scenario)).toEqual(EDITED_POINTS);
    expect(renders).toEqual(["render"]);
    await nextTick();
    expect(settled).toEqual([
      { committed: true, featureId: "cm-1", settleReason: "render" },
    ]);
  });

  it("folds exactly once and re-renders when the session closes on its own", async () => {
    const { edit, scenario, fake, renders, settled } = setup();
    edit.start("cm-1");

    fake.editSession!.close();
    await nextTick();

    expect(storedControlPoints(scenario)).toEqual(EDITED_POINTS);
    expect(renders).toEqual(["commit"]);
    expect(settled).toEqual([{ committed: true, featureId: "cm-1" }]);
    expect(edit.featureId.value).toBeNull();

    // One settled session, one undo step.
    scenario.store.undo();
    expect(storedControlPoints(scenario)).toEqual([
      [10, 60],
      [11, 61],
    ]);
  });

  it("never writes back the resolved style", () => {
    const { edit, scenario, fake } = setup();
    edit.start("cm-1");
    // Resolved at edit start from the identity projection. It must not come back.
    fake.editSession!.setWorkingGraphic({
      id: "cm-1",
      kind: "phase-line",
      controlPoints: EDITED_POINTS,
      style: { color: "#ff0000" },
    } as any);
    fake.editSession!.close();

    expect((scenario.store.state.layerItemMap["cm-1"] as any).style).toBeUndefined();
  });

  it("writes nothing when the session aborts", async () => {
    const { edit, scenario, fake, settled } = setup();
    edit.start("cm-1");

    fake.editSession!.abort();
    // Two ticks: the rejection propagates through the `.then` before the `.catch`.
    await nextTick();
    await nextTick();

    expect(storedControlPoints(scenario)).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(settled).toEqual([{ committed: false, featureId: "cm-1" }]);
    expect(edit.featureId.value).toBeNull();
  });

  it("drives the session's own history rather than scenario undo", () => {
    const { edit, fake } = setup();
    edit.start("cm-1");
    const session = fake.editSession!;
    session.setHistory({ canUndo: true });

    expect(edit.canUndo.value).toBe(true);
    expect(edit.undo()).toBe(true);
    expect(session.undoCount).toBe(1);

    edit.stop();
    // Nothing open: the caller falls back to scenario undo.
    expect(edit.undo()).toBe(false);
  });

  it("records the settled shape into state[] when geometry recording is on", () => {
    const { edit, scenario } = setup({ recordShape: true });
    edit.start("cm-1");
    edit.stop();

    const item = scenario.store.state.layerItemMap["cm-1"] as any;
    // Top-level shape untouched; the patch projects over it at the current time.
    expect(item.controlPoints).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(item.state).toHaveLength(1);
    expect(item.state[0].patch).toEqual({ controlPoints: EDITED_POINTS });
  });
});
