<template>
  <div class="mt-6 flex items-center justify-end gap-x-6">
    <button
      type="button"
      class="text-sm/6 font-semibold text-gray-900"
      @click="emit('cancel')"
    >
      Cancel
    </button>
    <button
      type="submit"
      class="shadow-xs rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Save
    </button>
  </div>
</template>
<script setup lang="ts">
import { defineEmits } from "vue";

const emit = defineEmits(["cancel"]);
</script>
