<script setup lang="ts">
import { computed } from "vue";
import { type MenuItemData } from "@/components/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const props = defineProps<{ options: MenuItemData[]; sortDirection?: "asc" | "desc" }>();
const emit = defineEmits(["action", "toggle-direction"]);

const activeOptionLabel = computed(
  () => props.options.find((option) => option.active)?.label,
);
const sortDirectionLabel = computed(() =>
  props.sortDirection === "asc" ? "Ascending" : "Descending",
);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};

function onToggleDirection() {
  emit("toggle-direction");
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="child" class="" @click.stop>
      <Button variant="ghost" class="">
        Sort
        <ChevronDown />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @select="onToggleDirection">
        <ArrowUp v-if="sortDirection === 'asc'" class="size-4" />
        <ArrowDown v-else class="size-4" />
        <span>Order: {{ sortDirectionLabel }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup :model-value="activeOptionLabel">
        <DropdownMenuRadioItem
          v-for="item in options"
          :key="item.label"
          :value="item.label"
          :disabled="item.disabled"
          @select="onItemClick(item)"
        >
          <span>{{ item.label }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
