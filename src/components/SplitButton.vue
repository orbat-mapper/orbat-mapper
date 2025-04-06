<template>
  <span class="relative inline-flex rounded-md shadow-xs">
    <button
      type="button"
      @click="onClick(activeItemRef)"
      :disabled="activeItemRef.disabled"
      class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60 disabled:hover:cursor-default"
    >
      {{ activeItemRef.label }}
    </button>
    <Menu as="div" class="relative -ml-px block">
      <Float placement="bottom-end" :offset="4" strategy="fixed" portal flip shift>
        <MenuButton
          class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
        >
          <span class="sr-only">Open options</span>
          <ChevronDownIcon class="h-5 w-5" aria-hidden="true" />
        </MenuButton>
        <MenuItems
          class="ring-opacity-5 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-hidden"
        >
          <MenuItem
            v-for="item in menuItems"
            :key="item.label"
            v-slot="{ active }"
            :disabled="item.disabled"
          >
            <button
              @click="onClick(item)"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'flex w-full px-4 py-2 text-sm',
                item.disabled ? 'opacity-60 hover:cursor-default' : '',
              ]"
            >
              {{ item.label }}
            </button>
          </MenuItem>
        </MenuItems>
      </Float>
    </Menu>
  </span>
</template>

<script setup lang="ts">
import { Float } from "@headlessui-float/vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";
import { computed, ref } from "vue";
import { type ButtonGroupItem } from "./types";

interface Props {
  items: ButtonGroupItem[];
  static?: boolean;
  activeItem?: ButtonGroupItem | null | undefined;
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
