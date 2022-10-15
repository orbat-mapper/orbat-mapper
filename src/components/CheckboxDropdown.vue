<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { PopoverButton, PopoverGroup, Popover, PopoverPanel } from "@headlessui/vue";
import { SelectItem } from "@/components/types";
import { useVModel } from "@vueuse/core";

interface Props {
  options: SelectItem[];
  modelValue: (string | number)[];
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const selectedItems = useVModel(props, "modelValue", emit);
</script>
<template>
  <PopoverGroup class="hidden sm:flex sm:items-baseline sm:space-x-8">
    <Popover as="div" class="relative z-50 inline-block text-left">
      <div>
        <PopoverButton
          class="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span
            ><slot>{{ label }}</slot></span
          >
          <span
            class="ml-1.5 rounded bg-gray-200 py-0.5 px-1.5 text-xs font-semibold tabular-nums text-gray-700"
            >{{ selectedItems.length }}</span
          >
          <ChevronDownIcon
            class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
        </PopoverButton>
      </div>

      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <PopoverPanel
          class="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <form class="space-y-4">
            <div
              v-for="(option, optionIdx) in options"
              :key="option.value"
              class="flex items-center"
            >
              <input
                :id="`filter-${option.value}`"
                :value="option.value"
                v-model="selectedItems"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                :for="`filter-${option.value}`"
                class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900"
                >{{ option.label }}</label
              >
            </div>
          </form>
        </PopoverPanel>
      </transition>
    </Popover>
  </PopoverGroup>
</template>
