<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

import type { ScenarioEventAction } from "@/types/constants";

const props = defineProps<{ hideEdit?: boolean }>();

const emit = defineEmits<{
  action: [value: ScenarioEventAction];
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="">
      <button
        type="button"
        class="block rounded-full p-2 text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="size-5" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-44 border-gray-300" align="end">
      <DropdownMenuItem @select="emit('action', 'changeTime')">
        <span>Modify time</span>
      </DropdownMenuItem>
      <DropdownMenuItem v-if="!hideEdit" @select="emit('action', 'editMeta')">
        <span>Edit</span>
      </DropdownMenuItem>
      <DropdownMenuItem v-if="!hideEdit" @select="emit('action', 'editMedia')">
        <span>Edit media</span>
      </DropdownMenuItem>
      <DropdownMenuItem @select="emit('action', 'delete')">
        <span>Delete</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
