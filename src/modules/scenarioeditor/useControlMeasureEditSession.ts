/**
 * The control-measure edit session — the second transient half of ADR-0006's
 * commit-on-settle, and the mirror of `useControlMeasureDrawSession`.
 *
 * Two things make it *not* a copy of the draw session:
 *
 * 1. **An edit closes and keeps its work; only a draw aborts.** Every settle path —
 *    a time scrub, a layer-visibility toggle, arming another tool, Escape — folds the
 *    working geometry into the store. There is deliberately no discard gesture: the
 *    fold is one undo step, so scenario undo *is* the discard.
 * 2. **It is entered by an explicit gesture**, never by a click. Click selects. Under
 *    settle-first, click-to-edit (tactrace's model) would leave an open session behind
 *    nearly every interaction on the map, and every one of those would have to settle.
 *
 * The fold rides `EditSession.onCommit` rather than the outer `edit()` promise.
 * `onCommit` fires **synchronously** inside `close()`, which is what lets a settle
 * close the session and have the feed's very next batch already carry the new
 * geometry; the promise resolves a microtask later, by which time a new tool may
 * already be armed. The promise therefore only reports *that* the session ended.
 */
import { onScopeDispose, ref } from "vue";
import type { Ref } from "vue";
import { isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type {
  EditSession,
  GraphicEditSession,
  PointSymbol,
} from "@orbat-mapper/tactical-draw";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type { TacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import {
  applyScenarioControlMeasureEdit,
  toEditStartMeasure,
} from "@/modules/scenarioeditor/controlMeasureEditHelpers";

export interface UseControlMeasureEditSessionOptions {
  scenario: TScenario;
  /** Re-read on every use: the façade is rebuilt on every basemap swap. */
  surface: () => TacticalDrawSurface | undefined | null;
  /** The settle-first feed. Absent on OpenLayers, which has no tactical-draw. */
  renderFeed?: TacticalGraphicRenderFeed | null;
  /**
   * Is geometry recording on? Read at fold time, not captured: a session may well
   * outlive a toggle of the toolbar's record button.
   */
  recordShape?: () => boolean;
  /**
   * A session ended on its own — a click away, an abort, a destroyed façade. The
   * armed-tool owner decides what happens next; unlike draw there is no re-arm case.
   */
  onSettled: (result: { committed: boolean; featureId: FeatureId }) => void;
}

export interface ControlMeasureEditSession {
  /** The control measure under edit, or `null`. Non-null exactly while open. */
  readonly featureId: Ref<FeatureId | null>;
  /** In-session history availability, for the details panel's affordances. */
  readonly canUndo: Ref<boolean>;
  readonly canRedo: Ref<boolean>;
  /** Open an edit session on `featureId`. `false` when it cannot be edited. */
  start(featureId: FeatureId): boolean;
  /** Close any open session, keeping its work. */
  stop(): void;
  /** In-session undo/redo. `false` when there is nothing to undo/redo. */
  undo(): boolean;
  redo(): boolean;
}

/**
 * `edit()` hands back a union because a point symbol is editable too. Only control
 * measures are ever passed in here, and only `EditSession` carries `controlPoints`.
 */
function asControlMeasureEditSession(
  live: EditSession | GraphicEditSession<PointSymbol>,
): EditSession | null {
  return "controlPoints" in live ? live : null;
}

export function useControlMeasureEditSession(
  options: UseControlMeasureEditSessionOptions,
): ControlMeasureEditSession {
  const featureId = ref<FeatureId | null>(null);
  const canUndo = ref(false);
  const canRedo = ref(false);

  // Same role as the draw session's: a settled `edit()` promise lands a microtask
  // after the close that produced it, so without a token a preempted session's
  // resolution would disarm the tool that replaced it. The *fold* is deliberately not
  // token-guarded — a closed edit keeps its work no matter what happened since.
  let generation = 0;
  // Never made reactive: the engine holds this object for the life of the session.
  let session: EditSession | null = null;
  // Set while the feed itself is closing us, so the fold can skip its own render:
  // the feed is mid-`render()` and will hand the surface the folded batch as soon as
  // `settle()` returns. Without this the fold would re-enter `render()`.
  let closingFromSettle = false;

  function clearSession() {
    generation += 1;
    session = null;
    featureId.value = null;
    canUndo.value = false;
    canRedo.value = false;
  }

  /** Close the open session, keeping its work. The fold happens in `onCommit`. */
  function close() {
    const live = session;
    if (!live) return;
    // Dropped before `close()`, which fires `onCommit` synchronously: the fold's
    // re-render settles again, and must not find a session that is already closing.
    session = null;
    live.close();
  }

  function fold(measure: Parameters<typeof applyScenarioControlMeasureEdit>[1]) {
    applyScenarioControlMeasureEdit(options.scenario, measure, {
      recordShape: options.recordShape?.() ?? false,
    });
    if (closingFromSettle) return;
    // Required by the library's contract, not an optimisation: it hands the override
    // back and expects the host's next render to be authoritative.
    options.renderFeed?.render("commit");
  }

  function start(itemId: FeatureId): boolean {
    stop();
    const token = generation;
    const surface = options.surface();
    if (!surface) return false;
    const { layerItem } = options.scenario.geo.getLayerItemById(itemId);
    if (!layerItem || !isNTacticalGraphicLayerItem(layerItem)) return false;
    // An unsupported kind is not in the render batch, so the library has nothing to
    // put handles on — and `edit()` would throw on its unknown kind.
    if (!isSupportedGraphicKind(layerItem.graphicKind)) return false;

    featureId.value = itemId;
    surface
      .edit(toEditStartMeasure(layerItem), {
        onSession(live) {
          if (token !== generation) return;
          const editSession = asControlMeasureEditSession(live);
          if (!editSession) return;
          session = editSession;
          const readHistory = () => {
            canUndo.value = editSession.history.state.canUndo;
            canRedo.value = editSession.history.state.canRedo;
          };
          readHistory();
          editSession.history.subscribe(readHistory);
          // The fold channel. Fires exactly once, synchronously from within the
          // `close()` that produced it, and never on abort.
          editSession.onCommit((snapshot) => fold(snapshot.graphic));
        },
      })
      .then(() => {
        if (token !== generation) return;
        clearSession();
        options.onSettled({ committed: true, featureId: itemId });
      })
      .catch((error) => {
        // Abort is a normal outcome here too — a destroyed façade, a basemap swap
        // mid-gesture. Nothing was folded, because `onCommit` never fired.
        if (!isTacticalDrawAbortError(error)) {
          console.error("[controlMeasureEdit] edit session failed", error);
        }
        if (token !== generation) return;
        clearSession();
        options.onSettled({ committed: false, featureId: itemId });
      });
    return true;
  }

  function stop() {
    close();
    clearSession();
  }

  // The settle-first guard's edit disposition, and the reason it is a *disposition*
  // and not one behaviour: where a draw aborts, an edit closes and keeps its work.
  // Registered on the feed rather than called from `arm()` so a time scrub or a
  // layer-visibility toggle settles through the same path.
  const unregisterSettle = options.renderFeed?.onSettle(() => {
    if (!session) return;
    closingFromSettle = true;
    try {
      close();
    } finally {
      closingFromSettle = false;
    }
  });

  onScopeDispose(() => {
    unregisterSettle?.();
    stop();
  });

  return {
    featureId,
    canUndo,
    canRedo,
    start,
    stop,
    undo: () => session?.history.undo() ?? false,
    redo: () => session?.history.redo() ?? false,
  };
}
