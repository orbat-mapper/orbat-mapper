import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, effectScope, nextTick, reactive } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { createEventHook } from "@vueuse/core";
import { useTacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type { TScenario } from "@/scenariostore";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedItems } from "@/stores/selectedStore";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";

function graphic(id: string): NScenarioLayerItem {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind: "phase-line",
    controlPoints: [
      [0, 0],
      [1, 1],
    ],
    _pid: "layer-1",
  } as NScenarioLayerItem;
}

function createHarness() {
  const state = reactive({ featureStateCounter: 0 });
  const featureLayerEvent = createEventHook<unknown>();
  const undoRedo = createEventHook<unknown>();
  const layers = reactive<{ value: unknown[] }>({ value: [] });
  const scenario = {
    store: { state, onUndoRedo: undoRedo.on },
    geo: {
      layerItemsLayers: computed(() => layers.value),
      onFeatureLayerEvent: featureLayerEvent.on,
    },
  } as unknown as TScenario;

  const render = vi.fn();
  const setHighlightedGraphics = vi.fn();
  const surface = { render, setHighlightedGraphics } as unknown as TacticalDrawSurface;

  return {
    state,
    featureLayerEvent,
    undoRedo,
    scenario,
    surface,
    render,
    setHighlightedGraphics,
    setLayers(next: unknown[]) {
      layers.value = next;
    },
  };
}

describe("useTacticalGraphicRenderFeed", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // The selection ref lives at module scope, not in Pinia, so it would otherwise
    // survive `setActivePinia` and leak between tests.
    useSelectedItems().selectedFeatureIds.value = new Set();
  });

  it("renders immediately and on every feed input", async () => {
    const h = createHarness();
    const scope = effectScope();
    scope.run(() =>
      useTacticalGraphicRenderFeed(h.scenario, { surface: () => h.surface }),
    );

    expect(h.render).toHaveBeenCalledTimes(1);

    // The store's own render signal: time scrubbing, `_hidden` flips, item writes.
    h.state.featureStateCounter++;
    await nextTick();
    expect(h.render).toHaveBeenCalledTimes(2);

    // A layer-visibility toggle must settle too — that is why the guard is on the
    // feed rather than on the clock.
    useUiStore().layersPanelActive = !useUiStore().layersPanelActive;
    await nextTick();
    expect(h.render).toHaveBeenCalledTimes(3);

    // Layer add/remove/move/update bypass featureStateCounter entirely.
    await h.featureLayerEvent.trigger({ type: "addLayer" });
    expect(h.render).toHaveBeenCalledTimes(4);

    // Undoing a top-level control-measure edit touches neither of the above.
    await h.undoRedo.trigger({});
    expect(h.render).toHaveBeenCalledTimes(5);

    scope.stop();
  });

  it("settles any open session before every render, and on teardown", async () => {
    const h = createHarness();
    const calls: string[] = [];
    const scope = effectScope();
    const feed = scope.run(() =>
      useTacticalGraphicRenderFeed(h.scenario, { surface: () => h.surface }),
    )!;
    h.render.mockImplementation(() => calls.push("render"));
    feed.onSettle((reason) => calls.push(`settle:${reason}`));

    h.state.featureStateCounter++;
    await nextTick();
    expect(calls).toEqual(["settle:render", "render"]);

    // M2's `arm()` hooks the same path without re-rendering.
    feed.settle("arm");
    // The host must render after folding a commit; the library hands the override
    // back and expects the next host render to be authoritative.
    feed.render("commit");
    expect(calls).toEqual([
      "settle:render",
      "render",
      "settle:arm",
      "settle:commit",
      "render",
    ]);

    scope.stop();
    expect(calls[calls.length - 1]).toBe("settle:teardown");
  });

  it("settles even while there is no surface to render to", () => {
    const h = createHarness();
    const settled: string[] = [];
    const scope = effectScope();
    const feed = scope.run(() =>
      useTacticalGraphicRenderFeed(h.scenario, { surface: () => undefined }),
    )!;
    feed.onSettle((reason) => settled.push(reason));

    feed.render();

    expect(settled).toEqual(["render"]);
    expect(h.render).not.toHaveBeenCalled();
    scope.stop();
  });

  it("exposes the last plan for the layer tree", () => {
    const h = createHarness();
    const scope = effectScope();
    const feed = scope.run(() =>
      useTacticalGraphicRenderFeed(h.scenario, { surface: () => h.surface }),
    )!;

    expect(feed.lastPlan).toEqual({
      graphics: [],
      unsupportedIds: [],
      duplicateIds: [],
    });
    scope.stop();
  });

  describe("selection highlight", () => {
    function harnessWithGraphics() {
      const h = createHarness();
      h.setLayers([
        { id: "layer-1", name: "layer-1", items: [graphic("cm1"), graphic("cm2")] },
      ]);
      return h;
    }

    it("highlights only selected ids that are actually in the batch", async () => {
      const h = harnessWithGraphics();
      const { selectedFeatureIds } = useSelectedItems();
      // A unit id and a plain-shape id share the same flat set; neither is a graphic.
      selectedFeatureIds.value = new Set(["cm2", "plain-shape"]);
      const scope = effectScope();
      scope.run(() =>
        useTacticalGraphicRenderFeed(h.scenario, { surface: () => h.surface }),
      );

      expect(h.setHighlightedGraphics).toHaveBeenLastCalledWith(["cm2"]);
      scope.stop();
    });

    it("re-highlights on a selection change without re-rendering the batch", async () => {
      const h = harnessWithGraphics();
      const { selectedFeatureIds } = useSelectedItems();
      const scope = effectScope();
      scope.run(() =>
        useTacticalGraphicRenderFeed(h.scenario, { surface: () => h.surface }),
      );
      expect(h.render).toHaveBeenCalledTimes(1);
      expect(h.setHighlightedGraphics).toHaveBeenLastCalledWith([]);

      selectedFeatureIds.value.add("cm1");
      await nextTick();

      expect(h.setHighlightedGraphics).toHaveBeenLastCalledWith(["cm1"]);
      // Highlighting starts and aborts no session, so selection must not reach
      // `render()` and must not settle an open edit.
      expect(h.render).toHaveBeenCalledTimes(1);
      scope.stop();
    });
  });
});
