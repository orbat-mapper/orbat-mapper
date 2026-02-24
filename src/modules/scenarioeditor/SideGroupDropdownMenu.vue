<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type SideAction, SideActions } from "@/types/constants";
import { computed } from "vue";
import { type MenuItemData } from "@/components/types";
import { EllipsisVertical } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  isLocked: boolean;
  isSideLocked: boolean;
  isSideHidden: boolean;
  isSideGroupLocked: boolean;
  isSideGroupHidden: boolean;
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
  props.isSideGroupHidden
    ? { label: "Show group", action: SideActions.Show, disabled: props.isSideHidden }
    : { label: "Hide group", action: SideActions.Hide, disabled: props.isSideHidden },
  { label: "Expand units", action: SideActions.Expand, disabled: props.isLocked },
  { label: "Collapse units", action: SideActions.Collapse, disabled: props.isLocked },
]);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="mr-2">
      <Button variant="ghost" size="icon" class="text-muted-foreground">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-52" align="end">
      <DropdownMenuLabel>Group actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="item in sideGroupMenuItems"
        @select="emit('action', item.action)"
        :key="item.action"
        :disabled="item.disabled"
      >
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
