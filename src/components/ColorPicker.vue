<template>
  <RadioGroup v-model="selectedColor">
    <RadioGroupLabel
      v-if="label || $slots.label"
      class="mb-4 block text-sm font-medium leading-6 text-gray-900"
      ><slot name="label">{{ label }}</slot></RadioGroupLabel
    >
    <div class="flex flex-wrap items-center gap-2">
      <RadioGroupOption
        as="template"
        v-for="color in $colors"
        :key="color.name"
        :value="color.value"
        v-slot="{ active, checked }"
      >
        <div
          :class="[
            color.selectedColor,
            active && checked ? 'ring ring-offset-1' : '',
            !active && checked ? 'ring-2' : '',
            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none',
          ]"
        >
          <RadioGroupLabel as="span" class="sr-only">{{ color.name }}</RadioGroupLabel>
          <div
            aria-hidden="true"
            :class="[
              color.bgColor,
              'flex h-7 w-7 items-center justify-center rounded-full border border-black border-opacity-10',
            ]"
          >
            <span v-if="!color.value">x</span>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script lang="ts">
export const colors = [
  {
    name: "Slate",
    value: "#64748b",
    bgColor: "bg-slate-500",
    selectedColor: "ring-slate-500",
  },

  {
    name: "Purple",
    value: "#a855f7",
    bgColor: "bg-purple-500",
    selectedColor: "ring-purple-500",
  },
  {
    name: "Blue",
    value: "#3b82f6",
    bgColor: "bg-blue-500",
    selectedColor: "ring-blue-500",
  },
  {
    name: "Green",
    value: "#22c55e",
    bgColor: "bg-green-500",
    selectedColor: "ring-green-500",
  },
  {
    name: "Yellow",
    value: "#eab308",
    bgColor: "bg-yellow-500",
    selectedColor: "ring-yellow-500",
  },
  {
    name: "Pink",
    value: "#ec4899",
    bgColor: "bg-pink-500",
    selectedColor: "ring-pink-500",
  },
  {
    name: "Rose",
    value: "#f43f5e",
    bgColor: "bg-rose-500",
    selectedColor: "ring-rose-500",
  },
];
</script>
<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { useVModel } from "@vueuse/core";
import { computed } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  showNone?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: colors[1].selectedColor,
  showNone: false,
});
const emit = defineEmits(["update:modelValue"]);

const selectedColor = useVModel(props, "modelValue", emit);
const $colors = computed(() =>
  props.showNone
    ? [
        {
          name: "None",
          value: null as unknown as undefined,
          bgColor: "bg-white",
          selectedColor: "ring-black",
        },
        ...colors,
      ]
    : colors,
);
</script>
