// @vitest-environment jsdom
/**
 * The M2 authoring layer end to end: the armed-tool owner, the two sessions, the
 * scenario store and the keyboard contract, over the shared medium-fidelity fakes of
 * the two seams it talks to — the host-owned `TacticalDrawSurface` and the settle-first
 * render feed. Everything below the fakes is the real thing, including the scenario
 * store, so "writes exactly once" is asserted against real state and real undo steps.
 *
 * No gestures are simulated and no transient phase is asserted: a session is moved on
 * through the same handles a pointer would move it on through, and only what a settled
 * session leaves behind is checked.
 */
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import type { TScenario } from "@/scenariostore";
import { useScenarioDraw } from "@/modules/scenarioeditor/useScenarioDraw";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useRecordingStore } from "@/stores/recordingStore";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
} from "@/modules/scenarioeditor/olInjects";
import { createTacticalDrawSurfaceFake } from "@/geo/engines/maplibre/tacticalDrawSurfaceFake";
import { createTacticalGraphicRenderFeedFake } from "@/modules/maplibreview/tacticalGraphicRenderFeedFake";
import { useTacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

// The plain draw interaction owns a real maplibre-gl map; this suite has none, and the
// armed-tool owner only ever asks it to start or cancel a plain tool.
vi.mock("@/composables/maplibreDrawInteraction", () => ({
  useMapLibreDrawInteraction: vi.fn(() => ({
    startDrawing: vi.fn(),
    currentDrawType: ref(null),
    startModify: vi.fn(),
    isModifying: ref(false),
    cancel: vi.fn(),
    isDrawing: ref(false),
    finishPathDrawing: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("@/composables/geoEditing", () => ({ useEditingInteraction: vi.fn() }));

const EDITED_POINTS = [
  [20, 70],
  [21, 71],
];

function createScenario(layerStack?: any[]): TScenario {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [],
    events: [],
    layerStack: layerStack ?? [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Control measures",
        specialization: "controlMeasure",
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
        ],
      },
    ],
  } as any);
  return { store, geo: useGeo(store) } as unknown as TScenario;
}

function controlMeasureIds(scenario: TScenario): string[] {
  return scenario.geo.layersItems.value.flatMap(({ items }) =>
    items.filter(isNTacticalGraphicLayerItem).map((item) => item.id),
  );
}

function storedItem(scenario: TScenario, id = "cm-1"): any {
  return scenario.store.state.layerItemMap[id];
}

function setup(
  setupOptions: { realFeed?: boolean; scenario?: TScenario; activeLayerId?: string } = {},
) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const scenario = setupOptions.scenario ?? createScenario();
  const fake = createTacticalDrawSurfaceFake({
    generateId: () => "cm-new",
    editControlPoints: EDITED_POINTS,
  });
  const feedFake = createTacticalGraphicRenderFeedFake();
  const engineRef = shallowRef<any>({
    map: { getNativeMap: () => ({ queryRenderedFeatures: vi.fn() }) },
    layers: {},
    draw: fake.surface,
  });
  const exposed = {} as ReturnType<typeof useScenarioDraw>;
  const activeLayerId = ref(setupOptions.activeLayerId ?? "layer-1");
  const wrapper = mount(
    defineComponent({
      setup() {
        // The fake feed reproduces settle-first ordering and nothing else, so by design
        // it cannot observe a store-driven re-render. The queued-render hazard only
        // exists on the real feed, whose `featureStateCounter` watcher is `flush: "pre"`.
        const renderFeed = setupOptions.realFeed
          ? useTacticalGraphicRenderFeed(scenario, { surface: () => fake.surface })
          : feedFake.feed;
        Object.assign(exposed, useScenarioDraw({ renderFeed }));
        return {};
      },
      template: "<div />",
    }),
    {
      global: {
        plugins: [pinia],
        provide: {
          [activeScenarioKey as symbol]: scenario,
          [activeScenarioMapEngineKey as symbol]: engineRef,
          [activeLayerKey as symbol]: activeLayerId,
          [activeNativeMapKey as symbol]: shallowRef(null),
          [activeFeatureSelectInteractionKey as symbol]: shallowRef(null),
        },
      },
    },
  );
  let mutations = 0;
  scenario.store.onMutation(() => (mutations += 1));
  return {
    wrapper,
    scenario,
    fake,
    feed: feedFake,
    draw: exposed,
    activeLayerId,
    mutations: () => mutations,
  };
}

describe("drawing a control measure", () => {
  beforeEach(() => vi.clearAllMocks());

  it("commits to the active unlocked control-measure layer", async () => {
    const scenario = createScenario([
      {
        id: "feature-layer",
        kind: "overlay",
        name: "Features",
        items: [],
      },
      {
        id: "cm-top",
        kind: "overlay",
        name: "Top control measures",
        specialization: "controlMeasure",
        items: [],
      },
      {
        id: "cm-active",
        kind: "overlay",
        name: "Active control measures",
        specialization: "controlMeasure",
        items: [],
      },
    ]);
    const { draw, fake } = setup({ scenario, activeLayerId: "cm-active" });

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    fake.drawSession!.commit();
    await nextTick();
    await nextTick();

    expect(storedItem(scenario, "cm-new")._pid).toBe("cm-active");
  });

  it("creates and activates a specialized destination before the first draw", () => {
    const scenario = createScenario([
      { id: "feature-layer", kind: "overlay", name: "Features", items: [] },
    ]);
    const { draw, fake, activeLayerId } = setup({
      scenario,
      activeLayerId: "feature-layer",
    });

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });

    const created = scenario.geo.overlayLayers.value.find(
      (layer) => layer.specialization === "controlMeasure",
    );
    expect(created).toMatchObject({ name: "Control measures", items: [] });
    expect(activeLayerId.value).toBe(created?.id);
    expect(fake.drawSession).not.toBeNull();
  });

  it("does not create another layer when every control-measure layer is locked", () => {
    const scenario = createScenario([
      {
        id: "cm-locked",
        kind: "overlay",
        name: "Locked",
        specialization: "controlMeasure",
        locked: true,
        items: [],
      },
    ]);
    const { draw, fake } = setup({ scenario, activeLayerId: "cm-locked" });

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });

    expect(scenario.geo.overlayLayers.value).toHaveLength(1);
    expect(fake.drawSession).toBeNull();
    expect(draw.armed.value).toEqual({ kind: "none" });
  });

  it("uses the topmost compatible layer, then restores last-used destinations by family", async () => {
    const scenario = createScenario([
      { id: "feature-a", kind: "overlay", name: "Feature A", items: [] },
      { id: "feature-b", kind: "overlay", name: "Feature B", items: [] },
      {
        id: "cm-top",
        kind: "overlay",
        name: "CM top",
        specialization: "controlMeasure",
        items: [],
      },
      {
        id: "cm-last",
        kind: "overlay",
        name: "CM last",
        specialization: "controlMeasure",
        items: [],
      },
    ]);
    const { draw, activeLayerId } = setup({ scenario, activeLayerId: "feature-b" });

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    expect(activeLayerId.value).toBe("cm-top");

    activeLayerId.value = "cm-last";
    await nextTick();
    draw.startDrawing("Point");
    expect(activeLayerId.value).toBe("feature-b");

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    expect(activeLayerId.value).toBe("cm-last");
  });

  it("refuses to edit a control measure in a locked layer", () => {
    const scenario = createScenario([
      {
        id: "cm-locked",
        kind: "overlay",
        name: "Locked",
        specialization: "controlMeasure",
        locked: true,
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
        ],
      },
    ]);
    const { draw, fake } = setup({ scenario, activeLayerId: "cm-locked" });

    draw.startControlMeasureEdit("cm-1");

    expect(draw.armed.value).toEqual({ kind: "none" });
    expect(fake.editSession).toBeNull();
  });

  it("writes exactly once, on settle, and undoes as one step", async () => {
    const { draw, scenario, fake, mutations } = setup();

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    fake.drawSession!.setControlPoints([
      [10, 60],
      [11, 61],
      [12, 62],
    ]);
    expect(mutations()).toBe(0);

    fake.drawSession!.commit();
    await nextTick();
    await nextTick();

    expect(controlMeasureIds(scenario)).toEqual(["cm-1", "cm-new"]);
    expect(storedItem(scenario, "cm-new").controlPoints).toEqual([
      [10, 60],
      [11, 61],
      [12, 62],
    ]);
    scenario.store.undo();
    expect(controlMeasureIds(scenario)).toEqual(["cm-1"]);
  });

  it("writes nothing when Escape aborts the session", async () => {
    const { draw, scenario, fake, mutations } = setup();

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    expect(draw.handleEscape()).toBe(true);
    await nextTick();
    await nextTick();

    expect(controlMeasureIds(scenario)).toEqual(["cm-1"]);
    expect(mutations()).toBe(0);
    expect(draw.armed.value).toEqual({ kind: "none" });
    expect(fake.drawSession).toBeNull();
  });

  it("re-arms on commit when addMultiple is on", async () => {
    const { draw, fake } = setup();
    useMainToolbarStore().addMultiple = true;

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    fake.drawSession!.commit();
    await nextTick();
    await nextTick();

    expect(draw.armed.value).toEqual({ kind: "cmDraw", graphicKind: "phase-line" });
    // A second session, for the next graphic of the same kind.
    expect(fake.calls.draw).toHaveLength(2);
    expect(fake.drawSession).not.toBeNull();
  });

  it("does not re-arm on any abort of a locked tool", async () => {
    const { draw, fake, feed } = setup();
    useMainToolbarStore().addMultiple = true;

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    draw.handleEscape();
    await nextTick();
    await nextTick();

    // Escape escapes a locked tool: one session, and nothing armed after it.
    expect(fake.calls.draw).toHaveLength(1);
    expect(draw.armed.value).toEqual({ kind: "none" });

    // Same disposition when the abort arrives from the feed instead — a time scrub or
    // a layer-visibility toggle mid-draw ends the tool, it does not hand out a new
    // session because `addMultiple` happens to be on.
    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    feed.feed.settle("render");
    await nextTick();
    await nextTick();

    expect(fake.calls.draw).toHaveLength(2);
    expect(draw.armed.value).toEqual({ kind: "none" });
  });
});

