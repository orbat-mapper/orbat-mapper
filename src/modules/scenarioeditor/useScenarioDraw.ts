import type Select from "ol/interaction/Select";
import type OLMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import {
  computed,
  inject,
  nextTick,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
  watchEffect,
  type Ref,
  type ShallowRef,
} from "vue";
import { storeToRefs } from "pinia";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import type { SnapCandidateRequest } from "@orbat-mapper/tactical-draw";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioKeyboardOwnerKey,
  tacticalGraphicRenderFeedKey,
} from "@/components/injects";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
} from "@/modules/scenarioeditor/olInjects";
import { injectStrict } from "@/utils";
import { useEditingInteraction, type DrawType } from "@/composables/geoEditing";
import { useMapLibreDrawInteraction } from "@/composables/maplibreDrawInteraction";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useRecordingStore } from "@/stores/recordingStore";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useFeatureLayerUtils } from "@/modules/scenarioeditor/featureLayerUtilsOl";
import {
  addOlDrawFeature,
  addScenarioDrawFeature,
  updateScenarioFeatureGeometry,
  updateScenarioFeatureGeometryFromOlFeature,
} from "@/modules/scenarioeditor/scenarioDrawHelpers";
import { newControlMeasureDefaults } from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import { useControlMeasureDrawSession } from "@/modules/scenarioeditor/useControlMeasureDrawSession";
import { useControlMeasureEditSession } from "@/modules/scenarioeditor/useControlMeasureEditSession";
import {
  getUnitSnapCandidates,
  type UnitSnapMap,
} from "@/modules/scenarioeditor/unitSnapCandidates";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { TacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";

/**
 * What the map is currently armed with — one union, one writer.
 *
 * Before ADR-0006 the draw stack carried three independent flags (`currentDrawType`,
 * `isDrawing`, `isModifying`) and control measures would have added two more. They are
 * mutually exclusive by construction, so they collapse into one union and the old flags
 * become computeds over it. Arming is also the point where an open tactical-draw
 * session must settle, and one union gives that exactly one place to live.
 */
export type ArmedTool =
  | { kind: "none" }
  | { kind: "plainDraw"; drawType: DrawType }
  | { kind: "plainModify" }
  | { kind: "cmDraw"; graphicKind: ControlMeasureKind }
  | { kind: "cmEdit"; featureId: FeatureId };

/**
 * The keyboard contract the armed-tool owner exposes upwards.
 *
 * Escape, Enter and Ctrl+Z used to be handled in three unrelated places, none of which
 * stopped propagation, so which one "won" was registration-order luck. They collapse
 * onto this one owner, which follows the first-refusal shape already used for the route
 * details panel: return `true` when it handled the key, `false` to fall through
 * completely untouched.
 *
 * It is a separate interface from `useScenarioDraw`'s full return because
 * `ScenarioEditor` — which owns undo/redo and sits *above* the map view — can only see
 * it through the registration holder, never through `provide`/`inject`.
 */
export interface ScenarioKeyboardOwner {
  handleEscape(event?: KeyboardEvent): boolean;
  handleEnter(event?: KeyboardEvent): boolean;
  handleUndoKey(event?: KeyboardEvent): boolean;
  /**
   * Separate from `handleUndoKey` because an open edit session has its own
   * `SessionHistory` with both directions; one guard for both keys could only ever
   * swallow, never steer.
   */
  handleRedoKey(event?: KeyboardEvent): boolean;
  /**
   * What undo/redo *availability* means right now, or `null` when the owner does not
   * own them and scenario `canUndo`/`canRedo` apply.
   *
   * The buttons need this and the key handlers do not: a key that is swallowed simply
   * does nothing, but an Undo button left enabled by scenario history while a draw
   * swallows the action would be a control that visibly does nothing — and one
   * disabled by scenario history during an edit would hide a session undo that is
   * genuinely available.
   */
  ownedUndoState(): { canUndo: boolean; canRedo: boolean } | null;
}

export interface UseScenarioDrawOptions {
  /**
   * The map engine. Passed explicitly by the map views, which cannot `inject` the key
   * they `provide` themselves; everything else injects.
   */
  engine?: ShallowRef<ScenarioMapEngine | undefined>;
  nativeOpenLayersMap?: ShallowRef<OLMap | null | undefined>;
  featureSelectInteraction?: ShallowRef<Select | null | undefined>;
  /** The settle-first render feed. Absent on OpenLayers, which has no tactical-draw. */
  renderFeed?: TacticalGraphicRenderFeed | null;
}

/**
 * The subset of a draw interaction the armed-tool owner drives. Both engines satisfy
 * it; `finishPathDrawing`/`destroy` are MapLibre-only.
 */
interface ScenarioDrawInteraction {
  startDrawing(drawType: DrawType): void;
  currentDrawType: Ref<DrawType | null>;
  startModify(): void;
  isModifying: Ref<boolean>;
  cancel(): void;
  isDrawing: Ref<boolean>;
  finishPathDrawing?: () => void;
  destroy?: () => void;
}

function isOpenLayersMap(nativeMap: unknown): nativeMap is OLMap {
  return Boolean(nativeMap && typeof (nativeMap as OLMap).addInteraction === "function");
}

/**
 * The armed-tool owner for the scenario map.
 *
 * Lives on the map view and is `provide`d, not created by `MapEditorDrawToolbar`: the
 * toolbar is `v-if`'d and so unmounted most of the time, while control-measure editing
 * is driven from the details panel, which is reachable with the toolbar closed. The
 * side effect is an improvement — `snap`/`translate`/`freehand` stop silently resetting
 * every time the toolbar is reopened.
 */
export function useScenarioDraw(options: UseScenarioDrawOptions = {}) {
  const activeScenario = injectStrict(activeScenarioKey);
  const engineRef = options.engine ?? injectStrict(activeScenarioMapEngineKey);
  const activeLayerIdRef = injectStrict(activeLayerKey);
  const nativeOpenLayersMapRef =
    options.nativeOpenLayersMap ??
    (inject(activeNativeMapKey, shallowRef()) as ShallowRef<OLMap | null | undefined>);
  const featureSelectInteractionRef =
    options.featureSelectInteraction ??
    (inject(activeFeatureSelectInteractionKey, shallowRef()) as ShallowRef<
      Select | null | undefined
    >);
  // `null` is a meaningful value here (OpenLayers has no tactical-draw), so it must
  // not fall through to the inject.
  const renderFeed =
    options.renderFeed !== undefined
      ? options.renderFeed
      : inject(tacticalGraphicRenderFeedKey, null);

  const toolbarStore = useMainToolbarStore();
  const { addMultiple, currentDrawStyle } = storeToRefs(toolbarStore);
  const { selectedFeatureIds, activeFeatureId } = useSelectedItems();
  const recordingStore = useRecordingStore();
  const controlMeasureToolStore = useControlMeasureToolStore();
  const { isRecordingGeometry } = storeToRefs(recordingStore);
  const mapSelectStore = useMapSelectStore();

  const snap = ref(true);
  const translate = ref(false);
  const freehand = ref(false);
  const layer = shallowRef<VectorLayer<any>>();
  const mapAdapter = computed(() => engineRef.value?.map);
  const nativeMap = computed(() => mapAdapter.value?.getNativeMap());
  const openLayersInteraction = shallowRef<ReturnType<
    typeof useEditingInteraction
  > | null>(null);
  const mapLibreInteraction = shallowRef<ReturnType<
    typeof useMapLibreDrawInteraction
  > | null>(null);
  const interaction = computed<ScenarioDrawInteraction | null>(
    () => openLayersInteraction.value ?? mapLibreInteraction.value,
  );

  const armed = shallowRef<ArmedTool>({ kind: "none" });

  // Selection suppression snapshots rather than force-enables. This composable used to
  // die with the draw toolbar, so writing `true` on disarm was harmless; hoisted, it
  // outlives the measurement toolbar and routing, both of which suppress the same two
  // flags. The refcounted token covers the MapLibre click path, which gates on
  // `selectionSuppressed`; the flags cover the OpenLayers interactions, which are bound
  // directly to them.
  let previousSelectState: { unit: boolean; feature: boolean } | null = null;
  let releaseSelectionSuppression: (() => void) | null = null;

  function suppressSelection() {
    if (previousSelectState) return;
    previousSelectState = {
      unit: mapSelectStore.unitSelectEnabled,
      feature: mapSelectStore.featureSelectEnabled,
    };
    mapSelectStore.unitSelectEnabled = false;
    mapSelectStore.featureSelectEnabled = false;
    releaseSelectionSuppression = mapSelectStore.suppressSelection();
  }

  function restoreSelection() {
    if (!previousSelectState) return;
    mapSelectStore.unitSelectEnabled = previousSelectState.unit;
    mapSelectStore.featureSelectEnabled = previousSelectState.feature;
    previousSelectState = null;
    releaseSelectionSuppression?.();
    releaseSelectionSuppression = null;
  }

  watch(
    [nativeOpenLayersMapRef, activeLayerIdRef],
    ([olMap, layerId]) => {
      if (!olMap) return;
      const { getOlLayerById } = useFeatureLayerUtils(olMap, { activeScenario });
      if (layerId) {
        layer.value = getOlLayerById(layerId);
      } else if (activeScenario.geo.layerItemsLayers.value?.length > 0) {
        layer.value = getOlLayerById(activeScenario.geo.layerItemsLayers.value[0].id);
      }
    },
    { immediate: true },
  );

  const selectedGeometryFeatures = () =>
    [...selectedFeatureIds.value]
      .map(
        (featureId) => activeScenario.geo.getGeometryLayerItemById(featureId).layerItem,
      )
      .filter(Boolean) as GeometryLayerItem[];

  const addFeature = (feature: GeometryLayerItem) => {
    const addedFeature = addScenarioDrawFeature(
      activeScenario,
      feature,
      activeLayerIdRef.value,
      currentDrawStyle.value ?? {},
    );
    if (addedFeature) activeFeatureId.value = addedFeature.id;
  };

  const updateFeatures = (
    updates: Array<{
      featureId: FeatureId;
      geometry: GeometryLayerItem["geometry"];
      geometryMeta?: Partial<GeometryLayerItem["geometryMeta"]>;
    }>,
  ) => {
    activeScenario.store.groupUpdate(
      () => {
        updates.forEach((update) =>
          updateScenarioFeatureGeometry(
            activeScenario,
            update.featureId,
            update.geometry,
            update.geometryMeta ?? {},
            {},
            isRecordingGeometry.value,
            { noEmit: false },
          ),
        );
      },
      { label: "updateFeatureGeometry", value: updates[0]?.featureId ?? "batch" },
    );
  };

  // These watchers create the engine-specific interaction once the corresponding map is
  // ready, and rebuild it when the map itself is replaced. The rebuild is new with the
  // hoist: this composable now outlives `onMapReady`, which reconstructs the adapter on
  // every map creation, so a slot filled once would stay bound to a destroyed map.
  let boundOpenLayersMap: OLMap | null = null;
  let boundMapAdapter: MapAdapter | null = null;

  watch(
    [nativeMap, layer],
    ([native, activeLayer]) => {
      if (!isOpenLayersMap(native) || !activeLayer) return;
      if (openLayersInteraction.value && native === boundOpenLayersMap) return;
      // `useEditingInteraction` has no disposer; the interactions it added went down
      // with the map they were added to.
      openLayersInteraction.value = useEditingInteraction(native, activeLayer, {
        addMultiple,
        select: featureSelectInteractionRef.value ?? undefined,
        addHandler: (olFeature, olLayer) => {
          const newFeature = addOlDrawFeature(
            activeScenario,
            olFeature,
            olLayer,
            currentDrawStyle.value ?? {},
          );
          if (newFeature) activeFeatureId.value = newFeature.id;
        },
        modifyHandler: (olFeatures) => {
          olFeatures.forEach((feature) =>
            updateScenarioFeatureGeometryFromOlFeature(
              activeScenario,
              feature,
              isRecordingGeometry.value,
            ),
          );
        },
        snap,
        translate,
        freehand,
      });
      boundOpenLayersMap = native;
    },
    { immediate: true },
  );

  watch(
    [mapAdapter, nativeMap],
    ([adapter, native]) => {
      if (isOpenLayersMap(native)) return;
      if (adapter === boundMapAdapter) return;
      mapLibreInteraction.value?.destroy();
      mapLibreInteraction.value = null;
      boundMapAdapter = adapter ?? null;
      if (!adapter) return;
      mapLibreInteraction.value = useMapLibreDrawInteraction(adapter, {
        addMultiple,
        snap,
        translate,
        freehand,
        getSelectedFeatures: selectedGeometryFeatures,
        addFeature,
        updateFeatures,
      });
    },
    { immediate: true },
  );

  /**
   * Is authoring control measures possible at all? Derived from the engine having a
   * tactical-draw surface rather than from an engine name, so OpenLayers degrades by
   * rendering the control-measure affordances disabled instead of hiding them — a
   * missing button is indistinguishable from a missing feature.
   */
  const canControlMeasures = computed(() => Boolean(engineRef.value?.draw));

  // Units are not graphics, so tactical-draw cannot see them through its built-in
  // sources. They reach it as external candidates, read from the map on each snap
  // resolution rather than captured — the native map is replaced on every basemap swap,
  // and the rendered features are the current time's positions.
  function unitSnapCandidates(request: SnapCandidateRequest) {
    const native = nativeMap.value;
    if (!native || isOpenLayersMap(native)) return [];
    return getUnitSnapCandidates(native as UnitSnapMap, request);
  }

  // One `snap` button, two mechanisms: the plain interactions read the ref directly,
  // tactical-draw takes engine-level snapping options. Re-asserted rather than diffed —
  // the surface documents this call as cheap and idempotent, and re-asserting is what
  // makes it survive both a `style.load` re-attach and a rebuilt surface.
  watchEffect(() => {
    engineRef.value?.draw?.setSnappingOptions({
      enabled: snap.value,
      sources: {
        graphics: true,
        graphicGeometry: true,
        external: unitSnapCandidates,
      },
    });
  });

  // A basemap swap destroys the tactical-draw façade and builds a new one. Destroying
  // it rejects an open session's promise *without* firing `onCommit`, so an edit would
  // lose everything the user had reshaped — the one settle path that cannot go through
  // the render feed's own inputs, because nothing in the store changed. Registered here
  // rather than in the map view because this is where the sessions are owned.
  watch(
    () => engineRef.value?.draw,
    (surface, _previous, onCleanup) => {
      if (!surface || !renderFeed) return;
      onCleanup(surface.onBeforeDetach(() => renderFeed.settle("detach")));
    },
    { immediate: true },
  );

  const currentDrawType = computed(() =>
    armed.value.kind === "plainDraw" ? armed.value.drawType : null,
  );
  const isDrawing = computed(
    () => armed.value.kind === "plainDraw" || armed.value.kind === "cmDraw",
  );
  const isModifying = computed(() => armed.value.kind === "plainModify");

  // The control-measure draw session. Everything transient lives in there; the only
  // thing that reaches back is a settled session asking what to arm next.
  const controlMeasureDraw = useControlMeasureDrawSession({
    scenario: activeScenario,
    // Read through a getter, never captured: the surface is replaced on every map
    // creation and its façade on every basemap swap.
    surface: () => engineRef.value?.draw,
    renderFeed,
    // Session-sticky UI state, read per session rather than captured: a default changed
    // between two draws applies to the second one. Narrowed per kind, because authored
    // colour is offered for the Generic Graphics kinds only.
    defaults: (graphicKind) =>
      newControlMeasureDefaults(controlMeasureToolStore.defaults, graphicKind),
    onSettled({ committed, graphicKind }) {
      // `addMultiple` re-arms on **commit only**, so Escape still escapes a locked
      // tool rather than being answered with a fresh session.
      if (committed && addMultiple.value) {
        arm({ kind: "cmDraw", graphicKind });
        return;
      }
      if (armed.value.kind === "cmDraw") arm({ kind: "none" });
    },
  });

  // The control-measure edit session. Entered only by an explicit gesture from the
  // details panel — a click selects and nothing more, because under settle-first
  // click-to-edit would leave an open session behind nearly every map interaction.
  const controlMeasureEdit = useControlMeasureEditSession({
    scenario: activeScenario,
    surface: () => engineRef.value?.draw,
    renderFeed,
    // Shape is the only recordable thing on a control measure, and it reuses the same
    // flag plain geometry does — see `applyScenarioControlMeasureEdit`.
    recordShape: () => isRecordingGeometry.value,
    onSettled({ featureId }) {
      // No re-arm case: an edit ends when its graphic is done, whether it closed on
      // a click away or was settled by something else.
      if (armed.value.kind === "cmEdit" && armed.value.featureId === featureId) {
        arm({ kind: "none" });
      }
    },
  });

  function applyArm(tool: ArmedTool, deferControlMeasureSession = false) {
    armed.value = tool;
    if (tool.kind !== "cmDraw") controlMeasureDraw.stop();
    if (tool.kind !== "cmEdit") controlMeasureEdit.stop();

    const startControlMeasureSession = () => {
      // Identity, not equality: something re-armed between the deferral and here, and
      // whatever it armed has already opened its own session.
      if (armed.value !== tool) return;
      if (tool.kind === "cmDraw") {
        controlMeasureDraw.start(tool.graphicKind);
      } else if (tool.kind === "cmEdit") {
        // Nothing editable behind that id — deleted, or an unsupported kind the library
        // cannot put handles on. Fall straight back to disarmed rather than leaving the
        // map armed at nothing and clicks swallowed.
        if (!controlMeasureEdit.start(tool.featureId)) armed.value = { kind: "none" };
      }
    };

    if (tool.kind === "cmDraw" || tool.kind === "cmEdit") {
      if (deferControlMeasureSession) void nextTick(startControlMeasureSession);
      else startControlMeasureSession();
    }

    withInteraction((activeInteraction) => {
      switch (tool.kind) {
        case "plainDraw":
          activeInteraction.startDrawing(tool.drawType);
          break;
        case "plainModify":
          // `startModify` is a toggle on both engines; only call it to turn it on.
          if (!activeInteraction.isModifying.value) activeInteraction.startModify();
          break;
        default:
          activeInteraction.cancel();
      }
    });
  }

  /**
   * Arm a tool. The second settle trigger from ADR-0006, with the same disposition as
   * the render feed's guard: an open edit closes and keeps its work, an open draw
   * aborts. It goes through the feed rather than talking to the surface directly, so
   * there is exactly one settle mechanism.
   */
  function arm(tool: ArmedTool) {
    // An open **edit** settles by folding its work into the store, and that write does
    // not always reach the feed synchronously: with geometry recording on the fold goes
    // through `addTacticalGraphicStateControlPoints`, which signals only via
    // `featureStateCounter`, and the feed's watcher on it is `flush: "pre"` — the
    // render it schedules is *queued*, not synchronous. Opening the replacement session
    // in this same tick would hand it straight to that queued render's
    // `settle("render")`, which would abort it before the first click and leave the map
    // disarmed. Same hazard, same fix as `useControlMeasureDrawSession.finish()`: let
    // the queued render flush before the replacement opens. A draw settles by aborting
    // and writes nothing, so it leaves nothing queued and needs no deferral.
    const editWasOpen = controlMeasureEdit.featureId.value !== null;
    renderFeed?.settle("arm");
    applyArm(tool, editWasOpen);
  }

  // The plain interactions keep their own `isDrawing`/`isModifying`/`currentDrawType`
  // refs and can end a tool on their own — a Point commits on a single click without
  // `addMultiple`, and `startModify` toggles. `armed` is the only writer for *arming*,
  // so their state is synced back down here rather than left as a second source of
  // truth.
  watch(
    () => {
      const active = interaction.value;
      if (!active) return null;
      return {
        drawing: active.isDrawing.value,
        modifying: active.isModifying.value,
        drawType: active.currentDrawType.value,
      };
    },
    (state) => {
      if (!state) return;
      if (state.drawing && state.drawType) {
        armed.value = { kind: "plainDraw", drawType: state.drawType };
      } else if (state.modifying) {
        armed.value = { kind: "plainModify" };
      } else if (armed.value.kind === "plainDraw" || armed.value.kind === "plainModify") {
        armed.value = { kind: "none" };
      }
    },
    { deep: true },
  );

  // Generalised from `isDrawing`: clicks are swallowed whenever *anything* is armed, so
  // a control-measure draw or edit does not double as a selection gesture.
  watch(
    () => armed.value.kind !== "none",
    (isArmed) => {
      if (isArmed) {
        translate.value = false;
        suppressSelection();
      } else {
        restoreSelection();
      }
    },
  );

  watch(translate, (enabled) => {
    if (enabled) arm({ kind: "none" });
  });

  // Closing the draw toolbar used to tear this composable down, which cancelled
  // whatever was armed. Hoisted it no longer does, so disarm explicitly — otherwise the
  // map stays armed and unclickable behind a closed toolbar. `cmEdit` is exempt: it is
  // driven from the details panel, which is reachable with the toolbar closed.
  watch(
    () => toolbarStore.currentToolbar,
    (toolbar) => {
      if (toolbar === "draw" || armed.value.kind === "cmEdit") return;
      // `translate` is a live map mode rather than a preference, so it does not get to
      // stay on behind a closed toolbar the way `snap` and `freehand` do.
      translate.value = false;
      arm({ kind: "none" });
    },
  );

  function withInteraction(action: (activeInteraction: ScenarioDrawInteraction) => void) {
    if (interaction.value) {
      action(interaction.value);
      return;
    }
    void nextTick(() => {
      if (interaction.value) action(interaction.value);
    });
  }

  function deleteSelected() {
    // Every store write owes a settle first: a `render()` whose batch omits the graphic
    // being edited aborts that session.
    renderFeed?.settle("commit");
    activeScenario.store.groupUpdate(
      () => {
        [...selectedFeatureIds.value.values()].forEach((featureId) =>
          activeScenario.geo.deleteFeature(featureId),
        );
      },
      { label: "batchLayer", value: "dummy" },
    );
  }

  function handleEscape(event?: KeyboardEvent): boolean {
    if (armed.value.kind === "none") return false;
    // Armed: handle it and stop, so the selection-clearing listener below does not also
    // fire. Escape therefore takes two presses to also clear the selection.
    event?.stopPropagation();
    arm({ kind: "none" });
    return true;
  }

  /**
   * First refusal on Escape, taken in the **capture** phase on `window`.
   *
   * tactical-draw registers its own bubble-phase `keydown` listener on `window` for the
   * life of every session and answers Escape with `fail(TacticalDrawAbortError)`. That
   * is the right disposition for a draw and the wrong one for an edit: an abort skips
   * `onCommit`, so the fold never happens and the user's reshaping is silently
   * discarded, which ADR-0006 forbids.
   *
   * The document-level `GlobalEvents` handler only outruns that listener by stopping
   * propagation, and it is skipped entirely on three pre-existing conditions — the
   * component is `v-if="shortcutsEnabled"`, the body is gated on `uiStore.escEnabled`
   * (false while a popover is open, while measuring, …), and it returns early for a
   * Reka target. In every one of those the library's listener still fires and eats the
   * edit. Ownership therefore cannot rest on propagation ordering against a listener
   * this host does not own, so the owner takes the key first, before every other
   * listener including the library's.
   *
   * Deliberately narrowed to the control-measure tools: nothing in the library listens
   * on behalf of a plain tool, and swallowing Escape this early for those would stop a
   * modal or a popover closing.
   */
  function onWindowEscapeCapture(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    if (armed.value.kind !== "cmDraw" && armed.value.kind !== "cmEdit") return;
    handleEscape(event);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onWindowEscapeCapture, { capture: true });
  }

  function handleEnter(event?: KeyboardEvent): boolean {
    if (armed.value.kind === "cmDraw") {
      // The library already finishes on a double-click; Enter is the keyboard
      // equivalent, and the session refuses it below `minControlPoints` itself.
      event?.stopPropagation();
      controlMeasureDraw.commit();
      return true;
    }
    if (armed.value.kind === "cmEdit") {
      // Enter finishes an edit the same way it finishes a draw. Disarming is the
      // settle, and an edit settles by closing and keeping its work.
      event?.stopPropagation();
      arm({ kind: "none" });
      return true;
    }
    if (armed.value.kind !== "plainDraw") return false;
    event?.stopPropagation();
    interaction.value?.finishPathDrawing?.();
    return true;
  }

  function handleUndoKey(event?: KeyboardEvent): boolean {
    if (armed.value.kind === "cmDraw") {
      // Swallowed outright. `DrawSession` has no history and no remove-last-point, so
      // letting the key reach scenario undo would settle a half-drawn graphic into the
      // store. During draw there is only abort.
      event?.stopPropagation();
      return true;
    }
    if (armed.value.kind !== "cmEdit") return false;
    // An edit session *does* have history, so the key drives that instead of scenario
    // undo — and is still swallowed when there is nothing left to undo, because the
    // alternative is undoing whatever the user did before opening the session.
    event?.stopPropagation();
    controlMeasureEdit.undo();
    return true;
  }

  function handleRedoKey(event?: KeyboardEvent): boolean {
    if (armed.value.kind === "cmDraw") {
      event?.stopPropagation();
      return true;
    }
    if (armed.value.kind !== "cmEdit") return false;
    event?.stopPropagation();
    controlMeasureEdit.redo();
    return true;
  }

  function ownedUndoState() {
    // During a draw there is only abort, so both directions are unavailable rather
    // than merely swallowed.
    if (armed.value.kind === "cmDraw") return { canUndo: false, canRedo: false };
    if (armed.value.kind === "cmEdit") {
      return {
        canUndo: controlMeasureEdit.canUndo.value,
        canRedo: controlMeasureEdit.canRedo.value,
      };
    }
    return null;
  }

  // `ScenarioEditor` owns undo/redo and sits above the map view, so it cannot inject
  // what the map view provides. It provides this holder instead and the owner registers
  // itself into it.
  const keyboardOwnerRef = inject(scenarioKeyboardOwnerKey, null);
  const keyboardOwner: ScenarioKeyboardOwner = {
    handleEscape,
    handleEnter,
    handleUndoKey,
    handleRedoKey,
    ownedUndoState,
  };
  if (keyboardOwnerRef) keyboardOwnerRef.value = keyboardOwner;

  onScopeDispose(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", onWindowEscapeCapture, { capture: true });
    }
    if (keyboardOwnerRef?.value === keyboardOwner) keyboardOwnerRef.value = null;
    mapLibreInteraction.value?.destroy();
    mapLibreInteraction.value = null;
    restoreSelection();
  });

  return {
    armed,
    arm,
    startDrawing: (drawType: DrawType) => arm({ kind: "plainDraw", drawType }),
    currentDrawType,
    startModify: () =>
      arm(
        armed.value.kind === "plainModify" ? { kind: "none" } : { kind: "plainModify" },
      ),
    isModifying,
    cancel: () => arm({ kind: "none" }),
    isDrawing,
    /** Non-null exactly while a control-measure draw session is open. */
    controlMeasureDrawProgress: controlMeasureDraw.progress,
    commitControlMeasureDraw: () => controlMeasureDraw.commit(),
    /** Non-null exactly while a control-measure edit session is open. */
    controlMeasureEditFeatureId: controlMeasureEdit.featureId,
    controlMeasureEditCanUndo: controlMeasureEdit.canUndo,
    controlMeasureEditCanRedo: controlMeasureEdit.canRedo,
    /** Label-drag mode — additive to reshape, and sticky across edit sessions. */
    controlMeasureLabelDrag: controlMeasureEdit.labelDrag,
    setControlMeasureLabelDrag: (enabled: boolean) =>
      controlMeasureEdit.setLabelDrag(enabled),
    /** The explicit edit gesture. Arming settles whatever was open first. */
    startControlMeasureEdit: (featureId: FeatureId) => arm({ kind: "cmEdit", featureId }),
    /** `engine.draw` is defined — control measures can be authored on this engine. */
    canControlMeasures,
    deleteSelected,
    handleEscape,
    handleEnter,
    handleUndoKey,
    handleRedoKey,
    snap,
    translate,
    freehand,
  };
}

export type ScenarioDraw = ReturnType<typeof useScenarioDraw>;
