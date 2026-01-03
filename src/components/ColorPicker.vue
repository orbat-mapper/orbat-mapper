<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem, Label } from "reka-ui";
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import { defaultColors as colors } from "./colors";

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

<template>
  <RadioGroupRoot v-model="selectedColor">
    <Label v-if="label || $slots.label" class="mb-4 block text-sm leading-6 font-medium">
      <slot name="label">{{ label }}</slot>
    </Label>
    <div class="flex flex-wrap items-center gap-2">
      <RadioGroupItem
        v-for="color in $colors"
        :key="color.name"
        :value="color.value"
        :class="[
          color.selectedColor,
          'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden',
          'data-[state=checked]:ring-2 focus:data-[state=checked]:ring-3 focus:data-[state=checked]:ring-offset-1',
        ]"
      >
        <span class="sr-only">{{ color.name }}</span>
        <div
          aria-hidden="true"
          :class="[
            color.bgColor,
            'border-opacity-10 flex h-7 w-7 items-center justify-center rounded-full border border-black',
          ]"
        >
          <span v-if="!color.value">x</span>
        </div>
      </RadioGroupItem>
    </div>
  </RadioGroupRoot>
</template>
