import { onUnmounted, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type { TScenario } from "@/scenariostore";
import type { Ref } from "vue";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";

const DAY_NIGHT_TERMINATOR_OVERLAY_ID = "day-night-terminator";

type DayNightTerminatorModule = typeof import("@/geo/dayNightTerminator");
type DayNightTerminatorClientModule = typeof import("@/geo/dayNightTerminatorClient");

let dayNightTerminatorModules: Promise<{
  terminator: DayNightTerminatorModule;
  client: DayNightTerminatorClientModule;
}> | null = null;

function loadDayNightTerminator() {
  if (!dayNightTerminatorModules) {
    dayNightTerminatorModules = Promise.all([
      import("@/geo/dayNightTerminator"),
      import("@/geo/dayNightTerminatorClient"),
    ]).then(([terminator, client]) => ({ terminator, client }));
  }
  return dayNightTerminatorModules;
}

export function useMaplibreDayNightTerminator(
  engineRef: Ref<ScenarioMapEngine | undefined>,
  activeScenario: TScenario,
) {
  const { showDayNightTerminator } = storeToRefs(useMapSettingsStore());

  let lastUpdateKey: string | null = null;
  let lastMap: unknown = null;

  function remove() {
    const mapAdapter = engineRef.value?.map;
    if (lastMap || lastUpdateKey !== null) {
      mapAdapter?.removeGeoJsonOverlay?.(DAY_NIGHT_TERMINATOR_OVERLAY_ID);
    }
    lastUpdateKey = null;
    lastMap = null;
  }

  async function sync(currentTime: number) {
    const mapAdapter = engineRef.value?.map;
    const updateKey = String(Math.floor(currentTime / 60_000));
    if (mapAdapter === lastMap && updateKey === lastUpdateKey) {
      return;
    }

    lastMap = mapAdapter;
    lastUpdateKey = updateKey;

    const { client, terminator } = await loadDayNightTerminator();
    const featureCollection = await client.requestDayNightTerminator(currentTime);

    if (!showDayNightTerminator.value) return;
    const latestMap = engineRef.value?.map;
    if (latestMap !== mapAdapter) return;
    if (lastUpdateKey !== updateKey) return;

    mapAdapter?.addGeoJsonOverlay?.(
      DAY_NIGHT_TERMINATOR_OVERLAY_ID,
      featureCollection,
      terminator.DAY_NIGHT_TERMINATOR_OVERLAY_OPTIONS,
    );
  }

  watchEffect(() => {
    if (!showDayNightTerminator.value) {
      remove();
      return;
    }
    const currentTime = activeScenario.store.state.currentTime;
    void engineRef.value?.map;
    void sync(currentTime);
  });

  onUnmounted(() => {
    engineRef.value?.map.removeGeoJsonOverlay?.(DAY_NIGHT_TERMINATOR_OVERLAY_ID);
  });

  return { DAY_NIGHT_TERMINATOR_OVERLAY_ID };
}
