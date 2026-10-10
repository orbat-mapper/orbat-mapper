<script setup lang="ts">
import { computed, ref } from "vue";
import { type ButtonGroupItem } from "./types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "@lucide/vue";
import { cn } from "@/lib/utils.ts";

interface Props {
  items: ButtonGroupItem[];
  static?: boolean;
  activeItem?: ButtonGroupItem | null | undefined;
  triggerClass?: string;
  buttonClass?: string;
  menuLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  static: false,
  menuLabel: "More options",
});
const emit = defineEmits(["update:activeItem"]);
const fallbackItem: ButtonGroupItem = { label: "", onClick: () => {}, disabled: true };

const _activeItem = ref(props.items[0]);

const resolvedActiveItem = computed(() => {
  const candidate =
    props.activeItem || _activeItem.value || props.items[0] || fallbackItem;
  return (
    props.items.find((item) => item.label === candidate.label) ||
    props.items[0] ||
    fallbackItem
  );
});

const activeItemRef = computed({
  get() {
    return resolvedActiveItem.value;
  },
  set(v) {
    _activeItem.value = v;
    emit("update:activeItem", v);
  },
});
const menuItems = computed(() =>
  props.items.filter((e) => e.label !== activeItemRef.value?.label),
);

const onClick = (item: ButtonGroupItem) => {
  if (!props.static) activeItemRef.value = item;
  item.onClick();
};
</script>

<template>
  <!-- min-w-0 and shrink let the label truncate in narrow toolbars -->
  <div class="flex min-w-0 items-center">
    <Button
      variant="outline"
      @click="onClick(activeItemRef)"
      :disabled="activeItemRef.disabled"
      :class="cn('min-w-0 shrink rounded-r-none text-left ring-inset', buttonClass)"
      :title="activeItemRef.label"
    >
      <span :class="cn('truncate', triggerClass)">{{ activeItemRef.label }}</span>
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          class="rounded-l-none border-l-0 px-2 ring-inset"
          :aria-label="menuLabel"
          :title="menuLabel"
          ><ChevronDown aria-hidden="true"
        /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          v-for="item in menuItems"
          :key="item.label"
          :disabled="item.disabled"
          @select="onClick(item)"
          >{{ item.label }}</DropdownMenuItem
        >
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
