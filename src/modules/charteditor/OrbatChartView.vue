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
    />
    <div class="absolute left-2 top-2">
      <ToggleField v-model="debug">Debug mode</ToggleField>
    </div>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import ToggleField from "../../components/ToggleField.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import { useScenarioIO } from "../../stores/scenarioIO";
import { LevelLayout } from "./orbatchart";
import { ORBAT1 } from "./orbatchart/test/testorbats";
import { symbolGenerator } from "../../symbology/milsymbwrapper";

export default defineComponent({
  name: "OrbatChartView",
  components: { ToggleField, OrbatChart },
  setup() {
    const debug = ref(false);
    const scenarioStore = useScenarioStore();
    const scenarioIO = useScenarioIO();
    scenarioIO.loadDemoScenario("falkland82");

    const rootUnit = computed(
      // () => scenarioStore.getUnitById("yeyNm2QTCh_yivrfpnv0N") || ORBAT1
      () => scenarioStore.getUnitByName("3 Mech Inf Bde") || ORBAT1
    );

    const lastLevelLayout = LevelLayout.TreeRight;
    const width = ref(1920 / 2);
    const height = ref(1080);
    const isReady = computed(() => scenarioStore.isLoaded);

    return {
      rootUnit,
      debug,
      lastLevelLayout,
      width,
      height,
      isReady,
      symbolGenerator,
    };
  },
});
</script>
