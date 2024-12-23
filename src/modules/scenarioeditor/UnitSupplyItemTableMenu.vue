<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { useSuppliesEditStore, useToeEditStore } from "@/stores/toeStore";

const toeStore = useSuppliesEditStore();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="block rounded-full p-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="size-5" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="" align="end">
      <DropdownMenuLabel>Columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem v-model:checked="toeStore.showClass">
        Supply class
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model:checked="toeStore.showAssigned">
        Assigned
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model:checked="toeStore.showOnHand">
        Available
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model:checked="toeStore.showPercentage">
        Percentage
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model:checked="toeStore.showUom">
        Unit
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
