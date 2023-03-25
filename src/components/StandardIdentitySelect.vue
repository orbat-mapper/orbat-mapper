<template>
  <div class="mt-4">
    <RadioGroup v-model="data">
      <RadioGroupLabel class="text-sm font-medium text-gray-700"
        >Standard identity
      </RadioGroupLabel>
      <div
        class="mt-1 grid gap-y-4 gap-x-4"
        :class="compact ? 'grid-cols-2' : 'sm:grid-cols-4'"
      >
        <RadioGroupOption
          as="template"
          v-for="sid in items"
          :key="sid.code"
          :value="sid.code"
          v-slot="{ checked, active }"
        >
          <div
            :class="[
              checked ? 'border-transparent' : 'border-gray-300',
              active ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
              'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
            ]"
          >
            <span class="flex flex-1">
              <span class="flex w-full flex-col items-center">
                <RadioGroupLabel
                  as="span"
                  class="block text-sm font-medium text-gray-900"
                  >{{ sid.text }}</RadioGroupLabel
                >
                <RadioGroupDescription as="span" class="mt-2 flex"
                  ><MilSymbol :sidc="sid.sidc" :size="32"
                /></RadioGroupDescription>
              </span>
            </span>
            <CheckCircleIcon
              :class="[
                !checked ? 'invisible' : '',
                'absolute right-1 top-1 h-5 w-5 text-indigo-600',
              ]"
              aria-hidden="true"
            />
            <span
              :class="[
                active ? 'border' : 'border-2',
                checked ? 'border-indigo-500' : 'border-transparent',
                'pointer-events-none absolute -inset-px rounded-lg',
              ]"
              aria-hidden="true"
            />
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>
    <div class="mt-2 flex justify-end">
      <button type="button" @click="toggleShowAll()" class="btn-link">
        <template v-if="showAll"><span aria-hidden="true"> ←</span> View less</template>
        <template v-else>View more<span aria-hidden="true"> →</span></template>
      </button>
    </div>
    <div class="mt-0 grid gap-4" :class="compact ? 'grid-cols-1' : 'sm:grid-cols-2'">
      <SymbolCodeSelect
        label="Fill color"
        :items="colorIconItems"
        v-model="fillColorValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import { SymbolItem, SymbolValue } from "@/types/constants";
import MilSymbol from "@/components/MilSymbol.vue";
import { useToggle, useVModel } from "@vueuse/core";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";

interface Props {
  modelValue: string;
  compact?: boolean;
  fillColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "3",
  compact: false,
  fillColor: "",
});
const emit = defineEmits(["update:modelValue", "update:fillColor"]);

const data = useVModel(props, "modelValue", emit);
const fillColorValue = useVModel(props, "fillColor", emit);

const sidItems = [
  {
    code: "3",
    text: "Friend",
  },
  {
    code: "6",
    text: "Hostile",
  },
  {
    code: "4",
    text: "Neutral",
  },
  {
    code: "1",
    text: "Unknown",
  },
  {
    code: "0",
    text: "Pending",
  },
  {
    code: "2",
    text: "Assumed Friend",
  },
  {
    code: "5",
    text: "Suspect",
  },
].map(addSymbol);

function addSymbol({ code, text }: SymbolValue): SymbolItem {
  return {
    code,
    text,
    sidc: "100" + code + 10 + "00" + "00" + "0000000000",
  };
}

const [showAll, toggleShowAll] = useToggle(false);
const items = computed(() =>
  showAll.value
    ? sidItems
    : sidItems.filter((e) => ["1", "3", "6", "4", "7"].includes(e.code))
);

const colors: Omit<SymbolItem, "sidc">[] = [
  { code: "", text: "Standard" },
  { code: "#80e0ff", text: "Blue (standard)" },
  { code: "#ff8080", text: "Red (standard)" },
  { code: "#aaffaa", text: "Green (standard)" },
  { code: "#ffff80", text: "Yellow (standard)" },
  { code: "#ffa1ff", text: "Pink (civilian)" },
  { code: "#aab074", text: "Olive" },
  { code: "#5baa5b", text: "Infantry (Battle Order)" },
  { code: "#ffd00b", text: "Armor (Battle Order)" },
  { code: "#ff3333", text: "Artillery (Battle Order)" },
  { code: "#f7f7f7", text: "Combat Support (Battle Order)" },
  { code: "#d87600", text: "Service Support (Battle Order)" },
  { code: "#a2e3e8", text: "Aviation (Battle Order)" },
];

const colorIconItems = computed((): SymbolItem[] =>
  colors.map((item) => ({
    ...item,
    sidc: "100" + data.value + 10 + "00" + "00" + "0000000000",
    symbolOptions: item.code ? { fillColor: item.code } : undefined,
  }))
);
</script>
