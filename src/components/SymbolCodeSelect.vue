<template>
  <Listbox as="div" v-model="selectedValue" class="">
    <ListboxLabel class="text-heading block text-sm font-medium">
      {{ label }}
    </ListboxLabel>
    <Float
      portal
      adaptive-width
      as="div"
      floating-as="template"
      class="relative mt-1"
      placement="bottom"
      flip
      :offset="4"
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
    >
      <ListboxButton
        class="t ext-left relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden sm:text-sm dark:bg-slate-800"
      >
        <div class="flex items-center">
          <div class="flex h-8 w-10 shrink-0 items-center">
            <MilitarySymbol
              :sidc="selected?.sidc || ''"
              alt=""
              :size="20"
              :options="{ ...symbolOptions, ...selected?.symbolOptions }"
            />
          </div>
          <span class="ml-3 block truncate">{{ selected?.text }}</span>
        </div>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
        >
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <ListboxOptions
        class="ring-opacity-5 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-hidden sm:text-sm dark:bg-slate-800"
      >
        <ListboxOption
          as="template"
          v-for="item in items"
          :key="item.sidc"
          :value="item.code"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
              'relative cursor-default py-2 pr-9 pl-3 select-none',
            ]"
          >
            <div class="flex items-center">
              <p class="flex h-7 w-8 shrink-0 items-center justify-center">
                <MilitarySymbol
                  :size="20"
                  :sidc="item.sidc"
                  :options="{ ...symbolOptions, ...item.symbolOptions, outlineWidth: 4 }"
                />
              </p>
              <span
                :class="[
                  selected ? 'font-semibold' : 'font-normal',
                  'ml-3 block truncate dark:text-slate-200',
                ]"
              >
                {{ item.text }}
              </span>
            </div>

            <span
              v-if="selected"
              :class="[
                active ? 'text-white' : 'text-indigo-600',
                'absolute inset-y-0 right-0 flex items-center pr-4',
              ]"
            >
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </Float>
  </Listbox>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Float } from "@headlessui-float/vue";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon as SelectorIcon } from "@heroicons/vue/20/solid";
import { useVModel } from "@vueuse/core";
import { type SymbolItem } from "@/types/constants";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { type UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  modelValue?: string;
  label?: string;
  items: SymbolItem[];
  symbolOptions?: UnitSymbolOptions;
}

const props = withDefaults(defineProps<Props>(), { modelValue: "00" });
const emit = defineEmits(["update:modelValue"]);

const selectedValue = useVModel(props, "modelValue", emit);
const selected = computed(() =>
  (props.items || []).find((i) => i.code === selectedValue.value),
);
</script>
