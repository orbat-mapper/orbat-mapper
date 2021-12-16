<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <SimpleModal v-model="open" dialog-title="Keyboard shortcuts">
    <div class="mt-4">
      <div v-for="category in shortcuts">
        <h4 class="text-base font-medium text-gray-900 border-b-2 pb-1 border-gray-300">
          {{ category.label }}
        </h4>
        <ul class="text-sm text-gray-900 divide-gray-200 divide-y">
          <li
            v-for="entry in category.shortcuts"
            class="flex justify-between items-center py-2"
          >
            <p class="text-gray-700 text-sm">{{ entry.description }}</p>
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

<script lang="ts">
import { defineComponent } from "vue";

import SimpleModal from "./SimpleModal.vue";
import { useVModel } from "@vueuse/core";

type KeyboardShortcut = string[];

interface KeyboardEntry {
  description: string;
  shortcut: KeyboardShortcut[];
}

interface KeyboardCategory {
  label: string;
  shortcuts: KeyboardEntry[];
}

const shortcuts: KeyboardCategory[] = [
  {
    label: "Generic",
    shortcuts: [
      { shortcut: [["?"]], description: "Show help" },
      { shortcut: [["s"]], description: "Search" },
      { shortcut: [["c"]], description: "Create subordinate unit" },
      { shortcut: [["e"]], description: "Edit active unit" },
      { shortcut: [["d"]], description: "Duplicate unit" },
      { shortcut: [["t"]], description: "Set scenario time" },
    ],
  },
  {
    label: "Map",
    shortcuts: [
      { shortcut: [["z"]], description: "Zoom to unit" },
      { shortcut: [["p"]], description: "Pan to unit" },
    ],
  },
];

export default defineComponent({
  name: "ShortcutsModal",
  components: {
    SimpleModal,
  },
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  setup(props) {
    const open = useVModel(props, "modelValue");

    return {
      open,
      shortcuts,
    };
  },
});
</script>
