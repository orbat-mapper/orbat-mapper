<template>
  <Menu as="div">
    <MenuButton
      class="w-8 h-8 inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-army2"
    >
      <span class="sr-only">Open options</span>
      <DotsVerticalIcon class="w-5 h-5" aria-hidden="true" />
    </MenuButton>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="z-20 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem
            v-slot="{ active, disabled }"
            v-for="item in items"
            :disabled="item.disabled"
          >
            <a
              href="#"
              @click.stop="$emit('action', item.action)"
              :class="[
                active
                  ? 'bg-gray-100 text-gray-900 border-r-2 border-army2'
                  : 'text-gray-700',
                'block px-4 py-2 text-sm',
                disabled ? 'opacity-50 hover:cursor-default' : '',
              ]"
              >{{ item.label }}</a
            >
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { ChevronRightIcon, DotsVerticalIcon } from "@heroicons/vue/solid";

export interface MenuItemData<T = string> {
  label: string;
  action: T;
  disabled?: boolean;
}

export default defineComponent({
  name: "DotsMenu",
  props: {
    items: { type: Array as PropType<MenuItemData[]>, required: true },
  },
  emits: ["action"],
  components: {
    DotsVerticalIcon,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
  },
  setup(props) {},
});
</script>
