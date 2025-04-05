<template>
  <button
    class="bg-opacity-25 hover:bg-opacity-50 rounded-full bg-gray-50 text-gray-500 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
  >
    <span class="sr-only">Close</span>
    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
  </button>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/24/solid";
</script>
