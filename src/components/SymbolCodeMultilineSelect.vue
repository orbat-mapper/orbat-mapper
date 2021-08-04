<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <Listbox as="div" v-model="selectedValue" class="">
    <ListboxLabel class="block text-sm font-medium text-gray-700">
      {{ label }}
    </ListboxLabel>
    <div class="mt-1 relative">
      <ListboxButton
        class="
          relative
          w-full
          bg-white
          border border-gray-300
          rounded-md
          shadow-sm
          pl-3
          pr-10
          py-2
          text-left
          cursor-default
          focus:outline-none
          focus:ring-1
          focus:ring-indigo-500
          focus:border-indigo-500
          sm:text-sm
        "
      >
        <span class="flex items-center">
          <MilSymbol
            :sidc="selected?.sidc || ''"
            alt=""
            :size="20"
            class="flex-shrink-0 h-8 w-10 pt-0.5"
          />
          <span class="ml-3 block">{{ selected?.text }}</span>
        </span>
        <span
          class="
            ml-3
            absolute
            inset-y-0
            right-0
            flex
            items-center
            pr-2
            pointer-events-none
          "
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
          class="
            absolute
            z-10
            mt-1
            w-full
            bg-white
            shadow-lg
            max-h-56
            border border-gray-200
            rounded-md
            py-1
            text-base
            ring-1 ring-black ring-opacity-5
            overflow-auto
            focus:outline-none
            sm:text-sm
          "
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
                active ? 'text-white bg-indigo-600' : 'text-gray-900',
                'cursor-default select-none relative py-2 pl-3 pr-9',
              ]"
            >
              <div class="flex items-start">
                <p class="flex-shrink-0 h-7 w-8 flex justify-center pt-1">
                  <MilSymbol :size="20" :sidc="item.sidc" />
                </p>
                <div
                  :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 ']"
                >
                  <p class="text-sm text-gray-500">
                    {{ item.entity }} / {{ item.entityType }}
                  </p>

                  <p class="mt-1">
                    {{ item.entitySubtype }}
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
    </div>
  </Listbox>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
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
