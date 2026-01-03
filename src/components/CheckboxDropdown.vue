<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SelectItem } from "@/components/types";
import { useVModel } from "@vueuse/core";
import { computed } from "vue";

interface Props {
  options: SelectItem[];
  modelValue: (string | number)[];
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const selectedItems = useVModel(props, "modelValue", emit);

// Create a reactive checked state for each option that syncs with selectedItems array
function createCheckedModel(value: string | number) {
  return computed({
    get: () => selectedItems.value.includes(value),
    set: (checked: boolean) => {
      if (checked) {
        if (!selectedItems.value.includes(value)) {
          selectedItems.value = [...selectedItems.value, value];
        }
      } else {
        selectedItems.value = selectedItems.value.filter((v) => v !== value);
      }
    },
  });
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="group text-muted-foreground hover:text-foreground inline-flex items-center justify-center text-sm font-medium"
    >
      <span
        ><slot>{{ label }}</slot></span
      >
      <span
        class="bg-muted text-muted-foreground ml-1.5 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums"
      >
        {{ selectedItems.length }}
      </span>
      <ChevronDown
        class="text-muted-foreground group-hover:text-foreground -mr-1 ml-1 size-5 shrink-0"
        aria-hidden="true"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuCheckboxItem
        v-for="option in options"
        :key="option.value"
        v-model="createCheckedModel(option.value).value"
        @select.prevent
      >
        {{ option.label }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