describe("the keyboard contract", () => {
  it("swallows Ctrl+Z outright while drawing, leaving the session open", () => {
    const { draw, scenario, fake } = setup();
    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });

    // Swallowed, so `ScenarioEditor` never reaches scenario undo — which would settle
    // a half-drawn graphic, since a `DrawSession` has no history.
    expect(draw.handleUndoKey()).toBe(true);
    expect(fake.drawSession).not.toBeNull();
    expect(scenario.store.canUndo.value).toBe(false);
  });

  it("steers Ctrl+Z into the session's own history while editing", () => {
    const { draw, fake } = setup();
    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setHistory({ canUndo: true });

    expect(draw.handleUndoKey()).toBe(true);
    expect(fake.editSession!.undoCount).toBe(1);
  });

  it("takes Escape at window capture, so an open edit folds and keeps its work", async () => {
    const { draw, scenario, fake } = setup();
    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setControlPoints(EDITED_POINTS);

    // Nothing mounts `KeyboardScenarioActions` here, which is the document-level path
    // being skipped exactly as it is in the app whenever a modal is open, `escEnabled`
    // is false or the target is a Reka popover. tactical-draw's own bubble-phase window
    // listener would abort the session in all of those — skipping `onCommit` and losing
    // the reshaping — so the owner has to take the key ahead of it.
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    await nextTick();

    expect(draw.armed.value).toEqual({ kind: "none" });
    expect(storedItem(scenario).controlPoints).toEqual(EDITED_POINTS);
  });

  it("leaves Escape alone at window capture when nothing is armed", () => {
    const { draw } = setup();
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    const seen = vi.fn();
    document.addEventListener("keydown", seen);
    document.body.dispatchEvent(event);
    document.removeEventListener("keydown", seen);

    expect(seen).toHaveBeenCalledTimes(1);
    expect(draw.armed.value).toEqual({ kind: "none" });
  });

  it("falls through untouched when nothing is armed", () => {
    const { draw } = setup();
    expect(draw.handleEscape()).toBe(false);
    expect(draw.handleEnter()).toBe(false);
    expect(draw.handleUndoKey()).toBe(false);
    expect(draw.handleRedoKey()).toBe(false);
  });
});

