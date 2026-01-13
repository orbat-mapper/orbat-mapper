<script setup lang="ts">
import SimpleModal from "./SimpleModal.vue";
import {
  defaultShortcuts,
  gridEditModeShortcuts,
  type KeyboardCategory,
  mapEditModeShortcuts,
} from "@/components/keyboardShortcuts";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { GRID_EDIT_ROUTE, MAP_EDIT_MODE_ROUTE, OLD_MAP_ROUTE } from "@/router/names";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Kbd } from "@/components/ui/kbd";
const route = useRoute();

const open = defineModel<boolean>({ default: false });

const shortcuts = computed((): KeyboardCategory[] => {
  if (route.name === OLD_MAP_ROUTE || route.name === MAP_EDIT_MODE_ROUTE)
    return mapEditModeShortcuts;
  if (route.name === GRID_EDIT_ROUTE) return gridEditModeShortcuts;
  return defaultShortcuts;
});
</script>

<template>
  <NewSimpleModal v-model="open" dialog-title="Keyboard shortcuts">
    <div class="mt-4">
      <div v-for="category in shortcuts">
        <h4 class="border-b-2 pb-1 text-base font-medium">
          {{ category.label }}
        </h4>
        <ul class="divide-y text-sm">
          <li
            v-for="entry in category.shortcuts"
            class="flex items-center justify-between py-2"
          >
            <p class="text-sm">{{ entry.description }}</p>
            <div>
              <ul class="divide-muted-foreground/50 flex divide-x-2">
                <li v-for="i in entry.shortcut" class="flex gap-0.5 px-2 py-0.5">
                  <Kbd v-for="s in i">{{ s }}</Kbd>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </NewSimpleModal>
</template>
