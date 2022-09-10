<template>
  <div class="pt-4 md:flex md:h-screen md:flex-col">
    <p
      class="absolute inset-x-0 top-0 h-4 border-b bg-amber-200 text-center text-xs text-amber-700"
    >
      Under development
    </p>
    <header class="relative w-full bg-gray-100 p-4 md:flex-shrink-0">
      <h1>{{ state.info.name }}</h1>
      <button
        type="button"
        @click="toggleSidebar()"
        class="fixed top-2 right-4 z-20 inline-flex items-center justify-center rounded-md bg-white bg-opacity-75 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span class="sr-only">Open main menu</span>
        <MenuIcon v-if="!sidebarIsOpen" class="block h-6 w-6" aria-hidden="true" />
        <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
      </button>
    </header>
    <div class="md:flex md:min-h-0 md:flex-auto">
      <section
        class="relative sticky top-0 z-10 h-[45vh] w-full bg-white shadow-md md:static md:h-full md:shadow-none"
      >
        <MapContainer @ready="onMapReady" />
        <MeasurementToolbar
          v-if="mapRef"
          :ol-map="mapRef"
          class="absolute bottom-2 left-2"
        />
      </section>
      <section class="w-full overflow-auto border bg-gray-50 md:max-w-sm lg:max-w-lg">
        <StoryModeContent @update-state="onUpdateState" />
      </section>
    </div>
    <SlideOver v-model="sidebarIsOpen" title="Settings">
      <NumberInputGroup
        label="Symbol size"
        type="number"
        v-model="settingsStore.mapIconSize"
      />
    </SlideOver>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, shallowRef, watch } from "vue";
import MapContainer from "@/components/MapContainer.vue";
import { invoke, useTitle, useToggle } from "@vueuse/core";
import OLMap from "ol/Map";
import StoryModeContent from "./StoryModeContent.vue";
import { chapter, StoryStateChange } from "@/testdata/testStory";
import { fromLonLat } from "ol/proj";
import dayjs from "dayjs";
import { flyTo } from "@/geo/layers";
import { useSettingsStore } from "@/stores/settingsStore";
import { clearStyleCache } from "@/geo/unitStyles";
import SlideOver from "../../components/SlideOver.vue";
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from "@heroicons/vue/24/outline";
import NumberInputGroup from "../../components/NumberInputGroup.vue";
import MeasurementToolbar from "../../components/MeasurementToolbar.vue";
import type { TScenario } from "@/scenariostore";
import { useUnitLayer } from "@/composables/geomap";
import { activeFeaturesKey, activeScenarioKey } from "@/components/injects";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { useFeatureStyles } from "@/geo/featureStyles";

const props = defineProps<{ activeScenario: TScenario }>();
provide(activeScenarioKey, props.activeScenario);

const scnFeatures = useFeatureStyles(props.activeScenario.geo);
provide(activeFeaturesKey, scnFeatures);

const { state } = props.activeScenario.store;

const originalTitle = useTitle().value;
const windowTitle = computed(() => state.info.name);
const mapIsReady = ref(false);
const sidebarIsOpen = ref(false);
const toggleSidebar = useToggle(sidebarIsOpen);
const mapRef = shallowRef<OLMap>();

const settingsStore = useSettingsStore();

useTitle(windowTitle);

onMounted(() => {
  window.scrollTo(0, 0);
});

onUnmounted(() => {
  useTitle(originalTitle);
});

const { unitLayer, drawUnits, animateUnits } = useUnitLayer({
  activeScenario: props.activeScenario,
});

function onMapReady(olMap: OLMap) {
  mapRef.value = olMap;

  mapIsReady.value = true;

  const view = mapRef.value!.getView();
  const { center, ...rest } = chapter.view;
  const time = dayjs.utc(chapter.startTime);
  props.activeScenario.time.setCurrentTime(time.valueOf());
  const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(mapRef.value!, {
    activeScenario: props.activeScenario,
    activeScenarioFeatures: scnFeatures,
  });

  loadScenarioLayers();
  olMap.addLayer(unitLayer);
  drawUnits();

  watch(
    () => state.currentTime,
    () => loadScenarioLayers(false)
  );

  view.animate({
    ...rest,
    center: fromLonLat(center, view.getProjection()),
    duration: 0,
  });
}

function onUpdateState(state: StoryStateChange) {
  if (state.time) {
    const time = dayjs.utc(state.time);
    props.activeScenario.time.setCurrentTime(time.valueOf());
    animateUnits();
  }
  if (state.view) {
    const view = mapRef.value!.getView();
    const { center, zoom, duration, ...rest } = state.view;

    // view.animate(
    //   {
    //     duration: 2000,
    //     ...rest,
    //     center: center && fromLonLat(center, view.getProjection()),
    //   },
    //   () => (doneAnimating.value = true)
    // );

    if (center)
      invoke(async () => {
        await flyTo(view, {
          location: fromLonLat(center, view.getProjection()),
          zoom,
          duration,
        });
        // await until(doneAnimating).toBe(true);
        console.log("done animating");
      });
  }

  console.log("On update state", state);
}

watch(settingsStore, () => {
  clearStyleCache();
  drawUnits();
});
</script>
