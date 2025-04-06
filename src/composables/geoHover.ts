import type OLMap from "ol/Map";
import { type MaybeRef } from "@vueuse/core";
import { ref, watch } from "vue";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { unByKey } from "ol/Observable";

export interface MapHoverOptions {
  enable?: MaybeRef<boolean>;
}

export function useMapHover(olMap: OLMap, options: MapHoverOptions = {}) {
  const enableRef = ref(options.enable ?? true);
  let pointerMoveKey: any = null;

  watch(
    enableRef,
    (enabled) => {
      const touch = matchMedia("(hover: none)").matches;
      if (touch) {
        // Touch device detected, disabling hover
        return;
      }

      if (!enabled) {
        pointerMoveKey && unByKey(pointerMoveKey);
        pointerMoveKey = null;
        return;
      }

      pointerMoveKey = useOlEvent(
        olMap.on("pointermove", (e) => {
          const pixel = olMap.getEventPixel(e.originalEvent);
          const hit = olMap.hasFeatureAtPixel(pixel);
          olMap.getTargetElement().style.cursor = hit ? "pointer" : "";
        }),
      );
    },
    { immediate: true },
  );

  return { enable: enableRef };
}
