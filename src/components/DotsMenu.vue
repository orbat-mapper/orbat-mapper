<template>
  <Menu as="div">
    <Float placement="left-start" strategy="fixed" flip shift :portal="portal">
      <MenuButton
        @click.stop=""
        class="focus:ring-army2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        class="ring-opacity-5 mx-3 mt-1 w-48 divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-hidden dark:bg-gray-800"
      >
        <div class="py-1">
          <MenuItem
            v-slot="{ active, disabled }"
            v-for="item in items"
            :disabled="item.disabled"
            @click="onItemClick(item)"
          >
            <button
              type="button"
              :class="[
                active
                  ? 'border-army2 border-r-2 bg-gray-100 text-gray-900'
                  : 'text-gray-700 dark:text-gray-300',
                'inline-flex w-full px-4 py-2 text-sm',
                disabled ? 'opacity-50 hover:cursor-default' : '',
              ]"
            >
              {{ item.label }}
            </button>
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

const props = defineProps<{ items: MenuItemData[]; portal?: boolean }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>
