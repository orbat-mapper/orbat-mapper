<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex items-center">
      <div class="flex h-10 w-10 flex-shrink-0">
        <MilSymbol
          :size="20"
          :sidc="unit.sidc"
          class="inline self-center"
          :modifiers="unit.symbolOptions"
        />
      </div>
      <p v-if="unit.highlight" v-html="unit.highlight" />
      <p v-else>{{ unit.name }}</p>
      <!--      <p class="ml-2 text-xs">{{ unit.score }}</p>-->
    </div>

    <p v-if="unit.parent" class="flex self-start text-xs text-gray-600">
      <MilSymbol
        :size="12"
        :sidc="unit.parent.sidc"
        :modifiers="unit.parent.symbolOptions"
        class="mr-1 opacity-80"
      />
      {{ unit.parent.name }}
    </p>
  </div>
</template>

<script setup lang="ts">
import MilSymbol from "./MilSymbol.vue";
import { UnitSearchResult } from "./types";

const props = defineProps<{ unit: UnitSearchResult }>();
</script>
