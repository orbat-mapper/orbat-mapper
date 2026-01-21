<script setup lang="ts">
import { computed } from "vue";
import type { ArrowStyleSpec, ArrowType, SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import NewSelect from "@/components/NewSelect.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{
  (e: "update", value: { style: Partial<SimpleStyleSpec> }): void;
}>();

const arrowTypeOptions: { label: string; value: ArrowType }[] = [
  { label: "None", value: "none" },
  { label: "Arrow", value: "arrow" },
  { label: "Arrow (open)", value: "arrow-open" },
  { label: "Arrow (curved)", value: "arrow-curved" },
  { label: "Arrow (stealth)", value: "arrow-stealth" },
  { label: "Arrow (double)", value: "arrow-double" },
  { label: "Hand drawn", value: "arrow-hand-drawn" },
  { label: "Hand drawn (double)", value: "arrow-double-hand-drawn" },
  { label: "Dot", value: "dot" },
  { label: "Square", value: "square" },
  { label: "Diamond", value: "diamond" },
  { label: "Bar", value: "bar" },
];

const arrowSettings = computed(() => {
  const { style } = props.feature;
  return {
    "arrow-start": style["arrow-start"] ?? "none",
    "arrow-end": style["arrow-end"] ?? "none",
  };
});

function updateValue(name: keyof ArrowStyleSpec, value: string | null | undefined) {
  emit("update", { style: { [name]: value as any } });
}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Arrows</div>
  <label for="arrow-start" class="self-center">Start</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <NewSelect
      id="arrow-start"
      :model-value="arrowSettings['arrow-start']"
      @update:model-value="updateValue('arrow-start', String($event))"
      :items="arrowTypeOptions"
    />
  </div>
  <label for="arrow-end" class="self-center">End</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <NewSelect
      id="arrow-end"
      :model-value="arrowSettings['arrow-end']"
      @update:model-value="updateValue('arrow-end', String($event))"
      :items="arrowTypeOptions"
    />
  </div>
</template>
