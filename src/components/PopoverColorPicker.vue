<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { useVModel } from "@vueuse/core";
import { computed, triggerRef } from "vue";
import { defaultColors, extraColors, isValidHexColor } from "@/components/colors";
import { useUiStore } from "@/stores/uiStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "reka-ui";
import CloseButton from "@/components/CloseButton.vue";
import EditableLabel from "@/components/EditableLabel.vue";

interface Props {
  modelValue?: string;
  label?: string;
  showNone?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: defaultColors[1].selectedColor,
  showNone: false,
});
const emit = defineEmits(["update:modelValue"]);

const uiStore = useUiStore();

const selectedColor = useVModel(props, "modelValue", emit);
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
      ><button type="button" class="flex items-center gap-2 hover:bg-gray-100">
        <span
          aria-hidden="true"
          :class="[
            'border-opacity-10 flex size-6 items-center justify-center rounded-full border border-black',
          ]"
          :style="{ backgroundColor: selectedColor }"
        >
          <span v-if="!selectedColor">x</span>
        </span>
        <span>{{ getColorName(selectedColor) }}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent class="relative" :avoidCollisions="true">
      <header class="text-sm font-bold">Color</header>
      <RadioGroup v-model="selectedColor">
        <RadioGroupLabel
          v-if="label || $slots.label"
          class="mb-4 block text-sm leading-6 font-medium text-gray-900"
        >
          <slot name="label">{{ label }}</slot>
        </RadioGroupLabel>
        <div class="mt-4 flex flex-wrap items-center gap-2">
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
                active && checked ? 'ring-3 ring-offset-1' : '',
                !active && checked ? 'ring-2' : '',
                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden',
              ]"
            >
              <RadioGroupLabel as="span" class="sr-only">{{
                color.name
              }}</RadioGroupLabel>
              <div
                aria-hidden="true"
                :class="[
                  color.bgColor,
                  'border-opacity-10 flex h-7 w-7 items-center justify-center rounded-full border border-black',
                ]"
                :style="{ backgroundColor: color.value }"
              >
                <span v-if="!color.value">x</span>
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
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
