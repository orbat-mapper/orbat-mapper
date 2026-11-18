<script setup lang="ts">
import { type HTMLAttributes, type MaybeRefOrGetter, toValue } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import type { MenuEntry, MenuItemData } from "@/components/types";
import { cn } from "@/lib/utils";
import DotsMenuEntries from "./DotsMenuEntries.vue";

withDefaults(
  defineProps<{
    /** A getter is only called while the menu is open, so rows can build items lazily. */
    items: MaybeRefOrGetter<MenuEntry[]>;
    sideOffset?: number;
    buttonClass?: HTMLAttributes["class"];
    triggerClass?: HTMLAttributes["class"];
    label?: string;
  }>(),
  {
    sideOffset: 10,
    label: "More options",
    triggerClass: "mr-2",
  },
);
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>

<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as="child" :class="triggerClass" @click.stop>
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
        <DotsMenuEntries :entries="toValue(items)" @select="onItemClick" />
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
