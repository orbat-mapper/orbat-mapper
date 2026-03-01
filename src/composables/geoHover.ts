import {
  ref,
  shallowRef,
  computed,
  provide,
  inject,
  unref,
  watch,
  type Ref,
  type MaybeRef,
  type InjectionKey,
} from "vue";
import { watchThrottled, watchDebounced } from "@vueuse/core";
import type OLMap from "ol/Map";
import type { FeatureLike } from "ol/Feature";
import type MapBrowserEvent from "ol/MapBrowserEvent";
import type { Types as MapBrowserEventType } from "ol/MapBrowserEventType";
import type { Pixel } from "ol/pixel";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { unByKey } from "ol/Observable";

export interface MapHoverContext {
  globalHoveredFeatures: Ref<FeatureLike[]>;
  globalHoveredPixel: Ref<Pixel | null>;
}

export const MapHoverKey: InjectionKey<MapHoverContext> = Symbol("MapHover");

export interface UseMapHoverOptions {
  filter?: (feature: FeatureLike) => boolean;
  debounceMs?: number;
}

export interface ProvideMapHoverOptions {
  hitTolerance?: number;
  throttleMs?: number;
  updateCursor?: boolean;
  enable?: MaybeRef<boolean>;
}

export function provideMapHover(
  mapRef: Ref<OLMap | null | undefined>,
  options: ProvideMapHoverOptions = {},
) {
  // Use shallowRef for complex OL objects to avoid deep reactivity overhead
  const globalHoveredFeatures = shallowRef<FeatureLike[]>([]);
  const globalHoveredPixel = ref<Pixel | null>(null);
  const rawPixel = ref<Pixel | null>(null);

  watchThrottled(
    rawPixel,
    (pixel) => {
      const map = unref(mapRef);
      const isEnabled = unref(options.enable ?? true);
      if (!map || !pixel || !isEnabled) {
        globalHoveredFeatures.value = [];
        globalHoveredPixel.value = null;
        return;
      }

      const features: FeatureLike[] = [];
      map.forEachFeatureAtPixel(
        pixel,
        (f) => {
          features.push(f);
          return features.length >= 10;
        },
        {
          hitTolerance: options.hitTolerance ?? 3,
        },
      );

      globalHoveredFeatures.value = features;
      globalHoveredPixel.value = pixel;

      if (options.updateCursor !== false) {
        const el = map.getTargetElement();
        if (el) el.style.cursor = features.length > 0 ? "pointer" : "";
      }
    },
    { throttle: options.throttleMs ?? 32 },
  );

  // Watch mapRef and handle cleanup of old instances
  watch(
    () => unref(mapRef),
    (map, _oldMap, onCleanup) => {
      if (!map) return;
      const pointerMoveType: MapBrowserEventType = "pointermove";

      const handler = (e: MapBrowserEvent) => {
        const isEnabled = unref(options.enable ?? true);
        if (!isEnabled) {
          rawPixel.value = null;
          return;
        }
        if (e.dragging) {
          rawPixel.value = null;
          return;
        }
        rawPixel.value = e.pixel;
      };

      const pointerMoveKey = useOlEvent(map.on(pointerMoveType, handler));

      // Cleanup if map instance changes or component unmounts
      const cleanup = () => unByKey(pointerMoveKey);
      onCleanup(cleanup);
    },
    { immediate: true },
  );

  const context: MapHoverContext = { globalHoveredFeatures, globalHoveredPixel };
  provide(MapHoverKey, context);
  return context;
}

export function useMapHover(options: UseMapHoverOptions = {}) {
  const context = inject(MapHoverKey);
  if (!context) throw new Error("useMapHover must be used within provideMapHover");

  const filteredFeatures = shallowRef<FeatureLike[]>([]);
  const isMatch = computed(() => filteredFeatures.value.length > 0);

  const update = (newFeatures: FeatureLike[]) => {
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
