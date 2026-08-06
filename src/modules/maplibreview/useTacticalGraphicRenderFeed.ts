/**
 * The control-measure render feed, with the settle-first guard on it.
 *
 * tactical-draw's contract makes mid-session writes illegal: a `render()` whose batch
 * omits the graphic currently being edited aborts that session. Everything that
 * re-renders on its own schedule — time scrubbing, layer-visibility toggles, undo,
 * layer add/remove — would therefore silently kill an open session.
 *
 * The resolution from ADR-0006 is **settle-first**, and the guard is placed on the
 * *feed*, not on the clock: every path that reaches `render()` settles any open
 * session first (an edit closes and keeps its work, a draw aborts). Putting it on the
 * clock would leave a visibility toggle unguarded.
 *
 * No sessions exist in M1, so `settle()` currently fans out to zero handlers. It is
 * built now, with the feed, so M2 cannot forget it: the session owner registers via
 * `onSettle`, while tool changes and host deletions call `settle()` on this same
 * object rather than inventing parallel paths.
 */
import { onScopeDispose, watch } from "vue";
import type { TScenario } from "@/scenariostore";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedItems } from "@/stores/selectedStore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import {
  buildTacticalGraphicRenderPlan,
  type TacticalGraphicRenderPlan,
} from "@/modules/maplibreview/tacticalGraphicRenderPlan";

/**
 * Why a settle is being asked for. Handlers may treat them differently, but the
 * disposition ADR-0006 fixes is the same for all of them: edit commits, draw aborts.
 */
export type SettleReason =
  /** The feed is about to hand tactical-draw a new batch. */
  | "render"
  /** A different tool is being armed (M2). */
  | "arm"
  /** A settled session's work has just been folded into the store (M2). */
  | "commit"
  /** A host deletion must settle any session before it removes the edited item. */
  | "delete"
  /**
   * The tactical-draw façade is about to be destroyed and rebuilt — a basemap swap.
   * Destroying it rejects an open session without firing `onCommit`, so an edit that
   * did not settle here would lose its work.
   */
  | "detach"
  /** The map is going away. */
  | "teardown";

export type SettleHandler = (reason: SettleReason) => void;

export interface TacticalGraphicRenderFeed {
  /**
   * Settle any open session, rebuild the batch and hand it to the surface.
   *
   * Public because the host is *required* to call it after folding a commit: the
   * library hands the override back and expects the host's next render to be
   * authoritative. M2 calls `render("commit")` at the end of its fold.
   */
  render(reason?: SettleReason): void;
  /** Settle without re-rendering before a tool change or host deletion. */
  settle(reason: SettleReason): void;
  /** Register a session owner. Returns an idempotent unregister. */
  onSettle(handler: SettleHandler): () => void;
  /** The batch last handed to the surface, for the layer tree's unsupported flag. */
  readonly lastPlan: TacticalGraphicRenderPlan | null;
}

/**
 * Push the selection into tactical-draw's passive highlight set.
 *
 * `selectedFeatureIds` is one flat set over every layer item kind, so it holds ids
 * that are units of no interest here and ids of plain shapes the other renderer draws.
 * The library skips unknown ids, but intersecting with the rendered batch keeps the
 * call honest and cheap.
 *
 * Highlighting is **not** a render: it starts no session and aborts none, so it
 * deliberately bypasses `settle()`. Selecting a control measure while an M2 edit
 * session is open must not close that session.
 */
function highlightedIdsFor(
  plan: TacticalGraphicRenderPlan | null,
  selected: ReadonlySet<FeatureId>,
): string[] {
  if (!plan || selected.size === 0) return [];
  return plan.graphics.map((graphic) => graphic.id).filter((id) => selected.has(id));
}

export function useTacticalGraphicRenderFeed(
  scenario: TScenario,
  options: {
    /** Re-read on every render: the façade is rebuilt on every basemap swap. */
    surface: () => TacticalDrawSurface | undefined | null;
  },
): TacticalGraphicRenderFeed {
  const uiStore = useUiStore();
  const { selectedFeatureIds } = useSelectedItems();
  const settleHandlers = new Set<SettleHandler>();
  let lastPlan: TacticalGraphicRenderPlan | null = null;

  // Mirrors the plain-feature feed: with the Layers panel open, time-hidden items
  // stay visible so they can be edited.
  const filterVisible = () => !uiStore.layersPanelActive;

  function settle(reason: SettleReason) {
    // Copied because a handler may unregister itself while settling.
    for (const handler of [...settleHandlers]) handler(reason);
  }

  function render(reason: SettleReason = "render") {
    settle(reason);
    const surface = options.surface();
    if (!surface) return;
    const plan = buildTacticalGraphicRenderPlan(scenario.geo.layerItemsLayers.value, {
      filterVisible: filterVisible(),
    });
    lastPlan = plan;
    surface.render(plan.graphics);
    // After the batch, never before: the library skips highlight ids that are not
    // currently rendered.
    surface.setHighlightedGraphics(highlightedIdsFor(plan, selectedFeatureIds.value));
  }

  function applyHighlight() {
    options
      .surface()
      ?.setHighlightedGraphics(highlightedIdsFor(lastPlan, selectedFeatureIds.value));
  }

  // Time is an input in its own right: a newly drawn graphic has no `state[]`, so its
  // first time scrub may not bump `featureStateCounter`, but it must still settle an
  // open recording edit. Counter changes made by the clock itself are batched with the
  // time change; a settled edit's store write may schedule an authoritative follow-up
  // render. Layer add/remove/move/update bypass both and arrive as feature-layer events
  // instead. The surface replays its last batch itself on `style.load`, so a basemap
  // swap needs nothing here.
  watch(
    [
      () => scenario.store.state.currentTime,
      () => scenario.store.state.featureStateCounter,
      () => uiStore.layersPanelActive,
      options.surface,
    ],
    () => render(),
    { immediate: true },
  );

  // Selection is deliberately NOT a render input. The plain-feature path re-renders on
  // selection because its selected style lives in the feature source; tactical-draw
  // draws the highlight on its own layer from a declarative id set, so a selection
  // change costs one `setHighlightedGraphics` and never risks settling a session.
  watch(() => [...selectedFeatureIds.value], applyHighlight);

  const layerEvents = scenario.geo.onFeatureLayerEvent(() => render());
  // Undo/redo is a third input, not a duplicate of the first two: undoing a
  // top-level control-measure edit (control points, style, amplifiers) replays a
  // patch without touching `featureStateCounter` and without emitting a layer event.
  const undoRedo = scenario.store.onUndoRedo(() => render());

  onScopeDispose(() => {
    layerEvents.off();
    undoRedo.off();
    settle("teardown");
    settleHandlers.clear();
  });

  return {
    render,
    settle,
    onSettle(handler) {
      settleHandlers.add(handler);
      return () => settleHandlers.delete(handler);
    },
    get lastPlan() {
      return lastPlan;
    },
  };
}
