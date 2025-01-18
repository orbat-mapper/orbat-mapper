<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import { defaultColors, extraColors } from "@/components/colors";
import { useUiStore } from "@/stores/uiStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "radix-vue";
import CloseButton from "@/components/CloseButton.vue";

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
            'flex size-6 items-center justify-center rounded-full border border-black border-opacity-10',
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
          class="mb-4 block text-sm font-medium leading-6 text-gray-900"
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
                active && checked ? 'ring ring-offset-1' : '',
                !active && checked ? 'ring-2' : '',
                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none',
              ]"
            >
              <RadioGroupLabel as="span" class="sr-only">{{
                color.name
              }}</RadioGroupLabel>
              <div
                aria-hidden="true"
                :class="[
                  color.bgColor,
                  'flex h-7 w-7 items-center justify-center rounded-full border border-black border-opacity-10',
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
      <PopoverClose as-child>
        <CloseButton class="absolute right-4 top-4" />
      </PopoverClose>
    </PopoverContent>
  </Popover>
</template>
