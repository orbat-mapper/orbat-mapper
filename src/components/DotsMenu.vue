<template>
  <Menu as="div">
    <MenuButton
      @click.stop
      class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army2 focus:ring-offset-2"
    >
      <span class="sr-only">Open options</span>
      <DotsVerticalIcon class="h-5 w-5" aria-hidden="true" />
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
        class="absolute right-10 top-3 z-20 mx-3 mt-1 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
      >
        <div class="py-1">
          <MenuItem
            v-slot="{ active, disabled }"
            v-for="item in items"
            :disabled="item.disabled"
            @click.stop.prevent="onItemClick(item)"
          >
            <a
              href="#"
              :class="[
                active
                  ? 'border-r-2 border-army2 bg-gray-100 text-gray-900'
                  : 'text-gray-700 dark:text-gray-300',
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

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { DotsVerticalIcon } from "@heroicons/vue/solid";
import { MenuItemData } from "@/components/types";

const props = defineProps<{ items: MenuItemData[] }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>
