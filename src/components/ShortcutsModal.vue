<template>
  <SimpleModal v-model="open" dialog-title="Keyboard shortcuts">
    <div class="mt-4">
      <div v-for="category in shortcuts">
        <h4 class="border-b-2 border-gray-300 pb-1 text-base font-medium text-gray-900">
          {{ category.label }}
        </h4>
        <ul class="divide-y divide-gray-200 text-sm text-gray-900">
          <li
            v-for="entry in category.shortcuts"
            class="flex items-center justify-between py-2"
          >
            <p class="text-sm text-gray-700">{{ entry.description }}</p>
            <div>
              <ul class="flex divide-x-2 divide-gray-300">
                <li v-for="i in entry.shortcut" class="px-2 py-0.5">
                  <kbd v-for="s in i" class="kbd-shortcut">{{ s }}</kbd>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </SimpleModal>
</template>

<script setup lang="ts">
import SimpleModal from "./SimpleModal.vue";
import { useVModel } from "@vueuse/core";
import {
  defaultShortcuts,
  gridEditModeShortcuts,
  type KeyboardCategory,
  mapEditModeShortcuts,
} from "@/components/keyboardShortcuts";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { GRID_EDIT_ROUTE, SCENARIO_ROUTE } from "@/router/names";
const route = useRoute();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const open = useVModel(props, "modelValue");
const shortcuts = computed((): KeyboardCategory[] => {
  if (route.name === SCENARIO_ROUTE) return mapEditModeShortcuts;
  if (route.name === GRID_EDIT_ROUTE) return gridEditModeShortcuts;
  return defaultShortcuts;
});
</script>
