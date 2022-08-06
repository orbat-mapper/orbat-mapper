<template>
  <div class="flex">
    <div>
      <label for="sidc" class="block text-sm font-medium text-gray-700"
        >Symbol code</label
      >
      <div class="mt-1 flex rounded-md shadow-sm">
        <div class="relative flex flex-grow items-stretch focus-within:z-10">
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
          class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <MenuAlt3Icon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span>Select</span>
        </button>
      </div>
    </div>
    <SymbolPickerModal
      v-if="showSymbolPicker"
      v-model:is-visible="showSymbolPickerDelayed"
      v-model:sidc="sidcValue"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { biSyncDelayedRef } from "@/composables/utils";
import { MenuAlt3Icon } from "@heroicons/vue/solid";
import NProgress from "nprogress";

const SymbolPickerModal = defineAsyncComponent(() => import("./SymbolPickerModal.vue"));

const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits(["update:modelValue"]);

const sidcValue = useVModel(props, "modelValue", emit);
const showSymbolPicker = ref(false);
const showSymbolPickerDelayed = ref(false);

biSyncDelayedRef(showSymbolPicker, showSymbolPickerDelayed);

const openModal = async () => {
  NProgress.start();
  showSymbolPicker.value = true;
};
</script>
