import DayNight from "ol-ext/source/DayNight";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import { Fill } from "ol/style";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { watch } from "vue";
import { watchPausable } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

export function useDayNightLayer() {
  const {
    store: { state },
  } = injectStrict(activeScenarioKey);
  const { showDayNightTerminator } = storeToRefs(useMapSettingsStore());

  const vectorSource = new DayNight();
  const layer = new VectorLayer({
    properties: { title: "Day/Night" },
    source: vectorSource,
    visible: showDayNightTerminator.value,
    style: new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: "red" }),
      }),
      fill: new Fill({
        color: [0, 0, 50, 0.4],
      }),
    }),
  });

  const { pause, resume } = watchPausable(
    () => state.currentTime,
    (time) => {
      vectorSource.setTime(new Date(time));
    },
    { immediate: true },
  );

  watch(
    showDayNightTerminator,
    (show) => {
      show ? resume() : pause();
      layer.setVisible(show);
    },
    { immediate: true },
  );

  return layer;
}
