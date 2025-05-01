<script setup lang="ts">
import { type MenuItemData } from "@/components/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const props = defineProps<{ options: MenuItemData[] }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
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
      <DropdownMenuItem
        v-for="item in options"
        @select="onItemClick(item)"
        :disabled="item.disabled"
      >
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
