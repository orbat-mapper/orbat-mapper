<script setup lang="ts">
import { computed, triggerRef } from "vue";
import { defaultColors, extraColors, isValidHexColor } from "@/components/colors";
import { useUiStore } from "@/stores/uiStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "reka-ui";
import CloseButton from "@/components/CloseButton.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import { Button } from "@/components/ui/button";

interface Props {
  label?: string;
  showNone?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showNone: false,
});

const selectedColor = defineModel<string>({ default: defaultColors[1].selectedColor });

const uiStore = useUiStore();
const $colors = computed(() => {
  const cols = props.showNone
    ? [
        {
          name: "None",
          value: null as unknown as undefined,
          bgColor: "bg-white",
          selectedColor: "ring-black",
        },
        ...defaultColors,
      ]
    : [...defaultColors];

  const notDefault =
    defaultColors.find((c) => c.value === selectedColor.value) === undefined;
  const notExtra = extraColors.find((c) => c.value === selectedColor.value) === undefined;
  cols.push(...extraColors);

  if (selectedColor.value && notDefault && notExtra) {
    cols.push({
      name: selectedColor.value?.toUpperCase() ?? "None",
      value: selectedColor.value,
      bgColor: "",
      selectedColor: "ring-black",
    });
  }
  return cols;
});

const inputColor = computed({
  get: () => selectedColor.value ?? "#000000",
  set: (v) => (selectedColor.value = v),
});

const hexValue = computed({
  get: () => selectedColor.value ?? "#000000",
  set: (v) => (selectedColor.value = v),
});

function updateHexValue(value: string) {
  if (isValidHexColor(value)) {
    selectedColor.value = value;
  } else {
    triggerRef(selectedColor);
  }
}

function getColorName(color: string) {
  return $colors.value.find((c) => c.value === color)?.name ?? color.toUpperCase();
}

function onOpen(isOpen: boolean) {
  if (isOpen) {
    uiStore.popperCounter++;
  } else {
    uiStore.popperCounter--;
    const notDefault =
      defaultColors.find((c) => c.value === selectedColor.value) === undefined;
    const notExtra =
      extraColors.find((c) => c.value === selectedColor.value) === undefined;
    if (selectedColor.value && notDefault && notExtra) {
      extraColors.push({
        name: selectedColor.value.toUpperCase(),
        value: selectedColor.value,
        bgColor: "",
        selectedColor: "ring-black",
      });
    }
  }
}
</script>
<template>
  <Popover @update:open="onOpen">
    <PopoverTrigger as-child
      ><slot name="trigger"
        ><Button type="button" variant="ghost" class="justify-start">
          <span
            aria-hidden="true"
            :class="[
              'border-opacity-10 flex size-6 items-center justify-center rounded-full border border-gray-700 dark:border-gray-600',
            ]"
            :style="{ backgroundColor: selectedColor }"
          >
            <span v-if="!selectedColor">x</span>
          </span>
          <span>{{ getColorName(selectedColor) }}</span>
        </Button></slot
      >
    </PopoverTrigger>
    <PopoverContent class="relative" :avoidCollisions="true">
      <header class="text-sm font-bold">Color</header>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <div
          v-for="color in $colors"
          :key="color.name"
          class="flex rounded-full outline -outline-offset-1 outline-black/10"
        >
          <input
            :aria-label="color.name"
            type="radio"
            name="color"
            :value="color.value"
            :checked="selectedColor === color.value"
            v-model="selectedColor"
            class="size-6 appearance-none rounded-full forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3"
            :style="{
              backgroundColor: color.value,
              outlineColor: selectedColor === color.value ? color.value : 'transparent',
            }"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <label for="color-picker" class="cursor-pointer text-sm font-medium"
          >Custom color</label
        >
        <input
          type="color"
          id="color-picker"
          v-model="inputColor"
          class="h-4 flex-auto cursor-pointer p-0"
        />
      </div>
      <div class="mt-4 flex items-center gap-4">
        <span class="flex-none text-sm font-medium">Hex value</span>
        <EditableLabel
          class="flex-auto"
          :model-value="hexValue"
          @update-value="updateHexValue"
        />
      </div>
      <PopoverClose as-child>
        <CloseButton class="absolute top-4 right-4" />
      </PopoverClose>
    </PopoverContent>
  </Popover>
</template>
