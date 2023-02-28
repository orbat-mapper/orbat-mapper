<template>
  <Menu as="div">
    <Float placement="left-start" portal flip shift>
      <MenuButton
        @click.stop=""
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army2 focus:ring-offset-2"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        class="mx-3 mt-1 w-48 divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
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
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { MenuItemData } from "@/components/types";
import { Float } from "@headlessui-float/vue";

const props = defineProps<{ items: MenuItemData[] }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>
