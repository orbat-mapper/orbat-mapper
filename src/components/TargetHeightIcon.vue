<script setup lang="ts">
// A lucide-styled target height: a reticle on a post above the ground, as far
// above it as a target must be seen. Pairs with ObserverHeightIcon.
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Ground. -->
    <path d="M5 21h14" />
    <!-- Post, rising into the reticle's lower tick. -->
    <path d="M12 21v-9.5" />
    <!-- Reticle: a ring with three ticks. -->
    <circle cx="12" cy="7.5" r="4" />
    <path d="M12 1.5v2M4.5 7.5h1.5M18 7.5h1.5" />
  </svg>
</template>
