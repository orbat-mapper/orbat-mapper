<script setup lang="ts" generic="T extends string">
import { computed } from "vue";
import { IconEye, IconEyeOff, IconMagnifyExpand } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import type { MenuItemData } from "@/components/types";

/**
 * The hover actions at the end of a Layers panel row: a zoom button (when the menu has
 * a "zoom" action), a visibility toggle, optional extra buttons (default slot) and an
 * optional menu. Shared so every section's rows line up and size the same.
 *
 * They sit over the end of the row, which must be `relative` and have a background
 * while hovered or focused, and show only then, so while hidden they take no width
 * from the name. They take the row's background, so a selected row stays one colour.
 */
const props = defineProps<{
  hidden?: boolean;
  toggleTitle?: string;
  toggleDisabled?: boolean;
  menuItems?: MenuItemData<T>[];
}>();
const emit = defineEmits<{ "toggle-visibility": []; action: [action: T] }>();

// Mirrors the menu's "Zoom to" item, so it is enabled exactly when that item is.
const zoomItem = computed(() => props.menuItems?.find((item) => item.action === "zoom"));

const buttonClass =
  "text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md disabled:pointer-events-none disabled:opacity-40";
</script>

<template>
  <div
    class="pointer-events-none absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1 bg-inherit pl-1 opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
    :class="{ 'pr-2': !menuItems }"
  >
    <button
      v-if="zoomItem"
      type="button"
      :class="[buttonClass, '-mr-2']"
      :title="zoomItem.label"
      :disabled="zoomItem.disabled"
      @click.stop="emit('action', zoomItem.action)"
    >
      <IconMagnifyExpand class="size-4" />
    </button>
    <slot />
    <button
      type="button"
      :class="buttonClass"
      :title="toggleTitle ?? 'Toggle visibility'"
      :disabled="toggleDisabled"
      @click.stop="emit('toggle-visibility')"
    >
      <IconEyeOff v-if="hidden" class="size-4" />
      <IconEye v-else class="size-4" />
    </button>
    <DotsMenu
      v-if="menuItems"
      :items="menuItems"
      button-class="size-7"
      @action="emit('action', $event)"
    />
  </div>
</template>
