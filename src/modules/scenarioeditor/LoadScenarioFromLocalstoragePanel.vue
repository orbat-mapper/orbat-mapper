<template>
  <div
    class="relative w-full rounded-lg border-2 border-dashed border-gray-300 p-4 ring-offset-2 focus-within:ring-2 hover:border-gray-500"
  >
    <button
      class="flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-700"
      @click="emit('loaded')"
    >
      <IconFolderUploadOutline class="h-10 w-10 text-gray-500" />

      <p class="mt-2 text-center">Load from local storage (legacy)</p>
    </button>

    <p
      v-if="isError"
      class="absolute bottom-2 left-0 w-full text-center text-base text-red-900"
    >
      Please select a valid scenario file.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { IconFolderUploadOutline } from "@iconify-prerendered/vue-mdi";

const emit = defineEmits(["loaded"]);

const isError = ref(false);
</script>
