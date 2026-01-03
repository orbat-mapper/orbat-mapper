<script setup lang="ts">
import { useVModel } from "@vueuse/core";

import { Bars3BottomRightIcon as MenuAlt3Icon } from "@heroicons/vue/24/solid";
import { injectStrict } from "@/utils";
import { sidcModalKey } from "@/components/injects";
import { type UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  modelValue?: string;
  symbolOptions?: UnitSymbolOptions;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const sidcValue = useVModel(props, "modelValue", emit);

const { getModalSidc } = injectStrict(sidcModalKey);

const openModal = async () => {
  const newSidcValue = await getModalSidc(props.modelValue || "", {
    symbolOptions: props.symbolOptions,
  });
  if (newSidcValue !== undefined) {
    emit("update:modelValue", newSidcValue);
  }
};
</script>

<template>
  <div class="flex">
    <div>
      <label for="sidc" class="block text-sm font-medium text-gray-700"
        >Symbol code</label
      >
      <div class="mt-1 flex rounded-md shadow-xs">
        <div class="relative flex grow items-stretch focus-within:z-10">
          <input
            type="text"
            v-model="sidcValue"
            name="sidc"
            id="sid"
            class="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="10031000001211000000"
          />
        </div>
        <button
          type="button"
          @click="openModal"
          class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
        >
          <MenuAlt3Icon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span>Select</span>
        </button>
      </div>
    </div>
  </div>
</template>
