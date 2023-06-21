<script setup lang="ts">
import { ScenarioImageLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed } from "vue";

interface Props {
  layer: ScenarioImageLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update"]);

const rotation = computed({
  get: () => props.layer.imageRotate ?? 0,
  set: (v) => emit("update", { imageRotate: v }, true),
});
</script>

<template>
  <section class="mt-4 grid w-full grid-cols-1 gap-x-6 gap-y-2 text-sm">
    <InputGroup
      label="Rotation"
      v-model.number="rotation"
      type="range"
      min="-3"
      max="3"
      step="0.01"
      class=""
    >
    </InputGroup>
  </section>
</template>
