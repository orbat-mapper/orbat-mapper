import type { Map as MlMap } from "maplibre-gl";
import { TacticalDraw, TacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type {
  DrawMeasureDraft,
  DrawOptions,
  EditOptions,
  Graphic,
  GraphicSnapshot,
  InteractionHit,
  // orbat-mapper has its own `MapAdapter` (`@/geo/contracts/mapAdapter`) answering a
  // different question. Alias tactical-draw's ABI so the two never collide.
  MapAdapter as TacticalDrawMapAdapter,
  PickEvent,
  PixelCoordinate,
  SnappingOptions,
  TacticalDrawAbortReason,
} from "@orbat-mapper/tactical-draw";
import type { ControlMeasure, ControlMeasureKind } from "@orbat-mapper/control-measures";
import { MapLibreAdapter } from "@orbat-mapper/tactical-draw-adapter-maplibre";
import { isProxy, isRef } from "vue";
import { nanoid } from "@/utils";

export type { TacticalDrawMapAdapter, InteractionHit, PixelCoordinate };

/** The session kinds a host can hold. Mirrors `TacticalDraw.activeSession`. */
export type TacticalDrawSession = TacticalDraw["activeSession"];

/**
 * Dev-only reactivity guard, warning at most once per session.
 *
 * tactical-draw caches rendered output on `Graphic` object identity. A Vue proxy
 * defeats that cache silently — nothing throws, the map just re-renders everything
 * on every pass — so the hazard is guarded at `render()`, which is the only door,
 * rather than left to a `markRaw` convention spread across call sites.
 *
 * The check is deliberately **shallow**: the batch array and each `Graphic` in it.
 * A `Graphic` built by `toControlMeasure` is a fresh plain object whose *fields* may
 * still point into reactive scenario state, and that is fine — the identity cache
 * keys on the `Graphic`, not on its members. Walking deeper would cost per render
 * and would warn on the normal case.
 */
let warnedAboutReactiveGraphics = false;

function isReactiveLike(value: unknown): boolean {
  return isProxy(value) || isRef(value);
}

function assertRawGraphics(graphics: readonly Graphic[]) {
  if (!import.meta.env.DEV) return;
  if (warnedAboutReactiveGraphics) return;
  if (!isReactiveLike(graphics) && !graphics.some(isReactiveLike)) return;
  warnedAboutReactiveGraphics = true;
  console.warn(
    "[tacticalDrawSurface] render() received reactive graphics. Vue reactivity must " +
      "not reach anything the tactical-draw engine holds: it caches rendered output " +
      "on Graphic object identity, which a proxy defeats. markRaw/shallowRef the " +
      "batch and its graphics. See docs/adr/0006-control-measures-on-tactical-draw.md.",
  );
}

/**
 * The same guard for the authoring doors. `draw()` and `edit()` also take host-owned
 * objects the engine holds for the life of a session, so a reactive draft or measure
 * defeats the same identity cache — `toRaw` it at the call site (`toControlMeasure`
 * already does).
 */
function assertRawGraphicInput(value: unknown, door: string) {
  if (!import.meta.env.DEV) return;
  if (warnedAboutReactiveGraphics) return;
  if (!isReactiveLike(value)) return;
  warnedAboutReactiveGraphics = true;
  console.warn(
    `[tacticalDrawSurface] ${door}() received a reactive object. Vue reactivity must ` +
      "not reach anything the tactical-draw engine holds: it caches rendered output " +
      "on Graphic object identity, which a proxy defeats. markRaw/toRaw it. " +
      "See docs/adr/0006-control-measures-on-tactical-draw.md.",
  );
}

/** Test-only: reset the once-per-session latch. */
export function __resetTacticalDrawReactivityWarning() {
  warnedAboutReactiveGraphics = false;
}

/**
 * Id generation is handed to the host so a graphic's id is the scenario layer-item id
 * from birth — `ControlMeasure.id === TacticalGraphicLayerItem.id`, with no
 * reconciliation table anywhere. The library's default is a monotonic `td-${n}` slug,
 * which would collide across façade re-attaches.
 *
 * Rebuilt per attach because the façade is reconstructed on every `style.load`.
 */
function tacticalDrawOptions() {
  return { generateId: () => nanoid() };
}

/**
 * The tactical-draw seam on the MapLibre scenario map.
 *
 * This is the second, distinct adapter over the same `maplibre-gl` Map: orbat-mapper's
 * own `MapAdapter` answers "how does the app drive a map?", while tactical-draw's
 * `MapAdapter` is the rendering/interaction ABI its engine calls into. Both are
 * constructed over the one native map; neither knows about the other.
 */
export interface TacticalDrawSurface {
  /** tactical-draw's engine adapter. Held for projection queries; not the render seam. */
  readonly adapter: TacticalDrawMapAdapter;
  /** The façade, or `null` between a basemap swap and the next `style.load`. */
  readonly tacticalDraw: TacticalDraw | null;
  /** Bottommost native graphics layer, used to place scenario layers underneath it. */
  getGraphicsAnchorLayerId(): string | undefined;
  /**
   * The one host render entry point. Declarative and host-authoritative: pass the
   * complete, flat, sorted graphic array every time. No-ops while detached.
   */
  render(graphics: readonly Graphic[]): void;
  /** Subscribe to picks on committed graphics. Returns an idempotent unsubscribe. */
  onGraphicPick(handler: (event: PickEvent) => void): () => void;
  /**
   * "Does tactical-draw own the pixel at `pixel`?" — `null` when it does not, and
   * always `null` while detached.
   *
   * This, not `onGraphicPick`, is how the host short-circuits its own plain-feature
   * hit test. It is a pure synchronous query over adapter-cached state, so it does
   * **not** depend on tactical-draw's pick/click dispatch having run first; a host
   * click handler can call it regardless of listener ordering. `onGraphicPick` is a
   * notification and gives no way to say "this click was mine, stop".
   *
   * Pass the host's raw click event as `originalEvent` to inherit the library's
   * pointer-type-aware tolerance (4 px mouse/pen, 12 px touch).
   */
  ownsInteractionAt(
    pixel: PixelCoordinate,
    options?: { tolerance?: number; originalEvent?: unknown },
  ): InteractionHit | null;
  /**
   * Replace the passive selection-highlight set. Declarative and idempotent, like
   * `render()`; `[]` clears it. Unknown ids are skipped by the library.
   *
   * Deliberately **not** part of the render batch: highlighting starts no session and
   * aborts none, so selection changes must not have to go through the settle-first
   * render feed. The set is replayed after a `style.load` re-attach.
   */
  setHighlightedGraphics(ids: readonly string[]): void;
  /**
   * Engine-level snapping for draw and edit sessions. Cheap and idempotent, so the
   * host re-asserts it rather than tracking what the façade currently holds — which
   * is also what makes it survive a `style.load` re-attach.
   */
  setSnappingOptions(options?: SnappingOptions): void;
  /**
   * Start an interactive draw. Resolves with the committed snapshot, rejects with
   * `TacticalDrawAbortError` on Escape / abort / destroy — and, notably, while the
   * façade is detached, so a caller's abort path covers the basemap-swap window by
   * construction rather than by a separate null check.
   *
   * Nothing here writes to the scenario store: the host folds the resolved snapshot
   * in exactly once, on settle (ADR-0006).
   */
  draw<K extends ControlMeasureKind>(
    draft: DrawMeasureDraft<K>,
    options?: DrawOptions,
  ): Promise<GraphicSnapshot<ControlMeasure<K>>>;
  /** Start an interactive edit on one committed control measure. Same rejection rules. */
  edit(
    measure: ControlMeasure,
    options?: EditOptions,
  ): Promise<GraphicSnapshot<ControlMeasure>>;
  /**
   * Abort whatever session is open. `true` when there was one. This is the settle
   * trigger's hard end — a draw aborts, an edit is closed by the caller instead.
   */
  cancel(reason?: TacticalDrawAbortReason): boolean;
  /** The open session, or `null`. Re-read it; never hold it across a basemap swap. */
  readonly activeSession: TacticalDrawSession;
  /**
   * Fires immediately before a live façade is destroyed — a basemap swap's
   * `style.load` re-attach, or `destroy()`.
   *
   * Destroying the façade rejects an open session's promise without firing
   * `onCommit`, which for an **edit** would silently discard the user's work and
   * break ADR-0006's "an edit closes and keeps its work". The host settles from here
   * so the fold happens while the façade is still alive. Returns an idempotent
   * unsubscribe.
   */
  onBeforeDetach(handler: () => void): () => void;
  /** Tear down the façade and the adapter, in that order, and stop re-attaching. */
  destroy(): void;
}

/**
 * Stand a `TacticalDraw` façade up over `mlMap`.
 *
 * Attachment is gated on `style.load` rather than `load`, because a basemap swap
 * (`setStyle(..., { diff: false })`) discards every custom source and layer without
 * re-firing `load`. The same gate therefore doubles as the re-attach hook, matching
 * how `mapLibreScenarioLayerController` already rebuilds its layers.
 *
 * Nothing returned here may be made deeply reactive — the engine caches rendered
 * output on `Graphic` object identity, and a Vue proxy would defeat that. Callers
 * must `markRaw` this surface.
 */
export function createTacticalDrawSurface(mlMap: MlMap): TacticalDrawSurface {
  // `viewChangeMode: "settle"` is load-bearing, not a tuning knob. MapLibre emits
  // `zoom` on every frame of a *pure pan*, so the adapter's default "continuous"
  // re-renders the whole stack per frame — measured at 1400 `updateData` calls in
  // one 2 s pan over 50 graphics, collapsing pan to 15 fps. In "settle" mode the
  // same scene holds 59 fps and the interactive ceiling moves from ~25 graphics to
  // ~150-200. The cost is that pixel-fit chrome refits at `moveend` instead of
  // scaling mid-animation. See docs/adr/0006-control-measures-on-tactical-draw.md.
  const adapter = new MapLibreAdapter(mlMap, { viewChangeMode: "settle" });
  const pickHandlers = new Set<(event: PickEvent) => void>();
  const beforeDetachHandlers = new Set<() => void>();

  let tacticalDraw: TacticalDraw | null = null;
  let unsubscribePick: (() => void) | null = null;
  let lastRendered: readonly Graphic[] = [];
  let lastHighlighted: readonly string[] = [];
  let lastSnapping: SnappingOptions | undefined;
  let destroyed = false;

  /** Every authoring door rejects the same way while detached. */
  function detachedAbort(): TacticalDrawAbortError {
    return new TacticalDrawAbortError("destroyed", {
      message:
        "tactical-draw is detached (basemap swap in progress or surface destroyed)",
    });
  }

  function detachFacade() {
    // Before anything is torn down, so a settling edit can still close through the
    // live façade and fold its work. Copied because a handler may unregister itself.
    if (tacticalDraw) {
      for (const handler of [...beforeDetachHandlers]) handler();
    }
    unsubscribePick?.();
    unsubscribePick = null;
    if (!tacticalDraw) return;
    try {
      tacticalDraw.destroy();
    } catch {
      // The style this façade's layers lived in is already gone.
    }
    tacticalDraw = null;
  }

  function attachFacade() {
    if (destroyed) return;
    // Idempotent by construction, so a repeated `style.load` cannot stack façades.
    detachFacade();
    tacticalDraw = new TacticalDraw(adapter, {
      ...tacticalDrawOptions(),
      snapping: lastSnapping,
    });
    unsubscribePick = tacticalDraw.onGraphicPick((event) => {
      for (const handler of pickHandlers) handler(event);
    });
    // A style swap wiped the previous layers; restore what the host last asked for.
    if (lastRendered.length > 0) tacticalDraw.render(lastRendered);
    // Highlights live on their own layer and are wiped by the same swap. Replay after
    // `render`, since the library skips ids that are not currently rendered.
    if (lastHighlighted.length > 0) tacticalDraw.setHighlightedGraphics(lastHighlighted);
  }

  const handleStyleLoad = () => attachFacade();
  mlMap.on("style.load", handleStyleLoad);
  // `@ready` fires on `load`, which is after the first `style.load` — attach now
  // rather than waiting for a basemap swap that may never come.
  if (mlMap.isStyleLoaded()) attachFacade();

  return {
    get adapter() {
      return adapter;
    },
    get tacticalDraw() {
      return tacticalDraw;
    },
    getGraphicsAnchorLayerId() {
      const graphicsLayerId = tacticalDraw?.layerIds.graphics;
      if (!graphicsLayerId) return;
      const sourcePrefix = `${graphicsLayerId}-`;
      return mlMap.getStyle().layers.find((layer) => {
        const source = "source" in layer ? layer.source : undefined;
        return typeof source === "string" && source.startsWith(sourcePrefix);
      })?.id;
    },
    render(graphics) {
      assertRawGraphics(graphics);
      lastRendered = graphics;
      tacticalDraw?.render(graphics);
    },
    onGraphicPick(handler) {
      pickHandlers.add(handler);
      return () => pickHandlers.delete(handler);
    },
    ownsInteractionAt(pixel, options) {
      return tacticalDraw?.ownsInteractionAt(pixel, options) ?? null;
    },
    setHighlightedGraphics(ids) {
      lastHighlighted = ids;
      tacticalDraw?.setHighlightedGraphics(ids);
    },
    setSnappingOptions(options) {
      lastSnapping = options;
      tacticalDraw?.setSnappingOptions(options);
    },
    draw(draft, options) {
      assertRawGraphicInput(draft, "draw");
      if (!tacticalDraw) return Promise.reject(detachedAbort());
      return tacticalDraw.draw(draft, options);
    },
    edit(measure, options) {
      assertRawGraphicInput(measure, "edit");
      if (!tacticalDraw) return Promise.reject(detachedAbort());
      return tacticalDraw.edit(measure, options);
    },
    cancel(reason) {
      return tacticalDraw?.cancel(reason) ?? false;
    },
    get activeSession() {
      return tacticalDraw?.activeSession ?? null;
    },
    onBeforeDetach(handler) {
      beforeDetachHandlers.add(handler);
      return () => beforeDetachHandlers.delete(handler);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      mlMap.off("style.load", handleStyleLoad);
      pickHandlers.clear();
      lastRendered = [];
      lastHighlighted = [];
      lastSnapping = undefined;
      // Order matters: the façade releases only the layer slots it allocated,
      // then the adapter tears down the rest.
      detachFacade();
      // After `detachFacade`, which is what gives the settle its last chance to run.
      beforeDetachHandlers.clear();
      adapter.destroy();
    },
  };
}
