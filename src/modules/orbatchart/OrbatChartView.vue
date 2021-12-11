<template>
  <main class="w-screen h-screen relative">
    <OrbatChart :unit="rootUnit" :debug="debug"></OrbatChart>
    <div class="absolute left-2 top-2">
      <ToggleField v-model="debug">Debug mode</ToggleField>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import OrbatChart from "./OrbatChart.vue";
import { ORBAT1 } from "../../orbatchart/test/testorbats";
import ToggleField from "../../components/ToggleField.vue";

export default defineComponent({
  name: "OrbatChartView",
  components: { ToggleField, OrbatChart },
  setup() {
    const debug = ref(false);
    return { rootUnit: ORBAT1, debug };
  },
});
</script>
