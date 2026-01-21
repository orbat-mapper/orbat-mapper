<script setup lang="ts">
import type { ArrowType } from "@/geo/simplestyle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DrawArrow from "@/components/DrawArrow.vue";

const modelValue = defineModel<ArrowType>({ required: true });

defineProps<{
  id?: string;
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
</script>

<template>
  <Select v-model="modelValue">
    <SelectTrigger :id="id" class="w-full">
      <div class="flex items-center gap-2">
        <DrawArrow
          v-if="modelValue !== 'none'"
          :arrow-type="modelValue"
          :size="20"
          :rotation="0"
          class="text-foreground shrink-0"
        />
        <SelectValue placeholder="Select arrow" />
      </div>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="item in arrowTypeOptions" :key="item.value" :value="item.value">
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
</template>
