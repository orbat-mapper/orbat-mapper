<template>
  <button
    type="button"
    class="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <component :is="icon" class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
    <span class="mt-2 block text-sm font-medium text-gray-900">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
  props: ["icon"],
  name: "CreateEmtpyDashed",
};
</script>
