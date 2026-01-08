<script lang="ts">
export default {
  props: ["icon"],
  name: "CreateEmtpyDashed",
};
</script>

<template>
  <button
    type="button"
    class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
  >
    <component
      :is="icon"
      class="text-muted-foreground mx-auto h-12 w-12"
      aria-hidden="true"
    />
    <span class="text-foreground mt-2 block text-sm font-medium">
      <slot />
    </span>
  </button>
</template>
