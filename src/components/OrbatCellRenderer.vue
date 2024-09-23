<script setup lang="ts">
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

const props = defineProps<{
  value: string;
  sidc: string;
  expanded: boolean;
  level: number;
  symbolOptions: Record<string, any>;
  canExpand?: boolean;
}>();
const emit = defineEmits(["toggle"]);
</script>

<template>
  <div class="flex items-center gap-2" :style="{ paddingLeft: level * 1.5 + 'rem' }">
    <div class="h-6 w-6">
      <button v-if="canExpand" @click="emit('toggle')" type="button">
        <ChevronRightIcon
          class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
          :class="{
            'rotate-90': expanded,
          }"
        />
      </button>
    </div>
    <MilitarySymbol :sidc="sidc" :size="20" :options="symbolOptions" />
    {{ value }}
  </div>
</template>
