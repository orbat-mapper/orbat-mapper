<template>
  <button
    type="button"
    class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "IconButton",
};
</script>
