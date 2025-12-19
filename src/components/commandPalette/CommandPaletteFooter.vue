<template>
  <div
    class="text-muted-foreground flex flex-wrap items-center justify-between px-4 py-2.5 text-xs"
  >
    <div class="flex items-center gap-0.5">
      Type

      <Kbd>@</Kbd>
      <span class="sm:hidden">for places,</span>
      <span class="hidden sm:inline">to search for places,</span>
      <button class="flex" @click="emit('click-actions')">
        <Kbd>#</Kbd> /
        <Kbd>&gt;</Kbd>
        <span class="">for actions</span>
      </button>
      <Kbd class="hidden sm:flex">?</Kbd>
      <span class="hidden sm:flex">for help.</span>
    </div>
    <div><ToggleField v-model="uiStore.searchGeoMode">Place mode</ToggleField></div>
  </div>
</template>
<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { useUiStore } from "@/stores/uiStore.ts";
import { Kbd } from "@/components/ui/kbd";

const emit = defineEmits(["click-actions"]);
const uiStore = useUiStore();
const props = defineProps<{
  rawQuery: string;
}>();
</script>
