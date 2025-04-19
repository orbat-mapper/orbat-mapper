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
import { ChevronDown } from "lucide-vue-next";
import { cn } from "@/lib/utils.ts";

interface Props {
  items: ButtonGroupItem[];
  static?: boolean;
  activeItem?: ButtonGroupItem | null | undefined;
  triggerClass?: string;
}
const props = withDefaults(defineProps<Props>(), { static: false });
const emit = defineEmits(["update:activeItem"]);

const _activeItem = ref(props.items[0]);

const activeItemRef = computed({
  get() {
    return props.activeItem || _activeItem.value;
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
  <div class="flex items-center">
    <Button
      variant="outline"
      @click="onClick(activeItemRef)"
      :disabled="activeItemRef.disabled"
      class="rounded-r-none text-left ring-inset"
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
          ><ChevronDown
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
