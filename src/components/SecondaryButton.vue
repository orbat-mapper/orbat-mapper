<template>
  <button
    type="button"
    class="
      inline-flex
      items-center
      px-2.5
      py-1.5
      border border-transparent
      text-xs
      font-medium
      rounded
      text-indigo-700
      bg-indigo-100
      hover:bg-indigo-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    "
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "SecondaryButton",
};
</script>

<style scoped></style>
