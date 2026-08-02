// PROTOTYPE — throwaway. Wayfinder ticket #640 ("Control-measure draw and edit UI").
//
// The smallest possible driver over the tactical-draw surface that #634/PR #644 stood
// up, so the three UI variants can be judged against *real* drawing and editing rather
// than a mock. Deliberately not production shaped:
//
//   - graphics live in an in-memory array, never in the scenario store (no undo/redo,
//     no persistence, no time projection). Commit-on-settle is simulated by pushing
//     the settled measure into that array and re-rendering.
//   - no identity/status modelling beyond a 4-entry colour table, enough to see what
//     #636's projection would look like on screen.
//
// Delete with the rest of `cmPrototype/` once a variant wins.
import { computed, markRaw, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { nanoid } from "nanoid";
import type { Ref } from "vue";
import type {
  ControlMeasure,
  ControlMeasureKind,
  ControlMeasureMetadata,
} from "@orbat-mapper/control-measures";
import {
  getDefaultOptions,
  listControlMeasureMetadata,
} from "@orbat-mapper/control-measures";
import type {
  DrawSession,
  EditSession,
  Graphic,
  SessionHistoryState,
} from "@orbat-mapper/tactical-draw";
import { isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";

/** Only kinds with a resolved draw rule can actually be drawn. */
export const DRAWABLE = listControlMeasureMetadata()
  .filter((m) => m.rule)
  .sort((a, b) => a.name.localeCompare(b.name));

export const BY_ENTITY: { entity: string; items: ControlMeasureMetadata[] }[] = (() => {
  const map = new Map<string, ControlMeasureMetadata[]>();
  for (const m of DRAWABLE) {
    const list = map.get(m.entity) ?? [];
    list.push(m);
    map.set(m.entity, list);
  }
  return [...map.entries()]
    .map(([entity, items]) => ({ entity, items }))
    .sort((a, b) => a.entity.localeCompare(b.entity));
})();

/** Prototype stand-in for #636's `identityColor` (real one derives from milsymbol). */
export const IDENTITIES = [
  { sid: "3", label: "Friend", color: "#00a8f0" },
  { sid: "6", label: "Hostile", color: "#ff3031" },
  { sid: "4", label: "Neutral", color: "#00c000" },
  { sid: "1", label: "Unknown", color: "#ffe100" },
] as const;

export type IdentityValue = (typeof IDENTITIES)[number]["sid"];

export interface CmProperties {
  standardIdentity: IdentityValue;
  status: "0" | "1";
  colorMode: "identity" | "monochrome";
}

const DEFAULT_PROPS: CmProperties = {
  standardIdentity: "3",
  status: "0",
  colorMode: "identity",
};

function styleFor(p: CmProperties) {
  const color =
    p.colorMode === "monochrome"
      ? "#000000"
      : (IDENTITIES.find((i) => i.sid === p.standardIdentity)?.color ?? "#000000");
  return { color, strokeWidth: 2, ...(p.status === "1" ? { strokeDash: [8, 6] } : {}) };
}

export function useCmPrototype(engineRef: Ref<ScenarioMapEngine | null | undefined>) {
  // Never deeply reactive — the engine caches rendered output on Graphic identity.
  const graphics = shallowRef<ControlMeasure[]>([]);
  const selectedId = ref<string | null>(null);

  const armedKind = ref<ControlMeasureKind | null>(null);
  const drawPoints = ref(0);
  const drawMin = ref(0);
  const drawMax = ref<number | undefined>(undefined);
  const drawCanCommit = ref(false);

  const editingId = ref<string | null>(null);
  const editDirty = ref(false);
  const editHistory = ref<SessionHistoryState>({ canUndo: false, canRedo: false });

  /** Draft properties for the *next* draw — session-sticky, as #636 decided. */
  const draft = ref<CmProperties>({ ...DEFAULT_PROPS });

  let drawSession: DrawSession | null = null;
  let editSession: EditSession | null = null;
  let abort: AbortController | null = null;

  const surface = computed(() => engineRef.value?.draw ?? null);
  const ready = computed(() => Boolean(surface.value?.tacticalDraw));

  const mode = computed<"idle" | "drawing" | "editing">(() =>
    armedKind.value ? "drawing" : editingId.value ? "editing" : "idle",
  );

  const selected = computed(
    () => graphics.value.find((g) => g.id === selectedId.value) ?? null,
  );
  const editing = computed(
    () => graphics.value.find((g) => g.id === editingId.value) ?? null,
  );

  function render() {
    surface.value?.render(graphics.value as readonly Graphic[]);
  }

  function propsOf(g: ControlMeasure): CmProperties {
    return { ...DEFAULT_PROPS, ...((g.properties ?? {}) as Partial<CmProperties>) };
  }

  function settleAll() {
    drawSession?.abort();
    editSession?.close();
    abort?.abort();
  }

  // ---- draw -----------------------------------------------------------------

  function arm(kind: ControlMeasureKind) {
    const td = surface.value?.tacticalDraw;
    if (!td) return;
    settleAll();
    armedKind.value = kind;
    selectedId.value = null;
    const properties = { ...draft.value };
    abort = new AbortController();
    td.draw(
      {
        kind,
        options: getDefaultOptions(kind),
        style: styleFor(properties),
        properties,
      },
      {
        signal: abort.signal,
        sizeAnchor: "ground",
        onSession: (s) => {
          drawSession = markRaw(s);
          drawMin.value = s.minControlPoints;
          drawMax.value = s.maxControlPoints;
          drawPoints.value = s.controlPoints.length;
          drawCanCommit.value = s.canCommit;
          s.onChange(() => {
            drawPoints.value = s.controlPoints.length;
            drawCanCommit.value = s.canCommit;
          });
        },
      },
    )
      .then(({ graphic }) => {
        // Commit-on-settle: one array push per settled session.
        graphics.value = [...graphics.value, { ...graphic, id: graphic.id || nanoid() }];
        selectedId.value = graphic.id;
        render();
      })
      .catch((e) => {
        if (!isTacticalDrawAbortError(e)) throw e;
      })
      .finally(() => {
        drawSession = null;
        armedKind.value = null;
        drawPoints.value = 0;
        drawCanCommit.value = false;
      });
  }

  const commitDraw = () => drawSession?.commit();

  // ---- edit -----------------------------------------------------------------

  function startEdit(id: string) {
    const td = surface.value?.tacticalDraw;
    const target = graphics.value.find((g) => g.id === id);
    if (!td || !target) return;
    settleAll();
    editingId.value = id;
    selectedId.value = id;
    abort = new AbortController();
    td.edit(target, {
      signal: abort.signal,
      modes: ["reshape", "transform"],
      closeOnClickAway: false,
      onSession: (s) => {
        const es = s as EditSession;
        editSession = markRaw(es);
        editDirty.value = es.dirty;
        editHistory.value = { ...es.history.state };
        es.onChange(() => {
          editDirty.value = es.dirty;
          editHistory.value = { ...es.history.state };
        });
        es.history.subscribe((state) => {
          editHistory.value = { ...state };
        });
      },
    })
      .then(({ graphic }) => {
        graphics.value = graphics.value.map((g) => (g.id === graphic.id ? graphic : g));
        render();
      })
      .catch((e) => {
        if (!isTacticalDrawAbortError(e)) throw e;
      })
      .finally(() => {
        editSession = null;
        editingId.value = null;
        editDirty.value = false;
        editHistory.value = { canUndo: false, canRedo: false };
      });
  }

  const closeEdit = () => editSession?.close();
  const undo = () => editSession?.history.undo() ?? false;
  const redo = () => editSession?.history.redo() ?? false;

  /** Live property edits: applied to the open edit session, or the draft. */
  function setProperty<K extends keyof CmProperties>(key: K, value: CmProperties[K]) {
    if (editSession) {
      const next = { ...propsOf(editSession.workingGraphic), [key]: value };
      editSession.setStyle(styleFor(next));
      editSession.updateGraphic((g) => ({
        ...g,
        properties: { ...g.properties, ...next },
      }));
      return;
    }
    if (selected.value && mode.value === "idle") {
      const target = selected.value;
      const next = { ...propsOf(target), [key]: value };
      graphics.value = graphics.value.map((g) =>
        g.id === target.id
          ? { ...g, properties: { ...g.properties, ...next }, style: styleFor(next) }
          : g,
      );
      render();
      return;
    }
    draft.value = { ...draft.value, [key]: value };
  }

  /** Properties the UI should show: the edit session's, the selection's, or the draft. */
  const activeProperties = computed<CmProperties>(() => {
    const target = editing.value ?? (mode.value === "idle" ? selected.value : null);
    return target ? propsOf(target) : draft.value;
  });

  function select(id: string | null) {
    selectedId.value = id;
  }

  function remove(id: string) {
    settleAll();
    graphics.value = graphics.value.filter((g) => g.id !== id);
    if (selectedId.value === id) selectedId.value = null;
    render();
  }

  function cancel() {
    if (drawSession) drawSession.abort();
    else if (editSession) editSession.abort();
    else selectedId.value = null;
    armedKind.value = null;
  }

  // ---- wiring ---------------------------------------------------------------

  let unpick: (() => void) | null = null;
  watch(
    surface,
    (s) => {
      unpick?.();
      unpick =
        s?.onGraphicPick((e) => {
          // #639: click selects, edit needs an explicit gesture.
          if (mode.value === "drawing") return;
          selectedId.value = e.id;
        }) ?? null;
      if (s) render();
    },
    { immediate: true },
  );

  watch(selectedId, (id) => {
    surface.value?.tacticalDraw?.setHighlightedGraphics(
      id && !editingId.value ? [id] : [],
    );
  });

  function onKeydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
      return;
    if (e.key === "Escape") {
      cancel();
      return;
    }
    if (e.key === "Enter" && drawCanCommit.value) {
      e.preventDefault();
      commitDraw();
      return;
    }
    // The rebinding the ticket asks about: while a session is open Ctrl+Z drives
    // SessionHistory, not scenario undo.
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      if (!editSession) return; // falls through to scenario undo
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) redo();
      else undo();
    }
  }
  window.addEventListener("keydown", onKeydown, { capture: true });

  onBeforeUnmount(() => {
    settleAll();
    unpick?.();
    window.removeEventListener("keydown", onKeydown, { capture: true });
    surface.value?.render([]);
  });

  return {
    ready,
    mode,
    graphics,
    selectedId,
    selected,
    editing,
    armedKind,
    drawPoints,
    drawMin,
    drawMax,
    drawCanCommit,
    editDirty,
    editHistory,
    activeProperties,
    arm,
    commitDraw,
    startEdit,
    closeEdit,
    undo,
    redo,
    setProperty,
    select,
    remove,
    cancel,
  };
}

export type CmPrototype = ReturnType<typeof useCmPrototype>;
