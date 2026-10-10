<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { type MenuItemData } from "@/components/types";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    items: MenuItemData[];
    sideOffset?: number;
    buttonClass?: HTMLAttributes["class"];
    label?: string;
  }>(),
  {
    sideOffset: 10,
    label: "More options",
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
        <Button
          variant="ghost"
          size="icon"
          :class="cn('text-muted-foreground', buttonClass)"
          :aria-label="label"
          :title="label"
        >
          <EllipsisVertical class="size-4" aria-hidden="true" />
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