describe("changing control-measure options while editing its shape", () => {
  it("keeps a Smooth toggle made while the edit session is open", async () => {
    const { draw, scenario } = setup({ realFeed: true });
    scenario.geo.updateTacticalGraphic("cm-1", { options: { smooth: false } });
    await nextTick();
    draw.arm({ kind: "cmEdit", featureId: "cm-1" });

    // This is the store write emitted by ControlMeasureStyleSettings when Smooth is
    // toggled in the details panel. The real feed then settles and reopens the edit.
    draw.updateControlMeasure("cm-1", { options: { smooth: true } });
    expect(storedItem(scenario).options).toEqual({ smooth: true });
    await nextTick();
    await nextTick();

    expect(storedItem(scenario).options).toEqual({ smooth: true });
    expect(draw.armed.value).toEqual({ kind: "cmEdit", featureId: "cm-1" });
  });
});

describe("recording a control measure's shape", () => {
  it("puts controlPoints in timed state while everything else stays top-level", async () => {
    const { draw, scenario, fake } = setup();
    useRecordingStore().isRecordingGeometry = true;

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setWorkingGraphic({
      id: "cm-1",
      kind: "phase-line",
      controlPoints: EDITED_POINTS,
      options: { width: 42 },
    } as any);
    // Disarming is the settle, and an edit settles by closing and keeping its work.
    draw.arm({ kind: "none" });
    await nextTick();

    const item = storedItem(scenario);
    expect(item.controlPoints).toEqual([
      [10, 60],
      [11, 61],
    ]);
    expect(item.options).toEqual({ width: 42 });
    expect(item.state).toHaveLength(1);
    expect(item.state[0].patch).toEqual({ controlPoints: EDITED_POINTS });
  });

  // The regression these guard: with recording on, the fold goes through
  // `addTacticalGraphicStateControlPoints`, which signals the real feed only by bumping
  // `featureStateCounter` — a `flush: "pre"` watcher, so its `render()` is queued rather
  // than synchronous. `arm()` used to open the replacement session in the same tick, and
  // the queued render's `settle("render")` then killed it before the first click.
  it("arms a draw out of an open recorded edit without the queued render killing it", async () => {
    const { draw, fake } = setup({ realFeed: true });
    useRecordingStore().isRecordingGeometry = true;

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setControlPoints(EDITED_POINTS);

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    await nextTick();
    await nextTick();

    expect(draw.armed.value).toEqual({ kind: "cmDraw", graphicKind: "phase-line" });
    expect(fake.drawSession).not.toBeNull();
  });

  it("arms an edit on another graphic out of an open recorded edit", async () => {
    const { draw, scenario, fake } = setup({ realFeed: true });
    scenario.geo.addFeature(
      {
        id: "cm-2",
        kind: "tacticalGraphic",
        graphicKind: "phase-line",
        controlPoints: [
          [30, 80],
          [31, 81],
        ],
      } as any,
      "layer-1",
    );
    await nextTick();
    useRecordingStore().isRecordingGeometry = true;

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setControlPoints(EDITED_POINTS);

    draw.arm({ kind: "cmEdit", featureId: "cm-2" });
    await nextTick();
    await nextTick();

    expect(draw.armed.value).toEqual({ kind: "cmEdit", featureId: "cm-2" });
    expect(draw.controlMeasureEditFeatureId.value).toBe("cm-2");
  });

  it("writes the shape top-level when recording is off", async () => {
    const { draw, scenario, fake } = setup();

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setControlPoints(EDITED_POINTS);
    draw.arm({ kind: "none" });
    await nextTick();

    const item = storedItem(scenario);
    expect(item.controlPoints).toEqual(EDITED_POINTS);
    expect(item.state ?? []).toHaveLength(0);
  });
});

describe("the façade going away underneath a session", () => {
  beforeEach(() => vi.clearAllMocks());

  // Destroying the façade rejects the session promise without firing `onCommit`, and
  // nothing in the store changed, so no other settle trigger can fire. Without the
  // `onBeforeDetach` hook the reshaping is silently discarded — the one settle path
  // ADR-0006's "an edit closes and keeps its work" cannot reach through the feed.
  it("keeps an open edit's work when a basemap swap detaches the surface", async () => {
    const { draw, scenario, fake } = setup();

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    fake.editSession!.setControlPoints(EDITED_POINTS);
    fake.setDetached(true);
    await nextTick();

    expect(storedItem(scenario).controlPoints).toEqual(EDITED_POINTS);
  });

  it("writes nothing when a draw is detached mid-gesture", async () => {
    const { draw, scenario, fake, mutations } = setup();

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    fake.setDetached(true);
    await nextTick();
    await nextTick();

    // A draw aborts rather than folding: half a graphic is not a graphic.
    expect(controlMeasureIds(scenario)).toEqual(["cm-1"]);
    expect(mutations()).toBe(0);
  });
});
