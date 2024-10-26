<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import { SideAction, SideActions } from "@/types/constants";
import { computed } from "vue";
import { MenuItemData } from "@/components/types";

const props = defineProps<{
  isLocked: boolean;
}>();

const emit = defineEmits<{
  action: [value: SideAction];
}>();

const sideMenuItems = computed((): MenuItemData<SideAction>[] => [
  { label: "Edit", action: SideActions.Edit, disabled: props.isLocked },
  { label: "Add group", action: SideActions.AddGroup, disabled: props.isLocked },
  { label: "Delete side", action: SideActions.Delete, disabled: props.isLocked },
  { label: "Move up", action: SideActions.MoveUp, disabled: props.isLocked },
  { label: "Move down", action: SideActions.MoveDown, disabled: props.isLocked },
  { label: "Add side", action: SideActions.Add, disabled: props.isLocked },
  { label: "Duplicate", action: SideActions.Clone, disabled: props.isLocked },
  {
    label: "Duplicate (with state)",
    action: SideActions.CloneWithState,
    disabled: props.isLocked,
  },
  props.isLocked
    ? { label: "Unlock side", action: SideActions.Unlock }
    : { label: "Lock side", action: SideActions.Lock },
]);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="mr-2">
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army2 focus:ring-offset-2"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-52 border-gray-300" align="end">
      <DropdownMenuLabel>Side actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="item in sideMenuItems"
        @select="emit('action', item.action)"
        :key="item.action"
        :disabled="item.disabled"
      >
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
