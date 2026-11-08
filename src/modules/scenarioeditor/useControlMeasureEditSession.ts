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
import { onScopeDispose, ref, shallowRef } from "vue";
import type { Ref, ShallowRef } from "vue";
import type { Position } from "geojson";
import {
  getControlMeasureModifierDrag,
  getControlMeasureVertexAlignedOptions,
  hasControlMeasureDetailHandles,
} from "@orbat-mapper/control-measures";
import type { FlowArrowOptions } from "@orbat-mapper/control-measures";
import { isEqual } from "es-toolkit";
import { getSizeAnchor, isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type {
  EditMode,
  EditSession,
  GraphicEditSession,
  ImageGraphic,
  Marker,
  PointSymbol,
} from "@orbat-mapper/tactical-draw";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type {
  SettleReason,
  TacticalGraphicRenderFeed,
} from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import {
  isNPointSymbolLayerItem,
  isNTacticalGraphicLayerItem,
} from "@/types/scenarioLayerItems";
import { toPointSymbol, toPointSymbolUpdate } from "@/geo/pointSymbols";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import {
  applyScenarioControlMeasureEdit,
  toControlMeasureEditUpdate,
  toEditStartMeasure,
} from "@/modules/scenarioeditor/controlMeasureEditHelpers";
import {
  clearAllFlowPointWidths,
  hasAnyFlowPointWidths,
} from "@/modules/scenarioeditor/flowArrowFlows";

/** An open edit session, whichever kind of graphic it edits. */
type LiveEditSession = EditSession | GraphicEditSession<PointSymbol>;

export interface UseControlMeasureEditSessionOptions {
  scenario: TScenario;
  /** Re-read on every use: the façade is rebuilt on every basemap swap. */
  surface: () => TacticalDrawSurface | undefined | null;
  /** The settle-first feed for tactical drawing. */
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
  readonly widthGrips: Ref<boolean>;
  readonly supportsWidthGrips: Ref<boolean>;
  readonly canResetVertexWidths: Ref<boolean>;
  setWidthGrips(enabled: boolean): void;
  resetVertexWidths(): void;
  /**
   * The engine's sub-selected part of a graphic drawn in parts (a Flow or Split
   * Arrow's flow); `undefined` for kinds without parts. View state: remembered across
   * the protective reopen a panel write causes, so the panel keeps its flow.
   */
  readonly selectedPart: Ref<number | undefined>;
  /**
   * Every sub-selected part, `selectedPart` (the primary) included, ascending; empty
   * for kinds without parts. Remembered across a protective reopen like the primary.
   */
  readonly selectedParts: Ref<readonly number[]>;
  /**
   * The open session's working points and options, which reach the store only when
   * the edit settles. The panel reads them while editing, so a flow pulled out on the
   * map shows up at once. Only arrows drawn as flows track it; `null` otherwise.
   */
  readonly liveShape: ShallowRef<{
    controlPoints: Position[];
    options: Record<string, unknown>;
  } | null>;
  /** Select a part alone, or with `extend` toggle it in or out of the selection. */
  selectPart(part: number, opts?: { extend?: boolean }): void;
  /** Replace the selected parts; `primary` defaults to the last listed. */
  selectParts(parts: readonly number[], primary?: number): void;
  /** Whether the open graphic declares a Ctrl/⌘ + drag on a point (new flow). */
  readonly canAddFlow: Ref<boolean>;
  /**
   * One-shot stand-in for holding Ctrl, for touch: the next press on a point that
   * changes the graphic pulls out a new flow, then it switches off.
   */
  readonly addFlowArmed: Ref<boolean>;
  setAddFlowArmed(armed: boolean): void;
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
  live:
    | EditSession
    | GraphicEditSession<PointSymbol>
    | GraphicEditSession<ImageGraphic>
    | GraphicEditSession<Marker>,
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
  const widthGrips = ref(false);
  const supportsWidthGrips = ref(false);
  const canResetVertexWidths = ref(false);
  /** The open session's per-vertex width option keys; empty when it has none. */
  let widthKeys: readonly string[] = [];
  /** A Flow Arrow keeps its point widths on each flow instead. */
  let flowWidths = false;
  const selectedPart = ref<number | undefined>(undefined);
  const selectedParts = shallowRef<readonly number[]>([]);
  const liveShape: ControlMeasureEditSession["liveShape"] = shallowRef(null);
  /** The graphic `selectedPart` belongs to, so a reopen on it restores the part. */
  let selectedPartOwner: FeatureId | null = null;
  /** How many flows `selectedParts` counted: parts are indices, so only then still apt. */
  let selectedPartsFlowCount = 0;
  const canAddFlow = ref(false);
  const addFlowArmed = ref(false);

  function setAddFlowArmed(armed: boolean) {
    addFlowArmed.value = armed && canAddFlow.value;
    options.surface()?.setModifierDragArmed(addFlowArmed.value);
  }

  function selectPart(part: number, opts?: { extend?: boolean }) {
    controlMeasureSession()?.selectPart(part, opts);
  }

  function selectParts(parts: readonly number[], primary?: number) {
    controlMeasureSession()?.selectParts(parts, primary);
  }

  function setWidthGrips(enabled: boolean) {
    widthGrips.value = enabled;
    controlMeasureSession()?.setDetailHandles(enabled);
  }

  function resetVertexWidths() {
    const session = controlMeasureSession();
    if (!session || !canResetVertexWidths.value) return;
    session.setOptions(
      flowWidths
        ? clearAllFlowPointWidths(session.workingGraphic.options as FlowArrowOptions)
        : Object.fromEntries(widthKeys.map((key) => [key, undefined])),
    );
  }

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
    controlMeasureSession()?.setModes(editModes());
  }

  // Same role as the draw session's: a settled `edit()` promise lands a microtask
  // after the close that produced it, so without a token a preempted session's
  // resolution would disarm the tool that replaced it. The *fold* is deliberately not
  // token-guarded — a closed edit keeps its work no matter what happened since.
  let generation = 0;
  let settleReason: SettleReason | undefined;
  // Never made reactive: the engine holds these objects for the life of the session.
  // `live` is whichever session is open, of either kind.
  let live: LiveEditSession | null = null;
  /** The open session when it edits a control measure, for the extras only it has. */
  function controlMeasureSession() {
    return live && asControlMeasureEditSession(live);
  }
  // Set while the feed itself is closing us, so the fold can skip its own render:
  // the feed is mid-`render()` and will hand the surface the folded batch as soon as
  // `settle()` returns. Without this the fold would re-enter `render()`.
  let closingFromSettle = false;

  function clearSession() {
    generation += 1;
    live = null;
    featureId.value = null;
    widthKeys = [];
    flowWidths = false;
    liveShape.value = null;
    supportsWidthGrips.value = false;
    canAddFlow.value = false;
    if (addFlowArmed.value) setAddFlowArmed(false);
    canResetVertexWidths.value = false;
    settleReason = undefined;
    canUndo.value = false;
    canRedo.value = false;
  }

  /** Close the open session, keeping its work. The fold happens in `onCommit`. */
  function close() {
    const closing = live;
    if (!closing) return;
    // Dropped before `close()`, which fires `onCommit` synchronously: the fold's
    // re-render settles again, and must not find a session that is already closing.
    live = null;
    closing.close();
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

  /** Adopt an opened session: make it the live one and mirror its history. */
  function adopt(opened: LiveEditSession) {
    live = opened;
    const readHistory = () => {
      canUndo.value = opened.history.state.canUndo;
      canRedo.value = opened.history.state.canRedo;
    };
    readHistory();
    opened.history.subscribe(readHistory);
  }

  /** Report the end of an `edit()` promise, unless a newer session has replaced it. */
  function settleWhen(
    edit: Promise<unknown>,
    token: number,
    itemId: FeatureId,
    logTag: string,
  ) {
    edit
      .then(() => {
        if (token !== generation) return;
        notifySettled(true, itemId, settleReason);
      })
      .catch((error) => {
        // Abort is a normal outcome — a destroyed façade, a basemap swap mid-gesture.
        // Nothing was folded, because `onCommit` never fired.
        if (!isTacticalDrawAbortError(error)) {
          console.error(`[${logTag}] edit session failed`, error);
        }
        if (token !== generation) return;
        notifySettled(false, itemId, settleReason);
      });
  }

  /** Move, rotate and resize a point symbol; one store write when it settles changed. */
  function startPointSymbol(
    itemId: FeatureId,
    token: number,
    surface: TacticalDrawSurface,
    startSymbol: PointSymbol,
  ) {
    featureId.value = itemId;
    const startUpdate = toPointSymbolUpdate(startSymbol);
    const edit = surface.edit(startSymbol, {
      onSession(opened) {
        if (token !== generation) return;
        const symbolEdit = opened as GraphicEditSession<PointSymbol>;
        adopt(symbolEdit);
        symbolEdit.onCommit((snapshot) => {
          const update = toPointSymbolUpdate(snapshot.graphic);
          if (!isEqual(startUpdate, update)) {
            options.scenario.geo.updatePointSymbol(itemId, update);
          }
          if (!closingFromSettle) options.renderFeed?.render("commit");
        });
      },
    });
    settleWhen(edit, token, itemId, "pointSymbolEdit");
    return true;
  }

  function start(itemId: FeatureId): boolean {
    stop();
    const token = generation;
    const surface = options.surface();
    if (!surface) return false;
    if (selectedPartOwner !== itemId) {
      selectedPartOwner = itemId;
      selectedPart.value = undefined;
      selectedParts.value = [];
    }
    const { layerItem } = options.scenario.geo.getLayerItemById(itemId);
    if (layerItem && isNPointSymbolLayerItem(layerItem)) {
      // Its own copy, for the same reason `toEditStartMeasure` clones.
      return startPointSymbol(
        itemId,
        token,
        surface,
        structuredClone(toPointSymbol(layerItem)),
      );
    }
    if (!layerItem || !isNTacticalGraphicLayerItem(layerItem)) return false;
    // An unsupported kind is not in the render batch, so the library has nothing to
    // put handles on — and `edit()` would throw on its unknown kind.
    if (!isSupportedGraphicKind(layerItem.graphicKind)) return false;

    featureId.value = itemId;
    const startMeasure = toEditStartMeasure(layerItem);
    // Detached from the object tactical-draw receives, so a library-owned mutation of
    // its working graphic cannot move the comparison baseline along with the edit.
    const startUpdate = toControlMeasureEditUpdate(startMeasure);
    const edit = surface.edit(startMeasure, {
      // Whatever the graphic already encodes, so an edit never silently re-anchors
      // it: a stored ground size stays ground, and a screen-anchored one — which
      // only an import can be, since every drawn graphic bakes to ground — is not
      // frozen to the zoom that happened to be showing when it was reshaped.
      sizeAnchor: getSizeAnchor(startMeasure),
      modes: editModes(),
      detailHandles: widthGrips.value,
      onSession(opened) {
        if (token !== generation) return;
        const editSession = asControlMeasureEditSession(opened);
        if (!editSession) return;
        adopt(editSession);
        widthKeys = getControlMeasureVertexAlignedOptions(startMeasure.kind);
        flowWidths = startMeasure.kind === "flow-arrow";
        supportsWidthGrips.value = hasControlMeasureDetailHandles(startMeasure.kind);
        canAddFlow.value = getControlMeasureModifierDrag(startMeasure.kind) !== null;
        const readWidths = () => {
          const options = editSession.workingGraphic.options as
            Record<string, unknown> | undefined;
          canResetVertexWidths.value = flowWidths
            ? hasAnyFlowPointWidths((options ?? {}) as FlowArrowOptions)
            : widthKeys.some((key) => Array.isArray(options?.[key]));
        };
        const tracksShape =
          startMeasure.kind === "flow-arrow" || startMeasure.kind === "split-arrow";
        const readShape = () => {
          if (!tracksShape) return;
          liveShape.value = {
            controlPoints: editSession.controlPoints.map((point) => [...point]),
            options: { ...(editSession.workingGraphic.options ?? {}) },
          };
        };
        const flowCount = () =>
          (editSession.workingGraphic.options as { flows?: unknown[] } | undefined)?.flows
            ?.length ?? 1;
        readWidths();
        readShape();
        editSession.onChange(() => {
          readWidths();
          readShape();
          selectedPartsFlowCount = flowCount();
          // A change while armed is the armed press doing its work: one-shot.
          if (addFlowArmed.value) setAddFlowArmed(false);
        });
        // Restore the flows the panel was on before a protective reopen. Should their
        // number have changed since, they may be other flows: keep the primary alone,
        // as the engine does when an edit changes it.
        if (selectedPart.value !== undefined) {
          editSession.selectParts(
            selectedPartsFlowCount === flowCount()
              ? selectedParts.value
              : [selectedPart.value],
            selectedPart.value,
          );
        }
        selectedPartsFlowCount = flowCount();
        selectedPart.value = editSession.selectedPart;
        selectedParts.value = editSession.selectedParts;
        editSession.onPartSelect((part, parts) => {
          if (token !== generation) return;
          selectedPart.value = part;
          selectedParts.value = parts;
        });
        // The fold channel. Fires exactly once, synchronously from within the
        // `close()` that produced it, and never on abort.
        editSession.onCommit((snapshot) => fold(snapshot.graphic, startUpdate));
      },
    });
    settleWhen(edit, token, itemId, "controlMeasureEdit");
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
    if (!live || reason === "commit") return;
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
    widthGrips,
    supportsWidthGrips,
    canResetVertexWidths,
    setWidthGrips,
    resetVertexWidths,
    selectedPart,
    selectedParts,
    liveShape,
    selectPart,
    selectParts,
    canAddFlow,
    addFlowArmed,
    setAddFlowArmed,
    canUndo,
    canRedo,
    start,
    stop,
    setLabelDrag,
    undo: () => live?.history.undo() ?? false,
    redo: () => live?.history.redo() ?? false,
  };
}
