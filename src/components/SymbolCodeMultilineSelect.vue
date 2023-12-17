<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <Listbox as="div" v-model="selectedValue" class="">
    <ListboxLabel class="block text-sm font-medium text-gray-700">
      {{ label }}
    </ListboxLabel>
    <Float
      as="div"
      floating-as="template"
      class="relative mt-1"
      placement="bottom"
      flip
      :offset="4"
    >
      <ListboxButton
        class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
      >
        <span class="flex items-center">
          <MilitarySymbol
            :sidc="selected?.sidc || ''"
            alt=""
            :size="20"
            class="h-8 w-10 flex-shrink-0 pt-0.5"
            :options="symbolOptions"
          />
          <div class="ml-3">
            <p v-if="selected?.subLabel" class="text-xs text-gray-600">
              {{ selected.subLabel }}
            </p>

            <p class="mt-0 text-sm">
              {{ selected?.label }}
            </p>
          </div>
        </span>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
        >
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            as="template"
            v-for="item in renderedItems"
            :key="item.sidc"
            :value="item.code"
            v-slot="{ active, selected }"
          >
            <li
              :class="[
                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-3 pr-9',
              ]"
            >
              <div class="flex items-center">
                <p class="flex h-7 w-8 flex-shrink-0 justify-center pt-1">
                  <MilitarySymbol :size="20" :sidc="item.sidc" :options="symbolOptions" />
                </p>
                <div :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 ']">
                  <p
                    v-if="item.subLabel"
                    class="text-xs text-gray-600"
                    :class="{ 'text-white': active }"
                  >
                    {{ item.subLabel }}
                  </p>

                  <p class="mt-0 text-sm">
                    {{ item.label }}
                  </p>
                </div>
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
      </transition>
    </Float>
  </Listbox>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Float } from "@headlessui-float/vue";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon as SelectorIcon } from "@heroicons/vue/24/solid";
import { useVModel } from "@vueuse/core";
import { SymbolItem } from "@/types/constants";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { UnitSymbolOptions } from "@/types/scenarioModels";

const props = defineProps({
  modelValue: {
    type: String,
    default: "00",
  },
  label: String,
  items: { type: Array as PropType<SymbolItem[]>, required: true },
  symbolOptions: { type: Object as PropType<UnitSymbolOptions> },
});

const emit = defineEmits(["update:modelValue"]);

const selectedValue = useVModel(props, "modelValue", emit);

function mapSymbolItem(item: SymbolItem) {
  return {
    sidc: item.sidc,
    code: item.code,
    label: item.entitySubtype || item.entityType || item.entity,
    subLabel: item.entitySubtype
      ? `${item.entity} / ${item.entityType}`
      : item.entityType
        ? item.entity
        : "",
  };
}

const renderedItems = computed(() => props.items.map(mapSymbolItem));

const selected = computed(() => {
  const v = (renderedItems.value || []).find((i) => i.code === selectedValue.value);
  return v ? v : renderedItems.value[0];
});
</script>
