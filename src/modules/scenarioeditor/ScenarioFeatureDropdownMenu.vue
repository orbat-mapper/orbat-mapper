<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type ScenarioFeatureActions } from "@/types/constants";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-vue-next";

const emit = defineEmits<{
  action: [value: ScenarioFeatureActions];
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="">
      <Button variant="ghost" size="sm" class="text-muted-foreground">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-52" align="end">
      <DropdownMenuItem inset @select="emit('action', 'zoom')">
        <span>Zoom to</span>
      </DropdownMenuItem>
      <DropdownMenuItem inset @select="emit('action', 'duplicate')">
        <span>Duplicate</span>
      </DropdownMenuItem>
      <DropdownMenuItem inset @select="emit('action', 'delete')">
        <span>Delete</span>
        <DropdownMenuShortcut>Del</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem inset @select="emit('action', 'removeMedia')">
        <span>Remove image</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
