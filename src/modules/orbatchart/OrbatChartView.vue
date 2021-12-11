<template>
  <main class="w-screen h-screen">
    <OrbatChart :unit="rootUnit"></OrbatChart>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OrbatChart from "./OrbatChart.vue";
import { ORBAT1 } from "../../orbatchart/test/testorbats";

export default defineComponent({
  name: "OrbatChartView",
  components: { OrbatChart },
  setup() {
    return { rootUnit: ORBAT1 };
  },
});
</script>
