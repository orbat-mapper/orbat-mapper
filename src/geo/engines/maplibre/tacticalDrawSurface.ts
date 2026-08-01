import type { Map as MlMap } from "maplibre-gl";
import { TacticalDraw } from "@orbat-mapper/tactical-draw";
import type {
  Graphic,
  // orbat-mapper has its own `MapAdapter` (`@/geo/contracts/mapAdapter`) answering a
  // different question. Alias tactical-draw's ABI so the two never collide.
  MapAdapter as TacticalDrawMapAdapter,
  PickEvent,
} from "@orbat-mapper/tactical-draw";
import { MapLibreAdapter } from "@orbat-mapper/tactical-draw-adapter-maplibre";

export type { TacticalDrawMapAdapter };

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
  /**
   * The one host render entry point. Declarative and host-authoritative: pass the
   * complete, flat, sorted graphic array every time. No-ops while detached.
   */
  render(graphics: readonly Graphic[]): void;
  /** Subscribe to picks on committed graphics. Returns an idempotent unsubscribe. */
  onGraphicPick(handler: (event: PickEvent) => void): () => void;
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
  const adapter = new MapLibreAdapter(mlMap);
  const pickHandlers = new Set<(event: PickEvent) => void>();

  let tacticalDraw: TacticalDraw | null = null;
  let unsubscribePick: (() => void) | null = null;
  let lastRendered: readonly Graphic[] = [];
  let destroyed = false;

  function detachFacade() {
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
    tacticalDraw = new TacticalDraw(adapter);
    unsubscribePick = tacticalDraw.onGraphicPick((event) => {
      for (const handler of pickHandlers) handler(event);
    });
    // A style swap wiped the previous layers; restore what the host last asked for.
    if (lastRendered.length > 0) tacticalDraw.render(lastRendered);
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
    render(graphics) {
      lastRendered = graphics;
      tacticalDraw?.render(graphics);
    },
    onGraphicPick(handler) {
      pickHandlers.add(handler);
      return () => pickHandlers.delete(handler);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      mlMap.off("style.load", handleStyleLoad);
      pickHandlers.clear();
      lastRendered = [];
      // Order matters: the façade releases only the layer slots it allocated,
      // then the adapter tears down the rest.
      detachFacade();
      adapter.destroy();
    },
  };
}
