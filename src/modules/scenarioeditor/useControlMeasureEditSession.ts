/**
 * The control-measure edit session — the second transient half of ADR-0006's
 * commit-on-settle, and the mirror of `useControlMeasureDrawSession`.
 *
 * Two things make it *not* a copy of the draw session:
 *
 * 1. **An edit closes and keeps its work; only a draw aborts.** Every settle path —
 *    a time scrub, a layer-visibility toggle, arming another tool, Escape — closes the
 *    session and folds changed work into the store. An unchanged edit writes nothing.
 *    There is deliberately no discard gesture: a changed fold is one undo step, so
 *    scenario undo *is* the discard.
 * 2. **Its lifecycle has an explicit owner.** A details-panel gesture owns a one-off
 *    session; persistent toolbar Edit owns sessions opened or transferred by selection
 *    changes. An unarmed map click still only selects — it never creates an edit.
 *
 * The fold rides `EditSession.onCommit` rather than the outer `edit()` promise.
 * `onCommit` fires **synchronously** inside `close()`, which is what lets a settle
 * close the session and have the feed's very next batch already carry the new
 * geometry; the promise resolves a microtask later, by which time a new tool may
 * already be armed. The promise therefore only reports *that* the session ended.
 */
import { onScopeDispose, ref } from "vue";
import type { Ref } from "vue";
import { isEqual } from "es-toolkit";
import { getSizeAnchor, isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type {
  EditMode,
  EditSession,
  GraphicEditSession,
  ImageGraphic,
  PointSymbol,
} from "@orbat-mapper/tactical-draw";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type {
  SettleReason,
  TacticalGraphicRenderFeed,
} from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import {
  applyScenarioControlMeasureEdit,
  toControlMeasureEditUpdate,
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
   * A session ended — by gesture, abort, façade destruction, or a protective settle.
   * The armed-tool owner decides whether to disarm, resume target-picking, or reopen
   * the same target after the authoritative render.
   */
  onSettled: (result: {
    committed: boolean;
    featureId: FeatureId;
    /** Present when the render feed, rather than a map gesture, closed the session. */
    settleReason?: SettleReason;
  }) => void;
}

export interface ControlMeasureEditSession {
  /** The control measure under edit, or `null`. Non-null exactly while open. */
  readonly featureId: Ref<FeatureId | null>;
  /** Is label-drag mode on? Sticky across sessions, like a tool preference. */
  readonly labelDrag: Ref<boolean>;
  /** In-session history availability, for the details panel's affordances. */
  readonly canUndo: Ref<boolean>;
  readonly canRedo: Ref<boolean>;
  /** Open an edit session on `featureId`. `false` when it cannot be edited. */
  start(featureId: FeatureId): boolean;
  /** Close any open session, keeping its work. */
  stop(): void;
  /** Turn label-drag mode on or off, live if a session is open. */
  setLabelDrag(enabled: boolean): void;
  /** In-session undo/redo. `false` when there is nothing to undo/redo. */
  undo(): boolean;
  redo(): boolean;
}

/**
 * `edit()` hands back a union because anchored graphics are editable too. Only
 * control measures are ever passed in here, and only `EditSession` carries
 * `controlPoints`.
 */
function asControlMeasureEditSession(
  live: EditSession | GraphicEditSession<PointSymbol> | GraphicEditSession<ImageGraphic>,
): EditSession | null {
  return "controlPoints" in live ? live : null;
}

export function useControlMeasureEditSession(
  options: UseControlMeasureEditSessionOptions,
): ControlMeasureEditSession {
  const featureId = ref<FeatureId | null>(null);
  const canUndo = ref(false);
  const canRedo = ref(false);
  // Sticky across sessions on purpose: it is a mode the user is in, not a property of
  // one graphic. Placing several labels means editing several graphics in a row, and
  // having the mode reset under you each time is the annoying half of that.
  const labelDrag = ref(false);

  /**
   * `["reshape", "transform"]` is the library's own default and is spelled out because
   * label drag is *additive* — the vertex handles and the transform box stay live, so
   * a label can be moved without leaving the reshape the panel armed the user for.
   */
  function editModes(): EditMode[] {
    return labelDrag.value
      ? ["reshape", "transform", "labeldrag"]
      : ["reshape", "transform"];
  }

  function setLabelDrag(enabled: boolean) {
    if (labelDrag.value === enabled) return;
    labelDrag.value = enabled;
    // Live, so the toggle acts on the session the user is looking at rather than only
    // on the next one. Nothing is written: mode is session state, not model state.
    session?.setModes(editModes());
  }

  // Same role as the draw session's: a settled `edit()` promise lands a microtask
  // after the close that produced it, so without a token a preempted session's
  // resolution would disarm the tool that replaced it. The *fold* is deliberately not
  // token-guarded — a closed edit keeps its work no matter what happened since.
  let generation = 0;
  let settleReason: SettleReason | undefined;
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
    settleReason = undefined;
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

  function fold(
    measure: Parameters<typeof applyScenarioControlMeasureEdit>[1],
    startUpdate: ReturnType<typeof toControlMeasureEditUpdate>,
  ) {
    // A render settle closes even an untouched session. Compare against the snapshot
    // captured when this particular session opened, not against the store's current
    // projection: a time scrub may already have projected a different timed state by
    // the time the feed reaches us.
    if (!isEqual(startUpdate, toControlMeasureEditUpdate(measure))) {
      applyScenarioControlMeasureEdit(options.scenario, measure, {
        recordShape: options.recordShape?.() ?? false,
      });
    }
    if (closingFromSettle) return;
    // Required by the library's contract, not an optimisation: it hands the override
    // back and expects the host's next render to be authoritative.
    options.renderFeed?.render("commit");
  }

  function notifySettled(
    committed: boolean,
    itemId: FeatureId,
    reason: SettleReason | undefined,
  ) {
    clearSession();
    options.onSettled({
      committed,
      featureId: itemId,
      ...(reason ? { settleReason: reason } : {}),
    });
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
    const startMeasure = toEditStartMeasure(layerItem);
    // Detached from the object tactical-draw receives, so a library-owned mutation of
    // its working graphic cannot move the comparison baseline along with the edit.
    const startUpdate = toControlMeasureEditUpdate(startMeasure);
    surface
      .edit(startMeasure, {
        // Whatever the graphic already encodes, so an edit never silently re-anchors
        // it: a stored ground size stays ground, and a screen-anchored one — which
        // only an import can be, since every drawn graphic bakes to ground — is not
        // frozen to the zoom that happened to be showing when it was reshaped.
        sizeAnchor: getSizeAnchor(startMeasure),
        modes: editModes(),
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
          editSession.onCommit((snapshot) => fold(snapshot.graphic, startUpdate));
        },
      })
      .then(() => {
        if (token !== generation) return;
        notifySettled(true, itemId, settleReason);
      })
      .catch((error) => {
        // Abort is a normal outcome here too — a destroyed façade, a basemap swap
        // mid-gesture. Nothing was folded, because `onCommit` never fired.
        if (!isTacticalDrawAbortError(error)) {
          console.error("[controlMeasureEdit] edit session failed", error);
        }
        if (token !== generation) return;
        notifySettled(false, itemId, settleReason);
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
  const unregisterSettle = options.renderFeed?.onSettle((reason) => {
    // `fold()` performs the library-required commit render synchronously from inside
    // the live session's own `onCommit`. That session is already settling itself; it
    // is not an external reason to close or later restore it.
    if (!session || reason === "commit") return;
    settleReason = reason;
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
    labelDrag,
    canUndo,
    canRedo,
    start,
    stop,
    setLabelDrag,
    undo: () => session?.history.undo() ?? false,
    redo: () => session?.history.redo() ?? false,
  };
}
