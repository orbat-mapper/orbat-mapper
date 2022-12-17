<template>
  <div class="mt-4">
    <RadioGroup v-model="data">
      <!--    <RadioGroupLabel class="text-base font-medium text-gray-900"-->
      <!--      >Select standard identity</RadioGroupLabel-->
      <!--    >-->

      <div
        class="grid gap-y-4 gap-x-4"
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
      <button
        v-if="!showAll"
        type="button"
        @click="showAll = true"
        class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
      >
        View all
        <span aria-hidden="true"> →</span>
      </button>
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
import { useVModel } from "@vueuse/core";

interface Props {
  modelValue: string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), { modelValue: "3", compact: false });
const emit = defineEmits(["update:modelValue"]);

const data = useVModel(props, "modelValue", emit);

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
    code: "7",
    text: "Custom 1",
  },
  {
    code: "8",
    text: "Custom 2",
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

const showAll = ref(false);
const items = computed(() =>
  showAll.value ? sidItems : sidItems.filter((e) => ["3", "6", "4", "7"].includes(e.code))
);
</script>
