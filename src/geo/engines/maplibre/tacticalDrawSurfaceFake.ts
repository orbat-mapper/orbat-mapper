/**
 * A medium-fidelity fake of the host-owned `TacticalDrawSurface` seam. **Test-only** —
 * nothing in the app imports it.
 *
 * It fakes the *seam*, not the library: `draw()`/`edit()` hand back a session through
 * `onSession` and a promise that the test settles through a handle, which is exactly
 * how much of tactical-draw the host code touches. Nothing here simulates a gesture —
 * there are no pointer events, no hit testing and no geometry. A test moves a session
 * on through the same handles a pointer would move it on through (`setControlPoints`,
 * `commit`, `abort`, `close`), which keeps the tests about the host's commit-on-settle
 * disposition rather than about the library's interaction model.
 *
 * Two details are load-bearing and are the reason this is shared rather than
 * hand-rolled per test file:
 *
 * 1. It rejects with the **real** `TacticalDrawAbortError`, so the host's
 *    `isTacticalDrawAbortError` folding is exercised against the real type. That error
 *    extends `DOMException`, not `Error`, and a stub that discriminates with
 *    `instanceof Error` silently resolves instead of rejecting.
 * 2. `DrawSession.commit()` resolves the outer promise, while `EditSession.close()`
 *    fires `onCommit` **synchronously** and resolves a microtask later. The edit fold
 *    rides that ordering.
 *
 * The `/testing` subpath of `@orbat-mapper/tactical-draw` is adapter-conformance only
 * and answers a different question, so it is deliberately not used here.
 */
import { TacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type {
  DrawMeasureDraft,
  DrawSession,
  EditMode,
  EditSession,
  Graphic,
  GraphicSnapshot,
  PickEvent,
  SizeAnchor,
  SnappingOptions,
  TacticalDrawAbortReason,
} from "@orbat-mapper/tactical-draw";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";

const DEFAULT_DRAW_CONTROL_POINTS: Position[] = [
  [10, 60],
  [11, 61],
];

export interface TacticalDrawSurfaceFakeOptions {
  /** Points a new draw session starts with. Two by default — enough to commit. */
  drawControlPoints?: Position[];
  minControlPoints?: number;
  maxControlPoints?: number;
  /** The working points an edit session starts with. Defaults to the measure's own. */
  editControlPoints?: Position[];
  /** Ids for graphics a draw session commits. */
  generateId?: () => string;
  /** Called from `destroy()`, for view tests that assert teardown ordering. */
  onDestroy?: () => void;
  /**
   * Start detached, as the real surface is between a basemap swap and the next
   * `style.load`: every authoring door rejects with `TacticalDrawAbortError`.
   */
  detached?: boolean;
}

/** What a test drives a live draw session with. */
export interface FakeDrawSessionHandle {
  /** The session as the host sees it. */
  readonly session: DrawSession;
  readonly draft: DrawMeasureDraft;
  readonly settled: boolean;
  /** Replace the committed points, firing `onChange` once — never a rubber-band tick. */
  setControlPoints(points: Position[]): void;
  /** Settle by commit, resolving the outer `draw()` promise. */
  commit(graphic?: Partial<ControlMeasure>): void;
  /** Settle by abort, rejecting it with the real `TacticalDrawAbortError`. */
  abort(reason?: TacticalDrawAbortReason): void;
}

/** What a test drives a live edit session with. */
export interface FakeEditSessionHandle {
  readonly session: EditSession;
  /** The measure the session was opened on — the host's edit-start input. */
  readonly startMeasure: ControlMeasure;
  readonly settled: boolean;
  readonly undoCount: number;
  readonly redoCount: number;
  /** The mode set the session is in: seeded by `edit()`, then moved by `setModes`. */
  readonly modes: readonly EditMode[];
  setSessionModes(modes: readonly EditMode[]): void;
  /** Move the working geometry. This is what a settled edit folds into the store. */
  setControlPoints(points: Position[]): void;
  /** Replace the working graphic wholesale (options, amplifiers, style, …). */
  setWorkingGraphic(graphic: ControlMeasure): void;
  setHistory(state: { canUndo?: boolean; canRedo?: boolean }): void;
  /** Settle by close, keeping the work: `onCommit` fires synchronously. */
  close(): void;
  abort(): void;
}

export interface TacticalDrawSurfaceFake {
  readonly surface: TacticalDrawSurface;
  /** The open draw session's handle, or `null`. Re-read it; sessions are replaced. */
  readonly drawSession: FakeDrawSessionHandle | null;
  readonly editSession: FakeEditSessionHandle | null;
  readonly calls: {
    draw: DrawMeasureDraft[];
    /** The size anchor each `draw()` / `edit()` was opened with, parallel to the above. */
    drawSizeAnchor: (SizeAnchor | undefined)[];
    edit: ControlMeasure[];
    editSizeAnchor: (SizeAnchor | undefined)[];
    cancel: (TacticalDrawAbortReason | undefined)[];
    render: (readonly Graphic[])[];
    highlight: (readonly string[])[];
    snapping: (SnappingOptions | undefined)[];
    destroy: number;
  };
  /** Push a pick to whatever the host subscribed with `onGraphicPick`. */
  emitGraphicPick(event: PickEvent): void;
  /** Detach or re-attach the façade, as a basemap swap does. */
  setDetached(detached: boolean): void;
}

function snapshot(graphic: ControlMeasure): GraphicSnapshot<ControlMeasure> {
  // The host reads `.graphic` and nothing else; `render` is the library's own
  // projection and has no meaning without a real engine.
  return { graphic } as GraphicSnapshot<ControlMeasure>;
}

export function createTacticalDrawSurfaceFake(
  options: TacticalDrawSurfaceFakeOptions = {},
): TacticalDrawSurfaceFake {
  let nextId = 0;
  const generateId = options.generateId ?? (() => `cm-${++nextId}`);
  let detached = options.detached ?? false;
  const beforeDetachHandlers = new Set<() => void>();

  function fireBeforeDetach() {
    for (const handler of [...beforeDetachHandlers]) handler();
  }

  const calls: TacticalDrawSurfaceFake["calls"] = {
    draw: [],
    drawSizeAnchor: [],
    edit: [],
    editSizeAnchor: [],
    cancel: [],
    render: [],
    highlight: [],
    snapping: [],
    destroy: 0,
  };
  const pickHandlers = new Set<(event: PickEvent) => void>();

  let drawHandle: FakeDrawSessionHandle | null = null;
  let editHandle: FakeEditSessionHandle | null = null;

  function detachedAbort(): TacticalDrawAbortError {
    return new TacticalDrawAbortError("destroyed");
  }

  function createDrawSession(
    draft: DrawMeasureDraft,
    settle: (result: GraphicSnapshot<ControlMeasure> | TacticalDrawAbortError) => void,
  ): FakeDrawSessionHandle {
    const min = options.minControlPoints ?? 2;
    const max = options.maxControlPoints;
    let points = [...(options.drawControlPoints ?? DEFAULT_DRAW_CONTROL_POINTS)];
    let settled = false;
    const changeListeners = new Set<(session: DrawSession) => void>();
    const commitListeners = new Set<(snap: GraphicSnapshot<ControlMeasure>) => void>();

    const session = {
      get controlPoints() {
        return points;
      },
      get canCommit() {
        return points.length >= min && (max === undefined || points.length <= max);
      },
      minControlPoints: min,
      maxControlPoints: max,
      commit() {
        if (settled || !session.canCommit) return false;
        handle.commit();
        return true;
      },
      abort() {
        handle.abort("session");
      },
      onChange(listener: (live: DrawSession) => void) {
        changeListeners.add(listener);
        return () => changeListeners.delete(listener);
      },
      onCommit(listener: (snap: GraphicSnapshot<ControlMeasure>) => void) {
        commitListeners.add(listener);
        return () => commitListeners.delete(listener);
      },
    } as unknown as DrawSession;

    const handle: FakeDrawSessionHandle = {
      session,
      draft,
      get settled() {
        return settled;
      },
      setControlPoints(next) {
        if (settled) return;
        points = [...next];
        for (const listener of [...changeListeners]) listener(session);
      },
      commit(graphic) {
        if (settled) return;
        settled = true;
        const committed = {
          id: generateId(),
          kind: draft.kind,
          controlPoints: [...points],
          ...graphic,
        } as ControlMeasure;
        const committedSnapshot = snapshot(committed);
        for (const listener of [...commitListeners]) listener(committedSnapshot);
        settle(committedSnapshot);
      },
      abort(reason = "session") {
        if (settled) return;
        settled = true;
        settle(new TacticalDrawAbortError(reason));
      },
    };
    return handle;
  }

  function createEditSession(
    measure: ControlMeasure,
    settle: (result: GraphicSnapshot<ControlMeasure> | TacticalDrawAbortError) => void,
  ): FakeEditSessionHandle {
    let working: ControlMeasure = {
      ...measure,
      controlPoints: [...(options.editControlPoints ?? measure.controlPoints ?? [])],
    } as ControlMeasure;
    let settled = false;
    let undoCount = 0;
    let redoCount = 0;
    let modes: readonly EditMode[] = [];
    const historyState = { canUndo: false, canRedo: false };
    const historyListeners = new Set<(state: typeof historyState) => void>();
    let commitHandler: ((snap: GraphicSnapshot<ControlMeasure>) => void) | null = null;

    const session = {
      history: {
        get state() {
          return historyState;
        },
        undo() {
          undoCount += 1;
          return historyState.canUndo;
        },
        redo() {
          redoCount += 1;
          return historyState.canRedo;
        },
        subscribe(listener: (state: typeof historyState) => void) {
          historyListeners.add(listener);
          return () => historyListeners.delete(listener);
        },
      },
      graphic: measure,
      get workingGraphic() {
        return working;
      },
      get controlPoints() {
        return working.controlPoints;
      },
      close() {
        if (settled) return undefined;
        settled = true;
        const committed = snapshot(working);
        // Synchronous, from inside `close()` — the ordering the fold depends on.
        commitHandler?.(committed);
        settle(committed);
        return committed;
      },
      abort() {
        if (settled) return;
        settled = true;
        settle(new TacticalDrawAbortError("session"));
      },
      get modes() {
        return modes;
      },
      setModes(next: readonly EditMode[]) {
        modes = [...next];
      },
      onCommit(handler: (snap: GraphicSnapshot<ControlMeasure>) => void) {
        commitHandler = handler;
        return () => (commitHandler = null);
      },
    } as unknown as EditSession;

    return {
      session,
      startMeasure: measure,
      get settled() {
        return settled;
      },
      get undoCount() {
        return undoCount;
      },
      get redoCount() {
        return redoCount;
      },
      /** The mode set the session is currently in — seeded by `edit()`, then `setModes`. */
      get modes() {
        return modes;
      },
      setSessionModes(next: readonly EditMode[]) {
        modes = [...next];
      },
      setControlPoints(points) {
        working = { ...working, controlPoints: [...points] } as ControlMeasure;
      },
      setWorkingGraphic(graphic) {
        working = graphic;
      },
      setHistory(state) {
        Object.assign(historyState, state);
        for (const listener of [...historyListeners]) listener(historyState);
      },
      close: () => void session.close(),
      abort: () => session.abort(),
    };
  }

  // Built untyped and cast once: `draw()` is generic over the measure kind, and
  // satisfying that generic here would buy nothing — the fake never renders.
  const surface = {
    adapter: {},
    tacticalDraw: null,
    render(graphics: readonly Graphic[]) {
      calls.render.push(graphics);
    },
    onGraphicPick(handler: (event: PickEvent) => void) {
      pickHandlers.add(handler);
      return () => pickHandlers.delete(handler);
    },
    ownsInteractionAt() {
      return null;
    },
    setHighlightedGraphics(ids: readonly string[]) {
      calls.highlight.push(ids);
    },
    setSnappingOptions(snapping?: SnappingOptions) {
      calls.snapping.push(snapping);
    },
    draw(
      draft: DrawMeasureDraft,
      drawOptions?: {
        sizeAnchor?: SizeAnchor;
        onSession?: (session: DrawSession) => void;
      },
    ) {
      calls.draw.push(draft);
      calls.drawSizeAnchor.push(drawOptions?.sizeAnchor);
      if (detached) return Promise.reject(detachedAbort());
      return new Promise<GraphicSnapshot<ControlMeasure>>((resolve, reject) => {
        drawHandle = createDrawSession(draft, (result) => {
          drawHandle = null;
          if (result instanceof TacticalDrawAbortError) reject(result);
          else resolve(result);
        });
        drawOptions?.onSession?.(drawHandle.session);
      });
    },
    edit(
      measure: ControlMeasure,
      editOptions?: {
        sizeAnchor?: SizeAnchor;
        modes?: readonly EditMode[];
        onSession?: (session: EditSession) => void;
      },
    ) {
      calls.edit.push(measure);
      calls.editSizeAnchor.push(editOptions?.sizeAnchor);
      if (detached) return Promise.reject(detachedAbort());
      return new Promise<GraphicSnapshot<ControlMeasure>>((resolve, reject) => {
        editHandle = createEditSession(measure, (result) => {
          editHandle = null;
          if (result instanceof TacticalDrawAbortError) reject(result);
          else resolve(result);
        });
        if (editOptions?.modes) editHandle.setSessionModes(editOptions.modes);
        editOptions?.onSession?.(editHandle.session);
      });
    },
    cancel(reason?: TacticalDrawAbortReason) {
      calls.cancel.push(reason);
      // One session at a time, exactly as the façade holds it.
      if (drawHandle) {
        drawHandle.abort(reason ?? "preempted");
        return true;
      }
      if (editHandle) {
        editHandle.abort();
        return true;
      }
      return false;
    },
    get activeSession() {
      return drawHandle?.session ?? editHandle?.session ?? null;
    },
    onBeforeDetach(handler: () => void) {
      beforeDetachHandlers.add(handler);
      return () => beforeDetachHandlers.delete(handler);
    },
    destroy() {
      calls.destroy += 1;
      // Before the sessions go, exactly as the real surface fires it — a test that
      // asserts an edit keeps its work across teardown depends on this ordering.
      fireBeforeDetach();
      detached = true;
      pickHandlers.clear();
      beforeDetachHandlers.clear();
      options.onDestroy?.();
    },
  } as unknown as TacticalDrawSurface;

  return {
    surface,
    get drawSession() {
      return drawHandle;
    },
    get editSession() {
      return editHandle;
    },
    calls,
    emitGraphicPick(event) {
      for (const handler of [...pickHandlers]) handler(event);
    },
    setDetached(value) {
      // A basemap swap destroys the façade, so detaching fires the same hook the real
      // surface fires — which is what gives an open edit its chance to fold.
      if (value && !detached) fireBeforeDetach();
      detached = value;
    },
  };
}
