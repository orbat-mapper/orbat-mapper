<script setup lang="ts">
import { computed } from "vue";
import { useActiveScenario } from "@/composables/scenarioUtils";

const props = defineProps<{ axis: [number, number] }>();

const {
  store: { state },
} = useActiveScenario();

// Reads the scenario time itself, so a time step re-renders only this line, not the lanes.
const percent = computed(() => {
  const [start, end] = props.axis;
  return ((state.currentTime - start) / (end - start)) * 100;
});
</script>

<template>
  <div
    v-if="percent >= 0 && percent <= 100"
    class="pointer-events-none absolute inset-y-0 w-0.5 bg-red-700/70"
    :style="{ left: `${percent}%` }"
  />
</template>
