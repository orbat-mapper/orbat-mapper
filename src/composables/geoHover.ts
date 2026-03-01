import type OLMap from "ol/Map";
import { type MaybeRef, ref, watch } from "vue";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { unByKey } from "ol/Observable";

export interface MapHoverOptions {
  enable?: MaybeRef<boolean>;
}

export function useMapHover(olMap: OLMap, options: MapHoverOptions = {}) {
  const enableRef = ref(options.enable ?? true);
  let pointerMoveKey: any = null;
  const targetElement = olMap.getTargetElement();

  const resetHoverState = () => {
    targetElement.style.cursor = "";
    targetElement.title = "";
  };

  watch(
    enableRef,
    (enabled) => {
      const touch = matchMedia("(hover: none)").matches;
      if (touch) {
        // Touch device detected, disabling hover
        resetHoverState();
        return;
      }

      if (!enabled) {
        pointerMoveKey && unByKey(pointerMoveKey);
        pointerMoveKey = null;
        resetHoverState();
        return;
      }

      pointerMoveKey = useOlEvent(
        olMap.on("pointermove", (e) => {
          const pixel = olMap.getEventPixel(e.originalEvent);
          const feature = olMap.forEachFeatureAtPixel(pixel, (feature, layer) => {
            return layer?.get("layerType") === "SCENARIO_FEATURE" ? feature : undefined;
          });
          const featureName = feature?.get("name") ?? "";
          targetElement.style.cursor = feature ? "pointer" : "";
          targetElement.title = typeof featureName === "string" ? featureName : "";
        }),
      );
    },
    { immediate: true },
  );

  return { enable: enableRef };
}
