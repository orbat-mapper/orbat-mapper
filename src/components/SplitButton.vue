<template>
  <span class="relative z-0 inline-flex rounded-md shadow-sm">
    <button
      type="button"
      @click="onClick(activeItem)"
      class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {{ activeItem.label }}
    </button>
    <Menu>
      <span class="relative -ml-px block" ref="trigger">
        <MenuButton
          class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <span class="sr-only">Open options</span>
          <ChevronDownIcon class="h-5 w-5" aria-hidden="true" /> </MenuButton
      ></span>
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <teleport to="body">
          <MenuItems>
            <div
              ref="container"
              class="absolute right-0 z-20 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
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
            </div>
          </MenuItems></teleport
        >
      </transition>
    </Menu>
  </span>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { computed, ref } from "vue";
import { usePopper } from "@/composables/usePopper";
import { ButtonGroupItem } from "./types";

interface Props {
  items: ButtonGroupItem[];
  static?: boolean;
}
const props = withDefaults(defineProps<Props>(), { static: false });

let [trigger, container] = usePopper({
  placement: "bottom-end",
  strategy: "fixed",
  modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
});

const activeItem = ref(props.items[0]);
const menuItems = computed(() =>
  props.items.filter((e) => e.label !== activeItem.value.label)
);

const onClick = (item: ButtonGroupItem) => {
  if (!props.static) activeItem.value = item;
  item.onClick();
};
</script>
