import { onScopeDispose, ref, shallowRef } from "vue";
import {
  TacticalDraw,
  isTacticalDrawAbortError,
  type DrawSession,
  type EditMode,
  type MapAdapter,
} from "@orbat-mapper/tactical-draw";
import {
  getDefaultOptions,
  type ControlMeasure,
  type ControlMeasureKind,
} from "@orbat-mapper/control-measures";
import { nanoid } from "@/utils/ids";

/**
 * Owns a {@link TacticalDraw} controller bound to a map for the lifetime of
 * the calling component scope. Engine-agnostic: it drives the draw/edit core
 * (`@orbat-mapper/tactical-draw`) through the `MapAdapter` ABI, so the same
 * logic serves both the MapLibre and OpenLayers map modes — the caller brings
 * the engine-specific adapter (`MapLibreAdapter` / `OpenLayersAdapter`).
 *
 * Scaffold: measures live only in this composable's memory. Persisting them
 * into the scenario store (alongside the existing feature model) is the next
 * integration step and is intentionally left out here.
 */
export function useTacticalDraw(adapter: MapAdapter) {
  const td = new TacticalDraw(adapter, { generateId: () => `tg-${nanoid()}` });

  /** Authoritative list of committed measures rendered on the graphics layer. */
  const measures = shallowRef<ControlMeasure[]>([]);
  const isDrawing = ref(false);
  const drawCanCommit = ref(false);
  const drawPointCount = ref(0);
  const editingId = ref<string | null>(null);

  let drawAbort: AbortController | null = null;
  let drawSession: DrawSession | null = null;
  let editAbort: AbortController | null = null;

  async function startDraw(kind: ControlMeasureKind) {
    if (drawAbort) return;
    // A new draw preempts any open edit (including the auto-edit phase below).
    editAbort?.abort();
    const abort = new AbortController();
    drawAbort = abort;
    isDrawing.value = true;
    try {
      const { measure } = await td.draw(
        { kind, options: getDefaultOptions(kind) },
        {
          signal: abort.signal,
          onSession: (session) => {
            drawSession = session;
            drawCanCommit.value = session.canCommit;
            drawPointCount.value = session.controlPoints.length;
            session.onChange((s) => {
              drawCanCommit.value = s.canCommit;
              drawPointCount.value = s.controlPoints.length;
            });
          },
        },
      );
      measures.value = [...measures.value, measure];
      td.render(measures.value);
      // Drop straight into editing the freshly drawn measure.
      void startEdit(measure);
    } catch (error) {
      if (!isTacticalDrawAbortError(error)) throw error;
    } finally {
      if (drawAbort === abort) {
        drawAbort = null;
        drawSession = null;
        isDrawing.value = false;
        drawCanCommit.value = false;
        drawPointCount.value = 0;
      }
    }
  }

  /** Commit the in-flight variable-length draw, if any. */
  function finishDraw() {
    drawSession?.commit();
  }

  /** Abort the in-flight draw, if any. */
  function cancelDraw() {
    drawAbort?.abort();
  }

  async function startEdit(
    measure: ControlMeasure,
    modes: EditMode[] = ["reshape", "translate", "rotate"],
  ) {
    drawAbort?.abort();
    editAbort?.abort();
    const abort = new AbortController();
    editAbort = abort;
    editingId.value = measure.id;
    try {
      const { measure: edited } = await td.edit(measure, {
        signal: abort.signal,
        modes,
      });
      measures.value = measures.value.map((m) => (m.id === edited.id ? edited : m));
      td.render(measures.value);
    } catch (error) {
      if (!isTacticalDrawAbortError(error)) throw error;
    } finally {
      if (editAbort === abort) {
        editAbort = null;
        editingId.value = null;
      }
    }
  }

  /** Stop any active edit without discarding the measure. */
  function stopEdit() {
    editAbort?.abort();
  }

  // Click a rendered measure to edit it.
  const unsubscribePick = td.onPick(td.layerIds.graphics, (event) => {
    const found = measures.value.find((m) => m.id === event.id);
    if (found) void startEdit(found);
  });

  onScopeDispose(() => {
    drawAbort?.abort();
    editAbort?.abort();
    unsubscribePick();
    td.destroy();
  });

  return {
    measures,
    isDrawing,
    drawCanCommit,
    drawPointCount,
    editingId,
    startDraw,
    finishDraw,
    cancelDraw,
    startEdit,
    stopEdit,
  };
}
