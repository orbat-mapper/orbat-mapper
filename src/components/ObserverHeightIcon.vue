<script setup lang="ts">
// A lucide-styled observer's eye height: an eye on a mast above the ground.
// Pairs with TargetHeightIcon, a reticle on a post.
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
    <!-- Mast. -->
    <path d="M12 21v-9" />
    <!-- Eye, with its pupil. -->
    <path d="M4 7.5q8-7.5 16 0q-8 7.5-16 0z" />
    <circle cx="12" cy="7.5" r="1.5" />
  </svg>
</template>
