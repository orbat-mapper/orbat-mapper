<template>
  <div class="md:flex md:flex-col md:h-screen">
    <header class="p-4 w-full bg-gray-100 md:flex-shrink-0 relative">
      <h1>{{ scenario.name }}</h1>
      <button
        type="button"
        @click="toggleSidebar()"
        class="
          z-20
          fixed
          top-2
          right-4
          bg-white bg-opacity-75
          inline-flex
          items-center
          justify-center
          p-2
          rounded-md
          text-gray-500
          hover:text-gray-500 hover:bg-gray-100
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          focus:ring-indigo-500
        "
      >
        <span class="sr-only">Open main menu</span>
        <MenuIcon
          v-if="!sidebarIsOpen"
          class="block h-6 w-6"
          aria-hidden="true"
        />
        <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
      </button>
    </header>
    <div class="md:flex-auto md:min-h-0 md:flex">
      <section
        class="
          w-full
          md:h-full
          sticky
          md:static
          top-0
          h-[45vh]
          bg-white
          z-10
          shadow-md
          md:shadow-none
        "
      >
        <MapContainer @ready="onMapReady" />
      </section>
      <section
        class="bg-gray-50 w-full md:max-w-sm lg:max-w-lg overflow-auto border"
      >
        <StoryModeContent @update-state="onUpdateState" />
      </section>
    </div>
    <SlideOver v-model="sidebarIsOpen" title="Settings">
      <InputGroup
        label="Symbol size"
        type="number"
        v-model="settingsStore.mapIconSize"
      ></InputGroup>
    </SlideOver>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from "vue";
import MapContainer from "../components/MapContainer.vue";
import { useScenarioStore } from "../stores/scenarioStore";
import { and, invoke, useTitle, useToggle, whenever } from "@vueuse/core";
import { useScenarioIO } from "../stores/scenarioIO";
import OLMap from "ol/Map";
import { useUnitLayer } from "../composables/geomap";
import StoryModeContent from "./StoryModeContent.vue";
import { chapter, StoryStateChange } from "../testdata/testStory";
import { fromLonLat } from "ol/proj";
import dayjs from "dayjs";
import { flyTo } from "../geo/layers";
import { useSettingsStore } from "../stores/settingsStore";
import { clearStyleCache } from "../geo/styles";
import SlideOver from "../components/SlideOver.vue";
import { MenuIcon, XIcon } from "@heroicons/vue/outline";
import InputGroup from "../components/InputGroup.vue";

export default defineComponent({
  name: "StoryModeView",
  components: {
    InputGroup,
    SlideOver,
    StoryModeContent,
    MapContainer,
    MenuIcon,
    XIcon,
  },
  setup() {
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const originalTitle = useTitle().value;
    const windowTitle = computed(() => scenarioStore.scenario.name);
    const mapIsReady = ref(false);
    const sidebarIsOpen = ref(false);
    const toggleSidebar = useToggle(sidebarIsOpen);
    let mapInstance: OLMap;

    const settingsStore = useSettingsStore();

    useTitle(windowTitle);

    onMounted(() => {
      window.scrollTo(0, 0);
    });

    onUnmounted(() => {
      useTitle(originalTitle);
    });

    scenarioIO.loadDemoScenario("falkland82");
    const scenarioLoaded = computed(() => scenarioStore.isLoaded);
    const scenario = toRef(scenarioStore, "scenario");
    const { unitLayer, drawUnits, animateUnits } = useUnitLayer();

    function onMapReady(olMap: OLMap) {
      mapInstance = olMap;
      olMap.addLayer(unitLayer);
      mapIsReady.value = true;
    }

    whenever(and(mapIsReady, scenarioLoaded), () => {
      const view = mapInstance.getView();
      const { center, ...rest } = chapter.view;
      const time = dayjs.utc(chapter.startTime);
      scenarioStore.setCurrentTime(time.valueOf());
      drawUnits();

      view.animate({
        ...rest,
        center: fromLonLat(center, view.getProjection()),
        duration: 0,
      });
      // const extent = unitLayer.getSource().getExtent();
      // if (extent && !unitLayer.getSource().isEmpty())
      //   mapInstance.getView().fit(extent, { padding: [10, 10, 10, 10] });
    });

    function onUpdateState(state: StoryStateChange) {
      if (state.time) {
        const time = dayjs.utc(state.time);
        scenarioStore.setCurrentTime(time.valueOf());
        animateUnits();
      }
      if (state.view) {
        const view = mapInstance.getView();
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

    return {
      scenario,
      onMapReady,
      onUpdateState,
      sidebarIsOpen,
      toggleSidebar,
      settingsStore,
    };
  },
});
</script>
