<template>
  <div class="bg-white overflow-hiden shadow">
    <div class="px-4 py-5 sm:p-6 relative">
      <p v-if="title" class="-mt-2 mb-4 text-sm text-gray-500">{{ title }}</p>
      <div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
        <button
          type="button"
          class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="$emit('close')"
        >
          <span class="sr-only">Close</span>
          <XIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { XIcon } from "@heroicons/vue/outline";

export default defineComponent({
  components: { XIcon },
  emits: ["close"],
  props: ["title"],
  name: "InlineFormPanel",
});
</script>
