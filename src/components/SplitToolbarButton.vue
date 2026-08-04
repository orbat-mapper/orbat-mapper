<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * One toolbar pill with two hit areas: the main half emits `click` (the caller re-arms
 * whatever the `icon` slot is previewing), the chevron half opens a dropdown holding the
 * `menu` slot. Both halves take the toolbar's active/disabled treatment from
 * `MainToolbarButton`, so a split button never renders half-armed and the toolbar
 * palette keeps a single owner.
 */
withDefaults(
  defineProps<{
    title: string;
    menuTitle: string;
    active?: boolean;
    disabled?: boolean;
  }>(),
  { active: false, disabled: false },
);
defineEmits<{ click: [] }>();
</script>

<template>
  <div class="ring-border flex items-center rounded-md ring-1 ring-inset">
    <MainToolbarButton
      :title="title"
      :active="active"
      :disabled="disabled"
      class="rounded-r-none"
      @click="$emit('click')"
    >
      <slot name="icon" />
    </MainToolbarButton>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <MainToolbarButton
          :title="menuTitle"
          :active="active"
          :disabled="disabled"
          class="border-border w-5 rounded-l-none border-l"
        >
          <ChevronDown class="size-3" />
        </MainToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <slot name="menu" />
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
