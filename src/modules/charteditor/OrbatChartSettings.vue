<template>
  <div class="space-y-2">
    <h3 class="text-gray-900 font-medium">Settings</h3>
    <InputGroup label="Levels" type="number" v-model="options.maxLevels"></InputGroup>
  </div>
</template>

<script>
import InputGroup from "../../components/InputGroup.vue";
import { useChartSettingsStore } from "./chartSettingsStore";

export default {
  name: "OrbatChartSettings",
  components: { InputGroup },
  setup() {
    const options = useChartSettingsStore();

    return { options };
  },
};
</script>
