<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <Listbox as="div" v-model="selectedValue" class="">
    <ListboxLabel class="block text-sm font-medium text-gray-700">
      {{ label }}
    </ListboxLabel>
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
      >
        <span class="flex items-center">
          <MilSymbol
            :sidc="selected?.sidc || ''"
            alt=""
            :size="20"
            class="h-8 w-10 flex-shrink-0 pt-0.5"
          />
          <span class="ml-3 block truncate">{{ selected?.text }}</span>
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
          class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
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
                'relative cursor-default select-none py-2 pl-3 pr-9',
              ]"
            >
              <div class="flex items-start">
                <p class="flex h-7 w-8 flex-shrink-0 justify-center">
                  <MilSymbol :size="20" :sidc="item.sidc" />
                </p>
                <span
                  :class="[
                    selected ? 'font-semibold' : 'font-normal',
                    'ml-3 block truncate',
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
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import MilSymbol from "./MilSymbol.vue";
import { useVModel } from "@vueuse/core";
import { SymbolItem } from "../types/constants";

export default defineComponent({
  components: {
    MilSymbol,
    Listbox,
    ListboxButton,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
    CheckIcon,
    SelectorIcon,
  },
  props: {
    modelValue: {
      type: String,
      default: "00",
    },
    label: String,
    items: { type: Array as PropType<SymbolItem[]>, required: true },
  },

  setup(props, { emit }) {
    const selectedValue = useVModel(props, "modelValue", emit);
    const selected = computed(() =>
      (props.items || []).find((i) => i.code === selectedValue.value)
    );

    return {
      selected,
      selectedValue,
    };
  },
});
</script>
