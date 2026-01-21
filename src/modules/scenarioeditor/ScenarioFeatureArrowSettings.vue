<script setup lang="ts">
import { computed } from "vue";
import type { ArrowStyleSpec, SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import ScenarioFeatureArrowSelect from "./ScenarioFeatureArrowSelect.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const arrowSettings = computed({
  get: () => {
    const { style } = props.feature;
    return {
      "arrow-start": style["arrow-start"] ?? "none",
      "arrow-end": style["arrow-end"] ?? "none",
    };
  },
  set: (val) => {
    // This setter is not used since we use updateValue explicitly or v-model with computed is tricky here
  },
});

function updateValue(name: keyof ArrowStyleSpec, value: string | null | undefined) {
  emit("update", { style: { [name]: value as any } });
}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Arrows</div>
  <label for="arrow-start" class="self-center">Start</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <ScenarioFeatureArrowSelect
      id="arrow-start"
      :model-value="arrowSettings['arrow-start']"
      @update:model-value="updateValue('arrow-start', $event)"
    />
  </div>
  <label for="arrow-end" class="self-center">End</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <ScenarioFeatureArrowSelect
      id="arrow-end"
      :model-value="arrowSettings['arrow-end']"
      @update:model-value="updateValue('arrow-end', $event)"
    />
  </div>
</template>
