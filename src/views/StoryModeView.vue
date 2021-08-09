<template>
  <div class="md:flex md:flex-col md:h-screen">
    <header class="p-4 w-full bg-gray-100 md:flex-shrink-0">
      <h1>{{ scenario.name }}</h1>
    </header>
    <div class="md:flex-auto md:min-h-0 md:flex">
      <section
        class="w-full md:h-full sticky md:static top-0 h-[45vh] bg-white z-10"
      >
        <MapContainer @ready="onMapReady" />
      </section>
      <section class="bg-gray-50 w-full md:max-w-sm overflow-auto border">
        <StoryModeContent />
      </section>
    </div>
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
} from "vue";
import MapContainer from "../components/MapContainer.vue";
import { useScenarioStore } from "../stores/scenarioStore";
import { and, toRefs, useTitle, whenever } from "@vueuse/core";
import { useScenarioIO } from "../stores/scenarioIO";
import OLMap from "ol/Map";
import { useUnitLayer } from "../composables/geomap";
import StoryModeContent from "./StoryModeContent.vue";

export default defineComponent({
  name: "StoryModeView",
  components: { StoryModeContent, MapContainer },
  setup() {
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    const originalTitle = useTitle().value;
    const windowTitle = computed(() => scenarioStore.scenario.name);
    const mapIsReady = ref(false);
    let mapInstance: OLMap;

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
    const { unitLayer, drawUnits } = useUnitLayer();

    function onMapReady(olMap: OLMap) {
      mapInstance = olMap;
      olMap.addLayer(unitLayer);
      mapIsReady.value = true;
    }

    whenever(and(mapIsReady, scenarioLoaded), () => {
      drawUnits();
      const extent = unitLayer.getSource().getExtent();
      if (extent && !unitLayer.getSource().isEmpty())
        mapInstance.getView().fit(extent, { padding: [10, 10, 10, 10] });
    });

    return { scenario, onMapReady };
  },
});
</script>
