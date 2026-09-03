import {
  effectScope,
  onScopeDispose,
  shallowRef,
  watch,
  type EffectScope,
  type ShallowRef,
} from "vue";
import type { Map as MlMap } from "maplibre-gl";
import type { MapAdapter as TacticalDrawMapAdapter } from "@orbat-mapper/tactical-draw";
import type { GridReferenceLabel } from "@/lib/grid";
import { useReferenceGridStore } from "@/stores/referenceGridStore";

export interface ReferenceGridLayers {
  labels: ShallowRef<GridReferenceLabel[]>;
  refresh: () => void;
  dispose: () => void;
}

/**
 * Lightweight facade that keeps the grid implementation out of the map-editor
 * chunk until the user first makes a reference grid visible.
 */
export function useReferenceGridLayers(
  mapSource: () => MlMap | undefined,
  adapterSource: () => TacticalDrawMapAdapter | undefined,
): ReferenceGridLayers {
  const grid = useReferenceGridStore();
  const labels = shallowRef<GridReferenceLabel[]>([]);
  let runtime: ReferenceGridLayers | null = null;
  let runtimeScope: EffectScope | null = null;
  let stopLabelSync: (() => void) | null = null;
  let disposed = false;
  let modulePromise: Promise<typeof import("./referenceGridLayersRuntime")> | null = null;

  async function ensureRuntime() {
    if (disposed || runtime) return;
    modulePromise ??= import("./referenceGridLayersRuntime");
    const module = await modulePromise;
    if (disposed || runtime || !grid.visible) return;

    const scope = effectScope(true);
    const created = scope.run(() =>
      module.createReferenceGridLayers(mapSource, adapterSource),
    );
    if (!created) {
      scope.stop();
      return;
    }

    runtimeScope = scope;
    runtime = created;
    stopLabelSync = watch(
      created.labels,
      (value) => {
        labels.value = value;
      },
      { immediate: true },
    );
  }

  const stopVisibilityWatch = watch(
    () => grid.visible,
    (visible) => {
      if (visible) {
        void ensureRuntime();
      } else {
        labels.value = [];
        runtime?.refresh();
      }
    },
    { immediate: true },
  );

  function refresh() {
    if (runtime) runtime.refresh();
    else if (grid.visible) void ensureRuntime();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopVisibilityWatch();
    stopLabelSync?.();
    runtimeScope?.stop();
    runtime = null;
    runtimeScope = null;
    labels.value = [];
  }

  onScopeDispose(dispose);

  return { labels, refresh, dispose };
}
