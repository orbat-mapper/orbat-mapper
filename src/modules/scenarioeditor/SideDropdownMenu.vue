<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

import { type SideAction, SideActions } from "@/types/constants";
import { computed } from "vue";
import { type DropdownMenuItemType } from "@/components/types";

const props = defineProps<{
  isLocked: boolean;
  isHidden?: boolean;
}>();

const emit = defineEmits<{
  action: [value: SideAction];
}>();

const sideMenuItems = computed(() => {
  return [
    { label: "Edit", action: SideActions.Edit, disabled: props.isLocked },
    { label: "Move up", action: SideActions.MoveUp, disabled: props.isLocked },
    { label: "Move down", action: SideActions.MoveDown, disabled: props.isLocked },

    { label: "Duplicate", action: SideActions.Clone, disabled: props.isLocked },
    {
      label: "Duplicate (with state)",
      action: SideActions.CloneWithState,
      disabled: props.isLocked,
    },
    props.isLocked
      ? { label: "Unlock side", action: SideActions.Unlock }
      : { label: "Lock side", action: SideActions.Lock },
    props.isHidden
      ? { label: "Show side", action: SideActions.Show }
      : { label: "Hide side", action: SideActions.Hide },
    { label: "Expand units", action: SideActions.Expand, disabled: props.isLocked },
    { label: "Collapse units", action: SideActions.Collapse, disabled: props.isLocked },

    { separator: true },
    { label: "Add side", action: SideActions.Add, disabled: props.isLocked },
    { label: "Add group", action: SideActions.AddGroup, disabled: props.isLocked },
    {
      label: "Add root unit",
      action: SideActions.AddSubordinate,
      disabled: props.isLocked,
    },
    { separator: true },
    { label: "Delete side", action: SideActions.Delete, disabled: props.isLocked },
  ] as DropdownMenuItemType[];
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="mr-2">
      <Button variant="ghost" size="icon" class="text-muted-foreground">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-52" align="end">
      <DropdownMenuLabel>Side actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <template
        v-for="(item, index) in sideMenuItems"
        :key="'action' in item ? item.action : index"
      >
        <DropdownMenuSeparator v-if="'separator' in item" />
        <DropdownMenuItem
          v-else
          @select="emit('action', item.action)"
          :disabled="item.disabled"
        >
          <span>{{ item.label }}</span>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
