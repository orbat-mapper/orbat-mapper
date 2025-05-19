<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { type MenuItemData } from "@/components/types";

const props = withDefaults(
  defineProps<{ items: MenuItemData[]; sideOffset?: number }>(),
  {
    sideOffset: 10,
  },
);
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>

<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as="child" class="mr-2" @click.stop>
        <Button variant="ghost" size="icon" class="text-muted-foreground">
          <EllipsisVertical class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent :side-offset="sideOffset" align="end">
        <DropdownMenuItem
          v-for="item in items"
          @select="onItemClick(item)"
          :disabled="item.disabled"
        >
          <span>{{ item.label }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
