// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useScenarioDraw,
  type ScenarioKeyboardOwner,
} from "@/modules/scenarioeditor/useScenarioDraw";
import { useSelectedItems } from "@/stores/selectedStore";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioKeyboardOwnerKey,
} from "@/components/injects";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
} from "@/modules/scenarioeditor/olInjects";
import { createTacticalDrawSurfaceFake } from "@/geo/engines/maplibre/tacticalDrawSurfaceFake";
import type { RenderedUnitFeature } from "@/modules/scenarioeditor/unitSnapCandidates";

const mocks = vi.hoisted(() => ({
  useMapLibreDrawInteraction: vi.fn(),
  useEditingInteraction: vi.fn(),
  mapLibreStartDrawing: vi.fn(),
  mapLibreStartModify: vi.fn(),
  mapLibreCancel: vi.fn(),
  mapLibreFinishPathDrawing: vi.fn(),
}));

vi.mock("@/composables/maplibreDrawInteraction", () => ({
  useMapLibreDrawInteraction: mocks.useMapLibreDrawInteraction,
}));

vi.mock("@/composables/geoEditing", () => ({
  useEditingInteraction: mocks.useEditingInteraction,
}));

function createInteraction() {
  return {
    startDrawing: mocks.mapLibreStartDrawing,
    currentDrawType: ref(null),
    startModify: mocks.mapLibreStartModify,
    isModifying: ref(false),
    cancel: mocks.mapLibreCancel,
    isDrawing: ref(false),
    finishPathDrawing: mocks.mapLibreFinishPathDrawing,
    destroy: vi.fn(),
  };
}

function createScenario() {
  return {
    store: {
      groupUpdate: vi.fn((fn: () => void) => fn()),
    },
    geo: {
      layerItemsLayers: { value: [] },
      getGeometryLayerItemById: vi.fn(() => ({})),
      getLayerItemById: vi.fn((id: string) => ({
        layerItem: {
          id,
          kind: "tacticalGraphic",
          graphicKind: "phase-line",
          controlPoints: [
            [0, 0],
            [1, 1],
          ],
        },
      })),
      updateTacticalGraphic: vi.fn(),
      deleteFeature: vi.fn(),
    },
  };
}

function createRenderFeed() {
  return {
    render: vi.fn(),
    settle: vi.fn(),
    onSettle: vi.fn(() => vi.fn()),
    lastPlan: null,
  };
}

function mountHarness({
  engineRef = shallowRef(),
  scenario = createScenario(),
  pinia = createPinia(),
  renderFeed,
  keyboardOwnerRef = shallowRef<ScenarioKeyboardOwner | null>(null),
}: {
  engineRef?: ReturnType<typeof shallowRef>;
  scenario?: ReturnType<typeof createScenario>;
  pinia?: ReturnType<typeof createPinia>;
  renderFeed?: ReturnType<typeof createRenderFeed>;
  keyboardOwnerRef?: ReturnType<typeof shallowRef<ScenarioKeyboardOwner | null>>;
} = {}) {
  setActivePinia(pinia);
  const activeLayer = ref("layer-1");
  const nativeMap = shallowRef(null);
  const featureSelect = shallowRef(null);
  const exposedDraw = {} as ReturnType<typeof useScenarioDraw>;
  const wrapper = mount(
    defineComponent({
      setup() {
        Object.assign(exposedDraw, useScenarioDraw({ renderFeed: renderFeed as any }));
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
          [activeLayerKey as symbol]: activeLayer,
          [activeNativeMapKey as symbol]: nativeMap,
          [activeFeatureSelectInteractionKey as symbol]: featureSelect,
          [scenarioKeyboardOwnerKey as symbol]: keyboardOwnerRef,
        },
      },
    },
  );
  return { wrapper, draw: exposedDraw, engineRef, scenario, keyboardOwnerRef };
}

function createEngine({
  renderedFeatures = [],
}: { renderedFeatures?: RenderedUnitFeature[] } = {}) {
  // The shared surface fake. Sessions are opened but never settled here: these tests
  // are about the armed-tool owner, not about what a settled session folds in — that
  // is `controlMeasureAuthoring.test.ts`.
  const fake = createTacticalDrawSurfaceFake();
  // Stable across calls: `unitSnapCandidates` re-reads the native map on every snap
  // resolution, so a fresh object per call would hide a captured-map regression.
  const nativeMap = {
    getLayersOrder: vi.fn(() => ["unitLayer"]),
    queryRenderedFeatures: vi.fn(() => renderedFeatures),
  };
  return {
    map: {
      getNativeMap: () => nativeMap,
    },
    layers: {},
    draw: fake.surface,
    surfaceFake: fake,
    suspendFeatureSelection: vi.fn(),
    resumeFeatureSelection: vi.fn(),
  };
}

