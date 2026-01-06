<script lang="ts">
export default {
  name: "ToolbarButton",
  props: {
    start: { type: Boolean, default: false },
    end: { type: Boolean, default: false },
    top: { type: Boolean, default: false },
    bottom: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
};
</script>

<template>
  <button
    type="button"
    class="border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:text-muted-foreground relative inline-flex items-center border px-3 py-2 text-sm font-medium transition-all outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 sm:px-2"
    :class="[
      start && 'rounded-l-md',
      end && 'rounded-r-md',
      top && 'rounded-t-md',
      bottom && 'rounded-b-md',
      active
        ? 'bg-army2 text-primary-foreground hover:bg-army2/90'
        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    ]"
  >
    <slot />
  </button>
</template>
