<template>
  <main class="w-screen h-screen relative">
    <OrbatChart
      v-if="isReady"
      :unit="rootUnit"
      :debug="debug"
      :last-level-layout="lastLevelLayout"
      :width="width"
      :height="height"
      :symbol-generator="symbolGenerator"
      @unitclick="onUnitClick"
      :interactive="isInteractive"
    />
    <div class="absolute left-4 top-4 flex items-center space-x-4">
      <ToggleField v-model="debug">Debug mode</ToggleField>
      <ToggleField v-model="isInteractive">Interactive</ToggleField>
      <button
        @click="showSearch = true"
        class="text-gray-500 hover:text-gray-900"
      >
        <span class="sr-only">Search units</span>
        <SearchIcon class="h-5 w-5" />
      </button>
    </div>
    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
  </main>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import ToggleField from "../../components/ToggleField.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import { useScenarioIO } from "../../stores/scenarioIO";
import { LevelLayout, UnitNodeInfo } from "./orbatchart";
import { ORBAT1 } from "./orbatchart/test/testorbats";
import { symbolGenerator } from "../../symbology/milsymbwrapper";
import { SearchIcon } from "@heroicons/vue/solid";
import SearchModal from "../../components/SearchModal.vue";
import { Unit } from "../../types/models";
import { whenever } from "@vueuse/core";

export default defineComponent({
  name: "OrbatChartView",
  components: {
    SearchModal: defineAsyncComponent(
      () => import("../../components/SearchModal.vue")
    ),
    ToggleField,
    OrbatChart,
    SearchIcon,
  },
  setup() {
    const debug = ref(false);
    const isInteractive = ref(false);
    const showSearch = ref(false);
    const rootUnit = ref<Unit>();
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();

    scenarioIO.loadDemoScenario("falkland82");

    whenever(
      () => scenarioStore.isLoaded,
      () => {
        rootUnit.value =
          scenarioStore.getUnitByName("3 Mech Inf Bde") || ORBAT1;
      }
    );

    const lastLevelLayout = LevelLayout.TreeRight;
    const width = ref(1920 / 2);
    const height = ref(1080);
    const isReady = computed(() => scenarioStore.isLoaded);

    const onUnitClick = (unit: UnitNodeInfo) => {
      console.log("Clicked on unit", unit.unit.name);
    };

    const onUnitSelect = (unitId: string) => {
      const unit = scenarioStore.getUnitById(unitId);
      if (unit) rootUnit.value = unit;
    };

    return {
      rootUnit,
      debug,
      lastLevelLayout,
      width,
      height,
      isReady,
      symbolGenerator,
      onUnitClick,
      isInteractive,
      showSearch,
      onUnitSelect,
    };
  },
});
</script>
