<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { Float } from "@headlessui-float/vue";
import { type MenuItemData } from "@/components/types";

const props = defineProps<{ options: MenuItemData[] }>();
const emit = defineEmits(["action"]);

const onItemClick = (item: MenuItemData<string | Function>) => {
  if (item.action instanceof Function) item.action();
  else emit("action", item.action);
};
</script>

<template>
  <Menu as="div" class="relative inline-block text-left">
    <Float
      placement="bottom-end"
      :offset="8"
      shift
      enter="transition duration-200 ease-out"
      enter-from="scale-95 opacity-0"
      enter-to="scale-100 opacity-100"
      leave="transition duration-150 ease-in"
      leave-from="scale-100 opacity-100"
      leave-to="scale-95 opacity-0"
      tailwindcss-origin-class
    >
      <div>
        <MenuButton
          class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Sort
          <ChevronDownIcon
            class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
        </MenuButton>
      </div>

      <MenuItems
        class="w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem
            v-for="option in options"
            :key="option.label"
            v-slot="{ active }"
            @click="onItemClick(option)"
          >
            <button
              type="button"
              :class="[
                option.active ? 'font-medium text-gray-900' : 'text-gray-500',
                active ? 'bg-gray-100' : '',
                'inline-flex w-full px-4 py-2 text-sm',
              ]"
            >
              {{ option.label }}
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Float></Menu
  >
</template>
