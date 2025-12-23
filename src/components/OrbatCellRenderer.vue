<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import UnitSymbol from "@/components/UnitSymbol.vue";

const props = defineProps<{
  value: string;
  sidc?: string;
  expanded: boolean;
  level: number;
  symbolOptions: Record<string, any>;
  canExpand?: boolean;
}>();
const emit = defineEmits(["toggle"]);
</script>

<template>
  <div class="flex items-center gap-2" :style="{ paddingLeft: level * 1.5 + 'rem' }">
    <div class="size-6">
      <button v-if="canExpand" @click="emit('toggle')" type="button">
        <ChevronRightIcon
          class="text-muted-foreground group-hover:text-foreground size-6 transform transition-transform"
          :class="{
            'rotate-90': expanded,
          }"
        />
      </button>
    </div>
    <UnitSymbol
      v-if="sidc"
      :sidc="sidc"
      class="max-h-8"
      :size="20"
      :options="{
        outlineWidth: 8,
        outlineColor: 'rgba(255,255,255,0.80)',
        ...symbolOptions,
      }"
    />
    <span :class="{ 'font-bold': sidc === undefined }">{{ value }}</span>
  </div>
</template>
