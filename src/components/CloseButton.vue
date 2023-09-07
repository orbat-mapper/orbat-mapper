<template>
  <button
    class="rounded-full bg-gray-50 bg-opacity-25 text-gray-500 hover:bg-opacity-50 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
  >
    <span class="sr-only">Close</span>
    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
  </button>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/24/solid";
</script>
