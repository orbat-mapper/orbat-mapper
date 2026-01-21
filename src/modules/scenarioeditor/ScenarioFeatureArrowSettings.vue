<script setup lang="ts">
import { computed } from "vue";
import type { ArrowStyleSpec, ArrowType, SimpleStyleSpec } from "@/geo/simplestyle";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DrawArrow from "@/components/DrawArrow.vue";

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
    <Select
      :model-value="arrowSettings['arrow-start']"
      @update:model-value="updateValue('arrow-start', $event as string)"
    >
      <SelectTrigger id="arrow-start" class="w-full">
        <SelectValue placeholder="Select arrow" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="item in arrowTypeOptions"
          :key="item.value"
          :value="item.value"
        >
          <div class="flex items-center gap-2">
            <DrawArrow
              v-if="item.value !== 'none'"
              :arrow-type="item.value"
              :size="20"
              :rotation="0"
              class="text-foreground"
            />
            <span>{{ item.label }}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
  <label for="arrow-end" class="self-center">End</label>
  <div class="grid grid-cols-[1fr_5ch] gap-4">
    <Select
      :model-value="arrowSettings['arrow-end']"
      @update:model-value="updateValue('arrow-end', $event as string)"
    >
      <SelectTrigger id="arrow-end" class="w-full">
        <SelectValue placeholder="Select arrow" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="item in arrowTypeOptions"
          :key="item.value"
          :value="item.value"
        >
          <div class="flex items-center gap-2">
            <DrawArrow
              v-if="item.value !== 'none'"
              :arrow-type="item.value"
              :size="20"
              :rotation="0"
              class="text-foreground"
            />
            <span>{{ item.label }}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
