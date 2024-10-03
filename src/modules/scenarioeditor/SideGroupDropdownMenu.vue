<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import { SideAction, SideActions } from "@/types/constants";
import { computed } from "vue";
import { MenuItemData } from "@/components/types";

const props = defineProps<{
  isLocked: boolean;
  isSideLocked: boolean;
  isSideGroupLocked: boolean;
}>();

const emit = defineEmits<{
  action: [value: SideAction];
}>();

const sideGroupMenuItems = computed((): MenuItemData<SideAction>[] => [
  {
    label: "Add root unit",
    action: SideActions.AddSubordinate,
    disabled: props.isLocked,
  },
  { label: "Edit group", action: SideActions.Edit, disabled: props.isLocked },
  { label: "Delete group", action: SideActions.Delete, disabled: props.isLocked },
  { label: "Move up", action: SideActions.MoveUp, disabled: props.isLocked },
  { label: "Move down", action: SideActions.MoveDown, disabled: props.isLocked },
  { label: "Duplicate", action: SideActions.Clone, disabled: props.isLocked },
  {
    label: "Duplicate (with state)",
    action: SideActions.CloneWithState,
    disabled: props.isLocked,
  },
  props.isSideGroupLocked
    ? { label: "Unlock group", action: SideActions.Unlock, disabled: props.isSideLocked }
    : { label: "Lock group", action: SideActions.Lock, disabled: props.isSideLocked },
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
      <DropdownMenuLabel inset>Group actions</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in sideGroupMenuItems"
        @select="emit('action', item.action)"
        :key="item.action"
        :disabled="item.disabled"
        inset
      >
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
