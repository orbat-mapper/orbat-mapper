/**
 * The point-symbol draw session: one click places the symbol. The `pointSymbol`
 * counterpart to `useControlMeasureDrawSession`, with the same commit-on-settle shape —
 * nothing is written while the gesture is open, the settled symbol is folded in exactly
 * once, and an abort is a normal outcome that writes nothing.
 */
import { nextTick, onScopeDispose, shallowRef } from "vue";
import type { Position } from "geojson";
import { isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type { TScenario } from "@/scenariostore";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type { TacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import { useSelectedItems } from "@/stores/selectedStore";
import type { PointSymbolSize } from "@/types/scenarioLayerItems";
import { addScenarioPointSymbol } from "@/modules/scenarioeditor/pointSymbolDrawHelpers";

export interface PointSymbolDrawTarget {
  sidc: string;
  name: string;
}

export interface UsePointSymbolDrawSessionOptions {
  scenario: TScenario;
  surface: () => TacticalDrawSurface | undefined | null;
  renderFeed?: TacticalGraphicRenderFeed | null;
  destinationLayerId?: () => string | number | null | undefined;
  /** The size a new symbol is born with; read per placement, never captured. */
  size: () => PointSymbolSize;
  onSettled: (result: {
    committed: boolean;
    target: PointSymbolDrawTarget;
    featureId?: string;
  }) => void;
}

export function usePointSymbolDrawSession(options: UsePointSymbolDrawSessionOptions) {
  const { activeFeatureId } = useSelectedItems();
  /** Non-null exactly while a placement is armed. */
  const active = shallowRef<PointSymbolDrawTarget | null>(null);
  // See `useControlMeasureDrawSession`: a preempted session's rejection lands a
  // microtask later and must not disarm whatever replaced it.
  let generation = 0;

  function stop() {
    generation += 1;
    active.value = null;
  }

  /** Write the placed symbol; `true` when it landed. Settles one tick after a commit. */
  function finish(
    token: number,
    target: PointSymbolDrawTarget,
    placed: {
      position: Position;
      size: PointSymbolSize;
      id?: string;
    } | null,
    destinationLayerId?: string | number | null,
  ): boolean {
    if (token !== generation) return false;
    active.value = null;
    const added =
      placed &&
      addScenarioPointSymbol(
        options.scenario,
        {
          sidc: target.sidc,
          name: target.name,
          position: placed.position,
          size: placed.size,
        },
        destinationLayerId == null ? undefined : String(destinationLayerId),
        placed.id,
      );
    if (!added) {
      options.onSettled({ committed: false, target });
      return false;
    }
    activeFeatureId.value = added.id;
    options.renderFeed?.render("commit");
    // The write queued a second render; settle after it, as a draw does.
    void nextTick(() => {
      if (token !== generation) return;
      options.onSettled({ committed: true, target, featureId: added.id });
    });
    return true;
  }

  function start(target: PointSymbolDrawTarget): boolean {
    stop();
    const token = generation;
    const surface = options.surface();
    if (!surface) return false;
    const destinationLayerId = options.destinationLayerId?.();
    active.value = target;
    surface
      .draw({ kind: "point-symbol", sidc: target.sidc, size: options.size() })
      .then((snapshot) =>
        finish(
          token,
          target,
          {
            position: [...snapshot.graphic.position],
            size: structuredClone(snapshot.graphic.size),
            id: snapshot.graphic.id,
          },
          destinationLayerId,
        ),
      )
      .catch((error) => {
        if (!isTacticalDrawAbortError(error)) {
          console.error("[pointSymbolDraw] draw session failed", error);
        }
        return finish(token, target, null, destinationLayerId);
      });
    return true;
  }

  /** Place a symbol at `position` without a gesture — a drop — through the same commit. */
  function place(target: PointSymbolDrawTarget, position: [number, number]): boolean {
    stop();
    return finish(
      generation,
      target,
      { position, size: options.size() },
      options.destinationLayerId?.(),
    );
  }

  // A placement has nothing partial to keep, so a settle aborts it, like a draw.
  const unregisterSettle = options.renderFeed?.onSettle(() => {
    if (!active.value) return;
    options.surface()?.cancel("preempted");
  });

  onScopeDispose(() => {
    unregisterSettle?.();
    stop();
  });

  return { active, start, place, stop };
}
