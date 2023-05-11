<template>
  <div class="overflow-hidden bg-white shadow">
    <div class="relative px-4 py-5 sm:p-6">
      <p v-if="title" class="-mt-2 mb-4 text-sm text-gray-500">{{ title }}</p>
      <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
        <button
          type="button"
          class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="$emit('close')"
        >
          <span class="sr-only">Close</span>
          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

export default defineComponent({
  components: { XMarkIcon },
  emits: ["close"],
  props: ["title"],
  name: "InlineFormPanel",
});
</script>