describe("useScenarioDraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSelectedItems().clear();
    mocks.useMapLibreDrawInteraction.mockImplementation(() => createInteraction());
  });

  it("initializes MapLibre drawing when the map engine becomes ready after setup", async () => {
    const { draw, engineRef } = mountHarness();

    draw.startDrawing("LineString");
    await nextTick();
    expect(mocks.mapLibreStartDrawing).not.toHaveBeenCalled();

    engineRef.value = createEngine();
    await nextTick();

    expect(mocks.useMapLibreDrawInteraction).toHaveBeenCalledTimes(1);
    draw.startDrawing("LineString");
    expect(mocks.mapLibreStartDrawing).toHaveBeenCalledWith("LineString");
  });

  it("rebuilds the MapLibre interaction when the map engine is replaced", async () => {
    const { engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();
    const first = mocks.useMapLibreDrawInteraction.mock.results[0].value;

    engineRef.value = createEngine();
    await nextTick();

    expect(first.destroy).toHaveBeenCalled();
    expect(mocks.useMapLibreDrawInteraction).toHaveBeenCalledTimes(2);
  });

  it("derives currentDrawType and isModifying from the armed tool", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();

    draw.startDrawing("Polygon");
    expect(draw.armed.value).toEqual({ kind: "plainDraw", drawType: "Polygon" });
    expect(draw.currentDrawType.value).toBe("Polygon");
    expect(draw.isModifying.value).toBe(false);

    draw.startModify();
    expect(draw.armed.value).toEqual({ kind: "plainModify" });
    expect(draw.currentDrawType.value).toBeNull();
    expect(draw.isModifying.value).toBe(true);

    draw.cancel();
    expect(draw.armed.value).toEqual({ kind: "none" });
  });

  it("uses the Edit toggle to edit the selected control measure", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();
    useMainToolbarStore().currentToolbar = "draw";
    useSelectedItems().activeFeatureId.value = "cm-1";

    draw.startModify();

    expect(draw.armed.value).toEqual({
      kind: "cmEdit",
      featureId: "cm-1",
      resume: "plainModify",
    });
    expect(draw.isModifying.value).toBe(true);

    draw.startModify();
    expect(draw.armed.value).toEqual({ kind: "none" });
    expect(draw.isModifying.value).toBe(false);
  });

  it("lets Edit mode select a control measure and starts editing it", async () => {
    const { draw, engineRef } = mountHarness();
    const engine = createEngine();
    engineRef.value = engine;
    await nextTick();
    useMainToolbarStore().currentToolbar = "draw";
    const mapSelectStore = useMapSelectStore();

    draw.startModify();
    await nextTick();

    // The map click path must remain live while Edit is waiting for a target.
    expect.soft(mapSelectStore.featureSelectEnabled).toBe(true);
    expect.soft(mapSelectStore.selectionSuppressed).toBe(false);

    // This is what the map selection path writes after a control-measure pick.
    useSelectedItems().activeFeatureId.value = "cm-1";
    await nextTick();

    expect.soft(draw.armed.value).toEqual({
      kind: "cmEdit",
      featureId: "cm-1",
      resume: "plainModify",
    });

    useSelectedItems().clear();
    engine.surfaceFake.editSession!.close();
    await nextTick();
    await nextTick();

    expect.soft(draw.armed.value).toEqual({ kind: "plainModify" });
    expect.soft(draw.isModifying.value).toBe(true);
    expect.soft(mapSelectStore.selectionSuppressed).toBe(false);
  });

  it("keeps a details-panel control-measure edit as a one-off gesture", async () => {
    const { draw, engineRef } = mountHarness();
    const engine = createEngine();
    engineRef.value = engine;
    await nextTick();
    useMainToolbarStore().currentToolbar = "draw";

    draw.startControlMeasureEdit("cm-1");
    engine.surfaceFake.editSession!.close();
    await nextTick();
    await nextTick();

    expect(draw.armed.value).toEqual({ kind: "none" });
    expect(draw.isModifying.value).toBe(false);
  });

  it("suppresses selection while a control-measure session owns map clicks", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();
    const mapSelectStore = useMapSelectStore();

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    await nextTick();
    expect(mapSelectStore.unitSelectEnabled).toBe(false);
    expect(mapSelectStore.featureSelectEnabled).toBe(false);
    expect(mapSelectStore.selectionSuppressed).toBe(true);

    draw.arm({ kind: "none" });
    await nextTick();
    expect(mapSelectStore.unitSelectEnabled).toBe(true);
    expect(mapSelectStore.featureSelectEnabled).toBe(true);
    expect(mapSelectStore.selectionSuppressed).toBe(false);
  });

  it("settles the render feed when a tool is armed", async () => {
    const renderFeed = createRenderFeed();
    const { draw, engineRef } = mountHarness({ renderFeed });
    engineRef.value = createEngine();
    await nextTick();

    draw.startDrawing("Point");

    expect(renderFeed.settle).toHaveBeenCalledWith("arm");
  });

  it("fans the one snap toggle out to tactical-draw's engine-level snapping", async () => {
    const { draw, engineRef } = mountHarness();
    const engine = createEngine();
    engineRef.value = engine;
    await nextTick();
    const { snapping } = engine.surfaceFake.calls;

    expect(snapping[snapping.length - 1]).toEqual({
      enabled: true,
      sources: {
        graphics: true,
        graphicGeometry: true,
        external: expect.any(Function),
      },
    });

    draw.snap.value = false;
    await nextTick();
    expect(snapping[snapping.length - 1]).toEqual({
      enabled: false,
      sources: {
        graphics: true,
        graphicGeometry: true,
        external: expect.any(Function),
      },
    });
  });

  it("offers rendered units to tactical-draw as external snap candidates", async () => {
    const { engineRef } = mountHarness();
    const engine = createEngine({
      renderedFeatures: [
        {
          layer: { id: "unitLayer" },
          geometry: { type: "Point", coordinates: [10, 20] },
          properties: { id: "unit-1" },
        },
      ],
    });
    engineRef.value = engine;
    await nextTick();
    const { snapping } = engine.surfaceFake.calls;
    const external = snapping[snapping.length - 1]?.sources?.external;

    expect(
      external?.({ coordinate: [0, 0], pixel: [100, 100], interaction: "draw" }),
    ).toEqual([{ id: "unit:unit-1", coordinate: [10, 20], kind: "unit", priority: 1 }]);
  });

  it("gates control measures on the engine having a tactical-draw surface", async () => {
    const { draw, engineRef } = mountHarness();
    expect(draw.canControlMeasures.value).toBe(false);

    engineRef.value = createEngine();
    await nextTick();
    expect(draw.canControlMeasures.value).toBe(true);
  });

  it("disarms when the draw toolbar closes, but leaves a control-measure edit alone", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();
    const toolbarStore = useMainToolbarStore();
    toolbarStore.currentToolbar = "draw";
    await nextTick();

    draw.startDrawing("Point");
    toolbarStore.currentToolbar = null;
    await nextTick();
    expect(draw.armed.value).toEqual({ kind: "none" });

    toolbarStore.currentToolbar = "draw";
    await nextTick();
    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    toolbarStore.currentToolbar = null;
    await nextTick();
    expect(draw.armed.value).toEqual({ kind: "cmEdit", featureId: "cm-1" });
  });

  it("registers itself as the keyboard owner and handles Escape only while armed", async () => {
    const { draw, engineRef, keyboardOwnerRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();

    expect(keyboardOwnerRef.value).not.toBeNull();
    expect(keyboardOwnerRef.value!.handleEscape()).toBe(false);

    draw.startDrawing("LineString");
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    expect(keyboardOwnerRef.value!.handleEscape(event)).toBe(true);
    expect(stopPropagation).toHaveBeenCalled();
    expect(draw.armed.value).toEqual({ kind: "none" });
  });

  it("finishes a plain path draw on Enter and falls through when unarmed", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();

    expect(draw.handleEnter()).toBe(false);
    expect(mocks.mapLibreFinishPathDrawing).not.toHaveBeenCalled();

    draw.startDrawing("LineString");
    expect(draw.handleEnter()).toBe(true);
    expect(mocks.mapLibreFinishPathDrawing).toHaveBeenCalled();
  });

  it("swallows Ctrl+Z during a control-measure session only", async () => {
    const { draw, engineRef } = mountHarness();
    engineRef.value = createEngine();
    await nextTick();

    expect(draw.handleUndoKey()).toBe(false);

    draw.startDrawing("Polygon");
    expect(draw.handleUndoKey()).toBe(false);

    draw.arm({ kind: "cmDraw", graphicKind: "phase-line" });
    expect(draw.handleUndoKey()).toBe(true);

    draw.arm({ kind: "cmEdit", featureId: "cm-1" });
    expect(draw.handleUndoKey()).toBe(true);
  });

  it("deletes selected features through the scenario store", () => {
    const scenario = createScenario();
    const renderFeed = createRenderFeed();
    const { draw } = mountHarness({ scenario, renderFeed });
    const { selectedFeatureIds } = useSelectedItems();
    selectedFeatureIds.value.add("feature-1");
    selectedFeatureIds.value.add("feature-2");

    draw.deleteSelected();

    expect(renderFeed.settle).toHaveBeenCalledWith("commit");
    expect(scenario.store.groupUpdate).toHaveBeenCalled();
    expect(scenario.geo.deleteFeature).toHaveBeenCalledWith("feature-1");
    expect(scenario.geo.deleteFeature).toHaveBeenCalledWith("feature-2");
  });
});
