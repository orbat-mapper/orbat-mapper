<template>
  <button
    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
  >
    <span class="sr-only">Close</span>
    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
  </button>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/24/solid";
</script>
