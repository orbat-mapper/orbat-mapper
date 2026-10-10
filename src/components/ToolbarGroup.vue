<script setup lang="ts">
/**
 * A captioned run of toolbar buttons. The caption is absolutely positioned above the
 * buttons, so it never changes the row's height or alignment; the toolbar reserves room
 * for it with extra top padding. It shows only inside a `toolbar` container (the map's
 * bottom toolbar area) at least 36rem wide; elsewhere only the group semantics remain.
 */
defineProps<{ label: string }>();
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    class="relative flex shrink-0 items-center gap-0.5"
  >
    <span
      class="text-muted-foreground pointer-events-none absolute bottom-full left-1 mb-0.5 hidden text-[10px] leading-none font-medium tracking-wide whitespace-nowrap uppercase @min-[36rem]/toolbar:block"
      aria-hidden="true"
    >
      {{ label }}
    </span>
    <slot />
  </div>
</template>
