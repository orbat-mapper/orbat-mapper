<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import { type ScenarioFeatureActions } from "@/types/constants";

const emit = defineEmits<{
  action: [value: ScenarioFeatureActions];
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="">
      <button type="button" class="block p-2.5 text-gray-500 hover:text-gray-900">
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-6 w-6" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-52 border-gray-300" align="end">
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

      <DropdownMenuSeparator />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
