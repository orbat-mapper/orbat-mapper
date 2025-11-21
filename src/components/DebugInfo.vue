<script setup lang="ts">
import { useFps } from "@vueuse/core";

const fps = useFps();
</script>
<template>
  <div
    class="bg-opacity-70 bg-background text-foreground fixed right-10 bottom-2 z-50 flex items-center gap-1 rounded text-xs print:hidden"
  >
    <p class="p-2 font-bold">
      <span class="sm:hidden">mo</span>
      <span class="hidden sm:inline md:hidden">sm</span>
      <span class="hidden md:inline lg:hidden">md</span>
      <span class="hidden lg:inline xl:hidden">lg</span>
      <span class="hidden xl:inline 2xl:hidden">xl</span>
      <span class="3xl:hidden hidden 2xl:inline">2xl</span>
      <span class="3xl:inline 4xl:hidden hidden">3xl</span>
      <span class="4xl:inline hidden">4xl+</span>
    </p>

    <p class="w-16"><span class="">FPS:</span> {{ fps }}</p>
  </div>
</template>
