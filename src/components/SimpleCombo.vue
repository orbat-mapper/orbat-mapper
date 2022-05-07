<template>
  <Combobox as="div" v-model="selectedValue">
    <ComboboxLabel class="block text-sm font-medium text-gray-700"
      >{{ label }}
    </ComboboxLabel>
    <div class="relative mt-1">
      <ComboboxInput
        class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        @change="query = $event.target.value"
        :display-value="
          (item) => String(computedValues.find((i) => i.value === item)?.label || '')
        "
      />
      <ComboboxButton
        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
      >
        <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>

      <ComboboxOptions
        v-if="filteredValues.length > 0"
        class="absolute z-10 z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="item in filteredValues"
          :key="item.value"
          :value="item.value"
          as="template"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              'relative cursor-default select-none py-2 pl-3 pr-9',
              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
            ]"
          >
            <span :class="['block truncate', selected && 'font-semibold']">
              {{ item.label }}
            </span>

            <span
              v-if="selected"
              :class="[
                'absolute inset-y-0 right-0 flex items-center pr-4',
                active ? 'text-white' : 'text-indigo-600',
              ]"
            >
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";
import { PropType } from "vue";
import { SelectItem } from "./types";
import { useVModel } from "@vueuse/core";

export default defineComponent({
  components: {
    CheckIcon,
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxLabel,
    ComboboxOption,
    ComboboxOptions,
    SelectorIcon,
  },
  props: {
    label: String,
    description: String,
    modelValue: [String, Number],
    items: { type: Array as PropType<SelectItem[]> },
    values: { type: Array as PropType<(string | number)[]> },
    extraClass: [String, Array, Object, Function, Boolean],
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const query = ref("");
    const selectedValue = useVModel(props, "modelValue", emit);
    const computedValues = computed(() => {
      if (props.items) return props.items;

      return (props.values || []).map((i) => ({
        label: i,
        value: i,
      }));
    });
    const filteredValues = computed(() =>
      query.value === ""
        ? computedValues.value
        : computedValues.value.filter((item) => {
            return String(item.label).toLowerCase().includes(query.value.toLowerCase());
          })
    );

    return {
      query,
      selectedValue,
      filteredValues,
      computedValues,
    };
  },
});
</script>
