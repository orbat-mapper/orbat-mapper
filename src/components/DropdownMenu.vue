<template>
  <Menu as="div" class="relative text-left">
    <Float placement="bottom-end" :offset="8" shift>
      <MenuButton
        class="group flex items-center rounded-md text-gray-300 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-army2 focus:ring-offset-2"
      >
        <span
          ><slot>{{ label }}</slot></span
        >
        <ChevronDownIcon
          class="ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-200"
          aria-hidden="true"
        />
      </MenuButton>
      <MenuItems
        class="w-48 divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
      >
        <div class="py-1">
          <MenuItem
            v-slot="{ active, disabled }"
            v-for="item in items"
            :disabled="item.disabled"
            @click="onItemClick(item)"
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
    </Float>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";
import { MenuItemData } from "@/components/types";
import { Float } from "@headlessui-float/vue";

const props = defineProps<{ items: MenuItemData[]; label?: string }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>
