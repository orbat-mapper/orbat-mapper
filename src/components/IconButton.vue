<template>
  <button
    type="button"
    class="
      bg-white
      rounded-full
      h-8
      w-8
      flex
      items-center
      justify-center
      text-gray-400
      hover:bg-gray-100 hover:text-gray-500
      focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500
    "
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "IconButton",
};
</script>
