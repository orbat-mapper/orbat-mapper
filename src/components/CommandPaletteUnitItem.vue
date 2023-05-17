<template>
  <li
    :class="[
      'flex cursor-default select-none items-center px-4 py-2',
      active ? 'bg-army text-white' : 'even:bg-gray-100',
    ]"
  >
    <div class="flex w-7 justify-center">
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
import { UnitSearchResult } from "@/components/types";
const props = defineProps<{ item: UnitSearchResult; active?: boolean }>();
</script>
