import {
  ref,
  shallowRef,
  computed,
  provide,
  inject,
  watch,
  type Ref,
  type InjectionKey,
} from "vue";
import { watchDebounced } from "@vueuse/core";

export type HoverPixel = number[];

export type HoverFeatureLike = { getId(): string | number | undefined };

export interface MapHoverContext {
  globalHoveredFeatures: Ref<HoverFeatureLike[]>;
  globalHoveredPixel: Ref<HoverPixel | null>;
}

export const MapHoverKey: InjectionKey<MapHoverContext> = Symbol("MapHover");

export interface UseMapHoverOptions {
  filter?: (feature: HoverFeatureLike) => boolean;
  debounceMs?: number;
}

export function provideMapHoverContext() {
  const globalHoveredFeatures = shallowRef<HoverFeatureLike[]>([]);
  const globalHoveredPixel = ref<HoverPixel | null>(null);

  const setHoveredFeatures = (features: HoverFeatureLike[], pixel: HoverPixel | null) => {
    globalHoveredFeatures.value = features;
    globalHoveredPixel.value = features.length && pixel ? pixel : null;
  };

  const clearHoveredFeatures = () => {
    globalHoveredFeatures.value = [];
    globalHoveredPixel.value = null;
  };

  const context: MapHoverContext = { globalHoveredFeatures, globalHoveredPixel };
  provide(MapHoverKey, context);

  return {
    ...context,
    setHoveredFeatures,
    clearHoveredFeatures,
  };
}

export function useMapHover(options: UseMapHoverOptions = {}) {
  const context = inject(MapHoverKey);
  if (!context) throw new Error("useMapHover must be used within provideMapHover");

  const filteredFeatures = shallowRef<HoverFeatureLike[]>([]);
  const isMatch = computed(() => filteredFeatures.value.length > 0);

  const update = (newFeatures: HoverFeatureLike[]) => {
    filteredFeatures.value = options.filter
      ? newFeatures.filter(options.filter)
      : newFeatures;
  };

  if (options.debounceMs) {
    watchDebounced(context.globalHoveredFeatures, (val) => update(val), {
      debounce: options.debounceMs,
      immediate: true,
    });
  } else {
    watch(context.globalHoveredFeatures, (val) => update(val), { immediate: true });
  }

  return {
    features: filteredFeatures,
    isMatch,
    allFeatures: context.globalHoveredFeatures,
    pixel: context.globalHoveredPixel,
  };
}
