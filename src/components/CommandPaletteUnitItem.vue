<template>
  <li
    :class="[
      'flex cursor-default items-center px-4 py-2 select-none',
      active ? 'bg-army text-white' : 'even:bg-gray-100',
    ]"
  >
    <div class="relative flex w-7 justify-center">
      <MilSymbol
        :sidc="item.sidc"
        :size="20"
        aria-hidden="true"
        :modifiers="{
          ...item.symbolOptions,
          outlineColor: 'white',
          outlineWidth: 8,
        }"
      />
      <span
        v-if="item._state?.location"
        class="absolute -right-1 bottom-0 block translate-x-1/2 translate-y-1/2 transform rounded-full border-2 border-white"
      >
        <span class="block h-1.5 w-1.5 rounded-full bg-red-800" />
      </span>
    </div>
    <p
      class="ml-3 flex-auto truncate"
      v-html="item.highlight ? item.highlight : item.name"
    />
    <p v-if="item.parent" class="flex text-xs opacity-80">
      <MilSymbol
        :size="12"
        :sidc="item.parent.sidc"
        :modifiers="{
          ...item.parent.symbolOptions,
          outlineColor: 'white',
          outlineWidth: 4,
        }"
        class="mr-1"
      />
      {{ item.parent.name }}
    </p>
  </li>
</template>
<script setup lang="ts">
import MilSymbol from "@/components/MilSymbol.vue";
import { type UnitSearchResult } from "@/components/types";
const props = defineProps<{ item: UnitSearchResult; active?: boolean }>();
</script>
