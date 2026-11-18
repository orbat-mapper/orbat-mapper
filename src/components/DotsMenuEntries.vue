<script setup lang="ts">
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import type { MenuEntry, MenuItemData } from "@/components/types";

defineProps<{ entries: MenuEntry[] }>();
const emit = defineEmits<{ select: [item: MenuItemData] }>();
</script>

<template>
  <template v-for="(entry, index) in entries" :key="index">
    <DropdownMenuSeparator v-if="'separator' in entry" />
    <DropdownMenuSub v-else-if="'children' in entry">
      <DropdownMenuSubTrigger :disabled="entry.disabled">
        <span>{{ entry.label }}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DotsMenuEntries :entries="entry.children" @select="emit('select', $event)" />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuItem
      v-else
      :variant="entry.variant"
      :disabled="entry.disabled"
      @select="emit('select', entry)"
    >
      <span>{{ entry.label }}</span>
    </DropdownMenuItem>
  </template>
</template>
