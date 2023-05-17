<template>
  <div class="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
    Type
    <!--
    <kbd
      :class="[
        'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white  font-semibold sm:mx-2',
        rawQuery.startsWith('@')
          ? 'border-indigo-600 text-indigo-600'
          : 'border-gray-400 text-gray-900',
      ]"
      >@</kbd
    >
    <span class="sm:hidden">for places,</span>
    <span class="hidden sm:inline">to search for places</span>-->
    <kbd
      :class="[
        'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
        rawQuery === '?'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-gray-400 text-gray-900',
      ]"
      >?</kbd
    >
    for help.
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  rawQuery: string;
}>();
</script>
